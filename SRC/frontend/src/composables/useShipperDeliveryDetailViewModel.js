import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import orderService from '@/services/orderService'

export function useShipperDeliveryDetailViewModel() {
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const order = ref(null)
  const isLoading = ref(false)
  const errorMessage = ref('')

  const formatPrice = (val) => `${Number(val || 0).toLocaleString('vi-VN')}đ`
  const goBack = () => router.push('/shipper/dashboard')

  const logout = async () => {
    await authStore.logout()
    router.push('/')
  }

  onMounted(async () => {
    if (!route.params.id) return
    isLoading.value = true
    try {
      order.value = await orderService.getById(route.params.id)
    } catch (err) {
      errorMessage.value = err.message || 'Không thể tải chi tiết đơn giao'
    } finally {
      isLoading.value = false
    }
  })

  return {
    order,
    isLoading,
    errorMessage,
    formatPrice,
    logout,
    goBack,
  }
}
