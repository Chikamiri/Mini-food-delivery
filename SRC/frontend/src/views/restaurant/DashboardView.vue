<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import restaurantService from '@/services/restaurantService'
import orderService from '@/services/orderService'

import iconDashboard from '@/assets/icon/dashbroad.svg'
import iconMenu from '@/assets/icon/menu.svg'
import iconTag from '@/assets/icon/tag.svg'
import iconReceipt from '@/assets/icon/reciept.svg'
import iconDollar from '@/assets/icon/dollar-sign.svg'
import iconSetting from '@/assets/icon/setting.svg'
import iconSignOut from '@/assets/icon/sign-out.svg'
import { goRestaurantPath, restaurantStatusBadge } from '@/utils/restaurantViewUtils'
import {
  logoutRestaurantAction,
  backToProfileAction,
  loadRestaurantDashboardAction,
} from '@/utils/restaurantDashboardUtils'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLoading = ref(false)
const pageError = ref('')
const myRestaurants = ref([])
const recentOrders = ref([])
const menuItems = ref([])

const selectedRestaurantId = computed(() => Number(route.query.restaurantId || 0))
const activeRestaurant = computed(() => {
  if (selectedRestaurantId.value) {
    const matched = myRestaurants.value.find((item) => Number(item.id) === selectedRestaurantId.value)
    if (matched) return matched
  }
  return myRestaurants.value[0] || null
})

const stats = computed(() => {
  const orders = recentOrders.value
  const pending = orders.filter((o) => ['PENDING', 'CONFIRMED'].includes(String(o.status || '').toUpperCase())).length
  const delivered = orders.filter((o) => String(o.status || '').toUpperCase() === 'DELIVERED').length
  const revenue = orders
    .filter((o) => String(o.status || '').toUpperCase() === 'DELIVERED')
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)

  return [
    { label: 'Đơn cần xử lý', value: String(pending), accent: '' },
    { label: 'Giao thành công', value: String(delivered), accent: 'accent-green' },
    { label: 'Món trong menu', value: String(menuItems.value.length), accent: 'accent-blue' },
    { label: 'Doanh thu', value: `${revenue.toLocaleString('vi-VN')} đ`, accent: 'accent-purple' },
  ]
})

const go = (path) => goRestaurantPath(router, path)
const logout = () => logoutRestaurantAction(authStore, router)
const backToProfile = () => backToProfileAction(router)
const statusBadge = (status) => restaurantStatusBadge(status)
const loadDashboard = () =>
  loadRestaurantDashboardAction({
    isLoading,
    pageError,
    restaurantService,
    myRestaurants,
    activeRestaurantRef: activeRestaurant,
    orderService,
    recentOrders,
    menuItems,
  })

onMounted(loadDashboard)
</script>

<template>
  <section class="restaurant-shell">
    <!-- Sidebar -->
    <aside class="restaurant-sidebar">
      <div class="sidebar-brand">
        <div class="logo-box">FD</div>
        <span>Nhà hàng</span>
      </div>

      <span class="sidebar-section-label">Điều hướng</span>
      <button class="nav-btn active" type="button" @click="go('/restaurant/dashboard')">
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
      <button class="nav-btn" type="button" @click="go('/restaurant/revenue')">
        <img :src="iconDollar" alt="" />Doanh thu
      </button>
      <button class="nav-btn" type="button" @click="go('/restaurant/settings')">
        <img :src="iconSetting" alt="" />Cài đặt
      </button>

      <div class="sidebar-spacer"></div>

      <div v-if="activeRestaurant" class="sidebar-restaurant-name">
        <strong>{{ activeRestaurant.name }}</strong>
        {{ activeRestaurant.address || 'Chưa có địa chỉ' }}
      </div>

      <button class="logout-btn" type="button" @click="logout">
        <img :src="iconSignOut" alt="" />Đăng xuất
      </button>
    </aside>

    <!-- Main -->
    <main class="restaurant-main">
      <header class="page-head">
        <div>
          <span class="page-tag">Tổng quan</span>
          <h1>Dashboard nhà hàng</h1>
          <p v-if="!activeRestaurant" class="subtitle">Chưa có nhà hàng nào được liên kết với tài khoản này.</p>
        </div>
        <div class="header-actions">
          <button class="outline-btn" type="button" @click="backToProfile">Quay về hồ sơ</button>
          <button class="refresh-btn" type="button" :disabled="isLoading" @click="loadDashboard">
            {{ isLoading ? 'Đang tải...' : 'Làm mới' }}
          </button>
        </div>
      </header>

      <p v-if="pageError" class="error-text">{{ pageError }}</p>

      <!-- KPI cards -->
      <section class="stats-grid">
        <article v-for="item in stats" :key="item.label" class="stat-card" :class="item.accent">
          <p>{{ item.label }}</p>
          <strong>{{ item.value }}</strong>
        </article>
      </section>

      <!-- Recent orders -->
      <section class="panel">
        <div class="panel-head">
          <h3>Đơn hàng gần đây</h3>
          <button class="outline-btn" type="button" @click="go('/restaurant/orders')">Xem tất cả</button>
        </div>

        <div v-if="!recentOrders.length" class="empty-state">
          <p>Chưa có đơn hàng gần đây.</p>
        </div>

        <ul v-else class="simple-list">
          <li v-for="order in recentOrders" :key="order.id">
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
