/**
 * Restaurant Service
 * Quan ly nha hang va menu
 */
import mockRestaurants from '@/mocks/restaurants.json'
import mockMenuItems from '@/mocks/menuItems.json'
import mockCategories from '@/mocks/restaurantCategories.json'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export default {
  // --- Restaurant ---
  async getAll() {
    await delay()
    return mockRestaurants.filter((r) => r.isApproved)
    // Sau nay: return (await api.get('/restaurants')).data
  },

  async getById(id) {
    await delay()
    return mockRestaurants.find((r) => r.id === Number(id))
    // Sau nay: return (await api.get(`/restaurants/${id}`)).data
  },

  async getByCategory(categoryId) {
    await delay()
    return mockRestaurants.filter((r) => r.categoryId === Number(categoryId) && r.isApproved)
  },

  // --- Restaurant Categories ---
  async getCategories() {
    await delay()
    return mockCategories
    // Sau nay: return (await api.get('/restaurant-categories')).data
  },

  // --- Menu Items ---
  async getMenuByRestaurant(restaurantId) {
    await delay()
    return mockMenuItems.filter((item) => item.restaurantId === Number(restaurantId) && item.isAvailable)
    // Sau nay: return (await api.get(`/restaurants/${restaurantId}/menu`)).data
  },

  async getMenuItem(id) {
    await delay()
    return mockMenuItems.find((item) => item.id === Number(id))
  },

  // --- Restaurant Owner: CRUD ---
  async createMenuItem(restaurantId, itemData) {
    await delay()
    return { id: Date.now(), restaurantId, ...itemData, isAvailable: true }
    // Sau nay: return (await api.post(`/restaurants/${restaurantId}/menu`, itemData)).data
  },

  async updateMenuItem(itemId, itemData) {
    await delay()
    return { id: itemId, ...itemData }
    // Sau nay: return (await api.put(`/menu-items/${itemId}`, itemData)).data
  },

  async deleteMenuItem(itemId) {
    await delay()
    return { success: true, id: itemId }
    // Sau nay: return (await api.delete(`/menu-items/${itemId}`)).data
  },
}
