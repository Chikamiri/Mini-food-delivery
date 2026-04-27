<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import restaurantService from '@/services/restaurantService'
import mapService from '@/services/mapService'
import MapView from '@/components/MapView.vue'
import { goRestaurantPath } from '@/utils/restaurantViewUtils'

import iconDashboard from '@/assets/icon/dashbroad.svg'
import iconMenu from '@/assets/icon/menu.svg'
import iconTag from '@/assets/icon/tag.svg'
import iconReceipt from '@/assets/icon/reciept.svg'
import iconDollar from '@/assets/icon/dollar-sign.svg'
import iconSetting from '@/assets/icon/setting.svg'

const router = useRouter()
const loading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const restaurants = ref([])
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
const go = (path) => goRestaurantPath(router, path)
const addressQuery = ref('')
const addressResults = ref([])
const searchingAddress = ref(false)
const mapMarkers = ref([])
const miniMapOpen = ref(true)
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

onMounted(loadData)
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
      <button class="nav-btn" type="button" @click="go('/restaurant/menu')">
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
      <button class="nav-btn active" type="button" @click="go('/restaurant/settings')">
        <img :src="iconSetting" alt="" />Cài đặt
      </button>
      <div class="sidebar-spacer"></div>
    </aside>

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
          <label class="full">
            <span>Ảnh đại diện (URL)</span>
            <input v-model="settingsForm.imageUrl" type="text" placeholder="https://..." />
          </label>
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
<style scoped>
.settings-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.settings-form label {
  display: grid;
  gap: 0.28rem;
}

.settings-form label.full {
  grid-column: 1 / -1;
}

.settings-form span {
  color: #2f3748;
  font-size: 0.84rem;
  font-weight: 600;
}

.settings-form input,
.settings-form textarea {
  width: 100%;
  border: 1px solid #d9deea;
  border-radius: 10px;
  padding: 0.58rem 0.68rem;
  font-size: 0.88rem;
  font-family: inherit;
}

.search-wrap {
  position: relative;
}

.searching-text {
  position: absolute;
  right: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
  color: #8c94a6;
  font-size: 0.75rem;
}

.address-results {
  list-style: none;
  margin: 0.35rem 0 0;
  padding: 0;
  border: 1px solid #d9deea;
  border-radius: 10px;
  background: #fff;
  max-height: 180px;
  overflow-y: auto;
}

.address-results li {
  padding: 0.5rem 0.65rem;
  border-bottom: 1px solid #eef1f7;
  font-size: 0.83rem;
  cursor: pointer;
  line-height: 1.35;
}

.address-results li:last-child {
  border-bottom: none;
}

.address-results li:hover {
  background: #fff3eb;
}

.switch-row {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
}

.switch-row span {
  font-weight: 500;
}

.actions {
  margin-top: 0.35rem;
  display: flex;
  justify-content: flex-end;
}

.mini-map-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.mini-map-actions small {
  color: #6d778b;
  font-size: 0.76rem;
}

.mini-map-window {
  border: 1px solid #e1e6f1;
  border-radius: 12px;
  padding: 0.6rem;
  background: #fafbff;
}

.mini-map-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.45rem;
  gap: 0.5rem;
}

.mini-map-head strong {
  color: #293247;
  font-size: 0.84rem;
}

.mini-map-head span {
  color: #6d778b;
  font-size: 0.76rem;
}

.success-text {
  margin: 0.7rem 0 0;
  color: #0f7b3f;
  font-weight: 600;
}
</style>
