<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOrderStore } from '@/stores/order'

const route = useRoute()
const orderStore = useOrderStore()

onMounted(() => {
  if (route.params.id) {
    orderStore.fetchOrderById(route.params.id)
  }
})
</script>

<template>
  <div class="order-tracking">
    <h1>Theo dõi đơn hàng</h1>
    <p v-if="orderStore.isLoading">Đang tải...</p>
    <p v-if="orderStore.error">{{ orderStore.error }}</p>
    <div v-if="orderStore.currentOrder">
      <p>Mã đơn: #{{ orderStore.currentOrder.id }}</p>
      <p>Trạng thái: {{ orderStore.currentOrder.status }}</p>
    </div>
  </div>
</template>
