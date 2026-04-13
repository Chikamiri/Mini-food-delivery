import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import authService from '@/services/authService'

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
      const result = await authService.login(email, password)
      user.value = result.user
      token.value = result.token
      localStorage.setItem('token', result.token)
      return result.user
    } catch (err) {
      error.value = err.message || 'Dang nhap that bai'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(payload) {
    isLoading.value = true
    error.value = null
    try {
      const result = await authService.register(payload)
      user.value = result.user
      token.value = result.token
      localStorage.setItem('token', result.token)
      return result.user
    } catch (err) {
      error.value = err.message || 'Dang ky that bai'
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
      user.value = profile
      return profile
    } catch (err) {
      error.value = err.message || 'Khong the tai profile'
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
