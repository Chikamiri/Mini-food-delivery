/**
 * User Service
 * Profile, dia chi
 */
import api from '@/services/api'

export default {
  // --- Profile ---
  async getProfile() {
    return api.get('/api/users/me')
  },

  async updateProfile(data) {
    return api.put('/api/users/me', data)
  },

  async deleteMyProfile() {
    return api.delete('/api/users/me')
  },

  // --- Addresses ---
  async getAddresses() {
    return api.get('/api/users/me/addresses')
  },

  async addAddress(addressData) {
    return api.post('/api/users/me/addresses', addressData)
  },

  async updateAddress(addressId, data) {
    return api.put(`/api/users/me/addresses/${addressId}`, data)
  },

  async deleteAddress(addressId) {
    return api.delete(`/api/users/me/addresses/${addressId}`)
  },

  async setDefaultAddress(addressId) {
    return api.patch(`/api/users/me/addresses/${addressId}/default`)
  },

  // --- Notifications ---
  async getNotifications() {
    return api.get('/api/users/me/notifications')
  },

  async markNotificationRead(notificationId) {
    return api.patch('/api/users/me/notifications/read', { notificationId })
  },

  async markAllNotificationsRead(type = null) {
    return api.patch('/api/users/me/notifications/read-all', { type })
  },
}
