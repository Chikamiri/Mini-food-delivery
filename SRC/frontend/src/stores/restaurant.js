import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import restaurantService from '@/services/restaurantService'

export const useRestaurantStore = defineStore('restaurant', () => {
  const restaurants = ref([])
  const categories = ref([])
  const selectedRestaurant = ref(null)
  const menuItems = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const openRestaurants = computed(() =>
    restaurants.value.filter((restaurant) => restaurant.isOpen),
  )

  async function fetchRestaurants() {
    isLoading.value = true
    error.value = null
    try {
      const data = await restaurantService.getAll()
      restaurants.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Khong the tai danh sach nha hang'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchRestaurantById(id) {
    isLoading.value = true
    error.value = null
    try {
      const data = await restaurantService.getById(id)
      selectedRestaurant.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Khong the tai chi tiet nha hang'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCategories() {
    isLoading.value = true
    error.value = null
    try {
      const data = await restaurantService.getCategories()
      categories.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Khong the tai danh muc nha hang'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMenuByRestaurant(restaurantId) {
    isLoading.value = true
    error.value = null
    try {
      const data = await restaurantService.getMenuByRestaurant(restaurantId)
      menuItems.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Khong the tai menu nha hang'
      throw err
    } finally {
      isLoading.value = false
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
