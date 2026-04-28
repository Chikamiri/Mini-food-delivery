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
          class="address-map"
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

<style scoped src="@/assets/styles/user-checkout-view.css"></style>
