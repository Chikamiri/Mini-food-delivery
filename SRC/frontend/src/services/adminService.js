/**
 * Admin Service
 * Quan ly nguoi dung, duyet nha hang, thong ke
 */
import api from '@/services/api'

export default {
  // --- User Management ---
  async getAllUsers() {
    return api.get('/api/admin/users')
  },

  async toggleUserActive(userId, isActive) {
    return api.patch(`/api/admin/users/${userId}/status`, { isActive })
  },

  // --- Restaurant Approval ---
  async getPendingRestaurants() {
    return api.get('/api/admin/restaurants/pending')
  },

  async approveRestaurant(restaurantId) {
    return api.post(`/api/admin/restaurants/${restaurantId}/approve`, {
      approved: true,
      reason: null,
    })
  },

  async rejectRestaurant(restaurantId, reason) {
    return api.post(`/api/admin/restaurants/${restaurantId}/approve`, {
      approved: false,
      reason: reason || null,
    })
  },

  // --- Stats ---
  async getSystemStats() {
    return api.get('/api/admin/stats')
  },
}
