<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import restaurantService from '@/services/restaurantService'
import RestaurantSidebar from '@/components/RestaurantSidebar.vue'

import iconTagOutline from '@/assets/icon/tag.svg'
import { loadRestaurantCategoriesDataAction } from '@/utils/restaurantDataUtils'

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const actionLoading = ref(false)
const restaurants = ref([])
const categories = ref([])
const activeRestaurantId = computed(() => restaurants.value[0]?.id || null)
const categoryModalOpen = ref(false)
watch(categoryModalOpen, (open) => { document.body.style.overflow = open ? 'hidden' : '' })
const categoryModalMode = ref('add')
const editingCategoryId = ref(null)
const categoryForm = ref({
  name: '',
})

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

onMounted(loadData)
</script>

<template>
  <section class="restaurant-shell">
    <RestaurantSidebar active-key="categories" />

    <main class="restaurant-main">
      <header class="page-head">
        <div>
          <span class="page-tag">Danh mục</span>
          <h1>Quản lý danh mục</h1>
          <p class="subtitle">Nhóm món ăn theo danh mục để menu hiển thị rõ ràng hơn.</p>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="outline-btn" type="button" :disabled="actionLoading" @click="openAddCategory">
            Thêm danh mục
          </button>
          <button class="refresh-btn" type="button" :disabled="loading" @click="loadData">
            {{ loading ? 'Đang tải...' : 'Làm mới' }}
          </button>
        </div>
      </header>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      <p v-if="successMessage" class="error-text" style="color:#18814b;">{{ successMessage }}</p>

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
            <div class="category-chip-text">
              <strong>{{ category.name }}</strong>
              <small>ID: {{ category.id }}</small>
            </div>
            <div class="category-actions">
              <button type="button" class="outline-btn small" :disabled="actionLoading" @click="openEditCategory(category)">
                Sửa
              </button>
              <button type="button" class="danger-btn small" :disabled="actionLoading" @click="deleteCategory(category)">
                Xóa
              </button>
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
  </section>
</template>

<style scoped src="@/assets/styles/restaurant-views.css"></style>
<style scoped>
.category-actions {
  margin-left: auto;
  display: flex;
  gap: 0.4rem;
}

.outline-btn.small,
.danger-btn.small {
  padding: 0.34rem 0.62rem;
  border-radius: 8px;
  font-size: 0.8rem;
}

.danger-btn.small {
  border: 1px solid #f3b3c0;
  background: #fff0f4;
  color: #cf1f46;
  font-weight: 600;
  cursor: pointer;
}

.menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 16, 28, 0.45);
  display: grid;
  place-items: center;
  padding: 1rem;
  z-index: 3000;
}

.menu-modal {
  width: min(460px, 96vw);
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e7ebf2;
  padding: 0.9rem;
}

.menu-form {
  display: grid;
  gap: 0.55rem;
}

.menu-form label span {
  display: block;
  margin-bottom: 0.25rem;
  color: #2f3748;
  font-size: 0.84rem;
  font-weight: 600;
}

.menu-form input {
  width: 100%;
  border: 1px solid #d9deea;
  border-radius: 10px;
  padding: 0.56rem 0.65rem;
  font-size: 0.88rem;
  font-family: inherit;
}

.menu-modal-actions {
  margin-top: 0.8rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
