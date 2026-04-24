<script setup>
import { onMounted, ref } from 'vue'
import userService from '@/services/userService'
import { fetchAddressesAction, setDefaultAddressAction } from '@/utils/addressManagerUtils'

const addresses = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const fetchAddresses = () => fetchAddressesAction(userService, addresses, isLoading, errorMessage)
const setDefault = (id) => setDefaultAddressAction(userService, id, fetchAddresses, errorMessage)

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
