import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
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

export function useCartViewModel() {
  const router = useRouter()
  const cartStore = useCartStore()
  const cartItems = computed(() => cartStore.items)
  const restaurantPoint = ref(null)
  const selectedAddressPoint = ref(null)

  const increment = (item) => incrementCartItem(cartStore, item)
  const decrement = (item) => decrementCartItem(cartStore, item)
  const removeItem = (lineId) => removeCartItem(cartStore, lineId)

  const subtotal = computed(() => cartStore.subtotal)
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
  const groupedByRestaurant = computed(() => groupCartByRestaurant(cartItems.value))
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

  return {
    cartItems,
    increment,
    decrement,
    removeItem,
    subtotal,
    deliveryFee,
    discount,
    total,
    formatPrice,
    groupedByRestaurant,
    goBrowse,
  }
}
