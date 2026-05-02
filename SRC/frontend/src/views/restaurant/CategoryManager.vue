<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import restaurantService from '@/services/restaurantService'
import RestaurantSidebar from '@/components/RestaurantSidebar.vue'

import iconTagOutline from '@/assets/icon/tag.svg'
import { loadRestaurantCategoriesDataAction } from '@/utils/restaurantDataUtils'

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const actionLoading = ref(false)
const router = useRouter()
const authStore = useAuthStore()
const restaurants = ref([])
const categories = ref([])
const activeRestaurantId = computed(() => restaurants.value[0]?.id || null)
const categoryModalOpen = ref(false)
const categoryItemsModalOpen = ref(false)
watch([categoryModalOpen, categoryItemsModalOpen], ([categoryOpen, itemsOpen]) => {
  document.body.style.overflow = categoryOpen || itemsOpen ? 'hidden' : ''
})
const categoryModalMode = ref('add')
const editingCategoryId = ref(null)
const categoryForm = ref({
  name: '',
})
const categoryItemsLoading = ref(false)
const selectedCategory = ref(null)
const selectedCategoryItems = ref([])

const loadData = () =>
  loadRestaurantCategoriesDataAction({
    loading,
    errorMessage,
    restaurantService,
    restaurants,
    activeRestaurantIdRef: activeRestaurantId,
    categories,
  })
const openAddCategory = () => {
  categoryModalMode.value = 'add'
  editingCategoryId.value = null
  categoryForm.value = { name: '' }
  categoryModalOpen.value = true
}
const openEditCategory = (category) => {
  categoryModalMode.value = 'edit'
  editingCategoryId.value = category.id
  categoryForm.value = { name: category.name || '' }
  categoryModalOpen.value = true
}
const closeCategoryModal = () => {
  categoryModalOpen.value = false
}
const saveCategory = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  if (!activeRestaurantId.value) {
    errorMessage.value = 'Không tìm thấy nhà hàng đang hoạt động.'
    return
  }
  if (!categoryForm.value.name.trim()) {
    errorMessage.value = 'Vui lòng nhập tên danh mục.'
    return
  }
  actionLoading.value = true
  try {
    const payload = { name: categoryForm.value.name.trim() }
    if (categoryModalMode.value === 'add') {
      await restaurantService.createMenuCategory(activeRestaurantId.value, payload)
      successMessage.value = 'Đã tạo danh mục mới.'
    } else {
      await restaurantService.updateMenuCategory(
        activeRestaurantId.value,
        editingCategoryId.value,
        payload,
      )
      successMessage.value = 'Đã cập nhật danh mục.'
    }
    closeCategoryModal()
    await loadData()
  } catch (error) {
    errorMessage.value = error.message || 'Không thể lưu danh mục.'
  } finally {
    actionLoading.value = false
  }
}
const deleteCategory = async (category) => {
  if (!activeRestaurantId.value || !category?.id) return
  const ok = window.confirm(`Xác nhận xóa danh mục "${category.name}"?`)
  if (!ok) return
  errorMessage.value = ''
  successMessage.value = ''
  actionLoading.value = true
  try {
    await restaurantService.deleteMenuCategory(activeRestaurantId.value, category.id)
    successMessage.value = 'Đã xóa danh mục.'
    await loadData()
  } catch (error) {
    errorMessage.value = error.message || 'Không thể xóa danh mục.'
  } finally {
    actionLoading.value = false
  }
}
const openCategoryItemsModal = async (category) => {
  if (!activeRestaurantId.value || !category?.id) return
  selectedCategory.value = category
  selectedCategoryItems.value = []
  categoryItemsLoading.value = true
  categoryItemsModalOpen.value = true
  try {
    const menuItems = await restaurantService.getMenuByRestaurant(activeRestaurantId.value)
    const normalizedCategoryId = Number(category.id)
    selectedCategoryItems.value = (Array.isArray(menuItems) ? menuItems : []).filter((item) => {
      const itemCategoryId = Number(item?.categoryId ?? item?.category?.id ?? item?.menuCategoryId)
      const sameCategoryId = Number.isFinite(itemCategoryId) && itemCategoryId === normalizedCategoryId
      const sameCategoryName = String(item?.categoryName || item?.category?.name || '').trim().toLowerCase() ===
        String(category.name || '').trim().toLowerCase()
      return sameCategoryId || sameCategoryName
    })
  } catch {
    selectedCategoryItems.value = []
  } finally {
    categoryItemsLoading.value = false
  }
}
const closeCategoryItemsModal = () => {
  categoryItemsModalOpen.value = false
  selectedCategory.value = null
  selectedCategoryItems.value = []
}
const logout = async () => {
  await authStore.logout()
  router.push('/')
}

onMounted(loadData)

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <section class="restaurant-shell">
    <RestaurantSidebar active-key="categories" :show-logout="true" @logout="logout" />

    <main class="restaurant-main">
      <header class="page-head">
        <div>
          <span class="page-tag">Danh mục</span>
          <h1>Quản lý danh mục</h1>
          <p class="subtitle">Nhóm món ăn theo danh mục để menu hiển thị rõ ràng hơn.</p>
        </div>
        <div class="page-head-actions">
          <button class="outline-btn" type="button" :disabled="actionLoading" @click="openAddCategory">
            Thêm danh mục
          </button>
          <button class="refresh-btn" type="button" :disabled="loading" @click="loadData">
            {{ loading ? 'Đang tải...' : 'Làm mới' }}
          </button>
        </div>
      </header>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success-text">{{ successMessage }}</p>

      <section class="panel">
        <div class="panel-head">
          <h3>Danh mục hiện có ({{ categories.length }})</h3>
        </div>

        <div v-if="!categories.length" class="empty-state">
          <p>Chưa có danh mục nào.</p>
        </div>

        <div v-else class="category-grid">
          <div v-for="category in categories" :key="category.id" class="category-chip">
            <div class="category-chip-icon">
              <img v-if="category.iconUrl" :src="category.iconUrl" :alt="category.name" />
              <img v-else :src="iconTagOutline" alt="" />
            </div>
            <div class="category-chip-content">
              <div class="category-chip-text">
                <strong>{{ category.name }}</strong>
                <small>ID: {{ category.id }}</small>
              </div>
              <div class="category-actions">
                <button
                  type="button"
                  class="outline-btn small"
                  :disabled="actionLoading"
                  @click="openCategoryItemsModal(category)"
                >
                  Xem danh sách
                </button>
                <button type="button" class="outline-btn small" :disabled="actionLoading" @click="openEditCategory(category)">
                  Sửa
                </button>
                <button type="button" class="danger-btn small" :disabled="actionLoading" @click="deleteCategory(category)">
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <Teleport to="body">
      <div v-if="categoryModalOpen" class="menu-overlay" @click.self="closeCategoryModal">
        <article class="menu-modal">
          <div class="panel-head">
            <h3>{{ categoryModalMode === 'add' ? 'Thêm danh mục' : 'Sửa danh mục' }}</h3>
          </div>
          <div class="menu-form">
            <label>
              <span>Tên danh mục</span>
              <input v-model="categoryForm.name" type="text" placeholder="Ví dụ: Món chính" />
            </label>
          </div>
          <div class="menu-modal-actions">
            <button type="button" class="outline-btn" @click="closeCategoryModal">Hủy</button>
            <button type="button" class="refresh-btn" :disabled="actionLoading" @click="saveCategory">
              {{ actionLoading ? 'Đang lưu...' : 'Lưu' }}
            </button>
          </div>
        </article>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="categoryItemsModalOpen" class="menu-overlay" @click.self="closeCategoryItemsModal">
        <article class="menu-modal category-items-modal">
          <div class="panel-head">
            <h3>Danh sách món: {{ selectedCategory?.name || '' }}</h3>
          </div>
          <div v-if="categoryItemsLoading" class="empty-state compact-empty">
            <p>Đang tải danh sách món...</p>
          </div>
          <div v-else-if="!selectedCategoryItems.length" class="empty-state compact-empty">
            <p>Danh mục này chưa có món nào.</p>
          </div>
          <ul v-else class="category-item-list">
            <li v-for="item in selectedCategoryItems" :key="item.id" class="category-item-row">
              <div class="category-item-info">
                <strong>{{ item.name }}</strong>
                <small>{{ item.description || 'Chưa có mô tả' }}</small>
              </div>
              <span class="category-item-price">{{ Number(item.price || 0).toLocaleString('vi-VN') }} đ</span>
            </li>
          </ul>
          <div class="menu-modal-actions">
            <button type="button" class="outline-btn" @click="closeCategoryItemsModal">Đóng</button>
          </div>
        </article>
      </div>
    </Teleport>
  </section>
</template>

<style scoped src="@/assets/styles/restaurant-views.css"></style>
<style scoped src="@/assets/styles/restaurant-category-manager.css"></style>
