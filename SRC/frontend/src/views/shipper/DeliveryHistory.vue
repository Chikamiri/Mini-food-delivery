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

<style scoped src="@/assets/styles/shipper-delivery-history.css"></style>
