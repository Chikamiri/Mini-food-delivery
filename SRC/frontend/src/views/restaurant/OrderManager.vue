<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import restaurantService from '@/services/restaurantService'
import orderService from '@/services/orderService'
import RestaurantSidebar from '@/components/RestaurantSidebar.vue'

import {
  restaurantStatusBadge,
  restaurantStatusLabel,
} from '@/utils/restaurantViewUtils'
import { loadRestaurantOrdersDataAction } from '@/utils/restaurantDataUtils'

const loading = ref(false)
const errorMessage = ref('')
const restaurants = ref([])
const orders = ref([])
const router = useRouter()
const authStore = useAuthStore()
const filterStatus = ref('ALL')
// delivery assignment info keyed by orderId
const deliveryInfo = ref({})

const activeRestaurantId = computed(() => restaurants.value[0]?.id || null)

const statusOptions = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'REJECTED']

const filteredOrders = computed(() => {
  if (filterStatus.value === 'ALL') return orders.value
  return orders.value.filter((o) => String(o.status || '').toUpperCase() === filterStatus.value)
})

const actionLoading = ref(false)
const successMsg = ref('')
const statusBadge = (status) => restaurantStatusBadge(status)
const statusLabel = (key) => restaurantStatusLabel(key)
const isPickupOrder = (order) => String(order?.note || '').includes('[FLOW:PICKUP_AT_STORE]')
const pickupSchedule = (order) => {
  const match = String(order?.note || '').match(/\[SCHEDULED_AT:([0-9]{2}:[0-9]{2})\]/)
  return match?.[1] || ''
}

const confirmOrder = async (orderId) => {
  actionLoading.value = true
  successMsg.value = ''
  try {
    await orderService.confirm(orderId)
    const target = orders.value.find((o) => o.id === orderId)
    if (target) target.status = 'CONFIRMED'
    successMsg.value = 'Đã xác nhận đơn hàng #' + orderId
  } catch (err) {
    errorMessage.value = err.message || 'Không thể xác nhận đơn hàng'
  } finally {
    actionLoading.value = false
  }
}

const rejectOrder = async (orderId) => {
  const reason = window.prompt('Nhập lý do từ chối đơn hàng:', 'Hết nguyên liệu')
  if (reason === null) return
  actionLoading.value = true
  successMsg.value = ''
  try {
    await orderService.reject(orderId, reason)
    const target = orders.value.find((o) => o.id === orderId)
    if (target) target.status = 'CANCELLED'
    successMsg.value = 'Đã từ chối đơn hàng #' + orderId
  } catch (err) {
    errorMessage.value = err.message || 'Không thể từ chối đơn hàng'
  } finally {
    actionLoading.value = false
  }
}

const markPreparing = async (orderId) => {
  actionLoading.value = true
  successMsg.value = ''
  try {
    await orderService.updateStatus(orderId, 'PREPARING')
    const target = orders.value.find((o) => o.id === orderId)
    if (target) target.status = 'PREPARING'
    successMsg.value = 'Đơn #' + orderId + ' đang được chuẩn bị'
  } catch (err) {
    errorMessage.value = err.message || 'Không thể cập nhật trạng thái'
  } finally {
    actionLoading.value = false
  }
}

const markReady = async (orderId) => {
  actionLoading.value = true
  successMsg.value = ''
  try {
    await orderService.updateStatus(orderId, 'READY')
    const target = orders.value.find((o) => o.id === orderId)
    if (target) target.status = 'READY'
    successMsg.value = 'Đơn #' + orderId + ' đã sẵn sàng giao'
  } catch (err) {
    errorMessage.value = err.message || 'Không thể cập nhật trạng thái'
  } finally {
    actionLoading.value = false
  }
}
const loadData = async () => {
  await loadRestaurantOrdersDataAction({
    loading,
    errorMessage,
    restaurantService,
    restaurants,
    activeRestaurantIdRef: activeRestaurantId,
    orderService,
    orders,
  })
  // Fetch delivery assignment info for SHIPPING orders
  const shippingOrders = orders.value.filter((o) => o.status === 'SHIPPING' || o.status === 'READY')
  await Promise.all(shippingOrders.map(async (o) => {
    try {
      const assignment = await orderService.getDeliveryByOrder(o.id)
      if (assignment) deliveryInfo.value[o.id] = assignment
    } catch { /* no assignment yet */ }
  }))
}
const logout = async () => {
  await authStore.logout()
  router.push('/')
}

onMounted(loadData)
</script>

<template>
  <section class="restaurant-shell">
    <RestaurantSidebar active-key="orders" :show-logout="true" @logout="logout" />

    <main class="restaurant-main">
      <header class="page-head">
        <div>
          <span class="page-tag">Đơn hàng</span>
          <h1>Quản lý đơn hàng</h1>
          <p class="subtitle">Theo dõi trạng thái và xử lý đơn mới từ khách hàng.</p>
        </div>
        <button class="refresh-btn" type="button" :disabled="loading" @click="loadData">
          {{ loading ? 'Đang tải...' : 'Làm mới' }}
        </button>
      </header>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <!-- Status filter tabs -->
      <div class="order-filter-row">
        <button
          v-for="s in statusOptions"
          :key="s"
          type="button"
          :class="['outline-btn', 'filter-chip', { 'active-filter': filterStatus === s }]"
          @click="filterStatus = s"
        >
          {{ statusLabel(s) }}
        </button>
      </div>

      <section class="panel">
        <div class="panel-head">
          <h3>Danh sách đơn ({{ filteredOrders.length }})</h3>
        </div>

        <div v-if="!filteredOrders.length" class="empty-state">
          <p>Không có đơn hàng nào{{ filterStatus !== 'ALL' ? ' ở trạng thái này' : '' }}.</p>
        </div>

        <p v-if="successMsg" class="success-text">{{ successMsg }}</p>

        <ul v-else class="simple-list">
          <li v-for="order in filteredOrders" :key="order.id" class="order-row">
            <div class="order-info">
              <span class="order-id">#{{ order.id }}</span>
              <span>{{ order.customerName || 'Khách hàng' }}</span>
              <span>{{ Number(order.totalAmount || 0).toLocaleString('vi-VN') }} đ</span>
              <b :class="statusBadge(order.status)">{{ statusLabel(order.status) }}</b>
              <span v-if="isPickupOrder(order)" class="shipper-tag waiting">Nhận tại quán</span>
              <span v-else-if="pickupSchedule(order)" class="shipper-tag">Giao hẹn giờ: {{ pickupSchedule(order) }}</span>
              <!-- Shipper tracking info -->
              <span v-if="!isPickupOrder(order) && deliveryInfo[order.id]?.shipperName" class="shipper-tag">
                {{ deliveryInfo[order.id].shipperName }}
                <span v-if="deliveryInfo[order.id].status === 'PICKED_UP'"> · Đang trên đường giao</span>
                <span v-else-if="deliveryInfo[order.id].status === 'ASSIGNED'"> · Đang đến lấy hàng</span>
              </span>
              <span v-else-if="!isPickupOrder(order) && order.status === 'READY'" class="shipper-tag waiting">Chờ shipper nhận</span>
            </div>
            <div class="order-actions">
              <button
                v-if="order.status === 'PENDING'"
                type="button"
                class="action-btn confirm"
                :disabled="actionLoading"
                @click="confirmOrder(order.id)"
              >
                Xác nhận
              </button>
              <button
                v-if="order.status === 'PENDING'"
                type="button"
                class="action-btn reject"
                :disabled="actionLoading"
                @click="rejectOrder(order.id)"
              >
                Từ chối
              </button>
              <button
                v-if="order.status === 'CONFIRMED'"
                type="button"
                class="action-btn ready"
                :disabled="actionLoading"
                @click="markPreparing(order.id)"
              >
                Bắt đầu chuẩn bị
              </button>
              <button
                v-if="order.status === 'PREPARING'"
                type="button"
                class="action-btn ready"
                :disabled="actionLoading"
                @click="markReady(order.id)"
              >
                {{ isPickupOrder(order) ? 'Sẵn sàng để khách đến nhận' : 'Sẵn sàng giao' }}
              </button>
            </div>
          </li>
        </ul>
      </section>
    </main>
  </section>
</template>

<style scoped src="@/assets/styles/restaurant-views.css"></style>
<style scoped src="@/assets/styles/restaurant-order-manager.css"></style>
