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

<style scoped src="@/assets/styles/shipper-delivery-detail.css"></style>
