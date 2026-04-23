/**
 * Order Service
 * Dat don, theo doi, quan ly don hang
 */
import api from '@/services/api'

export default {
  // --- User ---
  async create(orderData) {
    return api.post('/api/orders', orderData)
  },

  async getByUser() {
    const response = await api.get('/api/orders/history')
    return Array.isArray(response) ? response : response?.items || []
  },

  async getById(orderId) {
    return api.get(`/api/orders/${orderId}`)
  },

  async cancel(orderId) {
    await api.patch(`/api/orders/${orderId}/status`, { status: 'CANCELLED' })
    return { id: Number(orderId), status: 'CANCELLED' }
  },

  // --- Restaurant Owner ---
  async getByRestaurant(restaurantId) {
    return api.get(`/api/orders/restaurant/${restaurantId}`)
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
    return []
  },

  async acceptDelivery(orderId) {
    return api.patch(`/api/deliveries/${orderId}/pickup`, { note: '' })
  },

  async completeDelivery(orderId) {
    return api.patch(`/api/deliveries/${orderId}/deliver`, { note: '', codCollected: true })
  },
}
