<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import orderService from '@/services/orderService'
import MapView from '@/components/MapView.vue'
import mapService from '@/services/mapService'
import restaurantService from '@/services/restaurantService'
import ShipperSidebar from '@/components/ShipperSidebar.vue'
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

const shipperId = computed(() => authStore.user?.id || authStore.user?.userId)

const formatPrice = (val) => `${Number(val || 0).toLocaleString('vi-VN')}đ`
const formatTime = (val) => {
  if (!val) return ''
  return new Date(val).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const statusLabel = (s) => ({
  UNASSIGNED: 'Chờ nhận',
  ASSIGNED: 'Đang đến lấy hàng',
  PICKED_UP: 'Đang giao',
  DELIVERED: 'Đã giao xong',
}[s] || s)

const acceptingOrderId = ref(null)

const loadData = async () => {
  if (!isOnline.value) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [available, mine] = await Promise.all([
      orderService.getAvailableForDelivery(),
      orderService.getMyDeliveries(),
    ])
    availableDeliveries.value = available
    myDeliveries.value = mine.filter((d) => d.status !== 'DELIVERED')

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
  if (!isOnline.value) {
    errorMessage.value = 'Bạn đang ngoại tuyến. Hãy bật "Đang hoạt động" để nhận đơn.'
    return
  }
  if (!shipperId.value) { errorMessage.value = 'Không xác định được tài khoản shipper'; return }
  if (acceptingOrderId.value) return
  errorMessage.value = ''
  successMessage.value = ''
  acceptingOrderId.value = delivery.orderId
  try {
    await orderService.selfAssign(delivery.orderId, shipperId.value)
    successMessage.value = `Đã nhận đơn #${delivery.orderId}. Hãy đến nhà hàng lấy hàng!`
    await loadData()
  } catch (err) {
    errorMessage.value = err.message || 'Không thể nhận đơn'
  } finally {
    acceptingOrderId.value = null
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
    if (!isOnline.value) return
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

let pollTimer = null
function startPolling() {
  if (pollTimer || !isOnline.value) return
  pollTimer = setInterval(() => {
    if (isOnline.value) loadData()
  }, 30000)
}
function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

watch(isOnline, (on) => {
  if (on) {
    loadData()
    startPolling()
  } else {
    stopPolling()
    successMessage.value = ''
  }
})

onMounted(() => {
  loadData()
  startPolling()
})
onUnmounted(() => {
  stopPolling()
  stopGpsBroadcast()
  resetRouteMap()
})
</script>

<template>
  <div class="shipper-layout">
    <ShipperSidebar active-key="dashboard" @logout="logout" />

    <main class="shipper-main">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Tổng quan</h1>
          <p class="page-subtitle">Cập nhật mỗi 30 giây · {{ new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' }) }}</p>
        </div>
        <div class="header-actions">
          <button
            type="button"
            :class="['status-toggle', isOnline ? 'online' : 'offline']"
            @click="isOnline = !isOnline"
          >
            {{ isOnline ? 'Đang hoạt động' : 'Ngoại tuyến' }}
          </button>
          <button type="button" class="btn btn-ghost" :disabled="isLoading" @click="loadData">
            {{ isLoading ? 'Đang tải...' : 'Làm mới' }}
          </button>
        </div>
      </div>

      <!-- Alerts -->
      <div v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

      <!-- Active deliveries -->
      <div v-if="myDeliveries.length" class="section-block">
        <div class="section-head">
          <h2>Đơn đang xử lý</h2>
          <span class="count-badge">{{ myDeliveries.length }}</span>
        </div>
        <div class="deliveries-grid">
          <article v-for="delivery in myDeliveries" :key="delivery.id" class="delivery-card card-active">
            <div class="dc-top">
              <span class="dc-id">Đơn #{{ delivery.orderId }}</span>
              <span
                :class="['dc-badge', delivery.status === 'ASSIGNED' ? 'badge-assigned' : 'badge-picked-up']"
              >
                {{ statusLabel(delivery.status) }}
              </span>
            </div>
            <template v-if="orderDetails[delivery.orderId]">
              <div class="dc-rows">
                <div class="dc-row">
                  <span class="dc-label">Nhà hàng</span>
                  <span class="dc-value">{{ orderDetails[delivery.orderId].restaurantName || '—' }}</span>
                </div>
                <div class="dc-row">
                  <span class="dc-label">Giao đến</span>
                  <span class="dc-value">{{ orderDetails[delivery.orderId].deliveryAddress || '—' }}</span>
                </div>
                <div class="dc-row">
                  <span class="dc-label">Giá trị</span>
                  <span class="dc-value dc-amount">{{ formatPrice(orderDetails[delivery.orderId].totalAmount) }}</span>
                </div>
              </div>
            </template>
            <p v-if="delivery.createdAt" class="dc-time">Nhận lúc: {{ formatTime(delivery.createdAt) }}</p>
            <div class="dc-footer">
              <button
                v-if="delivery.status === 'ASSIGNED'"
                type="button"
                class="btn btn-blue"
                style="flex:1"
                @click="pickupOrder(delivery)"
              >
                Đã lấy hàng
              </button>
              <button
                v-if="delivery.status === 'PICKED_UP'"
                type="button"
                class="btn btn-danger"
                style="flex:1"
                @click="deliverOrder(delivery)"
              >
                Đã giao xong
              </button>
            </div>
          </article>
        </div>
      </div>

      <!-- Route map -->
      <div v-if="activeDeliveryMapMarkers.length" class="map-section section-block">
        <div class="map-head">
          <h2>Tuyến đường giao hàng</h2>
        </div>
        <MapView :markers="activeDeliveryMapMarkers" :route="activeDeliveryMapRoute" height="260px" />
      </div>

      <!-- Available orders -->
      <div class="section-block">
        <div class="section-head">
          <h2>Đơn chờ nhận</h2>
          <span class="count-badge">{{ availableDeliveries.length }}</span>
        </div>
        <div v-if="!availableDeliveries.length && !isLoading" class="empty-state">
          <p>Hiện không có đơn hàng nào sẵn sàng.<br />Đơn mới sẽ xuất hiện khi nhà hàng chuẩn bị xong.</p>
        </div>
        <div v-else class="deliveries-grid">
          <article v-for="delivery in availableDeliveries" :key="delivery.id" class="delivery-card">
            <div class="dc-top">
              <span class="dc-id">Đơn #{{ delivery.orderId }}</span>
              <span class="dc-badge badge-available">Chờ nhận</span>
            </div>
            <template v-if="orderDetails[delivery.orderId]">
              <div class="dc-rows">
                <div class="dc-row">
                  <span class="dc-label">Nhà hàng</span>
                  <span class="dc-value">{{ orderDetails[delivery.orderId].restaurantName || '—' }}</span>
                </div>
                <div class="dc-row">
                  <span class="dc-label">Giao đến</span>
                  <span class="dc-value">{{ orderDetails[delivery.orderId].deliveryAddress || '—' }}</span>
                </div>
                <div class="dc-row">
                  <span class="dc-label">Giá trị</span>
                  <span class="dc-value dc-amount">{{ formatPrice(orderDetails[delivery.orderId].totalAmount) }}</span>
                </div>
              </div>
            </template>
            <div class="dc-footer">
              <button
                type="button"
                class="btn btn-primary"
                style="flex:1"
                :disabled="!isOnline || acceptingOrderId === delivery.orderId"
                @click="acceptDelivery(delivery)"
              >
                {{
                  acceptingOrderId === delivery.orderId
                    ? 'Đang nhận...'
                    : !isOnline
                      ? 'Tắt nhận đơn khi ngoại tuyến'
                      : 'Nhận đơn này'
                }}
              </button>
            </div>
          </article>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped src="@/assets/styles/shipper-views.css"></style>
