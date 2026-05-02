import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import userService from '@/services/userService'
import { fetchAddressesAction, setDefaultAddressAction } from '@/utils/addressManagerUtils'
import mapService from '@/services/mapService'

function createEmptyAddress() {
  return {
    label: '',
    addressLine: '',
    detail: '',
    isDefault: false,
    latitude: 0,
    longitude: 0,
  }
}

export function useAddressManagerViewModel() {
  const addresses = ref([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')
  const isSubmitting = ref(false)
  const showAddForm = ref(false)
  const showEditForm = ref(false)
  const editingAddressId = ref(null)
  const newAddress = ref(createEmptyAddress())
  const editAddress = ref(createEmptyAddress())
  const router = useRouter()

  const newAddressSearchQuery = ref('')
  const newAddressSearchResults = ref([])
  const newAddressSearching = ref(false)
  let newSearchTimer = null

  const editAddressSearchQuery = ref('')
  const editAddressSearchResults = ref([])
  const editAddressSearching = ref(false)
  let editSearchTimer = null
  const newMiniMapOpen = ref(true)
  const editMiniMapOpen = ref(true)

  const newMapMarkers = computed(() => {
    const { latitude: lat, longitude: lng, label } = newAddress.value
    return lat && lng ? [{ lat: Number(lat), lng: Number(lng), label: label || 'Vị trí', color: 'red' }] : []
  })

  const editMapMarkers = computed(() => {
    const { latitude: lat, longitude: lng, label } = editAddress.value
    return lat && lng ? [{ lat: Number(lat), lng: Number(lng), label: label || 'Vị trí', color: 'blue' }] : []
  })

  function onNewAddressSearchInput() {
    clearTimeout(newSearchTimer)
    if (!newAddressSearchQuery.value.trim()) {
      newAddressSearchResults.value = []
      return
    }
    newSearchTimer = setTimeout(async () => {
      newAddressSearching.value = true
      try {
        newAddressSearchResults.value = await mapService.searchAddress(newAddressSearchQuery.value)
      } catch (_) {
        newAddressSearchResults.value = []
      }
      newAddressSearching.value = false
    }, 400)
  }

  function selectNewAddressResult(result) {
    newAddress.value.addressLine = result.displayName || result.display_name || ''
    newAddress.value.latitude = Number(result.lat)
    newAddress.value.longitude = Number(result.lng || result.lon)
    newAddressSearchResults.value = []
    newAddressSearchQuery.value = ''
  }

  function onEditAddressSearchInput() {
    clearTimeout(editSearchTimer)
    if (!editAddressSearchQuery.value.trim()) {
      editAddressSearchResults.value = []
      return
    }
    editSearchTimer = setTimeout(async () => {
      editAddressSearching.value = true
      try {
        editAddressSearchResults.value = await mapService.searchAddress(editAddressSearchQuery.value)
      } catch (_) {
        editAddressSearchResults.value = []
      }
      editAddressSearching.value = false
    }, 400)
  }

  function selectEditAddressResult(result) {
    editAddress.value.addressLine = result.displayName || result.display_name || ''
    editAddress.value.latitude = Number(result.lat)
    editAddress.value.longitude = Number(result.lng || result.lon)
    editAddressSearchResults.value = []
    editAddressSearchQuery.value = ''
  }

  function onNewMapClick({ lat, lng }) {
    newAddress.value.latitude = Number(lat.toFixed(6))
    newAddress.value.longitude = Number(lng.toFixed(6))
  }

  function onEditMapClick({ lat, lng }) {
    editAddress.value.latitude = Number(lat.toFixed(6))
    editAddress.value.longitude = Number(lng.toFixed(6))
  }

  const fetchAddresses = () => fetchAddressesAction(userService, addresses, isLoading, errorMessage)
  const setDefault = (id) => setDefaultAddressAction(userService, id, fetchAddresses, errorMessage)
  const resetNewAddress = () => {
    newAddress.value = createEmptyAddress()
  }
  const toggleAddForm = () => {
    showAddForm.value = !showAddForm.value
    if (showAddForm.value) {
      showEditForm.value = false
      editingAddressId.value = null
    } else {
      resetNewAddress()
    }
  }
  const openEditForm = (address) => {
    showAddForm.value = false
    showEditForm.value = true
    editingAddressId.value = address.id
    editAddress.value = {
      label: address.label || '',
      addressLine: address.addressLine || address.detail || '',
      detail: address.detail || '',
      isDefault: Boolean(address.isDefault),
      latitude: Number(address.latitude || 0),
      longitude: Number(address.longitude || 0),
    }
  }
  const cancelEdit = () => {
    showEditForm.value = false
    editingAddressId.value = null
  }
  const addAddress = async () => {
    errorMessage.value = ''
    successMessage.value = ''
    if (!newAddress.value.label || !newAddress.value.addressLine) {
      errorMessage.value = 'Vui lòng nhập nhãn và địa chỉ.'
      return
    }
    isSubmitting.value = true
    try {
      await userService.addAddress({
        label: newAddress.value.label,
        addressLine: newAddress.value.addressLine,
        detail: newAddress.value.detail || '',
        isDefault: Boolean(newAddress.value.isDefault),
        latitude: Number(newAddress.value.latitude || 0),
        longitude: Number(newAddress.value.longitude || 0),
      })
      successMessage.value = 'Đã thêm địa chỉ mới.'
      showAddForm.value = false
      resetNewAddress()
      await fetchAddresses()
    } catch (error) {
      errorMessage.value = error.message || 'Không thể thêm địa chỉ mới.'
    } finally {
      isSubmitting.value = false
    }
  }
  const deleteAddress = async (addressId) => {
    const ok = window.confirm('Bạn có chắc muốn xoá địa chỉ này?')
    if (!ok) return
    errorMessage.value = ''
    successMessage.value = ''
    isSubmitting.value = true
    try {
      await userService.deleteAddress(addressId)
      successMessage.value = 'Đã xoá địa chỉ.'
      await fetchAddresses()
    } catch (error) {
      errorMessage.value = error.message || 'Không thể xoá địa chỉ.'
    } finally {
      isSubmitting.value = false
    }
  }

  const updateAddress = async () => {
    errorMessage.value = ''
    successMessage.value = ''
    if (!editingAddressId.value) return
    if (!editAddress.value.label || !editAddress.value.addressLine) {
      errorMessage.value = 'Vui lòng nhập nhãn và địa chỉ.'
      return
    }
    isSubmitting.value = true
    try {
      await userService.updateAddress(editingAddressId.value, {
        label: editAddress.value.label,
        addressLine: editAddress.value.addressLine,
        detail: editAddress.value.detail || '',
        isDefault: Boolean(editAddress.value.isDefault),
        latitude: Number(editAddress.value.latitude || 0),
        longitude: Number(editAddress.value.longitude || 0),
      })
      if (editAddress.value.isDefault) {
        await userService.setDefaultAddress(editingAddressId.value)
      }
      successMessage.value = 'Đã cập nhật địa chỉ.'
      cancelEdit()
      await fetchAddresses()
    } catch (error) {
      errorMessage.value = error.message || 'Không thể cập nhật địa chỉ.'
    } finally {
      isSubmitting.value = false
    }
  }

  onMounted(fetchAddresses)

  onUnmounted(() => {
    clearTimeout(newSearchTimer)
    clearTimeout(editSearchTimer)
    newSearchTimer = null
    editSearchTimer = null
    document.body.style.overflow = ''
  })

  return {
    addresses,
    isLoading,
    errorMessage,
    successMessage,
    isSubmitting,
    showAddForm,
    showEditForm,
    newAddress,
    editAddress,
    router,
    newAddressSearchQuery,
    newAddressSearchResults,
    newAddressSearching,
    editAddressSearchQuery,
    editAddressSearchResults,
    editAddressSearching,
    newMiniMapOpen,
    editMiniMapOpen,
    newMapMarkers,
    editMapMarkers,
    onNewAddressSearchInput,
    selectNewAddressResult,
    onEditAddressSearchInput,
    selectEditAddressResult,
    onNewMapClick,
    onEditMapClick,
    setDefault,
    toggleAddForm,
    openEditForm,
    cancelEdit,
    addAddress,
    deleteAddress,
    updateAddress,
  }
}
