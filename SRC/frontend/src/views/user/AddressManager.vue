<script setup>
import iconBackArrow from '@/assets/icon/back-arrow.svg'
import MapView from '@/components/MapView.vue'
import { useAddressManagerViewModel } from '@/composables/useAddressManagerViewModel'

const {
  addresses,
  isLoading,
  errorMessage,
  successMessage,
  isSubmitting,
  showAddForm,
  showEditForm,
  newAddress,
  editAddress,
  router,
  newAddressSearchQuery,
  newAddressSearchResults,
  newAddressSearching,
  editAddressSearchQuery,
  editAddressSearchResults,
  editAddressSearching,
  newMiniMapOpen,
  editMiniMapOpen,
  newMapMarkers,
  editMapMarkers,
  onNewAddressSearchInput,
  selectNewAddressResult,
  onEditAddressSearchInput,
  selectEditAddressResult,
  onNewMapClick,
  onEditMapClick,
  setDefault,
  toggleAddForm,
  openEditForm,
  cancelEdit,
  addAddress,
  deleteAddress,
  updateAddress,
} = useAddressManagerViewModel()
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
