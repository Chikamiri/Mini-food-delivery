<script setup>
import { ref } from 'vue'

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

<style scoped>
.profile-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
  background: #f4f5f7;
  min-height: 100vh;
}

.profile-layout {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

/* Profile card */
.profile-card {
  background: linear-gradient(135deg, #ff7f23 0%, #ff9a56 100%);
  border-radius: 16px;
  padding: 1.5rem;
  color: #fff;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text {
  font-size: 1.6rem;
  font-weight: 700;
}

.avatar-info h1 {
  margin: 0;
  font-size: 1.3rem;
}

.avatar-info p {
  margin: 0.15rem 0 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.member-badge {
  display: inline-block;
  margin-top: 0.35rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.78rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.stat-item {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 0.7rem;
  text-align: center;
}

.stat-icon {
  font-size: 1.1rem;
  display: block;
  margin-bottom: 0.2rem;
}

.stat-item strong {
  display: block;
  font-size: 1.15rem;
}

.stat-item small {
  opacity: 0.85;
  font-size: 0.75rem;
}

/* Info section */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-card,
.menu-card,
.danger-card {
  background: #fff;
  border: 1px solid #eceef3;
  border-radius: 14px;
  padding: 1.2rem;
}

.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.info-header h2,
.menu-card h2,
.danger-card h2 {
  margin: 0;
  font-size: 1.05rem;
  color: #151824;
}

.edit-btn {
  border: 1px solid #d7dbe3;
  background: #fff;
  border-radius: 8px;
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  cursor: pointer;
  color: #434a59;
  transition: all 0.15s;
}

.edit-btn:hover {
  border-color: #ff7f23;
  color: #ff7f23;
}

/* Display mode */
.info-display {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f4f5f7;
}

.info-row:last-child {
  border-bottom: 0;
}

.info-label {
  color: #656b78;
  font-size: 0.9rem;
}

.info-value {
  color: #202432;
  font-weight: 500;
  font-size: 0.92rem;
}

.role-tag {
  background: #fff1e3;
  color: #ff7f23;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
}

/* Edit form */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.field {
  display: block;
}

.field span {
  display: block;
  margin-bottom: 0.35rem;
  font-weight: 600;
  font-size: 0.88rem;
  color: #2b3140;
}

.field input {
  width: 100%;
  border: 1px solid #d7dbe3;
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
  font-family: inherit;
  font-size: 0.92rem;
  transition: border-color 0.2s;
}

.field input:focus {
  outline: none;
  border-color: #ff7f23;
  box-shadow: 0 0 0 3px rgba(255, 127, 35, 0.12);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.5rem;
}

.cancel-btn {
  border: 1px solid #d7dbe3;
  background: #fff;
  border-radius: 10px;
  padding: 0.6rem 1.2rem;
  color: #434a59;
  cursor: pointer;
}

.save-btn {
  border: 0;
  background: #ff7f23;
  color: #fff;
  border-radius: 10px;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.save-btn:hover {
  background: #e86e14;
}

/* Menu shortcuts */
.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f4f5f7;
  text-decoration: none;
  color: inherit;
  transition: background 0.15s;
}

.menu-item:last-child {
  border-bottom: 0;
}

.menu-item:hover {
  background: #fafbfd;
  margin: 0 -1.2rem;
  padding: 0.75rem 1.2rem;
}

.menu-icon {
  font-size: 1.2rem;
  width: 28px;
  text-align: center;
}

.menu-label {
  flex: 1;
  font-size: 0.92rem;
  color: #303544;
}

.menu-arrow {
  color: #b0b5c0;
  font-size: 1.2rem;
}

/* Danger zone */
.danger-card {
  border-color: #fecaca;
}

.danger-card h2 {
  color: #ef4444;
}

.danger-card p {
  color: #656b78;
  font-size: 0.88rem;
  margin: 0.5rem 0 1rem;
  line-height: 1.45;
}

.danger-btn {
  border: 1px solid #ef4444;
  background: #fff;
  color: #ef4444;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.danger-btn:hover {
  background: #ef4444;
  color: #fff;
}

@media (max-width: 640px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .avatar-section {
    flex-direction: column;
    text-align: center;
  }
}
</style>
