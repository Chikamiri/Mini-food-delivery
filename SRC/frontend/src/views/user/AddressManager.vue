<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import userService from '@/services/userService'
import { fetchAddressesAction, setDefaultAddressAction } from '@/utils/addressManagerUtils'
import iconBackArrow from '@/assets/icon/back-arrow.svg'

const addresses = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingAddressId = ref(null)
const newAddress = ref({
  label: '',
  addressLine: '',
  detail: '',
  isDefault: false,
  latitude: 0,
  longitude: 0,
})
const editAddress = ref({
  label: '',
  addressLine: '',
  detail: '',
  isDefault: false,
  latitude: 0,
  longitude: 0,
})
const router = useRouter()

const fetchAddresses = () => fetchAddressesAction(userService, addresses, isLoading, errorMessage)
const setDefault = (id) => setDefaultAddressAction(userService, id, fetchAddresses, errorMessage)
const primaryAddress = computed(() => addresses.value.find((item) => item.isDefault) || null)
const otherAddresses = computed(() => addresses.value.filter((item) => !item.isDefault))
const resetNewAddress = () => {
  newAddress.value = {
    label: '',
    addressLine: '',
    detail: '',
    isDefault: false,
    latitude: 0,
    longitude: 0,
  }
}
const toggleAddForm = () => {
  showAddForm.value = !showAddForm.value
  if (showAddForm.value) {
    showEditForm.value = false
    editingAddressId.value = null
  } else {
    resetNewAddress()
  }
}
const openEditForm = (address) => {
  showAddForm.value = false
  showEditForm.value = true
  editingAddressId.value = address.id
  editAddress.value = {
    label: address.label || '',
    addressLine: address.addressLine || address.detail || '',
    detail: address.detail || '',
    isDefault: Boolean(address.isDefault),
    latitude: Number(address.latitude || 0),
    longitude: Number(address.longitude || 0),
  }
}
const cancelEdit = () => {
  showEditForm.value = false
  editingAddressId.value = null
}
const addAddress = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  if (!newAddress.value.label || !newAddress.value.addressLine) {
    errorMessage.value = 'Vui lòng nhập nhãn và địa chỉ.'
    return
  }
  isSubmitting.value = true
  try {
    await userService.addAddress({
      label: newAddress.value.label,
      addressLine: newAddress.value.addressLine,
      detail: newAddress.value.detail || '',
      isDefault: Boolean(newAddress.value.isDefault),
      latitude: Number(newAddress.value.latitude || 0),
      longitude: Number(newAddress.value.longitude || 0),
    })
    successMessage.value = 'Đã thêm địa chỉ mới.'
    showAddForm.value = false
    resetNewAddress()
    await fetchAddresses()
  } catch (error) {
    errorMessage.value = error.message || 'Không thể thêm địa chỉ mới.'
  } finally {
    isSubmitting.value = false
  }
}
const updateAddress = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  if (!editingAddressId.value) return
  if (!editAddress.value.label || !editAddress.value.addressLine) {
    errorMessage.value = 'Vui lòng nhập nhãn và địa chỉ.'
    return
  }
  isSubmitting.value = true
  try {
    await userService.updateAddress(editingAddressId.value, {
      label: editAddress.value.label,
      addressLine: editAddress.value.addressLine,
      detail: editAddress.value.detail || '',
      isDefault: Boolean(editAddress.value.isDefault),
      latitude: Number(editAddress.value.latitude || 0),
      longitude: Number(editAddress.value.longitude || 0),
    })
    if (editAddress.value.isDefault) {
      await userService.setDefaultAddress(editingAddressId.value)
    }
    successMessage.value = 'Đã cập nhật địa chỉ.'
    cancelEdit()
    await fetchAddresses()
  } catch (error) {
    errorMessage.value = error.message || 'Không thể cập nhật địa chỉ.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchAddresses)
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
    <p v-if="errorMessage" class="state-msg state-msg--error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="state-msg state-msg--success">{{ successMessage }}</p>

    <section v-if="showAddForm" class="address-block">
      <h2>Thêm địa chỉ mới</h2>
      <div class="form-grid">
        <label class="field">
          <span>Nhãn địa chỉ</span>
          <input v-model="newAddress.label" type="text" placeholder="Ví dụ: Nhà riêng, Công ty..." />
        </label>
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
      <div class="form-actions">
        <button type="button" class="ghost-btn" @click="toggleAddForm">Hủy</button>
        <button type="button" class="set-default-btn" :disabled="isSubmitting" @click="addAddress">
          {{ isSubmitting ? 'Đang lưu...' : 'Lưu địa chỉ mới' }}
        </button>
      </div>
    </section>

    <section v-if="primaryAddress" class="address-block">
      <h2>Địa chỉ mặc định</h2>
      <article class="address-card active">
        <div>
          <strong>{{ primaryAddress.label || 'Địa chỉ chính' }}</strong>
          <p>{{ primaryAddress.addressLine || primaryAddress.detail || 'Chưa có chi tiết địa chỉ' }}</p>
        </div>
        <div class="address-actions">
          <button type="button" class="edit-btn" @click="openEditForm(primaryAddress)">Chỉnh sửa</button>
          <span class="badge">Mặc định</span>
        </div>
      </article>
    </section>

    <section class="address-block">
      <h2>Địa chỉ khác</h2>
      <p v-if="!addresses.length" class="state-msg">Bạn chưa có địa chỉ nào.</p>
      <div v-else class="address-grid">
        <article v-for="address in otherAddresses" :key="address.id" class="address-card">
          <div>
            <strong>{{ address.label || 'Địa chỉ' }}</strong>
            <p>{{ address.addressLine || address.detail || 'Chưa có chi tiết địa chỉ' }}</p>
          </div>
          <div class="address-actions">
            <button type="button" class="edit-btn" @click="openEditForm(address)">Chỉnh sửa</button>
            <button type="button" class="set-default-btn" @click="setDefault(address.id)">Đặt mặc định</button>
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
      <div class="form-actions">
        <button type="button" class="ghost-btn" @click="cancelEdit">Hủy</button>
        <button type="button" class="set-default-btn" :disabled="isSubmitting" @click="updateAddress">
          {{ isSubmitting ? 'Đang lưu...' : 'Lưu chỉnh sửa' }}
        </button>
      </div>
    </section>
  </section>
</template>

<style scoped>
.address-page {
  max-width: 920px;
  margin: 0 auto;
  padding: 1.2rem;
  min-height: 100vh;
  background: radial-gradient(circle at top, #fff7fa 0%, #f7f8fc 55%, #f3f5fa 100%);
}

.address-head h1 {
  margin: 0.6rem 0 0.2rem;
  font-size: 1.55rem;
  color: #1a2233;
}

.address-head p {
  margin: 0;
  color: #6b7485;
}

.add-btn {
  margin-top: 0.65rem;
  border: 0;
  border-radius: 10px;
  background: #ff7f23;
  color: #fff;
  font-weight: 700;
  padding: 0.5rem 0.85rem;
  cursor: pointer;
}

.back-btn {
  border: 1px solid #d7dbe3;
  background: #fff;
  color: #303544;
  border-radius: 10px;
  padding: 0.45rem 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
  cursor: pointer;
}

.address-block {
  margin-top: 1rem;
  background: #fff;
  border: 1px solid #e7ebf2;
  border-radius: 14px;
  padding: 0.95rem;
}

.address-block h2 {
  margin: 0 0 0.7rem;
  font-size: 1rem;
  color: #20293a;
}

.address-grid {
  display: grid;
  gap: 0.7rem;
}

.form-grid {
  display: grid;
  gap: 0.65rem;
}

.field span {
  display: block;
  margin-bottom: 0.3rem;
  color: #2a3345;
  font-size: 0.88rem;
  font-weight: 600;
}

.field input[type='text'] {
  width: 100%;
  border: 1px solid #d7dbe3;
  border-radius: 10px;
  padding: 0.6rem 0.72rem;
  font-size: 0.9rem;
}

.field.row {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.field.row span {
  margin: 0;
  font-weight: 500;
}

.form-actions {
  margin-top: 0.75rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.55rem;
}

.ghost-btn {
  border: 1px solid #d7dbe3;
  border-radius: 9px;
  background: #fff;
  color: #495164;
  font-weight: 600;
  padding: 0.42rem 0.68rem;
  cursor: pointer;
}

.address-card {
  border: 1px solid #e5eaf2;
  border-radius: 12px;
  padding: 0.8rem;
  display: flex;
  justify-content: space-between;
  gap: 0.9rem;
  align-items: flex-start;
}

.address-actions {
  display: inline-flex;
  gap: 0.45rem;
}

.edit-btn {
  border: 1px solid #d7dbe3;
  border-radius: 9px;
  background: #fff;
  color: #4b5568;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.42rem 0.62rem;
  cursor: pointer;
  white-space: nowrap;
}

.address-card.active {
  border-color: #f898aa;
  background: #fff1f4;
}

.address-card strong {
  color: #1f2738;
}

.address-card p {
  margin: 0.28rem 0 0;
  color: #6f788a;
  font-size: 0.9rem;
}

.set-default-btn {
  border: 0;
  border-radius: 9px;
  background: #ff7f23;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.42rem 0.62rem;
  cursor: pointer;
  white-space: nowrap;
}

.badge {
  background: #ff7f23;
  color: #fff;
  border-radius: 999px;
  font-size: 0.75rem;
  padding: 0.2rem 0.58rem;
}

.state-msg {
  margin-top: 0.8rem;
  color: #6a7384;
}

.state-msg--error {
  color: #d7264a;
}

.state-msg--success {
  color: #168247;
}
</style>
