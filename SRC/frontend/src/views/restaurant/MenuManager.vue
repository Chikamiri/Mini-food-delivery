<script setup>
import RestaurantSidebar from '@/components/RestaurantSidebar.vue'
import iconView from '@/assets/icon/view.svg'
import iconImage from '@/assets/icon/image.svg'
import iconClose from '@/assets/icon/close.svg'
import { useMenuManagerViewModel } from '@/composables/useMenuManagerViewModel'

const {
  loading,
  errorMessage,
  successMessage,
  actionLoading,
  menuKeyword,
  categoryOptions,
  menuModalOpen,
  menuModalMode,
  menuForm,
  sizePrices,
  imagePreview,
  fileInputRef,
  filteredMenuItems,
  loadData,
  openAddMenu,
  openEditMenu,
  closeMenuModal,
  saveMenuItem,
  deleteMenuItem,
  logout,
  onImageSelected,
  removeImage,
} = useMenuManagerViewModel()
</script>

<template>
  <section class="restaurant-shell">
    <RestaurantSidebar active-key="menu" :show-logout="true" @logout="logout" />

    <main class="restaurant-main">
      <header class="page-head">
        <div>
          <span class="page-tag">Menu</span>
          <h1>Quản lý menu</h1>
          <p class="subtitle">Cập nhật danh sách món ăn và giá bán của nhà hàng.</p>
        </div>
        <div class="menu-header-actions">
          <button class="outline-btn" type="button" :disabled="actionLoading" @click="openAddMenu">
            Thêm món
          </button>
        </div>
      </header>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success-text">{{ successMessage }}</p>

      <!-- Menu cards -->
      <section class="panel">
        <div class="panel-head">
          <h3>Danh sách món ({{ filteredMenuItems.length }})</h3>
          <input
            v-model="menuKeyword"
            type="text"
            class="menu-search-input"
            placeholder="Tìm theo tên hoặc mô tả món..."
          />
        </div>

        <div v-if="!filteredMenuItems.length" class="empty-state">
          <p>Chưa có món nào trong menu. Hãy thêm món đầu tiên!</p>
        </div>

        <div v-else class="menu-card-grid">
          <article v-for="item in filteredMenuItems" :key="item.id" class="menu-card">
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.name"
              class="menu-card-img"
            />
            <div v-else class="menu-card-img menu-card-img--placeholder">
              <img :src="iconImage" alt="" class="menu-card-img-placeholder-icon" />
            </div>
            <div class="menu-card-body">
              <h4>{{ item.name }}</h4>
              <div class="menu-card-meta">
                <span class="price">{{ Number(item.price || 0).toLocaleString('vi-VN') }} đ</span>
                <span :class="item.isAvailable !== false ? 'badge badge-available' : 'badge badge-unavailable'">
                  {{ item.isAvailable !== false ? 'Đang bán' : 'Tạm hết' }}
                </span>
              </div>
              <div class="menu-actions">
                <button type="button" class="outline-btn small" :disabled="actionLoading" @click="openEditMenu(item)">
                  Sửa
                </button>
                <button type="button" class="danger-btn small" :disabled="actionLoading" @click="deleteMenuItem(item)">
                  Xóa
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>

    <Teleport to="body">
      <div v-if="menuModalOpen" class="menu-overlay" @click.self="closeMenuModal">
        <article class="menu-modal">
          <div class="panel-head">
            <h3>{{ menuModalMode === 'add' ? 'Thêm món mới' : 'Chỉnh sửa món' }}</h3>
          </div>
          <div class="menu-form">
            <label>
              <span>Tên món</span>
              <input v-model="menuForm.name" type="text" placeholder="Nhập tên món" />
            </label>
            <label>
              <span>Giá (VND)</span>
              <input v-model="menuForm.price" type="number" min="0" placeholder="50000" />
            </label>
            <div class="size-price-fields">
              <label>
                <span>Cỡ Nhỏ (VND)</span>
                <input v-model="sizePrices.small" type="number" min="0" />
              </label>
              <label>
                <span>Cỡ Vừa (VND)</span>
                <input v-model="sizePrices.medium" type="number" min="0" />
              </label>
              <label>
                <span>Cỡ Lớn (VND)</span>
                <input v-model="sizePrices.large" type="number" min="0" />
              </label>
            </div>
            <label v-if="menuModalMode === 'add'">
              <span>Danh mục</span>
              <select v-model="menuForm.categoryId">
                <option :value="null">Chọn danh mục</option>
                <option v-for="category in categoryOptions" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </label>
            <label>
              <span>Hình ảnh món</span>
              <div class="image-upload-area">
                <div v-if="imagePreview" class="image-preview-box">
                  <img :src="imagePreview" alt="Preview" class="image-preview" />
                  <button type="button" class="remove-img-btn" @click="removeImage">
                    <img :src="iconClose" alt="" width="12" height="12" />
                  </button>
                </div>
                <div v-else class="image-placeholder" @click="fileInputRef?.click()">
                  <img :src="iconView" alt="" class="upload-icon-svg" />
                  <span>Nhấn để chọn ảnh</span>
                </div>
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*"
                  class="file-input-hidden"
                  @change="onImageSelected"
                />
              </div>
            </label>
            <label>
              <span>Mô tả món</span>
              <textarea v-model="menuForm.description" rows="3" placeholder="Mô tả ngắn..."></textarea>
            </label>
            <label class="checkbox-row">
              <input v-model="menuForm.isAvailable" type="checkbox" />
              <span>Đang bán</span>
            </label>
          </div>
          <div class="menu-modal-actions">
            <button type="button" class="outline-btn" @click="closeMenuModal">Hủy</button>
            <button type="button" class="refresh-btn" :disabled="actionLoading" @click="saveMenuItem">
              {{ actionLoading ? 'Đang lưu...' : 'Lưu' }}
            </button>
          </div>
        </article>
      </div>
    </Teleport>
  </section>
</template>

<style scoped src="@/assets/styles/restaurant-views.css"></style>
<style scoped src="@/assets/styles/restaurant-menu-manager.css"></style>
