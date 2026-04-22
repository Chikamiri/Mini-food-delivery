<script setup>
import { onMounted, ref } from 'vue'
import userService from '@/services/userService'

const addresses = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

async function fetchAddresses() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const data = await userService.getAddresses()
    addresses.value = Array.isArray(data) ? data : []
  } catch (error) {
    errorMessage.value = error.message || 'Khong the tai dia chi'
  } finally {
    isLoading.value = false
  }
}

async function setDefault(id) {
  try {
    await userService.setDefaultAddress(id)
    await fetchAddresses()
  } catch (error) {
    errorMessage.value = error.message || 'Khong the dat mac dinh'
  }
}

onMounted(fetchAddresses)
</script>

<template>
  <div class="address-manager">
    <h1>Quản lý địa chỉ</h1>
    <p v-if="isLoading">Đang tải...</p>
    <p v-if="errorMessage">{{ errorMessage }}</p>
    <ul v-if="addresses.length">
      <li v-for="address in addresses" :key="address.id">
        <strong>{{ address.label || 'Địa chỉ' }}</strong> - {{ address.addressLine }}
        <button v-if="!address.isDefault" @click="setDefault(address.id)">Đặt mặc định</button>
      </li>
    </ul>
  </div>
</template>
