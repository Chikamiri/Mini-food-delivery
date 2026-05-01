<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ShipperSidebar from '@/components/ShipperSidebar.vue'
import orderService from '@/services/orderService'

const router = useRouter()
const authStore = useAuthStore()
const deliveries = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const formatPrice = (val) => `${Number(val || 0).toLocaleString('vi-VN')}đ`
const formatDate = (val) => {
  if (!val) return ''
  try { return new Date(val).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) } catch { return val }
}

const historyCount = computed(() => deliveries.value.length)

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

const loadHistory = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const assignments = await orderService.getMyDeliveries()
    const deliveredAssignments = (Array.isArray(assignments) ? assignments : []).filter(
      (item) => String(item?.status || '').toUpperCase() === 'DELIVERED',
    )

    const details = await Promise.all(
      deliveredAssignments.map(async (item) => {
        const orderId = item?.orderId
        if (!orderId) return null
        try {
          const order = await orderService.getById(orderId)
          return {
            id: order?.id || orderId,
            deliveryAddress: order?.deliveryAddress || order?.address || '',
            totalAmount: order?.totalAmount || 0,
            deliveredAt: item?.updatedAt || item?.deliveredAt || order?.updatedAt || null,
            createdAt: item?.createdAt || order?.createdAt || null,
          }
        } catch {
          return {
            id: orderId,
            deliveryAddress: '',
            totalAmount: 0,
            deliveredAt: item?.updatedAt || item?.deliveredAt || null,
            createdAt: item?.createdAt || null,
          }
        }
      }),
    )

    deliveries.value = details.filter(Boolean)
  } catch (error) {
    deliveries.value = []
    errorMessage.value = error.message || 'Không thể tải lịch sử giao hàng.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadHistory()
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
        <div class="header-actions">
          <button type="button" class="btn btn-ghost" :disabled="isLoading" @click="loadHistory">
            {{ isLoading ? 'Đang tải...' : 'Làm mới' }}
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="empty-state">Đang tải lịch sử...</div>
      <div v-else-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div>

      <div v-else-if="!historyCount" class="empty-state">
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
