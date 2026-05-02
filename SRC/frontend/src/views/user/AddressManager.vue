<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import userService from '@/services/userService'
import { fetchAddressesAction, setDefaultAddressAction } from '@/utils/addressManagerUtils'
import iconBackArrow from '@/assets/icon/back-arrow.svg'
import MapView from '@/components/MapView.vue'
import mapService from '@/services/mapService'

const addresses = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingAddressId = ref(null)
const newAddress = ref({
  label: '',
  addressLine: '',
  detail: '',
  isDefault: false,
  latitude: 0,
  longitude: 0,
})
const editAddress = ref({
  label: '',
  addressLine: '',
  detail: '',
  isDefault: false,
  latitude: 0,
  longitude: 0,
})
const router = useRouter()

// --- Map search ---
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
  if (!newAddressSearchQuery.value.trim()) { newAddressSearchResults.value = []; return }
  newSearchTimer = setTimeout(async () => {
    newAddressSearching.value = true
    try {
      newAddressSearchResults.value = await mapService.searchAddress(newAddressSearchQuery.value)
    } catch (_) { newAddressSearchResults.value = [] }
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
  if (!editAddressSearchQuery.value.trim()) { editAddressSearchResults.value = []; return }
  editSearchTimer = setTimeout(async () => {
    editAddressSearching.value = true
    try {
      editAddressSearchResults.value = await mapService.searchAddress(editAddressSearchQuery.value)
    } catch (_) { editAddressSearchResults.value = [] }
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
  newAddress.value = {
    label: '',
    addressLine: '',
    detail: '',
    isDefault: false,
    latitude: 0,
    longitude: 0,
  }
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
</script>

<template>
  <section class="address-page">
    <header class="address-head">
      <button type="button" class="back-btn" @click="router.push('/profile')">
        <img :src="iconBackArrow" alt="" width="16" height="16" />
        Quay lại hồ sơ
      </button>
      <h1>Quản lý địa chỉ</h1>
      <p>Chọn địa chỉ mặc định để đặt đơn nhanh hơn.</p>
      <button type="button" class="add-btn" @click="toggleAddForm">
        {{ showAddForm ? 'Đóng form' : 'Thêm mới địa chỉ' }}
      </button>
    </header>

    <p v-if="isLoading" class="state-msg">Đang tải danh sách địa chỉ...</p>
    <p v-else-if="errorMessage" class="state-msg state-msg--error">{{ errorMessage }}</p>
    <p v-else-if="successMessage" class="state-msg state-msg--success">{{ successMessage }}</p>

    <section v-if="showAddForm" class="address-block">
      <h2>Thêm địa chỉ mới</h2>
      <div class="form-grid">
        <label class="field">
          <span>Nhãn địa chỉ</span>
          <input v-model="newAddress.label" type="text" placeholder="Ví dụ: Nhà riêng, Công ty..." />
        </label>
        <div class="field">
          <span class="field-label">Tìm địa chỉ trên bản đồ</span>
          <div class="search-wrap">
            <input
              v-model="newAddressSearchQuery"
              type="text"
              placeholder="Nhập địa chỉ để tìm kiếm..."
              @input="onNewAddressSearchInput"
            />
            <span v-if="newAddressSearching" class="searching-hint">Đang tìm...</span>
          </div>
          <ul v-if="newAddressSearchResults.length" class="geo-results">
            <li
              v-for="(r, i) in newAddressSearchResults"
              :key="i"
              @click="selectNewAddressResult(r)"
            >
              {{ r.displayName || r.display_name }}
            </li>
          </ul>
        </div>
        <label class="field">
          <span>Địa chỉ</span>
          <input
            v-model="newAddress.addressLine"
            type="text"
            placeholder="Số nhà, đường, quận/huyện, thành phố"
          />
        </label>
        <label class="field">
          <span>Chi tiết thêm</span>
          <input v-model="newAddress.detail" type="text" placeholder="Tầng, tòa nhà, ghi chú..." />
        </label>
        <label class="field row">
          <input v-model="newAddress.isDefault" type="checkbox" />
          <span>Đặt làm địa chỉ mặc định</span>
        </label>
      </div>
      <div class="mini-map-actions">
        <button type="button" class="ghost-btn" @click="newMiniMapOpen = !newMiniMapOpen">
          {{ newMiniMapOpen ? 'Ẩn bản đồ nhỏ' : 'Mở bản đồ nhỏ' }}
        </button>
        <small>Nhấn lên bản đồ để lấy vị trí nhanh.</small>
      </div>
      <div v-if="newMiniMapOpen" class="mini-map-window">
        <div class="mini-map-head">
          <strong>Vị trí địa chỉ mới</strong>
          <span v-if="newAddress.latitude && newAddress.longitude">
            {{ Number(newAddress.latitude).toFixed(6) }}, {{ Number(newAddress.longitude).toFixed(6) }}
          </span>
        </div>
        <MapView
          :markers="newMapMarkers"
          height="220px"
          class="form-map"
          @map-click="onNewMapClick"
        />
      </div>
      <div class="form-actions">
        <button type="button" class="ghost-btn" @click="toggleAddForm">Hủy</button>
        <button type="button" class="set-default-btn" :disabled="isSubmitting" @click="addAddress">
          {{ isSubmitting ? 'Đang lưu...' : 'Lưu địa chỉ mới' }}
        </button>
      </div>
    </section>

    <section class="address-block">
      <h2>Địa chỉ</h2>
      <p v-if="!addresses.length" class="state-msg">Bạn chưa có địa chỉ nào.</p>
      <div v-else class="address-grid">
        <article
          v-for="address in addresses"
          :key="address.id"
          class="address-card"
          :class="{ active: address.isDefault }"
        >
          <div class="address-main">
            <div class="address-top-row">
              <strong>{{ address.label || 'Địa chỉ' }}</strong>
            </div>
            <p>{{ address.addressLine || address.detail || 'Chưa có chi tiết địa chỉ' }}</p>
          </div>
          <div class="address-actions">
            <div class="address-actions-top">
              <span v-if="address.isDefault" class="badge">Mặc định</span>
            </div>
            <button type="button" class="edit-btn" @click="openEditForm(address)">Chỉnh sửa</button>
            <button
              v-if="!address.isDefault"
              type="button"
              class="set-default-btn"
              @click="setDefault(address.id)"
            >
              Đặt mặc định
            </button>
            <button type="button" class="delete-btn" @click="deleteAddress(address.id)">Xoá</button>
          </div>
        </article>
      </div>
    </section>

    <section v-if="showEditForm" class="address-block">
      <h2>Chỉnh sửa địa chỉ</h2>
      <div class="form-grid">
        <label class="field">
          <span>Nhãn địa chỉ</span>
          <input v-model="editAddress.label" type="text" placeholder="Ví dụ: Nhà riêng, Công ty..." />
        </label>
        <div class="field">
          <span class="field-label">Tìm địa chỉ trên bản đồ</span>
          <div class="search-wrap">
            <input
              v-model="editAddressSearchQuery"
              type="text"
              placeholder="Nhập địa chỉ để tìm kiếm..."
              @input="onEditAddressSearchInput"
            />
            <span v-if="editAddressSearching" class="searching-hint">Đang tìm...</span>
          </div>
          <ul v-if="editAddressSearchResults.length" class="geo-results">
            <li
              v-for="(r, i) in editAddressSearchResults"
              :key="i"
              @click="selectEditAddressResult(r)"
            >
              {{ r.displayName || r.display_name }}
            </li>
          </ul>
        </div>
        <label class="field">
          <span>Địa chỉ</span>
          <input
            v-model="editAddress.addressLine"
            type="text"
            placeholder="Số nhà, đường, quận/huyện, thành phố"
          />
        </label>
        <label class="field">
          <span>Chi tiết thêm</span>
          <input v-model="editAddress.detail" type="text" placeholder="Tầng, tòa nhà, ghi chú..." />
        </label>
        <label class="field row">
          <input v-model="editAddress.isDefault" type="checkbox" />
          <span>Đặt làm địa chỉ mặc định</span>
        </label>
      </div>
      <div class="mini-map-actions">
        <button type="button" class="ghost-btn" @click="editMiniMapOpen = !editMiniMapOpen">
          {{ editMiniMapOpen ? 'Ẩn bản đồ nhỏ' : 'Mở bản đồ nhỏ' }}
        </button>
        <small>Nhấn lên bản đồ để lấy vị trí nhanh.</small>
      </div>
      <div v-if="editMiniMapOpen" class="mini-map-window">
        <div class="mini-map-head">
          <strong>Vị trí địa chỉ đang sửa</strong>
          <span v-if="editAddress.latitude && editAddress.longitude">
            {{ Number(editAddress.latitude).toFixed(6) }}, {{ Number(editAddress.longitude).toFixed(6) }}
          </span>
        </div>
        <MapView
          :markers="editMapMarkers"
          height="220px"
          class="form-map"
          @map-click="onEditMapClick"
        />
      </div>
      <div class="form-actions">
        <button type="button" class="ghost-btn" @click="cancelEdit">Hủy</button>
        <button type="button" class="set-default-btn" :disabled="isSubmitting" @click="updateAddress">
          {{ isSubmitting ? 'Đang lưu...' : 'Lưu chỉnh sửa' }}
        </button>
      </div>
    </section>
  </section>
</template>

<style scoped src="@/assets/styles/user-address-manager.css"></style>
