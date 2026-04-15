import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()

  const user = computed(() => authStore.user)
  const userRole = computed(() => authStore.userRole)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isLoading = computed(() => authStore.isLoading)
  const error = computed(() => authStore.error)

  function hasRole(role) {
    return userRole.value === role
  }

  function hasAnyRole(roles = []) {
    return roles.includes(userRole.value)
  }

  return {
    user,
    userRole,
    isAuthenticated,
    isLoading,
    error,
    hasRole,
    hasAnyRole,
    login: authStore.login,
    register: authStore.register,
    fetchProfile: authStore.fetchProfile,
    logout: authStore.logout,
  }
}
