<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import iconBackArrow from '@/assets/icon/back-arrow.svg'
import MapView from '@/components/MapView.vue'
import mapService from '@/services/mapService'
import restaurantService from '@/services/restaurantService'
import { useShipperTracking } from '@/composables/useShipperTracking'
import { useOrderRouteMap } from '@/composables/useOrderRouteMap'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const pollingId = ref(null)

const order = computed(() => orderStore.currentOrder)
const isLoading = computed(() => orderStore.isLoading)
const error = computed(() => orderStore.error)

const statusSteps = [
  { key: 'PENDING', label: 'Đặt hàng', icon: '1', desc: 'Đơn hàng đã được gửi đi' },
  { key: 'CONFIRMED', label: 'Xác nhận', icon: '2', desc: 'Nhà hàng đã nhận đơn' },
  { key: 'PREPARING', label: 'Chuẩn bị', icon: '3', desc: 'Đang chế biến món ăn' },
  { key: 'READY', label: 'Sẵn sàng', icon: '4', desc: 'Món đã sẵn sàng giao' },
  { key: 'DELIVERING', label: 'Đang giao', icon: '5', desc: 'Shipper đang trên đường' },
  { key: 'DELIVERED', label: 'Hoàn thành', icon: '6', desc: 'Đã giao thành công' },
]

const currentStepIndex = computed(() => {
  if (!order.value) return -1
  const status = String(order.value.status || '').toUpperCase()
  if (status === 'CANCELLED') return -2
  return statusSteps.findIndex((s) => s.key === status)
})

const isCancelled = computed(() => String(order.value?.status || '').toUpperCase() === 'CANCELLED')
const canCancel = computed(() => {
  const idx = currentStepIndex.value
  return idx >= 0 && idx <= 1 // Only PENDING or CONFIRMED
})

const formatPrice = (val) => `${Number(val || 0).toLocaleString('vi-VN')}đ`
const formatDate = (val) => {
  if (!val) return ''
  try { return new Date(val).toLocaleString('vi-VN') } catch { return val }
}

const cancelOrder = async () => {
  if (!order.value?.id) return
  const ok = window.confirm('Bạn có chắc muốn hủy đơn hàng này?')
  if (!ok) return
  try {
    await orderStore.cancelOrder(order.value.id)
    await orderStore.fetchOrderById(route.params.id)
  } catch { /* error handled by store */ }
}

const loadOrder = () => {
  if (route.params.id) {
    orderStore.fetchOrderById(route.params.id)
  }
}

// --- Map tracking ---
const { markers: mapMarkers, route: mapRoute, loadForOrder, reset: resetMap } = useOrderRouteMap({
  restaurantService,
  mapService,
})
const { shipperPos, connect: wsConnect, disconnect: wsDisconnect } = useShipperTracking()
const TRACKING_STATUSES = ['READY', 'DELIVERING', 'SHIPPING', 'DELIVERED']
let wsConnected = false

async function buildMap(ord) {
  if (!ord) return
  const status = String(ord.status || '').toUpperCase()
  if (!TRACKING_STATUSES.includes(status)) {
    resetMap()
    return
  }
  await loadForOrder(ord)

  // WebSocket for shipper position
  if (!wsConnected && (status === 'DELIVERING' || status === 'SHIPPING')) {
    wsConnected = true
    wsConnect(ord.id, (pos) => {
      const existing = mapMarkers.value.filter((m) => m.label !== 'Shipper')
      mapMarkers.value = [...existing, { lat: pos.lat, lng: pos.lng, label: 'Shipper', color: 'green' }]
    })
  }
}

watch(order, (ord) => buildMap(ord), { immediate: false })

onMounted(() => {
  loadOrder()
  // Poll every 15 seconds for real-time updates
  pollingId.value = setInterval(loadOrder, 15000)
})

onUnmounted(() => {
  if (pollingId.value) clearInterval(pollingId.value)
  resetMap()
  wsDisconnect()
})
</script>

<template>
  <section class="tracking-page">
    <button type="button" class="back-btn" @click="router.push('/browse?view=orders')">
      <img :src="iconBackArrow" alt="" width="16" height="16" />
      Quay lại lịch sử
    </button>

    <p v-if="isLoading && !order" class="status-text">Đang tải thông tin đơn hàng...</p>
    <p v-else-if="error && !order" class="status-text error">{{ error }}</p>

    <template v-if="order">
      <header class="tracking-header">
        <div>
          <h1>Đơn hàng #{{ order.id }}</h1>
          <p class="tracking-date">{{ formatDate(order.createdAt || order.created_at) }}</p>
        </div>
        <span :class="['status-chip', isCancelled ? 'cancelled' : 'active']">
          {{ isCancelled ? 'Đã hủy' : statusSteps[currentStepIndex]?.label || order.status }}
        </span>
      </header>

      <!-- Progress stepper -->
      <section v-if="!isCancelled" class="stepper-section">
        <div class="stepper">
          <div
            v-for="(step, idx) in statusSteps"
            :key="step.key"
            class="step"
            :class="{
              completed: idx < currentStepIndex,
              current: idx === currentStepIndex,
              upcoming: idx > currentStepIndex,
            }"
          >
            <div class="step-dot">
              <span>{{ step.icon }}</span>
            </div>
            <div class="step-info">
              <strong>{{ step.label }}</strong>
              <small>{{ step.desc }}</small>
            </div>
            <div v-if="idx < statusSteps.length - 1" class="step-line" :class="{ filled: idx < currentStepIndex }"></div>
          </div>
        </div>
      </section>

      <section v-else class="cancelled-section">
        <span class="cancelled-icon">X</span>
        <h3>Đơn hàng đã bị hủy</h3>
        <p>{{ order.cancelReason || order.note || 'Không có lý do cụ thể.' }}</p>
      </section>

      <!-- Live map for READY / SHIPPING / DELIVERING / DELIVERED -->
      <section v-if="mapMarkers.length" class="detail-card">
        <h2>Bản đồ giao hàng</h2>
        <p v-if="shipperPos" class="shipper-online">Shipper đang trực tuyến</p>
        <MapView :markers="mapMarkers" :route="mapRoute" height="300px" />
      </section>

      <!-- Order details -->
      <section class="detail-card">
        <h2>Chi tiết đơn hàng</h2>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Địa chỉ giao</span>
            <span class="detail-value">{{ order.deliveryAddress || order.address || 'Chưa có' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Phương thức thanh toán</span>
            <span class="detail-value">{{ order.paymentMethod || 'COD' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Tổng tiền</span>
            <span class="detail-value highlight">{{ formatPrice(order.totalAmount || order.total) }}</span>
          </div>
          <div v-if="order.note" class="detail-item">
            <span class="detail-label">Ghi chú</span>
            <span class="detail-value">{{ order.note }}</span>
          </div>
        </div>
      </section>

      <!-- Cancel button -->
      <div v-if="canCancel" class="action-row">
        <button type="button" class="cancel-btn" @click="cancelOrder">Hủy đơn hàng</button>
      </div>
    </template>
  </section>
</template>

<style scoped src="@/assets/styles/user-order-tracking.css"></style>
