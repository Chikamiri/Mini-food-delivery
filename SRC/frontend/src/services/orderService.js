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
    return api.get('/api/orders/history')
  },

  async getById(orderId) {
    return api.get(`/api/orders/${orderId}`)
  },

  async cancel(orderId) {
    return api.patch(`/api/orders/${orderId}/status`, { status: 'CANCELLED' })
  },

  // --- Restaurant Owner ---
  async getByRestaurant(restaurantId) {
    return api.get(`/api/restaurants/${restaurantId}/orders`)
  },

  async confirm(orderId) {
    return api.patch(`/api/orders/${orderId}/status`, { status: 'CONFIRMED' })
  },

  async reject(orderId, reason) {
    return api.patch(`/api/orders/${orderId}/status`, {
      status: 'CANCELLED',
      note: reason,
    })
  },

  async updateStatus(orderId, status) {
    return api.patch(`/api/orders/${orderId}/status`, { status })
  },

  // --- Shipper ---
  async getAvailableForDelivery() {
    return api.get('/api/shipper/orders/available')
  },

  async acceptDelivery(orderId) {
    return api.patch(`/api/shipper/orders/${orderId}/accept`)
  },

  async completeDelivery(orderId) {
    return api.patch(`/api/shipper/orders/${orderId}/complete`)
  },
}
