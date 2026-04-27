<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import orderService from '@/services/orderService'
import iconBackArrow from '@/assets/icon/back-arrow.svg'

const route = useRoute()
const router = useRouter()
const order = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const formatPrice = (val) => `${Number(val || 0).toLocaleString('vi-VN')}đ`

onMounted(async () => {
  if (!route.params.id) return
  isLoading.value = true
  try {
    order.value = await orderService.getById(route.params.id)
  } catch (err) {
    errorMessage.value = err.message || 'Không thể tải chi tiết đơn giao'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="detail-page">
    <button type="button" class="back-btn" @click="router.push('/shipper/dashboard')">
      <img :src="iconBackArrow" alt="" width="16" height="16" />
      Quay lại
    </button>

    <p v-if="isLoading" class="status-text">Đang tải chi tiết đơn giao...</p>
    <p v-else-if="errorMessage" class="status-text error">{{ errorMessage }}</p>

    <template v-if="order">
      <div class="detail-card">
        <h1>Đơn giao #{{ order.id }}</h1>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Khách hàng</span>
            <span>{{ order.customerName || 'Khách hàng' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Địa chỉ giao</span>
            <span>{{ order.deliveryAddress || order.address || 'Chưa có' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Tổng tiền</span>
            <span class="price">{{ formatPrice(order.totalAmount) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Trạng thái</span>
            <span class="status-badge">{{ order.status }}</span>
          </div>
          <div v-if="order.note" class="info-item">
            <span class="info-label">Ghi chú</span>
            <span>{{ order.note }}</span>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.detail-page {
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
.status-text { margin-top: 1rem; color: #485166; }
.status-text.error { color: #c02144; }
.detail-card {
  margin-top: 1rem;
  background: #fff;
  border: 1px solid #e8ecf4;
  border-radius: 16px;
  padding: 1.2rem;
}
.detail-card h1 { margin: 0 0 1rem; font-size: 1.3rem; color: #171f2f; }
.info-grid { display: grid; gap: 0.65rem; }
.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.45rem 0;
  border-bottom: 1px dashed #edf1f7;
}
.info-label { color: #6f7788; font-size: 0.88rem; }
.price { color: #f8143f; font-weight: 700; }
.status-badge {
  background: #e6f0ff;
  color: #1d5dba;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}
</style>
