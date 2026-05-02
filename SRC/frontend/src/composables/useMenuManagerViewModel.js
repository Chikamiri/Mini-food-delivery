import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import restaurantService from '@/services/restaurantService'
import { loadRestaurantMenuDataAction } from '@/utils/restaurantDataUtils'
import {
  encodeDescriptionWithSizePrices,
  getAutoSizePrices,
  parseDescriptionAndSizePrices,
} from '@/utils/menuSizePrices'

export function useMenuManagerViewModel() {
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
  watch(menuModalOpen, (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  })
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
  const previewSizePrices = computed(() => getAutoSizePrices(menuForm.value.price))

  const compressImage = (file, maxSize = 1200, quality = 0.85) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let w = img.width
          let h = img.height
          if (w > maxSize || h > maxSize) {
            if (w > h) {
              h = Math.round((h * maxSize) / w)
              w = maxSize
            } else {
              w = Math.round((w * maxSize) / h)
              h = maxSize
            }
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

  return {
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
  }
}
