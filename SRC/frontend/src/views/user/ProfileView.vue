<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import iconBackspace from '@/assets/icon/back-arrow.svg'
import userService from '@/services/userService'
import { useAuthStore } from '@/stores/auth'
import restaurantService from '@/services/restaurantService'

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

function startEditing() {
  form.value = {
    full_name: profile.value.full_name,
    email: profile.value.email,
    phone: profile.value.phone,
  }
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
}

function saveProfile() {
  updateProfile()
}

const stats = ref([
  { label: 'Đơn hàng', value: '24', icon: '📦' },
  { label: 'Đã giao', value: '21', icon: '✅' },
  { label: 'Yêu thích', value: '8', icon: '❤️' },
  { label: 'Địa chỉ', value: '3', icon: '📍' },
])

const menuItems = [
  { icon: '📋', label: 'Lịch sử đơn hàng', route: '/orders' },
  { icon: '📍', label: 'Quản lý địa chỉ', route: '/addresses' },
  { icon: '🔔', label: 'Thông báo', route: '/notifications' },
  { icon: '💳', label: 'Phương thức thanh toán', route: '/payment' },
  { icon: '🏪', label: 'Mở nhà hàng', route: 'open-restaurant' },
  { icon: '⚙️', label: 'Cài đặt', route: '/settings' },
  { icon: '❓', label: 'Trợ giúp', route: '/help' },
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

const router = useRouter()

function logout() {
  authStore.logout()
  router.push('/')
}

function goBackToBrowse() {
  router.push('/browse')
}

async function openRestaurantModal() {
  restaurantModalOpen.value = true
  showOpenRestaurantForm.value = false
  restaurantMessage.value = ''
  restaurantLoading.value = true
  try {
    const data = await restaurantService.getMyRestaurants()
    restaurants.value = Array.isArray(data) ? data : []
  } catch (error) {
    restaurants.value = []
    restaurantMessage.value = error.message || 'Chưa thể tải danh sách nhà hàng'
  } finally {
    restaurantLoading.value = false
  }
}

function closeRestaurantModal() {
  restaurantModalOpen.value = false
  showOpenRestaurantForm.value = false
}

function openRestaurantForm() {
  showOpenRestaurantForm.value = true
}

function handleMenuClick(item) {
  if (item.route === 'open-restaurant') {
    openRestaurantModal()
    return
  }
  router.push(item.route)
}

function submitOpenRestaurant() {
  restaurantMessage.value =
    'Đã ghi nhận thông tin mở quán. Bộ phận admin sẽ liên hệ và duyệt hồ sơ cho bạn.'
  openingForm.value = {
    name: '',
    phone: '',
    address: '',
    description: '',
    noteToAdmin: '',
  }
}

async function loadProfile() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const data = await userService.getProfile()
    profile.value = {
      ...profile.value,
      full_name: data.fullName || profile.value.full_name,
      email: data.email || profile.value.email,
      phone: data.phone || '',
      avatar_url: data.avatarUrl || '',
      role: data.role || profile.value.role,
      created_at: data.createdAt ? String(data.createdAt).slice(0, 10) : profile.value.created_at,
    }
    form.value = {
      full_name: profile.value.full_name,
      email: profile.value.email,
      phone: profile.value.phone,
    }
  } catch (error) {
    errorMessage.value = error.message || 'Khong the tai thong tin tai khoan'
  } finally {
    isLoading.value = false
  }
}

async function updateProfile() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const updated = await userService.updateProfile({
      fullName: form.value.full_name,
      phone: form.value.phone,
    })
    profile.value = {
      ...profile.value,
      full_name: updated.fullName || form.value.full_name,
      phone: updated.phone || form.value.phone,
    }
    isEditing.value = false
  } catch (error) {
    errorMessage.value = error.message || 'Khong the cap nhat thong tin'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (authStore.user) {
    profile.value.full_name = authStore.user.fullName || profile.value.full_name
    profile.value.email = authStore.user.email || profile.value.email
    profile.value.role = authStore.user.role || profile.value.role
  }
  loadProfile()
})

watch(restaurantModalOpen, (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
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
            <span class="stat-icon">{{ stat.icon }}</span>
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
            <button v-if="!isEditing" class="edit-btn" @click="startEditing">✏️ Chỉnh sửa</button>
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
              <span class="menu-icon">{{ item.icon }}</span>
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
  </section>
</template>

<style scoped src="@/assets/styles/profile-view.css"></style>
