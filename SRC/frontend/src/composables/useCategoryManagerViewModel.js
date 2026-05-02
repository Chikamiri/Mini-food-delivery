import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import restaurantService from '@/services/restaurantService'
import { loadRestaurantCategoriesDataAction } from '@/utils/restaurantDataUtils'

export function useCategoryManagerViewModel() {
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
        await restaurantService.updateMenuCategory(activeRestaurantId.value, editingCategoryId.value, payload)
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
        const sameCategoryName =
          String(item?.categoryName || item?.category?.name || '')
            .trim()
            .toLowerCase() === String(category.name || '').trim().toLowerCase()
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

  return {
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
  }
}
