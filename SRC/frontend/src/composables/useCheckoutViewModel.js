import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import userService from '@/services/userService'
import restaurantService from '@/services/restaurantService'
import {
  formatPriceVND,
  loadCheckoutAddressesAction,
  submitCheckoutOrderAction,
} from '@/utils/checkoutViewUtils'
import { getDeliveryFeeBySubtotal, getDiscountBySubtotal } from '@/utils/pricingUtils'
import mapService from '@/services/mapService'

export function useCheckoutViewModel() {
  const router = useRouter()
  const cartStore = useCartStore()
  const orderStore = useOrderStore()

  const deliveryAddresses = ref([])
  const selectedAddressId = ref(null)
  const orderTypes = ['Giao tiêu chuẩn', 'Giao hẹn giờ', 'Nhận tại quán']
  const selectedOrderType = ref(orderTypes[0])
  const desiredDeliveryTime = ref('')
  const orderNote = ref(cartStore.note || '')
  watch(orderNote, (v) => {
    cartStore.setNote(typeof v === 'string' ? v : '')
  })
  const isSubmitting = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')
  const currentTime = ref(new Date())
  let timeTicker = null
  const addressDistanceMap = ref({})
  const restaurantPoint = ref(null)
  const addressMapMarkers = ref([])

  const cartItems = computed(() => cartStore.items)
  const subtotal = computed(() => cartStore.subtotal)
  const deliveryFee = computed(() => getDeliveryFeeBySubtotal(subtotal.value))
  const discount = computed(() => getDiscountBySubtotal(subtotal.value))
  const total = computed(() => Math.max(0, subtotal.value + deliveryFee.value - discount.value))
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

  async function resolveAddressMarker(address) {
    if (!address) {
      addressMapMarkers.value = []
      return
    }
    if (address.latitude && address.longitude) {
      addressMapMarkers.value = [
        {
          lat: Number(address.latitude),
          lng: Number(address.longitude),
          label: address.label || 'Giao đến đây',
          color: 'red',
        },
      ]
    } else if (address.addressLine || address.detail) {
      try {
        const results = await mapService.searchAddress(address.addressLine || address.detail)
        if (results.length) {
          addressMapMarkers.value = [
            {
              lat: Number(results[0].lat),
              lng: Number(results[0].lng || results[0].lon),
              label: address.label || 'Giao đến đây',
              color: 'red',
            },
          ]
        }
      } catch (_) {
        addressMapMarkers.value = []
      }
    }
  }

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
    } catch (_) {
      // ignore and fallback null
    }
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
    } catch (_) {
      // ignore
    }
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
  watch(
    deliveryAddresses,
    () => {
      calculateAddressDistances()
    },
    { deep: true },
  )

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

  return {
    deliveryAddresses,
    selectedAddressId,
    orderTypes,
    selectedOrderType,
    desiredDeliveryTime,
    orderNote,
    isSubmitting,
    errorMessage,
    successMessage,
    addressDistanceMap,
    cartItems,
    subtotal,
    deliveryFee,
    discount,
    total,
    estimatedDeliveryTime,
    formatPrice,
    submitOrder,
    addressMapMarkers,
  }
}
