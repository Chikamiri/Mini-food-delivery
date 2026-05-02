<script setup>
import RestaurantSidebar from '@/components/RestaurantSidebar.vue'
import iconTagOutline from '@/assets/icon/tag.svg'
import { useCategoryManagerViewModel } from '@/composables/useCategoryManagerViewModel'

const {
  loading,
  errorMessage,
  successMessage,
  actionLoading,
  categories,
  categoryModalOpen,
  categoryItemsModalOpen,
  categoryModalMode,
  categoryForm,
  categoryItemsLoading,
  selectedCategory,
  selectedCategoryItems,
  loadData,
  openAddCategory,
  openEditCategory,
  closeCategoryModal,
  saveCategory,
  deleteCategory,
  openCategoryItemsModal,
  closeCategoryItemsModal,
  logout,
} = useCategoryManagerViewModel()
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
