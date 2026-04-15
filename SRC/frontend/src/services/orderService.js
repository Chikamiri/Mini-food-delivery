/**
 * Order Service
 * Dat don, theo doi, quan ly don hang
 */
import mockOrders from '@/mocks/orders.json'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export default {
  // --- User ---
  async create(orderData) {
    await delay()
    const newOrder = {
      id: Date.now(),
      ...orderData,
      status: 'PENDING',
      paymentMethod: 'COD',
      createdAt: new Date().toISOString(),
    }
    return newOrder
    // Sau nay: return (await api.post('/orders', orderData)).data
  },

  async getByUser(userId) {
    await delay()
    return mockOrders.filter((o) => o.userId === Number(userId))
    // Sau nay: return (await api.get('/orders/my')).data
  },

  async getById(orderId) {
    await delay()
    return mockOrders.find((o) => o.id === Number(orderId))
    // Sau nay: return (await api.get(`/orders/${orderId}`)).data
  },

  async cancel(orderId) {
    await delay()
    return { id: orderId, status: 'CANCELLED' }
    // Sau nay: return (await api.put(`/orders/${orderId}/cancel`)).data
  },

  // --- Restaurant Owner ---
  async getByRestaurant(restaurantId) {
    await delay()
    return mockOrders.filter((o) => o.restaurantId === Number(restaurantId))
    // Sau nay: return (await api.get(`/restaurants/${restaurantId}/orders`)).data
  },

  async confirm(orderId) {
    await delay()
    return { id: orderId, status: 'CONFIRMED' }
    // Sau nay: return (await api.put(`/orders/${orderId}/confirm`)).data
  },

  async reject(orderId, reason) {
    await delay()
    return { id: orderId, status: 'CANCELLED', note: reason }
    // Sau nay: return (await api.put(`/orders/${orderId}/reject`, { reason })).data
  },

  async updateStatus(orderId, status) {
    await delay()
    return { id: orderId, status }
    // Sau nay: return (await api.put(`/orders/${orderId}/status`, { status })).data
  },

  // --- Shipper ---
  async getAvailableForDelivery() {
    await delay()
    return mockOrders.filter((o) => o.status === 'READY')
    // Sau nay: return (await api.get('/orders/available-delivery')).data
  },

  async acceptDelivery(orderId) {
    await delay()
    return { id: orderId, status: 'DELIVERING' }
    // Sau nay: return (await api.put(`/orders/${orderId}/accept-delivery`)).data
  },

  async completeDelivery(orderId) {
    await delay()
    return { id: orderId, status: 'DELIVERED' }
    // Sau nay: return (await api.put(`/orders/${orderId}/complete-delivery`)).data
  },
}
