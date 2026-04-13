/**
 * Auth Service
 * Xu ly dang nhap, dang ky, dang xuat
 */
import mockUsers from '@/mocks/users.json'

// Simulate async delay
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export default {
  async login(email, password) {
    await delay()
    // Password duoc giu de giu dung signature API login thuc te.
    const _passwordProvided = Boolean(password)
    const user = mockUsers.find((u) => u.email === email)
    if (!user) {
      throw new Error('Email hoac mat khau khong dung')
    }
    // Mock token
    const token = 'mock-jwt-token-' + user.id
    return { user, token, passwordProvided: _passwordProvided }
    // Sau nay: return (await api.post('/auth/login', { email, password })).data
  },

  async register(userData) {
    await delay()
    const newUser = {
      id: mockUsers.length + 1,
      ...userData,
      role: 'USER',
      isActive: true,
      avatarUrl: null,
    }
    return { user: newUser, token: 'mock-jwt-token-' + newUser.id }
    // Sau nay: return (await api.post('/auth/register', userData)).data
  },

  async logout() {
    await delay(100)
    return { success: true }
    // Sau nay: return (await api.post('/auth/logout')).data
  },

  async getProfile() {
    await delay()
    return mockUsers[0]
    // Sau nay: return (await api.get('/auth/profile')).data
  },
}
