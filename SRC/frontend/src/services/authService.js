/**
 * Auth Service
 * Goi backend auth API
 */
import api from '@/services/api'

function toUser(authPayload) {
  return {
    id: authPayload.userId,
    email: authPayload.email,
    fullName: authPayload.fullName,
    role: authPayload.role,
  }
}

export default {
  async login(email, password) {
    const data = await api.post('/api/auth/login', { email, password })

    return {
      user: toUser(data),
      token: data.accessToken,
    }
  },

  async register(userData) {
    const payload = {
      fullName: userData.fullName,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || null,
      avatarUrl: userData.avatarUrl || null,
    }
    const data = await api.post('/api/auth/register', payload)

    return {
      user: toUser(data),
      token: data.accessToken,
    }
  },

  async logout() {
    // Backend hien chua co endpoint logout stateful, FE chi can clear token.
    return { success: true }
  },

  async getProfile() {
    return api.get('/api/users/me')
  },
}
