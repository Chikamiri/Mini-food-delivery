<script setup>
import { onMounted } from 'vue'
import { useOrderStore } from '@/stores/order'

const orderStore = useOrderStore()

onMounted(() => {
  orderStore.fetchUserOrders()
})
</script>

<template>
  <div class="order-history">
    <h1>Lịch sử đơn hàng</h1>
    <p v-if="orderStore.isLoading">Đang tải...</p>
    <p v-if="orderStore.error">{{ orderStore.error }}</p>
    <ul v-if="orderStore.orders.length">
      <li v-for="order in orderStore.orders" :key="order.id">
        #{{ order.id }} - {{ order.status }} - {{ order.totalAmount || 0 }}
      </li>
    </ul>
  </div>
</template>
