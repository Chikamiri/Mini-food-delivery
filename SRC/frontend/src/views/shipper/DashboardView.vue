<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import orderService from '@/services/orderService'
import MapView from '@/components/MapView.vue'
import mapService from '@/services/mapService'
import restaurantService from '@/services/restaurantService'
import { useShipperTracking } from '@/composables/useShipperTracking'
import { useOrderRouteMap } from '@/composables/useOrderRouteMap'

const router = useRouter()
const authStore = useAuthStore()
const isOnline = ref(true)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Available = UNASSIGNED deliveries
const availableDeliveries = ref([])
// My active deliveries (ASSIGNED or PICKED_UP)
const myDeliveries = ref([])
// Full order details keyed by orderId
const orderDetails = ref({})

const userName = computed(() => authStore.user?.fullName || 'Shipper')
const shipperId = computed(() => authStore.user?.id || authStore.user?.userId)

const formatPrice = (val) => `${Number(val || 0).toLocaleString('vi-VN')}đ`
const formatTime = (val) => {
  if (!val) return ''
  return new Date(val).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
}

const statusLabel = (s) => ({
  UNASSIGNED: 'Chờ nhận', ASSIGNED: 'Đã nhận — đến lấy hàng',
  PICKED_UP: 'Đã lấy hàng — đang giao', DELIVERED: 'Đã giao xong',
}[s] || s)

const loadData = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [available, mine] = await Promise.all([
      orderService.getAvailableForDelivery(),
      orderService.getMyDeliveries(),
    ])
    availableDeliveries.value = available
    myDeliveries.value = mine.filter((d) => d.status !== 'DELIVERED')

    // Fetch order details for all unique orderIds
    const allIds = [...new Set([
      ...available.map((d) => d.orderId),
      ...mine.map((d) => d.orderId),
    ])].filter(Boolean)

    await Promise.all(allIds.map(async (id) => {
      try {
        const detail = await orderService.getById(id)
        if (detail) orderDetails.value[id] = detail
      } catch { /* ignore */ }
    }))
  } catch (err) {
    errorMessage.value = err.message || 'Không thể tải dữ liệu'
  } finally {
    isLoading.value = false
  }
}

const acceptDelivery = async (delivery) => {
  if (!shipperId.value) { errorMessage.value = 'Không xác định được tài khoản shipper'; return }
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await orderService.selfAssign(delivery.orderId, shipperId.value)
    successMessage.value = `Đã nhận đơn #${delivery.orderId}. Hãy đến nhà hàng lấy hàng!`
    await loadData()
  } catch (err) {
    errorMessage.value = err.message || 'Không thể nhận đơn'
  }
}

const pickupOrder = async (delivery) => {
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await orderService.markPickup(delivery.orderId)
    successMessage.value = `Đã xác nhận lấy hàng đơn #${delivery.orderId}`
    await loadData()
  } catch (err) {
    errorMessage.value = err.message || 'Không thể xác nhận lấy hàng'
  }
}

const deliverOrder = async (delivery) => {
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await orderService.markDelivered(delivery.orderId)
    successMessage.value = `Đơn #${delivery.orderId} đã giao thành công!`
    await loadData()
  } catch (err) {
    errorMessage.value = err.message || 'Không thể hoàn thành giao hàng'
  }
}

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

// --- Map for active delivery ---
const {
  markers: activeDeliveryMapMarkers,
  route: activeDeliveryMapRoute,
  loadForOrder,
  reset: resetRouteMap,
} = useOrderRouteMap({ restaurantService, mapService })
const activeDelivery = computed(() => myDeliveries.value.find((d) => ['ASSIGNED', 'PICKED_UP'].includes(d.status)))

const { sendLocation } = useShipperTracking()

let gpsWatchId = null

async function buildDeliveryMap(delivery) {
  if (!delivery) { resetRouteMap(); return }
  const ord = orderDetails.value[delivery.orderId]
  if (!ord) return
  await loadForOrder(ord)
}

function startGpsBroadcast() {
  if (!navigator.geolocation || gpsWatchId) return
  gpsWatchId = navigator.geolocation.watchPosition((pos) => {
    const lat = pos.coords.latitude
    const lng = pos.coords.longitude
    const delivery = activeDelivery.value
    if (delivery?.orderId && shipperId.value) {
      sendLocation(delivery.orderId, shipperId.value, lat, lng)
    }
  }, () => {}, { enableHighAccuracy: true, maximumAge: 5000 })
}

function stopGpsBroadcast() {
  if (gpsWatchId) { navigator.geolocation.clearWatch(gpsWatchId); gpsWatchId = null }
}

watch(activeDelivery, (d) => {
  buildDeliveryMap(d)
  if (d) startGpsBroadcast()
  else stopGpsBroadcast()
}, { immediate: false })

watch(orderDetails, () => {
  if (activeDelivery.value) buildDeliveryMap(activeDelivery.value)
}, { deep: true })

// Poll every 30s for new available orders
let pollTimer = null
onMounted(() => { loadData(); pollTimer = setInterval(loadData, 30000) })
onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
  stopGpsBroadcast()
  resetRouteMap()
})
</script>

<template>
  <section class="shipper-page">
    <aside class="shipper-sidebar">
      <div class="sidebar-brand">
        <div class="logo-box">FD</div>
        <span>Shipper</span>
      </div>
      <nav class="sidebar-nav">
        <button class="nav-btn active" type="button">Tổng quan</button>
        <button class="nav-btn" type="button" @click="router.push('/shipper/history')">Lịch sử</button>
      </nav>
      <div class="sidebar-spacer"></div>
      <button class="nav-btn logout" type="button" @click="logout">Đăng xuất</button>
    </aside>

    <main class="shipper-main">
      <header class="shipper-header">
        <div>
          <h1>Xin chào, {{ userName }}!</h1>
          <p class="subtitle">Đơn hàng được cập nhật mỗi 30 giây.</p>
        </div>
        <div class="header-actions">
          <button
            type="button"
            :class="['toggle-btn', { online: isOnline }]"
            @click="isOnline = !isOnline"
          >
            {{ isOnline ? 'Đang hoạt động' : 'Đã tắt' }}
          </button>
          <button type="button" class="refresh-btn" :disabled="isLoading" @click="loadData">
            {{ isLoading ? 'Đang tải...' : 'Làm mới' }}
          </button>
        </div>
      </header>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success-text">{{ successMessage }}</p>

      <!-- My active deliveries -->
      <section v-if="myDeliveries.length" class="orders-section">
        <h2 class="section-title">Đơn đang xử lý ({{ myDeliveries.length }})</h2>
        <div class="orders-grid">
          <article v-for="delivery in myDeliveries" :key="delivery.id" class="delivery-card highlight">
            <div class="delivery-info">
              <span class="order-num">Đơn #{{ delivery.orderId }}</span>
              <span class="delivery-status">{{ statusLabel(delivery.status) }}</span>
              <template v-if="orderDetails[delivery.orderId]">
                <p class="address">Địa chỉ: {{ orderDetails[delivery.orderId].deliveryAddress || '—' }}</p>
                <p class="price">Giá trị đơn: {{ formatPrice(orderDetails[delivery.orderId].totalAmount) }}</p>
                <p class="restaurant-name">Nhà hàng: {{ orderDetails[delivery.orderId].restaurantName || '' }}</p>
              </template>
              <p v-if="delivery.createdAt" class="time-text">Nhận lúc: {{ formatTime(delivery.createdAt) }}</p>
            </div>
            <div class="card-actions">
              <button
                v-if="delivery.status === 'ASSIGNED'"
                type="button"
                class="action-btn pickup"
                @click="pickupOrder(delivery)"
              >
                Đã lấy hàng
              </button>
              <button
                v-if="delivery.status === 'PICKED_UP'"
                type="button"
                class="action-btn complete"
                @click="deliverOrder(delivery)"
              >
                Đã giao xong
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- Route map for active delivery -->
      <section v-if="activeDeliveryMapMarkers.length" class="orders-section">
        <h2 class="section-title">Tuyến đường giao hàng</h2>
        <MapView :markers="activeDeliveryMapMarkers" :route="activeDeliveryMapRoute" height="280px" />
      </section>

      <!-- Available orders to accept -->
      <section class="orders-section">
        <h2 class="section-title">Đơn chờ nhận ({{ availableDeliveries.length }})</h2>
        <p v-if="!availableDeliveries.length && !isLoading" class="empty-text">
          Hiện không có đơn hàng nào sẵn sàng giao. Đơn mới sẽ hiện khi nhà hàng chuẩn bị xong.
        </p>
        <div v-else class="orders-grid">
          <article v-for="delivery in availableDeliveries" :key="delivery.id" class="delivery-card">
            <div class="delivery-info">
              <span class="order-num">Đơn #{{ delivery.orderId }}</span>
              <template v-if="orderDetails[delivery.orderId]">
                <p class="address">Địa chỉ: {{ orderDetails[delivery.orderId].deliveryAddress || '—' }}</p>
                <p class="price">Giá trị đơn: {{ formatPrice(orderDetails[delivery.orderId].totalAmount) }}</p>
                <p class="restaurant-name">Nhà hàng: {{ orderDetails[delivery.orderId].restaurantName || '' }}</p>
              </template>
            </div>
            <button
              type="button"
              class="action-btn accept"
              @click="acceptDelivery(delivery)"
            >
              Nhận đơn
            </button>
          </article>
        </div>
      </section>
    </main>
  </section>
</template>

<style scoped src="@/assets/styles/shipper-views.css"></style>
<style scoped>
.subtitle { color: #8e95a5; font-size: 0.9rem; margin: 0; }
.section-title { font-size: 1.1rem; font-weight: 700; color: #1f293b; margin: 0 0 1rem; }
.delivery-status {
  display: inline-block;
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  background: #fff3cd;
  color: #856404;
  margin-bottom: 0.4rem;
}
.highlight .delivery-status { background: #d1e7dd; color: #0a5c36; }
.order-num { font-weight: 700; font-size: 1rem; color: #1f293b; display: block; margin-bottom: 0.3rem; }
.address { font-size: 0.85rem; color: #555; margin: 0.2rem 0; }
.price { font-size: 0.9rem; font-weight: 600; color: #f8143f; margin: 0.2rem 0; }
.restaurant-name { font-size: 0.82rem; color: #777; margin: 0.15rem 0; }
.time-text { font-size: 0.78rem; color: #aaa; margin-top: 0.3rem; }
.card-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap; }
.action-btn.pickup { background: #cfe2ff; color: #084298; }
.action-btn.pickup:hover { background: #b6d4fe; }
.success-text { color: #0f7b3f; font-weight: 600; margin-bottom: 0.5rem; background: #d1e7dd; padding: 0.6rem 1rem; border-radius: 8px; }
</style>
