<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import iconBackspace from '@/assets/icon/back-arrow.svg'
import iconEdit from '@/assets/icon/edit.svg'
import iconOrder from '@/assets/icon/reciept.svg'
import iconCheck from '@/assets/icon/check.svg'
import iconFavorite from '@/assets/icon/love.svg'
import iconLocation from '@/assets/icon/home.svg'
import iconHistory from '@/assets/icon/time.svg'
import iconPayment from '@/assets/icon/credit-card.svg'
import iconOpenRestaurant from '@/assets/icon/home.svg'
import iconSetting from '@/assets/icon/setting.svg'
import iconHelp from '@/assets/icon/info.svg'
import userService from '@/services/userService'
import orderService from '@/services/orderService'
import { useAuthStore } from '@/stores/auth'
import restaurantService from '@/services/restaurantService'
import ownerRequestService from '@/services/ownerRequestService'
import {
  startEditingProfileAction,
  cancelEditingProfileAction,
  logoutProfileAction,
  goBackToBrowseAction,
  openRestaurantModalAction,
  closeRestaurantModalAction,
  openRestaurantFormAction,
  openRestaurantDashboardAction,
  handleProfileMenuClickAction,
  submitOpenRestaurantAction,
  loadProfileAction,
  loadProfileStatsAction,
  updateProfileAction,
} from '@/utils/profileViewUtils'

const isEditing = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const authStore = useAuthStore()

const profile = ref({
  full_name: '',
  email: '',
  phone: '',
  avatar_url: '',
  role: '',
  created_at: '',
})

const form = ref({
  full_name: profile.value.full_name,
  email: profile.value.email,
  phone: profile.value.phone,
})

const startEditing = () => startEditingProfileAction(form, profile, isEditing)
const cancelEditing = () => cancelEditingProfileAction(isEditing)
const saveProfile = () => updateProfile()

const stats = ref([
  { label: 'Đơn hàng', value: '0', icon: iconOrder },
  { label: 'Đã giao', value: '0', icon: iconCheck },
  { label: 'Yêu thích', value: '0', icon: iconFavorite },
  { label: 'Địa chỉ', value: '0', icon: iconLocation },
])

const menuItems = [
  { icon: iconHistory, label: 'Lịch sử đơn hàng', route: '/orders/history' },
  { icon: iconLocation, label: 'Quản lý địa chỉ', route: '/addresses' },
  { icon: iconPayment, label: 'Phương thức thanh toán', action: 'coming-soon' },
  { icon: iconOpenRestaurant, label: 'Mở nhà hàng', action: 'open-restaurant' },
  { icon: iconSetting, label: 'Cài đặt', action: 'settings' },
  { icon: iconHelp, label: 'Trợ giúp', action: 'coming-soon' },
]

const restaurantModalOpen = ref(false)
const restaurantLoading = ref(false)
const restaurants = ref([])
const restaurantMessage = ref('')
const showOpenRestaurantForm = ref(false)
const openingForm = ref({
  name: '',
  phone: '',
  address: '',
  description: '',
  noteToAdmin: '',
})
const settingsModalOpen = ref(false)
const settingsForm = ref({
  pushNotifications: true,
  emailNotifications: true,
  promoNotifications: false,
  language: 'vi',
  theme: 'light',
  orderPrivacy: 'friends',
})
const getSettingsStorageKey = () =>
  `profile_settings_${String(authStore.user?.id || authStore.user?.email || profile.value.email || 'guest')}`
const loadSettingsFromStorage = () => {
  try {
    const scopedKey = getSettingsStorageKey()
    const scoped = JSON.parse(localStorage.getItem(scopedKey) || '{}')
    if (scoped && typeof scoped === 'object' && Object.keys(scoped).length) {
      settingsForm.value = { ...settingsForm.value, ...scoped }
      return
    }
    // One-time migration from legacy shared key
    const legacy = JSON.parse(localStorage.getItem('profile_settings') || '{}')
    if (legacy && typeof legacy === 'object' && Object.keys(legacy).length) {
      settingsForm.value = { ...settingsForm.value, ...legacy }
      localStorage.setItem(scopedKey, JSON.stringify(legacy))
      localStorage.removeItem('profile_settings')
    }
  } catch {
    // keep defaults
  }
}

const router = useRouter()
const route = useRoute()

const logout = () => logoutProfileAction(authStore, router)
const goBackToBrowse = () => goBackToBrowseAction(router)
const closeRestaurantModal = () => closeRestaurantModalAction(restaurantModalOpen, showOpenRestaurantForm)
const openRestaurantForm = () => openRestaurantFormAction(showOpenRestaurantForm)
const openRestaurantDashboard = (restaurant) =>
  openRestaurantDashboardAction(restaurant, restaurantMessage, closeRestaurantModal, router)
const openRestaurantModal = () =>
  openRestaurantModalAction({
    restaurantModalOpen,
    showOpenRestaurantForm,
    restaurantMessage,
    restaurantLoading,
    authStore,
    profile,
    restaurants,
    restaurantService,
    ownerRequestService,
    userService,
  })
const openSettingsModal = () => {
  settingsModalOpen.value = true
}
const closeSettingsModal = () => {
  settingsModalOpen.value = false
}
const saveSettings = () => {
  localStorage.setItem(getSettingsStorageKey(), JSON.stringify(settingsForm.value))
  restaurantMessage.value = 'Đã lưu cài đặt cá nhân.'
}
const handleMenuClick = (item) => {
  if (item.action === 'settings') {
    openSettingsModal()
    return
  }
  handleProfileMenuClickAction(
    item,
    openRestaurantModal,
    router,
    restaurantMessage,
    restaurantModalOpen,
    showOpenRestaurantForm,
  )
}
const submitOpenRestaurant = () =>
  submitOpenRestaurantAction({
    restaurantMessage,
    restaurantLoading,
    authStore,
    profile,
    restaurantService,
    ownerRequestService,
    openingForm,
    showOpenRestaurantForm,
    restaurants,
  })
const loadProfile = () => loadProfileAction(isLoading, errorMessage, userService, profile, form)
const loadStats = () =>
  loadProfileStatsAction(orderService, userService, stats, iconOrder, iconCheck, iconFavorite, iconLocation)
const updateProfile = () =>
  updateProfileAction(isLoading, errorMessage, userService, form, profile, isEditing)

onMounted(() => {
  if (authStore.user) {
    profile.value.full_name = authStore.user.fullName || profile.value.full_name
    profile.value.email = authStore.user.email || profile.value.email
    profile.value.role = authStore.user.role || profile.value.role
  }
  loadProfile()
  loadStats()
  loadSettingsFromStorage()
  if (String(route.query.openSettings || '') === '1') {
    settingsModalOpen.value = true
  }
})

watch([restaurantModalOpen, settingsModalOpen], ([restaurantOpen, settingsOpen]) => {
  document.body.style.overflow = restaurantOpen || settingsOpen ? 'hidden' : ''
})
</script>

<template>
  <section class="profile-view">
    <button type="button" class="back-btn" @click="goBackToBrowse">
      <img :src="iconBackspace" alt="" width="18" height="18" />
    </button>
    <div class="profile-layout">
      <!-- Profile card -->
      <div class="profile-card">
        <div class="avatar-section">
          <div class="avatar">
            <span class="avatar-text">{{ profile.full_name.charAt(0) }}</span>
          </div>
          <div class="avatar-info">
            <h1>{{ profile.full_name }}</h1>
            <p>{{ profile.email }}</p>
            <span class="member-badge">Thành viên từ {{ profile.created_at }}</span>
          </div>
        </div>
        <p v-if="isLoading" class="member-badge">Dang tai du lieu...</p>
        <p v-if="errorMessage" class="member-badge">{{ errorMessage }}</p>

        <div class="stats-row">
          <div v-for="stat in stats" :key="stat.label" class="stat-item">
            <span class="stat-icon"><img :src="stat.icon" alt="" /></span>
            <strong>{{ stat.value }}</strong>
            <small>{{ stat.label }}</small>
          </div>
        </div>
      </div>

      <!-- Info section -->
      <div class="info-section">
        <div class="info-card">
          <div class="info-header">
            <h2>Thông tin cá nhân</h2>
            <button v-if="!isEditing" class="edit-btn" @click="startEditing">
              <img :src="iconEdit" alt="" />
              Chỉnh sửa
            </button>
          </div>

          <form v-if="isEditing" class="edit-form" @submit.prevent="saveProfile">
            <label class="field">
              <span>Họ và tên</span>
              <input v-model="form.full_name" type="text" required placeholder="Nhập họ tên" />
            </label>
            <label class="field">
              <span>Email</span>
              <input v-model="form.email" type="email" required placeholder="Nhập email" />
            </label>
            <label class="field">
              <span>Số điện thoại</span>
              <input v-model="form.phone" type="tel" placeholder="Nhập số điện thoại" />
            </label>
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="cancelEditing">Huỷ</button>
              <button type="submit" class="save-btn">Lưu thay đổi</button>
            </div>
          </form>

          <div v-else class="info-display">
            <div class="info-row">
              <span class="info-label">Họ và tên</span>
              <span class="info-value">{{ profile.full_name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">{{ profile.email }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Số điện thoại</span>
              <span class="info-value">{{ profile.phone || 'Chưa cập nhật' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Vai trò</span>
              <span class="info-value role-tag">{{ profile.role }}</span>
            </div>
          </div>
        </div>

        <!-- Menu shortcuts -->
        <div class="menu-card">
          <h2>Truy cập nhanh</h2>
          <div class="menu-list">
            <button
              v-for="item in menuItems"
              :key="item.label"
              type="button"
              class="menu-item menu-item-btn"
              @click="handleMenuClick(item)"
            >
              <span class="menu-icon"><img :src="item.icon" alt="" /></span>
              <span class="menu-label">{{ item.label }}</span>
              <span class="menu-arrow">›</span>
            </button>
          </div>
          <button type="button" class="logout-btn" @click="logout">Đăng xuất</button>
        </div>

        <!-- Danger zone -->
        <div class="danger-card">
          <h2>Vùng nguy hiểm</h2>
          <p>Xoá tài khoản sẽ không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xoá vĩnh viễn.</p>
          <button class="danger-btn">Xoá tài khoản</button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="restaurantModalOpen" class="restaurant-overlay" @click.self="closeRestaurantModal">
        <article class="restaurant-modal">
          <div class="restaurant-modal-head">
            <h3>Mở nhà hàng</h3>
            <button type="button" class="modal-close-btn" @click="closeRestaurantModal">✕</button>
          </div>

          <section class="restaurant-section">
            <h4>Nhà hàng của bạn</h4>
            <p v-if="restaurantLoading">Đang tải danh sách...</p>
            <p v-else-if="!restaurants.length">Bạn chưa có nhà hàng nào.</p>
            <ul v-else class="restaurant-list">
              <li v-for="restaurant in restaurants" :key="restaurant.id">
                <strong>{{ restaurant.name }}</strong>
                <small>{{ restaurant.address || 'Chưa có địa chỉ' }}</small>
                <div class="restaurant-actions">
                  <small :class="restaurant.isApproved ? 'approved-badge' : 'pending-badge'">
                    {{ restaurant.isApproved ? 'Đã duyệt' : 'Chờ admin duyệt' }}
                  </small>
                  <button
                    type="button"
                    class="open-dashboard-btn"
                    :disabled="!restaurant.isApproved"
                    @click="openRestaurantDashboard(restaurant)"
                  >
                    Vào dashboard
                  </button>
                </div>
              </li>
            </ul>
          </section>

          <section class="restaurant-section">
            <h4>Mở quán mới</h4>
            <button v-if="!showOpenRestaurantForm" type="button" class="save-btn" @click="openRestaurantForm">
              Mở quán
            </button>
            <form v-else class="restaurant-form" @submit.prevent="submitOpenRestaurant">
              <label class="field">
                <span>Tên quán</span>
                <input v-model="openingForm.name" required type="text" placeholder="Ví dụ: Cơm Nhà 1988" />
              </label>
              <label class="field">
                <span>Số điện thoại quán</span>
                <input v-model="openingForm.phone" required type="tel" placeholder="09xxxxxxxx" />
              </label>
              <label class="field">
                <span>Địa chỉ</span>
                <input
                  v-model="openingForm.address"
                  required
                  type="text"
                  placeholder="Số nhà, đường, quận/huyện, thành phố"
                />
              </label>
              <label class="field">
                <span>Mô tả quán</span>
                <textarea
                  v-model="openingForm.description"
                  rows="3"
                  placeholder="Món chính, phong cách phục vụ, giờ mở cửa..."
                ></textarea>
              </label>
              <label class="field">
                <span>Ghi chú gửi admin</span>
                <textarea
                  v-model="openingForm.noteToAdmin"
                  rows="2"
                  placeholder="Thông tin bổ sung để admin duyệt hồ sơ"
                ></textarea>
              </label>
              <button type="submit" class="save-btn">Gửi yêu cầu mở quán</button>
            </form>
          </section>

          <p v-if="restaurantMessage" class="restaurant-message">{{ restaurantMessage }}</p>
        </article>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="settingsModalOpen" class="restaurant-overlay" @click.self="closeSettingsModal">
        <article class="restaurant-modal settings-modal">
          <div class="restaurant-modal-head">
            <h3>⚙️ Cài đặt tài khoản</h3>
            <button type="button" class="modal-close-btn" @click="closeSettingsModal">✕</button>
          </div>

          <!-- Thông báo -->
          <section class="settings-group">
            <div class="settings-group-title">
              <span class="settings-group-icon">🔔</span>
              <h4>Thông báo</h4>
            </div>
            <div class="settings-items">
              <label class="settings-toggle-row">
                <div class="settings-toggle-info">
                  <span class="toggle-label">Thông báo đẩy</span>
                  <span class="toggle-desc">Nhận thông báo đơn hàng, trạng thái giao hàng</span>
                </div>
                <div class="toggle-switch" :class="{ active: settingsForm.pushNotifications }" @click="settingsForm.pushNotifications = !settingsForm.pushNotifications">
                  <div class="toggle-knob"></div>
                </div>
              </label>
              <label class="settings-toggle-row">
                <div class="settings-toggle-info">
                  <span class="toggle-label">Gửi email đơn hàng</span>
                  <span class="toggle-desc">Nhận xác nhận đơn qua email</span>
                </div>
                <div class="toggle-switch" :class="{ active: settingsForm.emailNotifications }" @click="settingsForm.emailNotifications = !settingsForm.emailNotifications">
                  <div class="toggle-knob"></div>
                </div>
              </label>
              <label class="settings-toggle-row">
                <div class="settings-toggle-info">
                  <span class="toggle-label">Khuyến mãi & ưu đãi</span>
                  <span class="toggle-desc">Nhận tin về mã giảm giá, Flash Sale</span>
                </div>
                <div class="toggle-switch" :class="{ active: settingsForm.promoNotifications }" @click="settingsForm.promoNotifications = !settingsForm.promoNotifications">
                  <div class="toggle-knob"></div>
                </div>
              </label>
            </div>
          </section>

          <!-- Hiển thị -->
          <section class="settings-group">
            <div class="settings-group-title">
              <span class="settings-group-icon">🎨</span>
              <h4>Hiển thị & ngôn ngữ</h4>
            </div>
            <div class="settings-items">
              <div class="settings-select-row">
                <div class="settings-toggle-info">
                  <span class="toggle-label">Ngôn ngữ</span>
                  <span class="toggle-desc">Chọn ngôn ngữ hiển thị ứng dụng</span>
                </div>
                <select v-model="settingsForm.language" class="settings-select">
                  <option value="vi">🇻🇳 Tiếng Việt</option>
                  <option value="en">🇬🇧 English</option>
                </select>
              </div>
              <div class="settings-select-row">
                <div class="settings-toggle-info">
                  <span class="toggle-label">Giao diện</span>
                  <span class="toggle-desc">Chọn chế độ sáng, tối hoặc theo hệ thống</span>
                </div>
                <select v-model="settingsForm.theme" class="settings-select">
                  <option value="light">☀️ Sáng</option>
                  <option value="dark">🌙 Tối</option>
                  <option value="system">💻 Theo hệ thống</option>
                </select>
              </div>
            </div>
          </section>

          <!-- Riêng tư -->
          <section class="settings-group">
            <div class="settings-group-title">
              <span class="settings-group-icon">🔒</span>
              <h4>Quyền riêng tư</h4>
            </div>
            <div class="settings-items">
              <div class="settings-select-row">
                <div class="settings-toggle-info">
                  <span class="toggle-label">Lịch sử đơn hàng</span>
                  <span class="toggle-desc">Ai có thể xem lịch sử đặt hàng của bạn</span>
                </div>
                <select v-model="settingsForm.orderPrivacy" class="settings-select">
                  <option value="private">🔒 Chỉ mình tôi</option>
                  <option value="friends">👥 Bạn bè</option>
                  <option value="public">🌐 Công khai</option>
                </select>
              </div>
            </div>
          </section>

          <div class="settings-actions">
            <button type="button" class="settings-cancel-btn" @click="closeSettingsModal">Đóng</button>
            <button type="button" class="settings-save-btn" @click="saveSettings">💾 Lưu cài đặt</button>
          </div>

          <p v-if="restaurantMessage" class="settings-saved-msg">{{ restaurantMessage }}</p>
        </article>
      </div>
    </Teleport>
  </section>
</template>

<style scoped src="@/assets/styles/profile-view.css"></style>
