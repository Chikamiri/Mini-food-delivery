/**
 * Restaurant Service
 * Quan ly nha hang va menu
 */
import api from '@/services/api'

const DELETED_MENU_STORAGE_KEY = 'restaurant_deleted_menu_items'

function normalizeId(value) {
  const id = Number(value)
  return Number.isFinite(id) ? id : null
}

function getDeletedMenuMap() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DELETED_MENU_STORAGE_KEY) || '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function getDeletedMenuIdsByRestaurant(restaurantId) {
  if (!restaurantId) return []
  const map = getDeletedMenuMap()
  const key = String(restaurantId)
  const raw = Array.isArray(map[key]) ? map[key] : []
  return raw.map(normalizeId).filter((id) => id != null)
}

function rememberDeletedMenuId(restaurantId, itemId) {
  const normalizedRestaurantId = normalizeId(restaurantId)
  const normalizedItemId = normalizeId(itemId)
  if (normalizedRestaurantId == null || normalizedItemId == null) return

  const map = getDeletedMenuMap()
  const key = String(normalizedRestaurantId)
  const current = Array.isArray(map[key]) ? map[key].map(normalizeId).filter((id) => id != null) : []
  if (!current.includes(normalizedItemId)) {
    map[key] = [...current, normalizedItemId]
    localStorage.setItem(DELETED_MENU_STORAGE_KEY, JSON.stringify(map))
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

  async updateRestaurant(id, payload) {
    return api.put(`/api/restaurants/${id}`, payload)
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
    return menuItems.filter((item) => !deletedIds.has(normalizeId(item?.id)))
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
    const result = await api.delete(`/api/restaurants/${restaurantId}/menu/items/${itemId}`)
    rememberDeletedMenuId(restaurantId, itemId)
    return result
  },
}
