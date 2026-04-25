<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import userService from '@/services/userService'
import { fetchAddressesAction, setDefaultAddressAction } from '@/utils/addressManagerUtils'
import iconBackArrow from '@/assets/icon/back-arrow.svg'

const addresses = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const router = useRouter()

const fetchAddresses = () => fetchAddressesAction(userService, addresses, isLoading, errorMessage)
const setDefault = (id) => setDefaultAddressAction(userService, id, fetchAddresses, errorMessage)
const primaryAddress = computed(() => addresses.value.find((item) => item.isDefault) || null)
const otherAddresses = computed(() => addresses.value.filter((item) => !item.isDefault))

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
    </header>

    <p v-if="isLoading" class="state-msg">Đang tải danh sách địa chỉ...</p>
    <p v-if="errorMessage" class="state-msg state-msg--error">{{ errorMessage }}</p>

    <section v-if="primaryAddress" class="address-block">
      <h2>Địa chỉ mặc định</h2>
      <article class="address-card active">
        <div>
          <strong>{{ primaryAddress.label || 'Địa chỉ chính' }}</strong>
          <p>{{ primaryAddress.addressLine || primaryAddress.detail || 'Chưa có chi tiết địa chỉ' }}</p>
        </div>
        <span class="badge">Mặc định</span>
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
          <button type="button" class="set-default-btn" @click="setDefault(address.id)">Đặt mặc định</button>
        </article>
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

.address-card {
  border: 1px solid #e5eaf2;
  border-radius: 12px;
  padding: 0.8rem;
  display: flex;
  justify-content: space-between;
  gap: 0.9rem;
  align-items: flex-start;
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
</style>
