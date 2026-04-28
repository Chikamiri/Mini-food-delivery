<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ShipperSidebar from '@/components/ShipperSidebar.vue'

const router = useRouter()
const authStore = useAuthStore()
const deliveries = ref([])
const isLoading = ref(false)

const formatPrice = (val) => `${Number(val || 0).toLocaleString('vi-VN')}đ`
const formatDate = (val) => {
  if (!val) return ''
  try { return new Date(val).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) } catch { return val }
}

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

onMounted(() => {
  isLoading.value = false
  deliveries.value = []
})
</script>

<template>
  <div class="shipper-layout">
    <ShipperSidebar active-key="history" @logout="logout" />

    <main class="shipper-main">
      <div class="page-header">
        <div>
          <h1 class="page-title">Lịch sử giao hàng</h1>
          <p class="page-subtitle">Tất cả các đơn hàng bạn đã giao thành công</p>
        </div>
      </div>

      <p v-if="isLoading" class="alert alert-success" style="background:#f0f4ff;color:#1e40af;border-color:#bfdbfe;">
        Đang tải lịch sử...
      </p>

      <div v-else-if="!deliveries.length" class="empty-state">
        <p>Bạn chưa có lịch sử giao hàng nào.<br />Hoàn thành đơn hàng đầu tiên để xem ở đây.</p>
      </div>

      <div v-else class="history-list">
        <article v-for="d in deliveries" :key="d.id" class="history-card">
          <div class="history-card-info">
            <strong>Đơn #{{ d.id }}</strong>
            <p>{{ d.deliveryAddress || 'Không có địa chỉ' }}</p>
            <small>{{ formatDate(d.deliveredAt || d.createdAt) }}</small>
          </div>
          <span class="history-amount">{{ formatPrice(d.totalAmount) }}</span>
        </article>
      </div>
    </main>
  </div>
</template>

<style scoped src="@/assets/styles/shipper-views.css"></style>
