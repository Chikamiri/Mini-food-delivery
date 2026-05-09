<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import iconBackArrow from '@/assets/icon/back-arrow.svg'
import iconHome from '@/assets/icon/home.svg'
import iconImage from '@/assets/icon/image.svg'
import iconDelete from '@/assets/icon/delete.svg'
import { useCartStore } from '@/stores/cart'
import userService from '@/services/userService'
import restaurantService from '@/services/restaurantService'
import mapService from '@/services/mapService'
import {
  incrementCartItem,
  decrementCartItem,
  removeCartItem,
  formatCartPrice,
  groupCartByRestaurant,
  goBrowseFromCart,
} from '@/utils/cartViewUtils'

const router = useRouter()
const cartStore = useCartStore()
const cartItems = computed(() => cartStore.items)
const restaurantPoint = ref(null)
const selectedAddressPoint = ref(null)

const increment = (item) => incrementCartItem(cartStore, item)
const decrement = (item) => decrementCartItem(cartStore, item)
const removeItem = (lineId) => removeCartItem(cartStore, lineId)

const subtotal = computed(() => cartStore.subtotal)

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const routeDistanceKm = computed(() => {
  if (!restaurantPoint.value || !selectedAddressPoint.value) return null
  return haversineKm(
    restaurantPoint.value.lat,
    restaurantPoint.value.lng,
    selectedAddressPoint.value.lat,
    selectedAddressPoint.value.lng,
  )
})

const deliveryFee = computed(() => {
  if (Number(subtotal.value) <= 0) return 0
  const km = routeDistanceKm.value
  if (Number.isFinite(km)) return Number((5 + km * 2).toFixed(2))
  return 15
})

const discount = computed(() => 0)

const total = computed(() => Math.max(0, subtotal.value + deliveryFee.value - discount.value))

const formatPrice = (value) => formatCartPrice(value)

const groupedByRestaurant = computed(() => {
  return groupCartByRestaurant(cartItems.value)
})

const goBrowse = () => goBrowseFromCart(router)

async function resolveRestaurantPoint() {
  const restaurantId = Number(cartItems.value[0]?.restaurantId || 0)
  if (!restaurantId) {
    restaurantPoint.value = null
    return
  }
  try {
    const restaurant = await restaurantService.getById(restaurantId)
    if (restaurant?.latitude && restaurant?.longitude) {
      restaurantPoint.value = {
        lat: Number(restaurant.latitude),
        lng: Number(restaurant.longitude),
      }
      return
    }
    if (restaurant?.address) {
      const geo = await mapService.searchAddress(restaurant.address)
      if (Array.isArray(geo) && geo.length) {
        restaurantPoint.value = {
          lat: Number(geo[0].lat),
          lng: Number(geo[0].lng || geo[0].lon),
        }
        return
      }
    }
  } catch {
    // fallback handled by computed delivery fee
  }
  restaurantPoint.value = null
}

async function resolveDefaultAddressPoint() {
  try {
    const addresses = await userService.getAddresses()
    const list = Array.isArray(addresses) ? addresses : []
    const selected = list.find((item) => item.isDefault) || list[0]
    if (!selected) {
      selectedAddressPoint.value = null
      return
    }
    if (selected.latitude && selected.longitude) {
      selectedAddressPoint.value = {
        lat: Number(selected.latitude),
        lng: Number(selected.longitude),
      }
      return
    }
    const q = selected.addressLine || selected.detail || ''
    if (!q) {
      selectedAddressPoint.value = null
      return
    }
    const geo = await mapService.searchAddress(q)
    if (Array.isArray(geo) && geo.length) {
      selectedAddressPoint.value = {
        lat: Number(geo[0].lat),
        lng: Number(geo[0].lng || geo[0].lon),
      }
      return
    }
  } catch {
    // fallback handled by computed delivery fee
  }
  selectedAddressPoint.value = null
}

async function resolveDeliveryPricingContext() {
  await Promise.all([resolveRestaurantPoint(), resolveDefaultAddressPoint()])
}

watch(
  () => cartItems.value.map((item) => item.restaurantId).join(','),
  () => {
    resolveRestaurantPoint()
  },
)

onMounted(() => {
  resolveDeliveryPricingContext()
})
</script>

<template>
  <section class="cart-view">
    <RouterLink to="/browse" class="back-btn" aria-label="Quay lại danh sách món">
      <img :src="iconBackArrow" alt="" width="16" height="16" />
      Quay lại
    </RouterLink>

    <header class="cart-header">
      <h1>Giỏ hàng</h1>
      <span class="item-count">{{ cartItems.length }} món</span>
    </header>

    <div class="cart-body">
      <div class="cart-items">
        <div v-if="cartItems.length === 0" class="empty-state">
          <span class="empty-icon"><img :src="iconImage" alt="" class="empty-icon-img" /></span>
          <h2>Giỏ hàng trống</h2>
          <p>Hãy thêm món ăn từ nhà hàng yêu thích!</p>
          <button class="browse-btn" @click="goBrowse">Khám phá ngay</button>
        </div>

        <div
          v-for="(items, restaurant) in groupedByRestaurant"
          :key="restaurant"
          class="restaurant-group"
        >
          <div class="restaurant-label">
            <span class="restaurant-dot"><img :src="iconHome" alt="" width="14" height="14" /></span>
            <h3>{{ restaurant }}</h3>
          </div>

          <article v-for="item in items" :key="item.lineId" class="cart-item">
            <div class="item-image">
              <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" />
              <span v-else class="item-image-placeholder"><img :src="iconImage" alt="" width="18" height="18" /></span>
            </div>
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <p class="item-note">Kích cỡ: {{ item.size || 'Vừa' }}</p>
              <p v-if="item.note" class="item-note">Ghi chú: {{ item.note }}</p>
              <span class="item-price">{{ formatPrice(item.price) }}</span>
            </div>
            <div class="item-actions">
              <div class="qty-controls">
                <button class="qty-btn" @click="decrement(item)" :disabled="item.quantity <= 1">−</button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button class="qty-btn" @click="increment(item)">+</button>
              </div>
              <span class="item-subtotal">{{ formatPrice(item.price * item.quantity) }}</span>
              <button class="remove-btn" @click="removeItem(item.lineId)" aria-label="Xoá">
                <img :src="iconDelete" alt="" width="14" height="14" />
              </button>
            </div>
          </article>
        </div>
      </div>

      <aside v-if="cartItems.length > 0" class="cart-summary">
        <div class="summary-card">
          <h3>Tóm tắt đơn hàng</h3>

          <div class="voucher-row">
            <input type="text" placeholder="Mã giảm giá (sắp có)" disabled aria-disabled="true" />
            <button type="button" disabled aria-disabled="true">Sắp có</button>
          </div>

          <div class="bill-lines">
            <div class="bill-line">
              <span>Tạm tính</span>
              <strong>{{ formatPrice(subtotal) }}</strong>
            </div>
            <div class="bill-line">
              <span>Phí giao hàng</span>
              <strong>{{ formatPrice(deliveryFee) }}</strong>
            </div>
            <div class="bill-line discount">
              <span>Giảm giá</span>
              <strong>{{ formatPrice(discount) }}</strong>
            </div>
          </div>

          <div class="total-line">
            <span>Tổng thanh toán</span>
            <strong>{{ formatPrice(total) }}</strong>
          </div>

          <RouterLink to="/checkout" class="checkout-btn">Tiến hành thanh toán</RouterLink>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped src="@/assets/styles/cart-view.css"></style>
