<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import userService from '@/services/userService'
import restaurantService from '@/services/restaurantService'
import iconBackArrow from '@/assets/icon/back-arrow.svg'
import {
  formatPriceVND,
  loadCheckoutAddressesAction,
  submitCheckoutOrderAction,
} from '@/utils/checkoutViewUtils'
import { getDeliveryFeeBySubtotal, getDiscountBySubtotal } from '@/utils/pricingUtils'
import MapView from '@/components/MapView.vue'
import mapService from '@/services/mapService'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()

const deliveryAddresses = ref([])
const selectedAddressId = ref(null)
const orderTypes = ['Giao tiêu chuẩn', 'Giao hẹn giờ', 'Nhận tại quán']
const selectedOrderType = ref(orderTypes[0])
const desiredDeliveryTime = ref('')
const orderNote = ref(cartStore.note || '')
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const currentTime = ref(new Date())
let timeTicker = null
const addressDistanceMap = ref({})
const restaurantPoint = ref(null)

const cartItems = computed(() => cartStore.items)
const subtotal = computed(() => cartStore.subtotal)
const deliveryFee = computed(() => getDeliveryFeeBySubtotal(subtotal.value))
const discount = computed(() => getDiscountBySubtotal(subtotal.value))
const total = computed(() => subtotal.value + deliveryFee.value - discount.value)
const selectedAddress = computed(() =>
  deliveryAddresses.value.find((address) => address.id === selectedAddressId.value),
)
const primaryRestaurantId = computed(() => Number(cartItems.value[0]?.restaurantId || 0))
const estimatedDeliveryTime = computed(() => {
  if (selectedOrderType.value === 'Giao hẹn giờ' && desiredDeliveryTime.value) {
    const [hours, minutes] = desiredDeliveryTime.value.split(':').map(Number)
    const base = new Date()
    base.setHours(Number.isFinite(hours) ? hours : base.getHours())
    base.setMinutes(Number.isFinite(minutes) ? minutes : base.getMinutes())
    base.setSeconds(0, 0)
    const eta = new Date(base.getTime() + 30 * 60 * 1000)
    return eta.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }
  const eta = new Date(currentTime.value.getTime() + 30 * 60 * 1000)
  return eta.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
})

const formatPrice = (value) => formatPriceVND(value)
const loadAddresses = () =>
  loadCheckoutAddressesAction(userService, deliveryAddresses, selectedAddressId, errorMessage)
const submitOrder = () =>
  submitCheckoutOrderAction({
    errorMessage,
    successMessage,
    cartItems,
    selectedAddress,
    isSubmitting,
    orderNote,
    orderStore,
    cartStore,
    router,
    selectedOrderType,
    desiredDeliveryTime,
  })

// --- Map for selected address ---
const addressMapMarkers = ref([])

async function resolveAddressMarker(address) {
  if (!address) { addressMapMarkers.value = []; return }
  if (address.latitude && address.longitude) {
    addressMapMarkers.value = [{
      lat: Number(address.latitude),
      lng: Number(address.longitude),
      label: address.label || 'Giao đến đây',
      color: 'red',
    }]
  } else if (address.addressLine || address.detail) {
    try {
      const results = await mapService.searchAddress(address.addressLine || address.detail)
      if (results.length) {
        addressMapMarkers.value = [{
          lat: Number(results[0].lat),
          lng: Number(results[0].lng || results[0].lon),
          label: address.label || 'Giao đến đây',
          color: 'red',
        }]
      }
    } catch (_) { addressMapMarkers.value = [] }
  }
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function formatDistance(km) {
  if (!Number.isFinite(km)) return ''
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

async function resolveRestaurantPoint() {
  if (!primaryRestaurantId.value) {
    restaurantPoint.value = null
    return
  }
  try {
    const restaurant = await restaurantService.getById(primaryRestaurantId.value)
    if (restaurant?.latitude && restaurant?.longitude) {
      restaurantPoint.value = { lat: Number(restaurant.latitude), lng: Number(restaurant.longitude) }
      return
    }
    if (restaurant?.address) {
      const geo = await mapService.searchAddress(restaurant.address)
      if (geo.length) {
        restaurantPoint.value = { lat: Number(geo[0].lat), lng: Number(geo[0].lng || geo[0].lon) }
        return
      }
    }
  } catch (_) {}
  restaurantPoint.value = null
}

async function resolveAddressPoint(address) {
  if (!address) return null
  if (address.latitude && address.longitude) {
    return { lat: Number(address.latitude), lng: Number(address.longitude) }
  }
  try {
    const q = address.addressLine || address.detail || ''
    const geo = await mapService.searchAddress(q)
    if (geo.length) return { lat: Number(geo[0].lat), lng: Number(geo[0].lng || geo[0].lon) }
  } catch (_) {}
  return null
}

async function calculateAddressDistances() {
  addressDistanceMap.value = {}
  if (!restaurantPoint.value || !deliveryAddresses.value.length) return
  const nextMap = {}
  for (const address of deliveryAddresses.value) {
    const point = await resolveAddressPoint(address)
    if (!point) continue
    const km = haversineKm(restaurantPoint.value.lat, restaurantPoint.value.lng, point.lat, point.lng)
    nextMap[address.id] = formatDistance(km)
  }
  addressDistanceMap.value = nextMap
}

watch(selectedAddress, (addr) => resolveAddressMarker(addr))
watch(primaryRestaurantId, async () => {
  await resolveRestaurantPoint()
  await calculateAddressDistances()
})
watch(deliveryAddresses, () => {
  calculateAddressDistances()
}, { deep: true })

onMounted(() => {
  loadAddresses()
  resolveRestaurantPoint().then(calculateAddressDistances)
  timeTicker = setInterval(() => {
    currentTime.value = new Date()
  }, 30000)
})

onUnmounted(() => {
  if (timeTicker) clearInterval(timeTicker)
})
</script>

<template>
  <section class="checkout-page">
    <main class="checkout-main">
      <header class="checkout-header">
        <RouterLink to="/cart" class="back-link">
          <img :src="iconBackArrow" alt="" width="16" height="16" />
          Quay lại giỏ hàng
        </RouterLink>
        <h1>Thanh toán an toàn</h1>
      </header>

      <section class="checkout-section">
        <h2>Địa chỉ giao hàng</h2>
        <p v-if="!deliveryAddresses.length" class="empty-address">
          Bạn chưa có địa chỉ nào.
          <RouterLink to="/addresses" class="add-address-link">Thêm địa chỉ →</RouterLink>
        </p>
        <div v-else class="address-grid">
          <article
            v-for="item in deliveryAddresses"
            :key="item.id"
            class="address-card"
            :class="{ active: item.id === selectedAddressId }"
            role="button"
            tabindex="0"
            @click="selectedAddressId = item.id"
          >
            <p class="address-label">{{ item.label || 'Địa chỉ' }}</p>
            <p class="address-detail">{{ item.addressLine || item.detail }}</p>
            <p v-if="addressDistanceMap[item.id]" class="address-distance">
              Cách nhà hàng: {{ addressDistanceMap[item.id] }}
            </p>
          </article>
        </div>
        <MapView
          v-if="addressMapMarkers.length"
          :markers="addressMapMarkers"
          height="220px"
          style="margin-top:0.75rem"
        />
      </section>

      <section class="checkout-section">
        <h2>Loại đơn hàng</h2>
        <div class="chips-row">
          <button
            v-for="item in orderTypes"
            :key="item"
            class="chip-btn"
              :class="{ active: selectedOrderType === item }"
              @click="selectedOrderType = item"
          >
            {{ item }}
          </button>
        </div>
      </section>

      <section class="checkout-section form-grid">
        <div>
          <label>Thời gian giao dự kiến</label>
          <div class="time-row">
            <span>{{ estimatedDeliveryTime }}</span>
            <small>Ước tính sau 30 phút từ thời điểm hiện tại</small>
          </div>
        </div>
        <div v-if="selectedOrderType === 'Giao hẹn giờ'">
          <label>Giờ mong muốn giao</label>
          <input
            v-model="desiredDeliveryTime"
            type="time"
            class="desired-time-input"
          />
        </div>
        <div v-else-if="selectedOrderType === 'Nhận tại quán'" class="pickup-note-box">
          <label>Hình thức nhận</label>
          <p>Bạn sẽ đến nhà hàng để nhận món sau khi quán báo sẵn sàng.</p>
        </div>
        <div>
          <label>Ghi chú cho quán</label>
          <textarea
            v-model="orderNote"
            placeholder="Ví dụ: ít đá, không hành, gọi trước khi giao..."
          ></textarea>
        </div>
      </section>
      <p v-if="errorMessage" class="checkout-message checkout-message--error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="checkout-message checkout-message--success">{{ successMessage }}</p>
    </main>

    <aside class="checkout-summary">
      <div class="summary-card">
        <div class="summary-head">
          <h3>Giỏ hàng</h3>
          <span>{{ cartItems.length }} món</span>
        </div>

        <div class="summary-items">
          <article v-for="item in cartItems" :key="item.id" class="summary-item">
            <p class="restaurant-name">Từ {{ item.restaurantName || 'Nhà hàng' }}</p>
            <div class="item-row">
              <span>{{ item.name }}</span>
              <strong>{{ formatPrice(item.price) }}</strong>
            </div>
            <small>Số lượng: {{ item.quantity }}</small>
          </article>
        </div>

        <div class="bill-detail">
          <div><span>Tạm tính</span><strong>{{ formatPrice(subtotal) }}</strong></div>
          <div><span>Phí giao hàng</span><strong>{{ formatPrice(deliveryFee) }}</strong></div>
          <div><span>Giảm giá</span><strong>-{{ formatPrice(discount) }}</strong></div>
        </div>

        <div class="total-row">
          <span>Tổng thanh toán (COD)</span>
          <strong>{{ formatPrice(total) }}</strong>
        </div>

        <button class="pay-btn" :disabled="isSubmitting || !cartItems.length" @click="submitOrder">
          {{ isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt đơn' }}
        </button>
      </div>
    </aside>
  </section>
</template>

<style scoped>
.checkout-page {
  max-width: 1220px;
  margin: 0 auto;
  padding: 1.25rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 345px;
  gap: 1rem;
  min-height: 100vh;
  background: radial-gradient(circle at top, #fff7fa 0%, #f7f8fc 55%, #f3f5fa 100%);
}

.checkout-main,
.summary-card {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #e8ecf4;
  box-shadow: 0 10px 24px rgba(22, 33, 52, 0.07);
}

.checkout-main {
  padding: 1.1rem;
}

.checkout-header {
  border-bottom: 1px solid #edf1f7;
  padding-bottom: 0.9rem;
  margin-bottom: 0.8rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #485166;
  font-weight: 600;
  font-size: 0.88rem;
  text-decoration: none;
  margin-bottom: 0.5rem;
}

.back-link:hover { color: #f8143f; }

.empty-address {
  color: #7c8595;
  padding: 1rem;
  text-align: center;
}

.add-address-link {
  display: inline-block;
  margin-top: 0.4rem;
  color: #f8143f;
  font-weight: 600;
  text-decoration: none;
}

.checkout-header h1 {
  margin: 0;
  font-size: clamp(1.25rem, 2.5vw, 1.65rem);
  color: #171f2f;
}

.checkout-section {
  margin-top: 1rem;
}

.checkout-section h2 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: #1f293b;
}

.address-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.address-card {
  border: 1px dashed #d5dce9;
  border-radius: 14px;
  padding: 0.85rem;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.address-card.active {
  border-style: solid;
  border-color: #f8143f;
  background: #fff3f6;
}

.address-label {
  margin: 0;
  font-weight: 700;
  color: #2c364a;
}

.address-detail {
  margin: 0.3rem 0 0;
  color: #677185;
  font-size: 0.9rem;
  line-height: 1.45;
}

.address-distance {
  margin: 0.35rem 0 0;
  color: #f8143f;
  font-size: 0.82rem;
  font-weight: 600;
}

.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.chip-btn {
  border: 1px solid #d9deea;
  border-radius: 999px;
  padding: 0.5rem 0.82rem;
  background: #fff;
  color: #465066;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.chip-btn.active {
  border-color: #f8143f;
  background: #f8143f;
  color: #fff;
}

.chip-btn.secondary.active {
  background: #ffedf1;
  border-color: #f6b6c5;
  color: #d81642;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  display: block;
  margin-bottom: 0.45rem;
  color: #2c364a;
  font-weight: 600;
  font-size: 0.92rem;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
  padding-top: 0.3rem;
}

.time-row span {
  color: #3a4356;
  font-weight: 600;
}

.time-row small {
  color: #8a92a0;
  font-weight: 500;
}

textarea {
  width: 100%;
  min-height: 94px;
  border: 1px solid #d9deea;
  border-radius: 12px;
  padding: 0.65rem 0.75rem;
  resize: vertical;
  font-family: inherit;
  font-size: 0.9rem;
}

textarea:focus {
  outline: none;
  border-color: #f8a1b1;
  box-shadow: 0 0 0 3px rgba(248, 20, 63, 0.1);
}

.desired-time-input {
  width: 100%;
  border: 1px solid #d9deea;
  border-radius: 12px;
  padding: 0.58rem 0.68rem;
  font-size: 0.9rem;
  font-family: inherit;
}

.pickup-note-box {
  border: 1px dashed #f6b6c5;
  border-radius: 12px;
  padding: 0.65rem 0.75rem;
  background: #fff3f6;
}

.pickup-note-box p {
  margin: 0;
  color: #7a4250;
  font-size: 0.88rem;
  line-height: 1.4;
}

.summary-card {
  padding: 1rem 1rem 1.1rem;
  position: sticky;
  top: 1rem;
}

.summary-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-head h3 {
  margin: 0;
  color: #1d273a;
}

.summary-head span {
  color: #7c8595;
  font-size: 0.85rem;
}

.summary-items {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.summary-item {
  padding-bottom: 0.7rem;
  border-bottom: 1px dashed #edf1f7;
}

.restaurant-name {
  margin: 0;
  font-size: 0.8rem;
  color: #f8143f;
  font-weight: 600;
}

.item-row {
  margin-top: 0.25rem;
  display: flex;
  justify-content: space-between;
  gap: 0.7rem;
}

.item-row span {
  color: #2a3346;
}

.item-row strong {
  color: #202a3c;
}

.summary-item small {
  color: #8a92a0;
}

.bill-detail {
  margin-top: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.bill-detail div {
  display: flex;
  justify-content: space-between;
  color: #6f7788;
  font-size: 0.9rem;
}

.total-row {
  margin-top: 0.9rem;
  padding-top: 0.8rem;
  border-top: 1px solid #edf1f7;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.total-row span {
  color: #273144;
  font-weight: 700;
}

.total-row strong {
  font-size: 1.28rem;
  color: #121b2c;
}

.pay-btn {
  margin-top: 1rem;
  width: 100%;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(120deg, #f8143f 0%, #ff4f72 100%);
  color: #fff;
  padding: 0.75rem;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.pay-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(248, 20, 63, 0.24);
}

.pay-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.checkout-message {
  margin-top: 0.9rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.checkout-message--error {
  color: #d81642;
}

.checkout-message--success {
  color: #1f8a4d;
}

@media (max-width: 1024px) {
  .checkout-page {
    grid-template-columns: 1fr;
  }

  .summary-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .checkout-page {
    padding: 0.95rem 0.8rem 1.4rem;
  }

  .address-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
