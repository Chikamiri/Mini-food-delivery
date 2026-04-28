import { ref } from 'vue'
import { buildOrderRouteMapData } from '@/utils/orderRouteMapUtils'

export function useOrderRouteMap({ restaurantService, mapService }) {
  const markers = ref([])
  const route = ref([])

  async function loadForOrder(order) {
    if (!order) {
      markers.value = []
      route.value = []
      return
    }
    const data = await buildOrderRouteMapData(order, { restaurantService, mapService })
    markers.value = data.markers
    route.value = data.route
  }

  function reset() {
    markers.value = []
    route.value = []
  }

  return {
    markers,
    route,
    loadForOrder,
    reset,
  }
}
