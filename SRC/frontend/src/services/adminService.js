/**
 * Admin Service
 * Quan ly nguoi dung, duyet nha hang, thong ke
 */
import api from '@/services/api'
import ownerRequestService from '@/services/ownerRequestService'
import shipperRequestService from '@/services/shipperRequestService'

export default {
  // --- User Management ---
  async getAllUsers() {
    return api.get('/api/admin/users')
  },

  async toggleUserActive(userId, isActive) {
    return api.patch(`/api/admin/users/${userId}/status`, { active: isActive })
  },

  async updateUserRole(userId, role) {
    return api.patch(`/api/admin/users/${userId}/role`, { role })
  },

  async deleteUser(userId) {
    return api.delete(`/api/admin/users/${userId}`)
  },

  // --- Restaurant Approval ---
  async getPendingRestaurants() {
    return api.get('/api/admin/restaurants/pending')
  },

  async approveRestaurant(restaurantId) {
    return api.post(`/api/admin/restaurants/${restaurantId}/approve`, {
      approved: true,
      note: null,
    })
  },

  async rejectRestaurant(restaurantId, reason) {
    return api.post(`/api/admin/restaurants/${restaurantId}/approve`, {
      approved: false,
      note: reason || null,
    })
  },

  // --- Stats ---
  async getSystemStats() {
    return api.get('/api/admin/stats')
  },

  // --- Owner Request Approval ---
  async getPendingOwnerRequests() {
    return ownerRequestService.getPendingRequests()
  },

  async approveOwnerRequest(requestId) {
    return ownerRequestService.processRequest(requestId, true, null)
  },

  async rejectOwnerRequest(requestId, reason) {
    return ownerRequestService.processRequest(requestId, false, reason || null)
  },

  // --- Shipper Request Approval ---
  async getPendingShipperRequests() {
    return shipperRequestService.getPendingRequests()
  },

  async approveShipperRequest(requestId) {
    return shipperRequestService.processRequest(requestId, true, null)
  },

  async rejectShipperRequest(requestId, reason) {
    return shipperRequestService.processRequest(requestId, false, reason || null)
  },
}
