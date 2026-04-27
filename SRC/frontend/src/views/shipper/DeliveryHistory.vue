<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBackArrow from '@/assets/icon/back-arrow.svg'

const router = useRouter()
const deliveries = ref([])
const isLoading = ref(false)

const formatPrice = (val) => `${Number(val || 0).toLocaleString('vi-VN')}đ`
const formatDate = (val) => {
  if (!val) return ''
  try { return new Date(val).toLocaleDateString('vi-VN') } catch { return val }
}

onMounted(() => {
  // Backend shipper history endpoint not yet available
  isLoading.value = false
  deliveries.value = []
})
</script>

<template>
  <section class="history-page">
    <button type="button" class="back-btn" @click="router.push('/shipper/dashboard')">
      <img :src="iconBackArrow" alt="" width="16" height="16" />
      Quay lại
    </button>

    <h1>Lịch sử giao hàng</h1>

    <p v-if="isLoading" class="status-text">Đang tải lịch sử...</p>
    <p v-else-if="!deliveries.length" class="empty-text">Bạn chưa có lịch sử giao hàng nào.</p>

    <div v-else class="history-list">
      <article v-for="d in deliveries" :key="d.id" class="history-card">
        <div>
          <strong>Đơn #{{ d.id }}</strong>
          <p>{{ d.deliveryAddress || 'Không có địa chỉ' }}</p>
          <small>{{ formatDate(d.deliveredAt || d.createdAt) }}</small>
        </div>
        <span class="price">{{ formatPrice(d.totalAmount) }}</span>
      </article>
    </div>
  </section>
</template>

<style scoped>
.history-page {
  max-width: 780px;
  margin: 0 auto;
  padding: 1.2rem;
  min-height: 100vh;
  background: radial-gradient(circle at top, #fff7fa 0%, #f7f8fc 55%, #f3f5fa 100%);
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid #d8deea;
  background: #fff;
  color: #2b3346;
  border-radius: 10px;
  padding: 0.45rem 0.72rem;
  font-weight: 600;
  cursor: pointer;
}
h1 { margin: 1rem 0; color: #171f2f; font-size: 1.4rem; }
.status-text { color: #485166; }
.empty-text { color: #7c8595; margin-top: 1rem; }
.history-list { display: grid; gap: 0.7rem; }
.history-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border: 1px solid #e8ecf4;
  border-radius: 14px;
  padding: 0.85rem;
}
.history-card strong { color: #1f293b; }
.history-card p { margin: 0.2rem 0; color: #6f7788; font-size: 0.88rem; }
.history-card small { color: #a0a8b6; font-size: 0.8rem; }
.price { color: #f8143f; font-weight: 700; font-size: 1rem; }
</style>
