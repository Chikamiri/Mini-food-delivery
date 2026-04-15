/**
 * Admin Service
 * Quan ly nguoi dung, duyet nha hang, thong ke
 */
import mockUsers from '@/mocks/users.json'
import mockRestaurants from '@/mocks/restaurants.json'
import mockOrders from '@/mocks/orders.json'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export default {
  // --- User Management ---
  async getAllUsers() {
    await delay()
    return mockUsers
    // Sau nay: return (await api.get('/admin/users')).data
  },

  async toggleUserActive(userId, isActive) {
    await delay()
    return { id: userId, isActive }
    // Sau nay: return (await api.put(`/admin/users/${userId}/toggle-active`)).data
  },

  // --- Restaurant Approval ---
  async getPendingRestaurants() {
    await delay()
    return mockRestaurants.filter((r) => !r.isApproved)
    // Sau nay: return (await api.get('/admin/restaurants/pending')).data
  },

  async approveRestaurant(restaurantId) {
    await delay()
    return { id: restaurantId, isApproved: true }
    // Sau nay: return (await api.put(`/admin/restaurants/${restaurantId}/approve`)).data
  },

  async rejectRestaurant(restaurantId, reason) {
    await delay()
    return { id: restaurantId, isApproved: false, reason }
    // Sau nay: return (await api.put(`/admin/restaurants/${restaurantId}/reject`, { reason })).data
  },

  // --- Stats ---
  async getSystemStats() {
    await delay()
    return {
      totalUsers: mockUsers.length,
      totalRestaurants: mockRestaurants.length,
      totalOrders: mockOrders.length,
      totalRevenue: mockOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    }
    // Sau nay: return (await api.get('/admin/stats')).data
  },
}
