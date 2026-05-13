import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import orderService from '@/services/orderService'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const currentOrder = ref(null)
  const _activeRequests = ref(0)
  const isLoading = computed(() => _activeRequests.value > 0)
  const error = ref(null)

  const activeOrders = computed(() =>
    orders.value.filter((order) =>
      ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SHIPPING'].includes(order.status),
    ),
  )

  async function fetchUserOrders() {
    _activeRequests.value++
    error.value = null
    try {
      const data = await orderService.getByUser()
      orders.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Không thể tải danh sách đơn hàng'
      throw err
    } finally {
      _activeRequests.value--
    }
  }

  async function fetchOrderById(orderId) {
    _activeRequests.value++
    error.value = null
    try {
      const data = await orderService.getById(orderId)
      currentOrder.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Không thể tải chi tiết đơn hàng'
      throw err
    } finally {
      _activeRequests.value--
    }
  }

  async function createOrder(payload) {
    _activeRequests.value++
    error.value = null
    try {
      const created = await orderService.create(payload)
      orders.value = [created, ...orders.value]
      currentOrder.value = created
      return created
    } catch (err) {
      error.value = err.message || 'Không thể tạo đơn hàng'
      throw err
    } finally {
      _activeRequests.value--
    }
  }

  async function cancelOrder(orderId) {
    _activeRequests.value++
    error.value = null
    try {
      const updated = await orderService.cancel(orderId)
      orders.value = orders.value.map((item) =>
        item.id === Number(orderId) ? { ...item, status: updated.status } : item,
      )
      if (currentOrder.value?.id === Number(orderId)) {
        currentOrder.value = { ...currentOrder.value, status: updated.status }
      }
      return updated
    } catch (err) {
      error.value = err.message || 'Không thể hủy đơn hàng'
      throw err
    } finally {
      _activeRequests.value--
    }
  }

  return {
    orders,
    currentOrder,
    isLoading,
    error,
    activeOrders,
    fetchUserOrders,
    fetchOrderById,
    createOrder,
    cancelOrder,
  }
})
