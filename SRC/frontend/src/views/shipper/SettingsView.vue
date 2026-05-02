<script setup>
import ShipperSidebar from '@/components/ShipperSidebar.vue'
import iconUser from '@/assets/icon/user.svg'
import iconShipper from '@/assets/icon/send.svg'
import iconNotice from '@/assets/icon/notice.svg'
import iconDelete from '@/assets/icon/delete.svg'
import { useShipperSettingsViewModel } from '@/composables/useShipperSettingsViewModel'

const {
  isLoading,
  isSaving,
  deletingAccount,
  savedMsg,
  errorMsg,
  profileForm,
  vehicleForm,
  notifForm,
  saveProfile,
  saveVehicle,
  saveNotifications,
  logout,
  deleteAccount,
} = useShipperSettingsViewModel()
</script>

<template>
  <div class="shipper-layout">
    <ShipperSidebar active-key="settings" @logout="logout" />

    <main class="shipper-main shipper-settings-main">
      <div class="page-header">
        <div>
          <h1 class="page-title">Cài đặt</h1>
          <p class="page-subtitle">Quản lý hồ sơ, phương tiện và thông báo của bạn</p>
        </div>
      </div>

      <div v-if="isLoading" class="empty-state">Đang tải thông tin...</div>

      <div v-else class="settings-layout">
        <!-- Alerts -->
        <div v-if="savedMsg" class="alert alert-success" style="margin-bottom:1rem;">{{ savedMsg }}</div>
        <div v-if="errorMsg" class="alert alert-error" style="margin-bottom:1rem;">{{ errorMsg }}</div>

        <!-- Profile section -->
        <div class="settings-group">
          <div class="settings-group-head">
            <div class="settings-group-icon icon-orange">
              <img :src="iconUser" alt="" />
            </div>
            <div>
              <h3>Thông tin cá nhân</h3>
              <p>Họ tên và số điện thoại liên lạc</p>
            </div>
          </div>
          <div class="settings-rows">
            <div class="settings-field">
              <label>Họ và tên</label>
              <input
                v-model="profileForm.fullName"
                type="text"
                placeholder="Nhập họ tên đầy đủ"
              />
            </div>
            <div class="settings-field">
              <label>Số điện thoại</label>
              <input
                v-model="profileForm.phone"
                type="tel"
                placeholder="09xxxxxxxx"
              />
            </div>
          </div>
          <div class="settings-actions">
            <button type="button" class="btn btn-primary" :disabled="isSaving" @click="saveProfile">
              {{ isSaving ? 'Đang lưu...' : 'Lưu thông tin' }}
            </button>
          </div>
        </div>

        <!-- Vehicle section -->
        <div class="settings-group">
          <div class="settings-group-head">
            <div class="settings-group-icon icon-blue">
              <img :src="iconShipper" alt="" />
            </div>
            <div>
              <h3>Phương tiện</h3>
              <p>Thông tin xe dùng để giao hàng</p>
            </div>
          </div>
          <div class="settings-rows">
            <div class="settings-field">
              <label>Biển số xe</label>
              <input
                v-model="vehicleForm.licensePlate"
                type="text"
                placeholder="VD: 59A-12345"
                maxlength="20"
              />
            </div>
            <div class="settings-field">
              <label>Loại phương tiện</label>
              <select v-model="vehicleForm.vehicleType">
                <option value="motorbike">Xe máy</option>
                <option value="bicycle">Xe đạp</option>
                <option value="car">Ô tô</option>
              </select>
            </div>
          </div>
          <div class="settings-actions">
            <button type="button" class="btn btn-primary" @click="saveVehicle">
              Lưu phương tiện
            </button>
          </div>
        </div>

        <!-- Notifications section -->
        <div class="settings-group">
          <div class="settings-group-head">
            <div class="settings-group-icon icon-green">
              <img :src="iconNotice" alt="" />
            </div>
            <div>
              <h3>Thông báo</h3>
              <p>Tuỳ chọn nhận thông báo từ hệ thống</p>
            </div>
          </div>
          <div class="settings-rows">
            <div class="settings-toggle-row">
              <div class="toggle-info">
                <span class="toggle-title">Đơn hàng mới</span>
                <span class="toggle-desc">Nhận thông báo khi có đơn hàng được giao cho bạn</span>
              </div>
              <div
                :class="['toggle-switch', notifForm.orderAssigned ? 'on' : '']"
                @click="notifForm.orderAssigned = !notifForm.orderAssigned; saveNotifications()"
              >
                <div class="toggle-knob"></div>
              </div>
            </div>
            <div class="settings-toggle-row">
              <div class="toggle-info">
                <span class="toggle-title">Thông báo hệ thống</span>
                <span class="toggle-desc">Cập nhật, bảo trì và thông báo từ MiniFood</span>
              </div>
              <div
                :class="['toggle-switch', notifForm.systemAnnouncements ? 'on' : '']"
                @click="notifForm.systemAnnouncements = !notifForm.systemAnnouncements; saveNotifications()"
              >
                <div class="toggle-knob"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Account section -->
        <div class="settings-group">
          <div class="settings-group-head">
            <div class="settings-group-icon icon-red">
              <img :src="iconDelete" alt="" />
            </div>
            <div>
              <h3>Xóa tài khoản</h3>
              <p>Xóa vĩnh viễn tài khoản shipper</p>
            </div>
          </div>
          <p class="danger-desc">
            Hành động này sẽ xóa toàn bộ dữ liệu tài khoản shipper và không thể hoàn tác.
          </p>
          <div class="settings-actions">
            <button type="button" class="btn btn-ghost" :disabled="deletingAccount" @click="deleteAccount">
              {{ deletingAccount ? 'Đang xóa...' : 'Xóa tài khoản' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped src="@/assets/styles/shipper-views.css"></style>
