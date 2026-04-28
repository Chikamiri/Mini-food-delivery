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
    <button type="button" class="back-btn" @click="router.push('/orders/history')">
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

<style scoped>
.tracking-page {
  max-width: 780px;
  margin: 0 auto;
  padding: 1.2rem;
  min-height: 100vh;
  background: radial-gradient(circle at top, #fff7fa 0%, #f7f8fc 55%, #f3f5fa 100%);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid #d8deea;
  background: #fff;
  color: #2b3346;
  border-radius: 10px;
  padding: 0.45rem 0.72rem;
  font-weight: 600;
  cursor: pointer;
}

.status-text { margin-top: 1rem; color: #485166; }
.status-text.error { color: #c02144; }

.tracking-header {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  background: #fff;
  border: 1px solid #e8ecf4;
  border-radius: 16px;
  padding: 1rem;
}

.tracking-header h1 { margin: 0; font-size: 1.35rem; color: #171f2f; }
.tracking-date { margin: 0.2rem 0 0; color: #7c8595; font-size: 0.85rem; }

.status-chip {
  border-radius: 999px;
  padding: 0.32rem 0.75rem;
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
}
.status-chip.active { background: #e6f9ee; color: #0f7b3f; }
.status-chip.cancelled { background: #ffedf0; color: #c02144; }

/* Stepper */
.stepper-section {
  margin-top: 1rem;
  background: #fff;
  border: 1px solid #e8ecf4;
  border-radius: 16px;
  padding: 1.2rem;
}

.stepper { display: flex; flex-direction: column; gap: 0; }

.step {
  display: grid;
  grid-template-columns: 48px 1fr;
  grid-template-rows: auto auto;
  gap: 0 0.75rem;
  position: relative;
}

.step-dot {
  grid-row: 1;
  grid-column: 1;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  border: 2px solid #e2e5eb;
  background: #f8f9fc;
  z-index: 2;
  transition: all 0.3s ease;
}

.step.completed .step-dot { border-color: #22c55e; background: #e6f9ee; }
.step.current .step-dot { border-color: #f8143f; background: #fff0f3; box-shadow: 0 0 0 4px rgba(248,20,63,0.12); }

.step-info {
  grid-row: 1;
  grid-column: 2;
  padding: 0.6rem 0;
}

.step-info strong { display: block; color: #1f293b; font-size: 0.92rem; }
.step.upcoming .step-info strong { color: #a0a8b6; }
.step-info small { color: #7c8595; font-size: 0.8rem; }
.step.upcoming .step-info small { color: #c5cad4; }

.step-line {
  grid-row: 2;
  grid-column: 1;
  width: 2px;
  height: 18px;
  margin: 0 auto;
  background: #e2e5eb;
  transition: background 0.3s ease;
}

.step-line.filled { background: #22c55e; }

/* Cancelled */
.cancelled-section {
  margin-top: 1rem;
  background: #fff;
  border: 1px solid #fdd;
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
}

.cancelled-icon { font-size: 2.5rem; }
.cancelled-section h3 { margin: 0.5rem 0 0.3rem; color: #c02144; }
.cancelled-section p { margin: 0; color: #7c8595; }

/* Details */
.detail-card {
  margin-top: 1rem;
  background: #fff;
  border: 1px solid #e8ecf4;
  border-radius: 16px;
  padding: 1rem;
}

.detail-card h2 { margin: 0 0 0.8rem; font-size: 1rem; color: #1d273a; }

.detail-grid { display: grid; gap: 0.65rem; }

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.4rem 0;
  border-bottom: 1px dashed #edf1f7;
}

.detail-label { color: #6f7788; font-size: 0.88rem; }
.detail-value { color: #202a3c; font-weight: 600; font-size: 0.9rem; }
.detail-value.highlight { color: #f8143f; font-size: 1.05rem; }

.action-row {
  margin-top: 1rem;
  text-align: center;
}

.cancel-btn {
  border: 1px solid #fcc;
  background: #fff0f2;
  color: #c02144;
  border-radius: 12px;
  padding: 0.65rem 1.5rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.cancel-btn:hover { background: #ffe0e4; }

@media (max-width: 600px) {
  .tracking-header { flex-direction: column; }
}

.shipper-online {
  font-size: 0.85rem;
  color: #168247;
  margin: 0 0 0.6rem;
  font-weight: 600;
}
</style>
