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

const go = (path) => goRestaurantPath(router, path)
const statusBadge = (status) => restaurantStatusBadge(status)
const statusLabel = (key) => restaurantStatusLabel(key)
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

        <ul v-else class="simple-list">
          <li v-for="order in filteredOrders" :key="order.id">
            <span>#{{ order.id }}</span>
            <span>{{ order.customerName || 'Khách hàng' }}</span>
            <span>{{ Number(order.totalAmount || 0).toLocaleString('vi-VN') }} đ</span>
            <b :class="statusBadge(order.status)">{{ order.status }}</b>
          </li>
        </ul>
      </section>
    </main>
  </section>
</template>

<style scoped src="@/assets/styles/restaurant-views.css"></style>
