import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import authService from '@/services/authService'
import { useCartStore } from '@/stores/cart'

function normalizeRole(role) {
  return String(role || '').toUpperCase().replace(/^ROLE_/, '')
}

function normalizeUser(u) {
  if (!u) return u
  return { ...u, role: normalizeRole(u.role) }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => Boolean(token.value))
  const userRole = computed(() => user.value?.role || null)

  async function login(email, password) {
    isLoading.value = true
    error.value = null
    try {
      const cartStore = useCartStore()
      const result = await authService.login(email, password)
      user.value = normalizeUser(result.user)
      token.value = result.token
      localStorage.setItem('token', result.token)
      cartStore.setUser(result.user?.id || result.user?.email || 'guest')
      return result.user
    } catch (err) {
      error.value = err.message || 'Đăng nhập thất bại'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(payload) {
    isLoading.value = true
    error.value = null
    try {
      const cartStore = useCartStore()
      const result = await authService.register(payload)
      user.value = normalizeUser(result.user)
      token.value = result.token
      localStorage.setItem('token', result.token)
      cartStore.setUser(result.user?.id || result.user?.email || 'guest')
      return result.user
    } catch (err) {
      error.value = err.message || 'Đăng ký thất bại'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProfile() {
    if (!token.value) return null
    isLoading.value = true
    error.value = null
    try {
      const profile = await authService.getProfile()
      const normalizedProfile = normalizeUser(profile)
      user.value = normalizedProfile
      const cartStore = useCartStore()
      cartStore.setUser(normalizedProfile?.id || normalizedProfile?.email || 'guest')
      return normalizedProfile
    } catch (err) {
      error.value = err.message || 'Không thể tải hồ sơ'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true
    try {
      await authService.logout()
    } finally {
      const cartStore = useCartStore()
      cartStore.clearCart()
      cartStore.setUser('')
      user.value = null
      token.value = null
      error.value = null
      localStorage.removeItem('token')
      isLoading.value = false
    }
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    userRole,
    login,
    register,
    fetchProfile,
    logout,
  }
})
