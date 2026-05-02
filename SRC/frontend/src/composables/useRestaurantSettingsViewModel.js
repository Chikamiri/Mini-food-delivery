import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import restaurantService from '@/services/restaurantService'
import mapService from '@/services/mapService'
import { compressImageToJpegDataUrl } from '@/utils/imageCompress'

export function useRestaurantSettingsViewModel() {
  const loading = ref(false)
  const isSaving = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')
  const restaurants = ref([])
  const router = useRouter()
  const authStore = useAuthStore()
  const settingsForm = ref({
    id: null,
    name: '',
    description: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
    imageUrl: '',
    openingTime: '',
    closingTime: '',
    categoryId: null,
    isOpen: true,
  })

  const activeRestaurant = computed(() => restaurants.value[0] || null)
  const addressQuery = ref('')
  const addressResults = ref([])
  const searchingAddress = ref(false)
  const mapMarkers = ref([])
  const miniMapOpen = ref(true)
  const imageFileInputRef = ref(null)
  const avatarInputKey = ref(0)
  let searchTimer = null

  const toTimeInput = (value) => {
    if (!value) return ''
    const raw = String(value)
    return raw.length >= 5 ? raw.slice(0, 5) : raw
  }

  const toFloatOrNull = (value) => {
    const trimmed = String(value ?? '').trim()
    if (!trimmed) return null
    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : null
  }

  const syncMapMarker = () => {
    const lat = toFloatOrNull(settingsForm.value.latitude)
    const lng = toFloatOrNull(settingsForm.value.longitude)
    if (lat == null || lng == null) {
      mapMarkers.value = []
      return
    }
    mapMarkers.value = [
      {
        lat,
        lng,
        label: settingsForm.value.name || 'Nhà hàng',
        color: 'orange',
      },
    ]
  }

  const searchAddress = () => {
    clearTimeout(searchTimer)
    const q = addressQuery.value.trim()
    if (!q) {
      addressResults.value = []
      return
    }
    searchTimer = setTimeout(async () => {
      searchingAddress.value = true
      try {
        addressResults.value = await mapService.searchAddress(q)
      } catch {
        addressResults.value = []
      } finally {
        searchingAddress.value = false
      }
    }, 400)
  }

  const selectAddressResult = (item) => {
    const lat = Number(item.lat)
    const lng = Number(item.lng ?? item.lon)
    settingsForm.value.address = item.displayName || item.display_name || settingsForm.value.address
    settingsForm.value.latitude = Number.isFinite(lat) ? lat : ''
    settingsForm.value.longitude = Number.isFinite(lng) ? lng : ''
    addressResults.value = []
    addressQuery.value = ''
    syncMapMarker()
  }

  const onMapClick = ({ lat, lng }) => {
    settingsForm.value.latitude = Number(lat.toFixed(6))
    settingsForm.value.longitude = Number(lng.toFixed(6))
    syncMapMarker()
  }

  const loadData = async () => {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''
    try {
      const mine = await restaurantService.getMyRestaurants()
      restaurants.value = Array.isArray(mine) ? mine : []
      if (!restaurants.value.length) return
      const detail = await restaurantService.getById(restaurants.value[0].id)
      settingsForm.value = {
        id: detail.id,
        name: detail.name || '',
        description: detail.description || '',
        phone: detail.phone || '',
        address: detail.address || '',
        latitude: detail.latitude ?? '',
        longitude: detail.longitude ?? '',
        imageUrl: detail.imageUrl || '',
        openingTime: toTimeInput(detail.openingTime),
        closingTime: toTimeInput(detail.closingTime),
        categoryId: detail.categoryId ?? null,
        isOpen: detail.isOpen !== false,
      }
      syncMapMarker()
    } catch (error) {
      errorMessage.value = error.message || 'Không thể tải cài đặt nhà hàng.'
    } finally {
      loading.value = false
    }
  }

  watch(
    () => [settingsForm.value.latitude, settingsForm.value.longitude, settingsForm.value.name],
    () => syncMapMarker(),
  )

  const saveSettings = async () => {
    errorMessage.value = ''
    successMessage.value = ''
    if (!settingsForm.value.id) {
      errorMessage.value = 'Không tìm thấy nhà hàng để cập nhật.'
      return
    }
    if (!settingsForm.value.name.trim() || !settingsForm.value.phone.trim() || !settingsForm.value.address.trim()) {
      errorMessage.value = 'Vui lòng nhập đầy đủ tên nhà hàng, số điện thoại và địa chỉ.'
      return
    }
    if (!settingsForm.value.openingTime || !settingsForm.value.closingTime) {
      errorMessage.value = 'Vui lòng chọn giờ mở cửa và đóng cửa.'
      return
    }

    const payload = {
      name: settingsForm.value.name.trim(),
      description: settingsForm.value.description?.trim() || '',
      phone: settingsForm.value.phone.trim(),
      address: settingsForm.value.address.trim(),
      latitude: toFloatOrNull(settingsForm.value.latitude),
      longitude: toFloatOrNull(settingsForm.value.longitude),
      imageUrl: settingsForm.value.imageUrl?.trim() || '',
      openingTime: settingsForm.value.openingTime,
      closingTime: settingsForm.value.closingTime,
      categoryId: settingsForm.value.categoryId,
      isOpen: Boolean(settingsForm.value.isOpen),
    }

    isSaving.value = true
    try {
      const updated = await restaurantService.updateRestaurant(settingsForm.value.id, payload)
      settingsForm.value.address = updated?.address || settingsForm.value.address
      settingsForm.value.latitude = updated?.latitude ?? settingsForm.value.latitude
      settingsForm.value.longitude = updated?.longitude ?? settingsForm.value.longitude
      successMessage.value = 'Đã cập nhật cài đặt nhà hàng thành công.'
    } catch (error) {
      errorMessage.value = error.message || 'Không thể cập nhật cài đặt nhà hàng.'
    } finally {
      isSaving.value = false
    }
  }
  const logout = async () => {
    await authStore.logout()
    router.push('/')
  }

  const triggerRestaurantImagePick = () => imageFileInputRef.value?.click()

  async function onRestaurantImageFileChange(e) {
    const file = e.target?.files?.[0]
    if (!file) return
    errorMessage.value = ''
    try {
      const dataUrl = await compressImageToJpegDataUrl(file, 960, 0.85)
      settingsForm.value.imageUrl = dataUrl
    } catch (err) {
      errorMessage.value = err?.message || 'Không xử lý được ảnh. Thử file JPG/PNG nhỏ hơn.'
    } finally {
      avatarInputKey.value += 1
    }
  }

  function clearRestaurantImage() {
    settingsForm.value.imageUrl = ''
    avatarInputKey.value += 1
  }

  onMounted(loadData)

  onUnmounted(() => {
    clearTimeout(searchTimer)
    searchTimer = null
  })

  return {
    loading,
    isSaving,
    errorMessage,
    successMessage,
    settingsForm,
    activeRestaurant,
    addressQuery,
    addressResults,
    searchingAddress,
    mapMarkers,
    miniMapOpen,
    imageFileInputRef,
    avatarInputKey,
    searchAddress,
    selectAddressResult,
    onMapClick,
    loadData,
    saveSettings,
    logout,
    triggerRestaurantImagePick,
    onRestaurantImageFileChange,
    clearRestaurantImage,
  }
}
