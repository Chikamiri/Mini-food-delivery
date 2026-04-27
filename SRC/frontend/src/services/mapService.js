import api from '@/services/api'

export default {
  async searchAddress(query) {
    if (!query || !query.trim()) return []
    const results = await api.get(`/api/public/map/search?q=${encodeURIComponent(query.trim())}`)
    return Array.isArray(results) ? results : []
  },

  async getRoute(startLat, startLng, endLat, endLng) {
    if (!startLat || !startLng || !endLat || !endLng) return null
    return api.get(
      `/api/public/map/route?startLat=${startLat}&startLng=${startLng}&endLat=${endLat}&endLng=${endLng}`,
    )
  },

  async getShipperLocation(shipperId) {
    return api.get(`/api/deliveries/${shipperId}/location`)
  },

  // Extract GeoJSON coordinate array from OSRM route response
  extractRouteCoords(routingResponse) {
    const coords = routingResponse?.routes?.[0]?.geometry?.coordinates
    if (!Array.isArray(coords)) return []
    // OSRM returns [lng, lat] — convert to Leaflet [lat, lng]
    return coords.map(([lng, lat]) => [lat, lng])
  },
}
