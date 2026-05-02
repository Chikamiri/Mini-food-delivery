import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import orderService from '@/services/orderService'
import mapService from '@/services/mapService'
import restaurantService from '@/services/restaurantService'
import { useShipperTracking } from '@/composables/useShipperTracking'
import { useOrderRouteMap } from '@/composables/useOrderRouteMap'

export function useShipperDashboardViewModel() {
  const router = useRouter()
  const authStore = useAuthStore()
  const isOnline = ref(true)
  const isLoading = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')
  const availableDeliveries = ref([])
  const myDeliveries = ref([])
  const orderDetails = ref({})
  const shipperId = computed(() => authStore.user?.id || authStore.user?.userId)
  const acceptingOrderId = ref(null)

  const formatPrice = (val) => `${Number(val || 0).toLocaleString('vi-VN')}đ`
  const formatTime = (val) => {
    if (!val) return ''
    return new Date(val).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }
  const statusLabel = (s) =>
    (
      {
        UNASSIGNED: 'Chờ nhận',
        ASSIGNED: 'Đang đến lấy hàng',
        PICKED_UP: 'Đang giao',
        DELIVERED: 'Đã giao xong',
      }[s] || s
    )

  const loadData = async () => {
    if (!isOnline.value) return
    isLoading.value = true
    errorMessage.value = ''
    try {
      const [available, mine] = await Promise.all([orderService.getAvailableForDelivery(), orderService.getMyDeliveries()])
      availableDeliveries.value = available
      myDeliveries.value = mine.filter((d) => d.status !== 'DELIVERED')

      const allIds = [...new Set([...available.map((d) => d.orderId), ...mine.map((d) => d.orderId)])].filter(Boolean)
      await Promise.all(
        allIds.map(async (id) => {
          try {
            const detail = await orderService.getById(id)
            if (detail) orderDetails.value[id] = detail
          } catch {
            // ignore
          }
        }),
      )
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
    if (!shipperId.value) {
      errorMessage.value = 'Không xác định được tài khoản shipper'
      return
    }
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

  const {
    markers: activeDeliveryMapMarkers,
    route: activeDeliveryMapRoute,
    loadForOrder,
    reset: resetRouteMap,
  } = useOrderRouteMap({ restaurantService, mapService })
  const activeDelivery = computed(() =>
    myDeliveries.value.find((d) => ['ASSIGNED', 'PICKED_UP'].includes(d.status)),
  )
  const { sendLocation } = useShipperTracking()
  let gpsWatchId = null

  async function buildDeliveryMap(delivery) {
    if (!delivery) {
      resetRouteMap()
      return
    }
    const ord = orderDetails.value[delivery.orderId]
    if (!ord) return
    await loadForOrder(ord)
  }

  function startGpsBroadcast() {
    if (!navigator.geolocation || gpsWatchId) return
    gpsWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!isOnline.value) return
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const delivery = activeDelivery.value
        if (delivery?.orderId && shipperId.value) {
          sendLocation(delivery.orderId, shipperId.value, lat, lng)
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 },
    )
  }

  function stopGpsBroadcast() {
    if (gpsWatchId) {
      navigator.geolocation.clearWatch(gpsWatchId)
      gpsWatchId = null
    }
  }

  watch(
    activeDelivery,
    (d) => {
      buildDeliveryMap(d)
      if (d) startGpsBroadcast()
      else stopGpsBroadcast()
    },
    { immediate: false },
  )

  watch(
    orderDetails,
    () => {
      if (activeDelivery.value) buildDeliveryMap(activeDelivery.value)
    },
    { deep: true },
  )

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

  return {
    isOnline,
    isLoading,
    errorMessage,
    successMessage,
    availableDeliveries,
    myDeliveries,
    orderDetails,
    acceptingOrderId,
    activeDeliveryMapMarkers,
    activeDeliveryMapRoute,
    formatPrice,
    formatTime,
    statusLabel,
    loadData,
    acceptDelivery,
    pickupOrder,
    deliverOrder,
    logout,
  }
}
