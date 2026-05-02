<script setup>
import iconBackspace from '@/assets/icon/back-arrow.svg'
import iconEdit from '@/assets/icon/edit.svg'
import iconClose from '@/assets/icon/close.svg'
import iconNotice from '@/assets/icon/notice.svg'
import iconGlobe from '@/assets/icon/globe.svg'
import iconShield from '@/assets/icon/shield.svg'
import iconDelete from '@/assets/icon/delete.svg'
import { useProfileViewModel } from '@/composables/useProfileViewModel'

const {
  isEditing,
  isLoading,
  errorMessage,
  profile,
  form,
  stats,
  menuItems,
  restaurantModalOpen,
  restaurantLoading,
  restaurants,
  restaurantMessage,
  showOpenRestaurantForm,
  openingForm,
  settingsModalOpen,
  deletingAccount,
  shipperModalOpen,
  shipperLoading,
  shipperMessage,
  shipperRequests,
  showShipperForm,
  shipperForm,
  settingsForm,
  startEditing,
  cancelEditing,
  saveProfile,
  logout,
  goBackToBrowse,
  closeRestaurantModal,
  openRestaurantForm,
  openRestaurantDashboard,
  openSettingsModal,
  closeSettingsModal,
  openShipperModal,
  closeShipperModal,
  submitShipperRequest,
  saveSettings,
  deleteMyAccount,
  handleMenuClick,
  submitOpenRestaurant,
} = useProfileViewModel()
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
        <p v-if="isLoading" class="member-badge">Đang tải dữ liệu...</p>
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

      </div>
    </div>

    <Teleport to="body">
      <div v-if="restaurantModalOpen" class="restaurant-overlay" @click.self="closeRestaurantModal">
        <article class="restaurant-modal">
          <div class="restaurant-modal-head">
            <h3>Mở nhà hàng</h3>
            <button type="button" class="modal-close-btn" @click="closeRestaurantModal">
              <img :src="iconClose" alt="" width="14" height="14" />
            </button>
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
            <h3>Cài đặt tài khoản</h3>
            <button type="button" class="modal-close-btn" @click="closeSettingsModal">
              <img :src="iconClose" alt="" width="14" height="14" />
            </button>
          </div>

          <!-- Thông báo -->
          <section class="settings-group">
            <div class="settings-group-title">
              <span class="settings-group-icon"><img :src="iconNotice" alt="" /></span>
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
              <span class="settings-group-icon"><img :src="iconGlobe" alt="" /></span>
              <h4>Hiển thị & ngôn ngữ</h4>
            </div>
            <div class="settings-items">
              <div class="settings-select-row">
                <div class="settings-toggle-info">
                  <span class="toggle-label">Ngôn ngữ</span>
                  <span class="toggle-desc">Chọn ngôn ngữ hiển thị ứng dụng</span>
                </div>
                <select v-model="settingsForm.language" class="settings-select">
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div class="settings-select-row">
                <div class="settings-toggle-info">
                  <span class="toggle-label">Giao diện</span>
                  <span class="toggle-desc">Chọn chế độ sáng, tối hoặc theo hệ thống</span>
                </div>
                <select v-model="settingsForm.theme" class="settings-select">
                  <option value="light">Sáng</option>
                  <option value="dark">Tối</option>
                  <option value="system">Theo hệ thống</option>
                </select>
              </div>
            </div>
          </section>

  

          <section class="settings-group danger-zone">
            <div class="settings-group-title">
              <span class="settings-group-icon"><img :src="iconDelete" alt="" /></span>
              <h4>Xóa tài khoản</h4>
            </div>
            <div class="settings-items">
              <p class="danger-desc">
                Xoá tài khoản sẽ không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xoá vĩnh viễn.
              </p>
              <button
                type="button"
                class="danger-btn"
                :disabled="deletingAccount"
                @click="deleteMyAccount"
              >
                {{ deletingAccount ? 'Đang xoá...' : 'Xoá tài khoản' }}
              </button>
            </div>
          </section>

          <div class="settings-actions">
            <button type="button" class="settings-cancel-btn" @click="closeSettingsModal">Đóng</button>
            <button type="button" class="settings-save-btn" @click="saveSettings">Lưu cài đặt</button>
          </div>

          <p v-if="restaurantMessage" class="settings-saved-msg">{{ restaurantMessage }}</p>
        </article>
      </div>
    </Teleport>

    <!-- Shipper Request Modal -->
    <Teleport to="body">
      <div v-if="shipperModalOpen" class="restaurant-overlay" @click.self="closeShipperModal">
        <article class="restaurant-modal">
          <div class="restaurant-modal-head">
            <h3>Đăng ký làm Shipper</h3>
            <button type="button" class="modal-close-btn" @click="closeShipperModal">
              <img :src="iconClose" alt="" width="14" height="14" />
            </button>
          </div>

          <section class="restaurant-section">
            <h4>Trạng thái yêu cầu</h4>
            <p v-if="shipperLoading">Đang tải...</p>

            <template v-else>
              <!-- Show existing requests -->
              <ul v-if="shipperRequests.length" class="restaurant-list">
                <li v-for="req in shipperRequests" :key="req.id">
                  <strong>Yêu cầu #{{ req.id }}</strong>
                  <small>SĐT: {{ req.phoneNumber }} | Biển số: {{ req.licensePlate }}</small>
                  <div class="restaurant-actions">
                    <small
                      :class="
                        String(req.status).toUpperCase() === 'APPROVED'
                          ? 'approved-badge'
                          : String(req.status).toUpperCase() === 'REJECTED'
                            ? 'rejected-badge'
                            : 'pending-badge'
                      "
                    >
                      {{
                        String(req.status).toUpperCase() === 'APPROVED'
                          ? 'Đã duyệt'
                          : String(req.status).toUpperCase() === 'REJECTED'
                            ? 'Bị từ chối'
                            : 'Chờ admin duyệt'
                      }}
                    </small>
                  </div>
                  <small v-if="req.adminNote" class="admin-note">Ghi chú admin: {{ req.adminNote }}</small>
                </li>
              </ul>
              <p v-else>Bạn chưa gửi yêu cầu nào.</p>
            </template>
          </section>

          <section v-if="showShipperForm" class="restaurant-section">
            <h4>Gửi yêu cầu mới</h4>
            <form class="restaurant-form" @submit.prevent="submitShipperRequest">
              <label class="field">
                <span>Số điện thoại liên hệ</span>
                <input
                  v-model="shipperForm.phoneNumber"
                  required
                  type="tel"
                  placeholder="09xxxxxxxx"
                  minlength="10"
                  maxlength="15"
                />
              </label>
              <label class="field">
                <span>Biển số xe</span>
                <input
                  v-model="shipperForm.licensePlate"
                  required
                  type="text"
                  placeholder="VD: 59A-12345"
                  minlength="4"
                  maxlength="20"
                />
              </label>
              <button type="submit" class="save-btn" :disabled="shipperLoading">
                {{ shipperLoading ? 'Đang gửi...' : 'Gửi yêu cầu làm Shipper' }}
              </button>
            </form>
          </section>

          <p v-if="shipperMessage" class="restaurant-message">{{ shipperMessage }}</p>
        </article>
      </div>
    </Teleport>
  </section>
</template>

<style scoped src="@/assets/styles/profile-view.css"></style>
