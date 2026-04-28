<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import orderService from '@/services/orderService'
import ShipperSidebar from '@/components/ShipperSidebar.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const order = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const formatPrice = (val) => `${Number(val || 0).toLocaleString('vi-VN')}đ`

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

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
  <div class="shipper-layout">
    <ShipperSidebar active-key="dashboard" @logout="logout" />

    <main class="shipper-main">
      <div class="page-header">
        <div>
          <button type="button" class="btn btn-ghost" style="margin-bottom:0.75rem;" @click="router.push('/shipper/dashboard')">
            ← Quay lại
          </button>
          <h1 class="page-title">Chi tiết đơn giao</h1>
          <p v-if="order" class="page-subtitle">Đơn #{{ order.id }}</p>
        </div>
      </div>

      <div v-if="isLoading" class="empty-state">Đang tải chi tiết đơn giao...</div>
      <div v-else-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div>

      <div v-else-if="order" class="detail-card">
        <div class="detail-card-head">
          <h1>Đơn giao #{{ order.id }}</h1>
        </div>
        <div class="detail-card-body">
          <div class="detail-row">
            <span class="detail-label">Khách hàng</span>
            <span class="detail-value">{{ order.customerName || 'Khách hàng' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Địa chỉ giao</span>
            <span class="detail-value">{{ order.deliveryAddress || order.address || 'Chưa có' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Nhà hàng</span>
            <span class="detail-value">{{ order.restaurantName || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Tổng tiền</span>
            <span class="detail-value value-price">{{ formatPrice(order.totalAmount) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Trạng thái</span>
            <span class="status-pill">{{ order.status }}</span>
          </div>
          <div v-if="order.note" class="detail-row">
            <span class="detail-label">Ghi chú</span>
            <span class="detail-value">{{ order.note }}</span>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>Không tìm thấy thông tin đơn hàng.</p>
      </div>
    </main>
  </div>
</template>

<style scoped src="@/assets/styles/shipper-views.css"></style>
