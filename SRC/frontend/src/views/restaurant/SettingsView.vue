<script setup>
import MapView from '@/components/MapView.vue'
import RestaurantSidebar from '@/components/RestaurantSidebar.vue'
import { useRestaurantSettingsViewModel } from '@/composables/useRestaurantSettingsViewModel'

const {
  loading,
  isSaving,
  errorMessage,
  successMessage,
  settingsForm,
  activeRestaurant,
  addressQuery,
  addressResults,
  searchingAddress,
  mapMarkers,
  miniMapOpen,
  imageFileInputRef,
  avatarInputKey,
  searchAddress,
  selectAddressResult,
  onMapClick,
  loadData,
  saveSettings,
  logout,
  triggerRestaurantImagePick,
  onRestaurantImageFileChange,
  clearRestaurantImage,
} = useRestaurantSettingsViewModel()
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
