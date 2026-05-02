<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import restaurantService from '@/services/restaurantService'
import mapService from '@/services/mapService'
import MapView from '@/components/MapView.vue'
import RestaurantSidebar from '@/components/RestaurantSidebar.vue'
import { compressImageToJpegDataUrl } from '@/utils/imageCompress'

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
</script>

<template>
  <section class="restaurant-shell">
    <RestaurantSidebar active-key="settings" :show-logout="true" @logout="logout" />

    <main class="restaurant-main">
      <header class="page-head">
        <div>
          <span class="page-tag">Cài đặt</span>
          <h1>Cài đặt nhà hàng</h1>
          <p class="subtitle">
            Cập nhật thông tin cửa hàng. Bạn có thể chỉnh sửa địa chỉ nhà hàng tại đây.
          </p>
        </div>
        <button class="refresh-btn" type="button" :disabled="loading" @click="loadData">
          {{ loading ? 'Đang tải...' : 'Tải lại' }}
        </button>
      </header>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success-text">{{ successMessage }}</p>

      <section class="panel">
        <div class="panel-head">
          <h3>Thông tin nhà hàng</h3>
          <span v-if="activeRestaurant">{{ activeRestaurant.name }}</span>
        </div>

        <div v-if="loading" class="empty-state">
          <p>Đang tải thông tin nhà hàng...</p>
        </div>

        <div v-else-if="!activeRestaurant" class="empty-state">
          <p>Bạn chưa có nhà hàng nào để chỉnh sửa.</p>
        </div>

        <form v-else class="settings-form" @submit.prevent="saveSettings">
          <label>
            <span>Tên nhà hàng</span>
            <input v-model="settingsForm.name" type="text" placeholder="Tên nhà hàng" />
          </label>
          <label>
            <span>Số điện thoại</span>
            <input v-model="settingsForm.phone" type="text" placeholder="090..." />
          </label>
          <label class="full">
            <span>Địa chỉ nhà hàng</span>
            <input
              v-model="settingsForm.address"
              type="text"
              placeholder="Số nhà, đường, quận/huyện, thành phố"
            />
          </label>
          <label class="full">
            <span>Tìm địa chỉ bằng bản đồ</span>
            <div class="search-wrap">
              <input
                v-model="addressQuery"
                type="text"
                placeholder="Nhập địa chỉ để tìm kiếm..."
                @input="searchAddress"
              />
              <small v-if="searchingAddress" class="searching-text">Đang tìm...</small>
            </div>
            <ul v-if="addressResults.length" class="address-results">
              <li
                v-for="(item, index) in addressResults"
                :key="index"
                role="button"
                tabindex="0"
                @click="selectAddressResult(item)"
                @keydown.enter="selectAddressResult(item)"
              >
                {{ item.displayName || item.display_name }}
              </li>
            </ul>
          </label>
          <label>
            <span>Vĩ độ</span>
            <input v-model="settingsForm.latitude" type="number" step="any" placeholder="10.7769" />
          </label>
          <label>
            <span>Kinh độ</span>
            <input v-model="settingsForm.longitude" type="number" step="any" placeholder="106.7009" />
          </label>
          <label>
            <span>Giờ mở cửa</span>
            <input v-model="settingsForm.openingTime" type="time" />
          </label>
          <label>
            <span>Giờ đóng cửa</span>
            <input v-model="settingsForm.closingTime" type="time" />
          </label>
          <div class="full restaurant-image-block">
            <span>Ảnh đại diện</span>
            <div class="restaurant-image-row">
              <img
                v-if="settingsForm.imageUrl"
                :src="settingsForm.imageUrl"
                alt=""
                class="restaurant-avatar-preview"
              />
              <div v-else class="restaurant-avatar-placeholder">Chưa có ảnh</div>
              <div class="restaurant-image-actions">
                <input
                  :key="avatarInputKey"
                  ref="imageFileInputRef"
                  type="file"
                  accept="image/*"
                  class="restaurant-image-file-input"
                  @change="onRestaurantImageFileChange"
                />
                <button type="button" class="outline-btn" @click="triggerRestaurantImagePick">
                  Chọn ảnh từ máy
                </button>
                <button
                  v-if="settingsForm.imageUrl"
                  type="button"
                  class="outline-btn restaurant-image-remove"
                  @click="clearRestaurantImage"
                >
                  Xóa ảnh
                </button>
                <small class="restaurant-image-hint">
                  Ảnh được nén JPEG (~960px cạnh dài) rồi lưu. Ảnh đã có dạng link vẫn hiển thị bình thường.
                </small>
              </div>
            </div>
          </div>
          <label class="full">
            <span>Mô tả</span>
            <textarea v-model="settingsForm.description" rows="4" placeholder="Mô tả ngắn về nhà hàng"></textarea>
          </label>
          <label class="switch-row full">
            <input v-model="settingsForm.isOpen" type="checkbox" />
            <span>Nhà hàng đang mở cửa nhận đơn</span>
          </label>
          <div class="full mini-map-actions">
            <button
              type="button"
              class="outline-btn"
              @click="miniMapOpen = !miniMapOpen"
            >
              {{ miniMapOpen ? 'Ẩn bản đồ nhỏ' : 'Mở bản đồ nhỏ' }}
            </button>
            <small>Nhấn trực tiếp lên map để lấy tọa độ.</small>
          </div>

          <div v-if="miniMapOpen" class="full mini-map-window">
            <div class="mini-map-head">
              <strong>Bản đồ vị trí nhà hàng</strong>
              <span v-if="settingsForm.latitude && settingsForm.longitude">
                {{ settingsForm.latitude }}, {{ settingsForm.longitude }}
              </span>
            </div>
            <MapView
              :markers="mapMarkers"
              height="220px"
              @map-click="onMapClick"
            />
          </div>

          <div class="actions full">
            <button type="submit" class="refresh-btn" :disabled="isSaving">
              {{ isSaving ? 'Đang lưu...' : 'Lưu cài đặt' }}
            </button>
          </div>
        </form>
      </section>
    </main>
  </section>
</template>

<style scoped src="@/assets/styles/restaurant-views.css"></style>
<style scoped src="@/assets/styles/restaurant-settings-view.css"></style>
