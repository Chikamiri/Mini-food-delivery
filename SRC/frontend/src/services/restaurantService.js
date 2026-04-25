/**
 * Restaurant Service
 * Quan ly nha hang va menu
 */
import api from '@/services/api'

const DELETED_MENU_STORAGE_KEY = 'restaurant_deleted_menu_items'

function getDeletedMenuIdsByRestaurant(restaurantId) {
  if (!restaurantId) return []
  try {
    const parsed = JSON.parse(localStorage.getItem(DELETED_MENU_STORAGE_KEY) || '{}')
    const ids = parsed?.[String(restaurantId)]
    return Array.isArray(ids) ? ids : []
  } catch {
    return []
  }
}

export default {
  // --- Restaurant ---
  async getAll() {
    const response = await api.post('/api/restaurants/search', {})
    return Array.isArray(response) ? response : response?.items || []
  },

  async getById(id) {
    return api.get(`/api/restaurants/${id}`)
  },

  async getMyRestaurants() {
    return api.get('/api/restaurants/my-restaurants')
  },

  async createRestaurant(payload) {
    return api.post('/api/restaurants', payload)
  },

  async getByCategory(categoryId) {
    const response = await api.post('/api/restaurants/search', { categoryId })
    return Array.isArray(response) ? response : response?.items || []
  },

  // --- Restaurant Categories ---
  async getCategories() {
    return api.get('/api/restaurant-categories')
  },

  // --- Menu Categories (per restaurant) ---
  async getMenuCategories(restaurantId) {
    return api.get(`/api/restaurants/${restaurantId}/menu/categories`)
  },

  async createMenuCategory(restaurantId, payload) {
    return api.post(`/api/restaurants/${restaurantId}/menu/categories`, payload)
  },

  async updateMenuCategory(restaurantId, categoryId, payload) {
    return api.put(`/api/restaurants/${restaurantId}/menu/categories/${categoryId}`, payload)
  },

  async deleteMenuCategory(restaurantId, categoryId) {
    return api.delete(`/api/restaurants/${restaurantId}/menu/categories/${categoryId}`)
  },

  // --- Menu Items ---
  async getMenuByRestaurant(restaurantId) {
    // Backend currently exposes menu items inside restaurant detail response.
    const detail = await api.get(`/api/restaurants/${restaurantId}`)
    const menuItems = Array.isArray(detail?.menuItems) ? detail.menuItems : []
    const deletedIds = new Set(getDeletedMenuIdsByRestaurant(restaurantId))
    return menuItems.filter((item) => !deletedIds.has(item?.id))
  },

  async getMenuItem(restaurantId, itemId) {
    return api.get(`/api/restaurants/${restaurantId}/menu/items/${itemId}`)
  },

  // --- Restaurant Owner: CRUD ---
  async createMenuItem(restaurantId, categoryId, itemData) {
    return api.post(`/api/restaurants/${restaurantId}/menu/categories/${categoryId}/items`, itemData)
  },

  async updateMenuItem(restaurantId, itemId, itemData) {
    return api.put(`/api/restaurants/${restaurantId}/menu/items/${itemId}`, itemData)
  },

  async deleteMenuItem(restaurantId, itemId) {
    return api.delete(`/api/restaurants/${restaurantId}/menu/items/${itemId}`)
  },
}
