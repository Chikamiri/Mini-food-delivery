export async function resolvePointByAddress(address, mapService) {
  if (!address) return null
  try {
    const results = await mapService.searchAddress(address)
    if (!Array.isArray(results) || !results.length) return null
    return {
      lat: Number(results[0].lat),
      lng: Number(results[0].lng || results[0].lon),
    }
  } catch {
    return null
  }
}

export async function resolveRestaurantPoint(order, restaurantService, mapService) {
  if (!order?.restaurantId) return null
  try {
    const restaurant = await restaurantService.getById(order.restaurantId)
    if (restaurant?.latitude && restaurant?.longitude) {
      return {
        point: { lat: Number(restaurant.latitude), lng: Number(restaurant.longitude) },
        label: restaurant.name || 'Nhà hàng',
      }
    }
    const geocoded = await resolvePointByAddress(restaurant?.address, mapService)
    if (!geocoded) return null
    return { point: geocoded, label: restaurant?.name || 'Nhà hàng' }
  } catch {
    return null
  }
}

export async function resolveDeliveryPoint(order, mapService) {
  const deliveryAddress = order?.deliveryAddress || order?.address
  return resolvePointByAddress(deliveryAddress, mapService)
}

export async function buildOrderRouteMapData(order, { restaurantService, mapService }) {
  const markers = []
  const restaurantData = await resolveRestaurantPoint(order, restaurantService, mapService)
  const deliveryPoint = await resolveDeliveryPoint(order, mapService)

  if (restaurantData?.point) {
    markers.push({
      lat: restaurantData.point.lat,
      lng: restaurantData.point.lng,
      label: restaurantData.label,
      color: 'orange',
    })
  }

  if (deliveryPoint) {
    markers.push({
      lat: deliveryPoint.lat,
      lng: deliveryPoint.lng,
      label: 'Giao đến đây',
      color: 'red',
    })
  }

  let route = []
  if (restaurantData?.point && deliveryPoint) {
    try {
      const routeResp = await mapService.getRoute(
        restaurantData.point.lat,
        restaurantData.point.lng,
        deliveryPoint.lat,
        deliveryPoint.lng,
      )
      route = mapService.extractRouteCoords(routeResp)
    } catch {
      route = []
    }
  }

  return { markers, route }
}
