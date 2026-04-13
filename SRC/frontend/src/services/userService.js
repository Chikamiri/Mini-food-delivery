/**
 * User Service
 * Profile, dia chi
 */
import mockUsers from '@/mocks/users.json'
import mockAddresses from '@/mocks/addresses.json'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export default {
  // --- Profile ---
  async getProfile(userId) {
    await delay()
    return mockUsers.find((u) => u.id === Number(userId))
    // Sau nay: return (await api.get('/users/profile')).data
  },

  async updateProfile(userId, data) {
    await delay()
    return { id: userId, ...data }
    // Sau nay: return (await api.put('/users/profile', data)).data
  },

  // --- Addresses ---
  async getAddresses(userId) {
    await delay()
    return mockAddresses.filter((a) => a.userId === Number(userId))
    // Sau nay: return (await api.get('/users/addresses')).data
  },

  async addAddress(userId, addressData) {
    await delay()
    return { id: Date.now(), userId, ...addressData }
    // Sau nay: return (await api.post('/users/addresses', addressData)).data
  },

  async updateAddress(addressId, data) {
    await delay()
    return { id: addressId, ...data }
    // Sau nay: return (await api.put(`/users/addresses/${addressId}`, data)).data
  },

  async deleteAddress(addressId) {
    await delay()
    return { success: true, id: addressId }
    // Sau nay: return (await api.delete(`/users/addresses/${addressId}`)).data
  },

  async setDefaultAddress(addressId) {
    await delay()
    return { id: addressId, isDefault: true }
    // Sau nay: return (await api.put(`/users/addresses/${addressId}/default`)).data
  },
}
