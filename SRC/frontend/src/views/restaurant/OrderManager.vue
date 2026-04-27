<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import restaurantService from '@/services/restaurantService'
import orderService from '@/services/orderService'

import iconDashboard from '@/assets/icon/dashbroad.svg'
import iconMenu from '@/assets/icon/menu.svg'
import iconTag from '@/assets/icon/tag.svg'
import iconReceipt from '@/assets/icon/reciept.svg'
import iconDollar from '@/assets/icon/dollar-sign.svg'
import {
  goRestaurantPath,
  restaurantStatusBadge,
  restaurantStatusLabel,
} from '@/utils/restaurantViewUtils'
import { loadRestaurantOrdersDataAction } from '@/utils/restaurantDataUtils'

const router = useRouter()
const loading = ref(false)
const errorMessage = ref('')
const restaurants = ref([])
const orders = ref([])
const filterStatus = ref('ALL')

const activeRestaurantId = computed(() => restaurants.value[0]?.id || null)

const statusOptions = ['ALL', 'PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED']

const filteredOrders = computed(() => {
  if (filterStatus.value === 'ALL') return orders.value
  return orders.value.filter((o) => String(o.status || '').toUpperCase() === filterStatus.value)
})

const actionLoading = ref(false)
const successMsg = ref('')
const go = (path) => goRestaurantPath(router, path)
const statusBadge = (status) => restaurantStatusBadge(status)
const statusLabel = (key) => restaurantStatusLabel(key)

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
const loadData = () =>
  loadRestaurantOrdersDataAction({
    loading,
    errorMessage,
    restaurantService,
    restaurants,
    activeRestaurantIdRef: activeRestaurantId,
    orderService,
    orders,
  })

onMounted(loadData)
</script>

<template>
  <section class="restaurant-shell">
    <aside class="restaurant-sidebar">
      <div class="sidebar-brand">
        <div class="logo-box">FD</div>
        <span>Nhà hàng</span>
      </div>

      <span class="sidebar-section-label">Điều hướng</span>
      <button class="nav-btn" type="button" @click="go('/restaurant/dashboard')">
        <img :src="iconDashboard" alt="" />Tổng quan
      </button>
      <button class="nav-btn" type="button" @click="go('/restaurant/menu')">
        <img :src="iconMenu" alt="" />Quản lý menu
      </button>
      <button class="nav-btn" type="button" @click="go('/restaurant/categories')">
        <img :src="iconTag" alt="" />Danh mục
      </button>
      <button class="nav-btn active" type="button" @click="go('/restaurant/orders')">
        <img :src="iconReceipt" alt="" />Đơn hàng
      </button>
      <button class="nav-btn" type="button" @click="go('/restaurant/revenue')">
        <img :src="iconDollar" alt="" />Doanh thu
      </button>
      <div class="sidebar-spacer"></div>
    </aside>

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
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1.25rem;">
        <button
          v-for="s in statusOptions"
          :key="s"
          type="button"
          :class="['outline-btn', { 'active-filter': filterStatus === s }]"
          style="border-radius:999px; padding:0.45rem 1rem; font-size:0.85rem; cursor:pointer;"
          :style="filterStatus === s ? 'background:#f8143f; color:#fff; border-color:#f8143f;' : 'background:#fff; color:#3f4552; border:1px solid #e2e5eb;'"
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
              <b :class="statusBadge(order.status)">{{ order.status }}</b>
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
                v-if="order.status === 'CONFIRMED' || order.status === 'PREPARING'"
                type="button"
                class="action-btn ready"
                :disabled="actionLoading"
                @click="markReady(order.id)"
              >
                Sẵn sàng giao
              </button>
            </div>
          </li>
        </ul>
      </section>
    </main>
  </section>
</template>

<style scoped src="@/assets/styles/restaurant-views.css"></style>
<style scoped>
.order-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.order-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.order-id { font-weight: 700; color: #1f293b; }
.order-actions {
  display: flex;
  gap: 0.4rem;
}
.action-btn {
  border: 0;
  border-radius: 8px;
  padding: 0.38rem 0.72rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.action-btn.confirm { background: #e6f9ee; color: #0f7b3f; }
.action-btn.reject { background: #ffedf0; color: #c02144; }
.action-btn.ready { background: #e6f0ff; color: #1d5dba; }
.success-text { color: #0f7b3f; font-weight: 600; margin-bottom: 0.5rem; }
</style>
