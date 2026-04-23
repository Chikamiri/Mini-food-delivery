/**
 * Restaurant Service
 * Quan ly nha hang va menu
 */
import api from '@/services/api'

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

  async getByCategory(categoryId) {
    const response = await api.post('/api/restaurants/search', { categoryId })
    return Array.isArray(response) ? response : response?.items || []
  },

  // --- Restaurant Categories ---
  async getCategories() {
    return api.get('/api/restaurant-categories')
  },

  // --- Menu Items ---
  async getMenuByRestaurant(restaurantId) {
    return api.get(`/api/restaurants/${restaurantId}/menu-items`)
  },

  async getMenuItem(id) {
    return api.get(`/api/menu-items/${id}`)
  },

  // --- Restaurant Owner: CRUD ---
  async createMenuItem(restaurantId, itemData) {
    return api.post(`/api/restaurants/${restaurantId}/menu-items`, itemData)
  },

  async updateMenuItem(itemId, itemData) {
    return api.put(`/api/menu-items/${itemId}`, itemData)
  },

  async deleteMenuItem(itemId) {
    return api.delete(`/api/menu-items/${itemId}`)
  },
}
