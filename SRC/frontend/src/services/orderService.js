/**
 * Order Service
 * Dat don, theo doi, quan ly don hang
 */
import api from '@/services/api'

function normalizeOrderList(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.content)) return response.content
  if (Array.isArray(response?.items)) return response.items
  if (Array.isArray(response?.orders)) return response.orders
  if (Array.isArray(response?.data)) return response.data
  return []
}

export default {
  // --- User ---
  async create(orderData) {
    return api.post('/api/orders', orderData)
  },

  async getByUser() {
    const response = await api.get('/api/orders/history')
    return normalizeOrderList(response)
  },

  async getById(orderId) {
    return api.get(`/api/orders/${orderId}`)
  },

  async cancel(orderId) {
    await api.patch(`/api/orders/${orderId}/status`, { status: 'CANCELLED' })
    return { id: Number(orderId), status: 'CANCELLED' }
  },

  // --- Restaurant Owner ---
  // Backend's findByRestaurantIdAndStatus returns empty when status=null (IS NULL check).
  // Workaround: fetch each status separately and merge.
  async getByRestaurant(restaurantId) {
    const statuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SHIPPING', 'DELIVERED', 'REJECTED', 'CANCELLED']
    const results = await Promise.all(
      statuses.map((s) =>
        api
          .get(`/api/orders/restaurant/${restaurantId}?status=${s}`)
          .then(normalizeOrderList)
          .catch(() => []),
      ),
    )
    return results.flat()
  },

  async confirm(orderId) {
    await api.patch(`/api/orders/${orderId}/status`, { status: 'CONFIRMED' })
    return { id: Number(orderId), status: 'CONFIRMED' }
  },

  async reject(orderId, reason) {
    await api.patch(`/api/orders/${orderId}/status`, {
      status: 'CANCELLED',
      note: reason,
    })
    return { id: Number(orderId), status: 'CANCELLED' }
  },

  async updateStatus(orderId, status) {
    await api.patch(`/api/orders/${orderId}/status`, { status })
    return { id: Number(orderId), status }
  },

  // --- Shipper ---
  async getAvailableForDelivery() {
    const response = await api.get('/api/deliveries/available')
    return Array.isArray(response) ? response : []
  },

  async getMyDeliveries() {
    const response = await api.get('/api/deliveries/my')
    return Array.isArray(response) ? response : []
  },

  // Self-assign: shipper accepts an available delivery
  async selfAssign(orderId, shipperId) {
    return api.post('/api/deliveries/assign', { orderId: Number(orderId), shipperId: Number(shipperId) })
  },

  // Mark picked up from restaurant
  async markPickup(orderId) {
    return api.patch(`/api/deliveries/${orderId}/pickup`, { note: '' })
  },

  // Mark delivered to customer (COD must be collected)
  async markDelivered(orderId) {
    return api.patch(`/api/deliveries/${orderId}/deliver`, { note: '', codCollected: true })
  },

  // Get delivery assignment for a specific order (used by restaurant to track shipper)
  async getDeliveryByOrder(orderId) {
    return api.get(`/api/deliveries/order/${orderId}`)
  },

  // Kept for backward compat
  async acceptDelivery(orderId) {
    return api.patch(`/api/deliveries/${orderId}/pickup`, { note: '' })
  },

  async completeDelivery(orderId) {
    return api.patch(`/api/deliveries/${orderId}/deliver`, { note: '', codCollected: true })
  },
}
