<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const isEditing = ref(false)

const profile = ref({
  full_name: 'Nguyễn Văn A',
  email: 'nguyenvana@email.com',
  phone: '0901 234 567',
  avatar_url: '',
  role: 'USER',
  created_at: '2026-01-15',
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
  profile.value = { ...profile.value, ...form.value }
  isEditing.value = false
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
  { icon: '⚙️', label: 'Cài đặt', route: '/settings' },
  { icon: '❓', label: 'Trợ giúp', route: '/help' },
]

const router = useRouter()

function logout() {
  // TODO: Khi có backend, gọi API logout + xóa token/session tại đây.
  router.push('/')
}
</script>

<template>
  <section class="profile-view">
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
            <a v-for="item in menuItems" :key="item.label" :href="item.route" class="menu-item">
              <span class="menu-icon">{{ item.icon }}</span>
              <span class="menu-label">{{ item.label }}</span>
              <span class="menu-arrow">›</span>
            </a>
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
  </section>
</template>

<style scoped src="@/assets/styles/profile-view.css"></style>
