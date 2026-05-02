<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import restaurantService from '@/services/restaurantService'
import RestaurantSidebar from '@/components/RestaurantSidebar.vue'

import iconView from '@/assets/icon/view.svg'
import iconImage from '@/assets/icon/image.svg'
import iconClose from '@/assets/icon/close.svg'
import { loadRestaurantMenuDataAction } from '@/utils/restaurantDataUtils'
import {
  encodeDescriptionWithSizePrices,
  getAutoSizePrices,
  parseDescriptionAndSizePrices,
} from '@/utils/menuSizePrices'

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const actionLoading = ref(false)
const router = useRouter()
const authStore = useAuthStore()
const restaurants = ref([])
const menuItems = ref([])
const menuKeyword = ref('')
const categoryOptions = ref([])
const menuModalOpen = ref(false)
watch(menuModalOpen, (open) => { document.body.style.overflow = open ? 'hidden' : '' })
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
const sizePrices = ref({
  small: '',
  medium: '',
  large: '',
})
const imagePreview = ref('')
const fileInputRef = ref(null)
const formatVnd = (value) => `${Number(value || 0).toLocaleString('vi-VN')} đ`
const previewSizePrices = computed(() => getAutoSizePrices(menuForm.value.price))

/** Compress & resize image file → Base64 data URL */
const compressImage = (file, maxSize = 1200, quality = 0.85) => {
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
const filteredMenuItems = computed(() => {
  const keyword = String(menuKeyword.value || '').trim().toLowerCase()
  if (!keyword) return menuItems.value
  return menuItems.value.filter((item) => {
    const name = String(item?.name || '').toLowerCase()
    const description = String(item?.description || '').toLowerCase()
    return name.includes(keyword) || description.includes(keyword)
  })
})
const loadData = async () => {
  await loadRestaurantMenuDataAction({
    loading,
    errorMessage,
    restaurantService,
    restaurants,
    activeRestaurantIdRef: activeRestaurantId,
    menuItems,
  })
}
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
  sizePrices.value = {
    small: String(previewSizePrices.value.small),
    medium: String(previewSizePrices.value.medium),
    large: String(previewSizePrices.value.large),
  }
  imagePreview.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}
const openAddMenu = () => {
  menuModalMode.value = 'add'
  editingMenuId.value = null
  resetMenuForm()
  menuModalOpen.value = true
}
const openEditMenu = (item) => {
  const parsed = parseDescriptionAndSizePrices(item.description || '', item.price)
  menuModalMode.value = 'edit'
  editingMenuId.value = item.id
  menuForm.value = {
    name: item.name || '',
    description: parsed.cleanDescription || '',
    price: String(item.price ?? ''),
    imageUrl: item.imageUrl || '',
    isAvailable: item.isAvailable !== false,
    categoryId: item.categoryId ?? categoryOptions.value[0]?.id ?? null,
  }
  sizePrices.value = {
    small: String(parsed.prices.small),
    medium: String(parsed.prices.medium),
    large: String(parsed.prices.large),
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
  const numericSizePrices = {
    small: Number(sizePrices.value.small || 0),
    medium: Number(sizePrices.value.medium || menuForm.value.price || 0),
    large: Number(sizePrices.value.large || 0),
  }
  if (
    !Number.isFinite(numericSizePrices.small) ||
    !Number.isFinite(numericSizePrices.medium) ||
    !Number.isFinite(numericSizePrices.large) ||
    numericSizePrices.small < 0 ||
    numericSizePrices.medium < 0 ||
    numericSizePrices.large < 0
  ) {
    errorMessage.value = 'Giá theo kích cỡ không hợp lệ.'
    return
  }
  const payload = {
    name: menuForm.value.name,
    description: encodeDescriptionWithSizePrices(menuForm.value.description, numericSizePrices),
    price: numericSizePrices.medium,
    imageUrl: menuForm.value.imageUrl || '',
    isAvailable: Boolean(menuForm.value.isAvailable),
  }
  actionLoading.value = true
  try {
    if (menuModalMode.value === 'add') {
      if (!menuForm.value.categoryId) {
        errorMessage.value = 'Vui lòng chọn danh mục trước khi thêm món.'
        actionLoading.value = false
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
    await loadData()
    successMessage.value = 'Đã xóa món khỏi menu.'
  } catch (error) {
    errorMessage.value = error.message || 'Không thể xóa món.'
  } finally {
    actionLoading.value = false
  }
}
const logout = async () => {
  await authStore.logout()
  router.push('/')
}

onMounted(async () => {
  await loadData()
  await loadCategoryOptions()
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
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
          <button class="refresh-btn" type="button" :disabled="loading" @click="loadData">
            {{ loading ? 'Đang tải...' : 'Làm mới' }}
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
