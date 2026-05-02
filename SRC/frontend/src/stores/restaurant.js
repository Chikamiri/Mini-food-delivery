import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import restaurantService from '@/services/restaurantService'

export const useRestaurantStore = defineStore('restaurant', () => {
  const restaurants = ref([])
  const categories = ref([])
  const selectedRestaurant = ref(null)
  const menuItems = ref([])
  const _activeRequests = ref(0)
  const isLoading = computed(() => _activeRequests.value > 0)
  const error = ref(null)

  const openRestaurants = computed(() =>
    restaurants.value.filter((restaurant) => restaurant.isOpen),
  )

  async function fetchRestaurants() {
    _activeRequests.value++
    error.value = null
    try {
      const data = await restaurantService.getAll()
      restaurants.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Không thể tải danh sách nhà hàng'
      throw err
    } finally {
      _activeRequests.value--
    }
  }

  async function fetchRestaurantById(id) {
    _activeRequests.value++
    error.value = null
    try {
      const data = await restaurantService.getById(id)
      selectedRestaurant.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Không thể tải chi tiết nhà hàng'
      throw err
    } finally {
      _activeRequests.value--
    }
  }

  async function fetchCategories() {
    _activeRequests.value++
    error.value = null
    try {
      const data = await restaurantService.getCategories()
      categories.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Không thể tải danh mục nhà hàng'
      throw err
    } finally {
      _activeRequests.value--
    }
  }

  async function fetchMenuByRestaurant(restaurantId) {
    _activeRequests.value++
    error.value = null
    try {
      const data = await restaurantService.getMenuByRestaurant(restaurantId)
      menuItems.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Không thể tải menu nhà hàng'
      throw err
    } finally {
      _activeRequests.value--
    }
  }

  return {
    restaurants,
    categories,
    selectedRestaurant,
    menuItems,
    isLoading,
    error,
    openRestaurants,
    fetchRestaurants,
    fetchRestaurantById,
    fetchCategories,
    fetchMenuByRestaurant,
  }
})
