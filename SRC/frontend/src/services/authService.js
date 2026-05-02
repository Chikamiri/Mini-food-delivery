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

/** Map /api/users/me to the same shape as login `toUser` (+ extra fields for callers). */
function meToUser(data) {
  if (!data) return null
  return {
    id: data.id ?? data.userId,
    email: data.email,
    fullName: data.fullName ?? data.full_name,
    role: data.role,
    phone: data.phone ?? null,
    avatarUrl: data.avatarUrl ?? data.avatar_url ?? null,
    createdAt: data.createdAt ?? data.created_at ?? null,
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
    const data = await api.get('/api/users/me')
    return meToUser(data)
  },
}
