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
    <p v-if="orderStore.error" class="state-msg state-msg--error">{{ orderStore.error }}</p>

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

<style scoped>
.history-page {
  max-width: 920px;
  margin: 0 auto;
  padding: 1.2rem;
  min-height: 100vh;
  background: radial-gradient(circle at top, #fff7fa 0%, #f7f8fc 55%, #f3f5fa 100%);
}

.history-head h1 {
  margin: 0.6rem 0 0.2rem;
  font-size: 1.55rem;
  color: #1a2233;
}

.history-head p {
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

.state-msg {
  margin-top: 0.8rem;
  color: #6a7384;
}

.state-msg--error {
  color: #d7264a;
}

.order-list {
  margin-top: 1rem;
  display: grid;
  gap: 0.75rem;
}

.order-card {
  border: 1px solid #e7ebf2;
  border-radius: 14px;
  background: #fff;
  padding: 0.9rem;
}

.order-card.empty h3 {
  margin: 0;
  color: #1f2738;
}

.order-card.empty p {
  margin: 0.35rem 0 0;
  color: #6f788a;
}

.order-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.7rem;
}

.order-top strong {
  color: #1e2637;
}

.order-top p {
  margin: 0.25rem 0 0;
  color: #6f788a;
  font-size: 0.9rem;
}

.status {
  border-radius: 999px;
  padding: 0.18rem 0.58rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.status.delivered {
  background: #eaf8ef;
  color: #12833b;
}

.status.cancelled {
  background: #ffecef;
  color: #d7264a;
}

.status.delivering {
  background: #eef4ff;
  color: #315cce;
}

.status.pending {
  background: #fff5e7;
  color: #a56704;
}

.order-meta {
  margin-top: 0.62rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #6b7485;
  font-size: 0.88rem;
}

.order-meta strong {
  color: #20293a;
  font-size: 0.96rem;
}

.order-actions {
  margin-top: 0.7rem;
}

.outline-btn {
  border: 1px solid #ffbb8d;
  background: #fff8f2;
  color: #d9640d;
  border-radius: 10px;
  padding: 0.42rem 0.68rem;
  font-weight: 600;
  cursor: pointer;
}
</style>
