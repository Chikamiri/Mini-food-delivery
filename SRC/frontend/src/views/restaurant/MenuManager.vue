<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import restaurantService from '@/services/restaurantService'

import iconDashboard from '@/assets/icon/dashbroad.svg'
import iconMenu from '@/assets/icon/menu.svg'
import iconTag from '@/assets/icon/tag.svg'
import iconReceipt from '@/assets/icon/reciept.svg'
import iconDollar from '@/assets/icon/dollar-sign.svg'
import { goRestaurantPath } from '@/utils/restaurantViewUtils'
import { loadRestaurantMenuDataAction } from '@/utils/restaurantDataUtils'

const router = useRouter()
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const actionLoading = ref(false)
const restaurants = ref([])
const menuItems = ref([])
const categoryOptions = ref([])
const menuModalOpen = ref(false)
const menuModalMode = ref('add')
const editingMenuId = ref(null)
const menuForm = ref({
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  isAvailable: true,
  categoryId: null,
})
const newCategoryName = ref('')
const imagePreview = ref('')
const fileInputRef = ref(null)

/** Compress & resize image file → Base64 data URL (max 400×400, JPEG quality 0.7) */
const compressImage = (file, maxSize = 400, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width
        let h = img.height
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = Math.round(h * maxSize / w); w = maxSize }
          else { w = Math.round(w * maxSize / h); h = maxSize }
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
const onImageSelected = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    const base64 = await compressImage(file)
    menuForm.value.imageUrl = base64
    imagePreview.value = base64
  } catch {
    errorMessage.value = 'Không thể đọc file ảnh.'
  }
}
const removeImage = () => {
  menuForm.value.imageUrl = ''
  imagePreview.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const activeRestaurantId = computed(() => restaurants.value[0]?.id || null)

const go = (path) => goRestaurantPath(router, path)
const loadData = () =>
  loadRestaurantMenuDataAction({
    loading,
    errorMessage,
    restaurantService,
    restaurants,
    activeRestaurantIdRef: activeRestaurantId,
    menuItems,
  })
const loadCategoryOptions = async () => {
  try {
    if (!activeRestaurantId.value) return
    const data = await restaurantService.getMenuCategories(activeRestaurantId.value)
    categoryOptions.value = Array.isArray(data) ? data : []
    if (!menuForm.value.categoryId && categoryOptions.value.length) {
      menuForm.value.categoryId = categoryOptions.value[0].id
    }
  } catch {
    categoryOptions.value = []
  }
}
const resetMenuForm = () => {
  menuForm.value = {
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    isAvailable: true,
    categoryId: categoryOptions.value[0]?.id || null,
  }
  imagePreview.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
  newCategoryName.value = ''
}
const openAddMenu = () => {
  menuModalMode.value = 'add'
  editingMenuId.value = null
  resetMenuForm()
  menuModalOpen.value = true
}
const openEditMenu = (item) => {
  menuModalMode.value = 'edit'
  editingMenuId.value = item.id
  menuForm.value = {
    name: item.name || '',
    description: item.description || '',
    price: String(item.price ?? ''),
    imageUrl: item.imageUrl || '',
    isAvailable: item.isAvailable !== false,
    categoryId: item.categoryId ?? categoryOptions.value[0]?.id ?? null,
  }
  imagePreview.value = item.imageUrl || ''
  menuModalOpen.value = true
}
const closeMenuModal = () => {
  menuModalOpen.value = false
}
const saveMenuItem = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  if (!activeRestaurantId.value) {
    errorMessage.value = 'Không tìm thấy nhà hàng đang hoạt động.'
    return
  }
  if (!menuForm.value.name || !menuForm.value.price) {
    errorMessage.value = 'Vui lòng nhập tên món và giá.'
    return
  }
  const payload = {
    name: menuForm.value.name,
    description: menuForm.value.description || '',
    price: Number(menuForm.value.price),
    imageUrl: menuForm.value.imageUrl || '',
    isAvailable: Boolean(menuForm.value.isAvailable),
  }
  actionLoading.value = true
  try {
    if (menuModalMode.value === 'add') {
      if (!menuForm.value.categoryId && !newCategoryName.value.trim()) {
        errorMessage.value = 'Vui lòng chọn danh mục hoặc nhập danh mục mới.'
        return
      }
      if (!menuForm.value.categoryId && newCategoryName.value.trim()) {
        const created = await restaurantService.createMenuCategory(activeRestaurantId.value, {
          name: newCategoryName.value.trim(),
        })
        const createdId = created?.id
        if (!createdId) {
          errorMessage.value = 'Tạo danh mục mới thất bại.'
          return
        }
        menuForm.value.categoryId = createdId
        await loadCategoryOptions()
      }
      if (!menuForm.value.categoryId) {
        errorMessage.value = 'Vui lòng chọn danh mục trước khi thêm món.'
        return
      }
      await restaurantService.createMenuItem(
        activeRestaurantId.value,
        Number(menuForm.value.categoryId),
        payload,
      )
      successMessage.value = 'Đã thêm món mới thành công.'
    } else {
      await restaurantService.updateMenuItem(activeRestaurantId.value, editingMenuId.value, payload)
      successMessage.value = 'Đã cập nhật món ăn thành công.'
    }
    closeMenuModal()
    await loadData()
  } catch (error) {
    errorMessage.value = error.message || 'Không thể lưu món ăn.'
  } finally {
    actionLoading.value = false
  }
}
const deleteMenuItem = async (item) => {
  if (!activeRestaurantId.value || !item?.id) return
  const ok = window.confirm(`Xác nhận xóa món "${item.name}"?`)
  if (!ok) return
  errorMessage.value = ''
  successMessage.value = ''
  actionLoading.value = true
  try {
    await restaurantService.deleteMenuItem(activeRestaurantId.value, item.id)
    successMessage.value = 'Đã xóa món khỏi menu.'
    await loadData()
  } catch (error) {
    errorMessage.value = error.message || 'Không thể xóa món.'
  } finally {
    actionLoading.value = false
  }
}

onMounted(async () => {
  await loadData()
  await loadCategoryOptions()
})
</script>

<template>
  <section class="restaurant-shell">
    <aside class="restaurant-sidebar">
      <div class="sidebar-brand">
        <div class="logo-box">FD</div>
        <span>Nhà hàng</span>
      </div>

      <span class="sidebar-section-label">Điều hướng</span>
      <button class="nav-btn" type="button" @click="go('/restaurant/dashboard')">
        <img :src="iconDashboard" alt="" />Tổng quan
      </button>
      <button class="nav-btn active" type="button" @click="go('/restaurant/menu')">
        <img :src="iconMenu" alt="" />Quản lý menu
      </button>
      <button class="nav-btn" type="button" @click="go('/restaurant/categories')">
        <img :src="iconTag" alt="" />Danh mục
      </button>
      <button class="nav-btn" type="button" @click="go('/restaurant/orders')">
        <img :src="iconReceipt" alt="" />Đơn hàng
      </button>
      <button class="nav-btn" type="button" @click="go('/restaurant/revenue')">
        <img :src="iconDollar" alt="" />Doanh thu
      </button>
      <div class="sidebar-spacer"></div>
    </aside>

    <main class="restaurant-main">
      <header class="page-head">
        <div>
          <span class="page-tag">Menu</span>
          <h1>Quản lý menu</h1>
          <p class="subtitle">Cập nhật danh sách món ăn và giá bán của nhà hàng.</p>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="outline-btn" type="button" :disabled="actionLoading" @click="openAddMenu">
            Thêm món
          </button>
          <button class="refresh-btn" type="button" :disabled="loading" @click="loadData">
            {{ loading ? 'Đang tải...' : 'Làm mới' }}
          </button>
        </div>
      </header>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      <p v-if="successMessage" class="error-text" style="color:#18814b;">{{ successMessage }}</p>

      <!-- Menu cards -->
      <section class="panel">
        <div class="panel-head">
          <h3>Danh sách món ({{ menuItems.length }})</h3>
        </div>

        <div v-if="!menuItems.length" class="empty-state">
          <p>Chưa có món nào trong menu. Hãy thêm món đầu tiên!</p>
        </div>

        <div v-else class="menu-card-grid">
          <article v-for="item in menuItems" :key="item.id" class="menu-card">
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.name"
              class="menu-card-img"
            />
            <div v-else class="menu-card-img" style="background:#f0f2f8; display:grid; place-items:center; color:#bbb; font-size:2rem;">🍽</div>
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
            <label v-if="menuModalMode === 'add'">
              <span>Danh mục</span>
              <select v-model="menuForm.categoryId">
                <option :value="null">Chọn danh mục</option>
                <option v-for="category in categoryOptions" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </label>
            <label v-if="menuModalMode === 'add' && !categoryOptions.length">
              <span>Tên danh mục mới</span>
              <input v-model="newCategoryName" type="text" placeholder="Ví dụ: Món chính" />
              <small class="hint-text">Nhà hàng chưa có danh mục, sẽ tạo mới khi lưu món.</small>
            </label>
            <label>
              <span>Hình ảnh món</span>
              <div class="image-upload-area">
                <div v-if="imagePreview" class="image-preview-box">
                  <img :src="imagePreview" alt="Preview" class="image-preview" />
                  <button type="button" class="remove-img-btn" @click="removeImage">✕</button>
                </div>
                <div v-else class="image-placeholder" @click="fileInputRef?.click()">
                  <span class="upload-icon">📷</span>
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
<style scoped>
.menu-actions {
  margin-top: 0.65rem;
  display: flex;
  gap: 0.45rem;
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
  width: min(520px, 96vw);
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

.hint-text {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.78rem;
  color: #7b8394;
}

.menu-form input,
.menu-form textarea,
.menu-form select {
  width: 100%;
  border: 1px solid #d9deea;
  border-radius: 10px;
  padding: 0.56rem 0.65rem;
  font-size: 0.88rem;
  font-family: inherit;
}

.checkbox-row {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-row span {
  margin: 0;
}

.menu-modal-actions {
  margin-top: 0.8rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* Image upload */
.image-upload-area {
  margin-top: 0.15rem;
}

.image-preview-box {
  position: relative;
  display: inline-block;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #d9deea;
}

.image-preview {
  display: block;
  max-width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 10px;
}

.remove-img-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.55);
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 1.5rem;
  border: 2px dashed #ccd2e0;
  border-radius: 10px;
  cursor: pointer;
  color: #8c94a6;
  transition: border-color 0.2s;
}

.image-placeholder:hover {
  border-color: #6c63ff;
  color: #6c63ff;
}

.upload-icon {
  font-size: 1.8rem;
}

.file-input-hidden {
  display: none;
}
</style>
