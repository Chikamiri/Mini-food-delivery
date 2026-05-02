<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import iconBackArrow from '@/assets/icon/back-arrow.svg'

const orderStore = useOrderStore()
const router = useRouter()
const formattedOrders = computed(() =>
  (orderStore.orders || []).map((order) => ({
    ...order,
    statusLabel: String(order?.status || '').toUpperCase(),
    totalLabel: `${Number(order?.totalAmount || 0).toLocaleString('vi-VN')}đ`,
    createdAtLabel: order?.createdAt
      ? new Date(order.createdAt).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '---',
  })),
)
const statusClass = (status) => {
  const s = String(status || '').toUpperCase()
  if (s === 'DELIVERED') return 'status delivered'
  if (s === 'CANCELLED') return 'status cancelled'
  if (s === 'DELIVERING') return 'status delivering'
  return 'status pending'
}

onMounted(() => {
  orderStore.fetchUserOrders()
})
</script>

<template>
  <section class="history-page">
    <header class="history-head">
      <button type="button" class="back-btn" @click="router.push('/profile')">
        <img :src="iconBackArrow" alt="" width="16" height="16" />
        Quay lại hồ sơ
      </button>
      <h1>Lịch sử đơn hàng</h1>
      <p>Theo dõi toàn bộ đơn bạn đã đặt gần đây.</p>
    </header>

    <p v-if="orderStore.isLoading" class="state-msg">Đang tải đơn hàng...</p>
    <p v-else-if="orderStore.error" class="state-msg state-msg--error">{{ orderStore.error }}</p>

    <section class="order-list">
      <article v-if="!formattedOrders.length && !orderStore.isLoading" class="order-card empty">
        <h3>Chưa có đơn hàng nào</h3>
        <p>Hãy quay lại trang duyệt món để đặt đơn đầu tiên.</p>
      </article>

      <article v-for="order in formattedOrders" :key="order.id" class="order-card">
        <div class="order-top">
          <div>
            <strong>#{{ order.id }}</strong>
            <p>{{ order.restaurantName || 'Nhà hàng' }}</p>
          </div>
          <span :class="statusClass(order.statusLabel)">{{ order.statusLabel }}</span>
        </div>
        <div class="order-meta">
          <span>Đặt lúc: {{ order.createdAtLabel }}</span>
          <strong>{{ order.totalLabel }}</strong>
        </div>
        <div class="order-actions">
          <button type="button" class="outline-btn" @click="router.push(`/orders/${order.id}/tracking`)">
            Theo dõi đơn
          </button>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped src="@/assets/styles/user-order-history.css"></style>
