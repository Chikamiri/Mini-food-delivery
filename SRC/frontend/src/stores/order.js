import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import orderService from '@/services/orderService'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const currentOrder = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const activeOrders = computed(() =>
    orders.value.filter((order) =>
      ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING'].includes(order.status),
    ),
  )

  async function fetchUserOrders(userId) {
    isLoading.value = true
    error.value = null
    try {
      const data = await orderService.getByUser(userId)
      orders.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Khong the tai danh sach don hang'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchOrderById(orderId) {
    isLoading.value = true
    error.value = null
    try {
      const data = await orderService.getById(orderId)
      currentOrder.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Khong the tai chi tiet don hang'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createOrder(payload) {
    isLoading.value = true
    error.value = null
    try {
      const created = await orderService.create(payload)
      orders.value = [created, ...orders.value]
      currentOrder.value = created
      return created
    } catch (err) {
      error.value = err.message || 'Khong the tao don hang'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function cancelOrder(orderId) {
    isLoading.value = true
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
      error.value = err.message || 'Khong the huy don hang'
      throw err
    } finally {
      isLoading.value = false
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
