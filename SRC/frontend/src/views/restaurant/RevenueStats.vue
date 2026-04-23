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

const router = useRouter()
const loading = ref(false)
const errorMessage = ref('')
const restaurants = ref([])
const orders = ref([])

const activeRestaurantId = computed(() => restaurants.value[0]?.id || null)
const deliveredOrders = computed(() =>
  orders.value.filter((o) => String(o.status || '').toUpperCase() === 'DELIVERED'),
)
const totalRevenue = computed(() =>
  deliveredOrders.value.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
)

function go(path) {
  router.push(path)
}

async function loadData() {
  loading.value = true
  errorMessage.value = ''
  try {
    const mine = await restaurantService.getMyRestaurants()
    restaurants.value = Array.isArray(mine) ? mine : []
    if (!activeRestaurantId.value) {
      orders.value = []
      return
    }
    const data = await orderService.getByRestaurant(activeRestaurantId.value)
    orders.value = Array.isArray(data) ? data : []
  } catch (error) {
    errorMessage.value = error.message || 'Không thể tải dữ liệu doanh thu'
  } finally {
    loading.value = false
  }
}

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
      <button class="nav-btn" type="button" @click="go('/restaurant/orders')">
        <img :src="iconReceipt" alt="" />Đơn hàng
      </button>
      <button class="nav-btn active" type="button" @click="go('/restaurant/revenue')">
        <img :src="iconDollar" alt="" />Doanh thu
      </button>
      <div class="sidebar-spacer"></div>
    </aside>

    <main class="restaurant-main">
      <header class="page-head">
        <div>
          <span class="page-tag">Doanh thu</span>
          <h1>Báo cáo doanh thu</h1>
          <p class="subtitle">Tổng hợp doanh thu dựa trên đơn hàng đã giao thành công.</p>
        </div>
        <button class="refresh-btn" type="button" :disabled="loading" @click="loadData">
          {{ loading ? 'Đang tải...' : 'Làm mới' }}
        </button>
      </header>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <!-- Revenue highlight -->
      <section class="revenue-hero">
        <div class="revenue-total-card">
          <span class="page-tag">Tổng doanh thu</span>
          <p class="big-number">{{ totalRevenue.toLocaleString('vi-VN') }} đ</p>
          <p class="sub-label">Từ {{ deliveredOrders.length }} đơn đã giao</p>
        </div>
        <div class="revenue-total-card" style="background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);">
          <span class="page-tag" style="color: #1bb45f;">Đơn thành công</span>
          <p class="big-number">{{ deliveredOrders.length }}</p>
          <p class="sub-label">trên tổng {{ orders.length }} đơn</p>
        </div>
      </section>

      <!-- Delivered orders list -->
      <section class="panel">
        <div class="panel-head">
          <h3>Chi tiết đơn đã giao</h3>
        </div>

        <div v-if="!deliveredOrders.length" class="empty-state">
          <p>Chưa có đơn nào được giao thành công.</p>
        </div>

        <ul v-else class="simple-list">
          <li v-for="order in deliveredOrders" :key="order.id">
            <span>#{{ order.id }}</span>
            <span>{{ order.customerName || 'Khách hàng' }}</span>
            <span>{{ Number(order.totalAmount || 0).toLocaleString('vi-VN') }} đ</span>
            <b class="badge badge-delivered">{{ order.status }}</b>
          </li>
        </ul>
      </section>
    </main>
  </section>
</template>

<style scoped src="@/assets/styles/restaurant-views.css"></style>
