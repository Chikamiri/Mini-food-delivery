<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import restaurantService from '@/services/restaurantService'
import orderService from '@/services/orderService'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const pageError = ref('')
const myRestaurants = ref([])
const recentOrders = ref([])
const menuItems = ref([])

const activeRestaurant = computed(() => myRestaurants.value[0] || null)

const stats = computed(() => {
  const orders = recentOrders.value
  const pending = orders.filter((order) => ['PENDING', 'CONFIRMED'].includes(String(order.status || '').toUpperCase())).length
  const delivered = orders.filter((order) => String(order.status || '').toUpperCase() === 'DELIVERED').length
  const revenue = orders
    .filter((order) => String(order.status || '').toUpperCase() === 'DELIVERED')
    .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)

  return [
    { label: 'Đơn cần xử lý', value: String(pending) },
    { label: 'Đơn giao thành công', value: String(delivered) },
    { label: 'Món trong menu', value: String(menuItems.value.length) },
    { label: 'Doanh thu (tạm tính)', value: `${revenue.toLocaleString('vi-VN')} đ` },
  ]
})

function go(path) {
  router.push(path)
}

async function logout() {
  await authStore.logout()
  router.push('/')
}

async function loadDashboard() {
  isLoading.value = true
  pageError.value = ''

  try {
    const restaurants = await restaurantService.getMyRestaurants()
    myRestaurants.value = Array.isArray(restaurants) ? restaurants : []

    if (!activeRestaurant.value?.id) {
      recentOrders.value = []
      menuItems.value = []
      return
    }

    const [ordersResult, menuResult] = await Promise.allSettled([
      orderService.getByRestaurant(activeRestaurant.value.id),
      restaurantService.getMenuByRestaurant(activeRestaurant.value.id),
    ])

    recentOrders.value =
      ordersResult.status === 'fulfilled' && Array.isArray(ordersResult.value) ? ordersResult.value.slice(0, 6) : []
    menuItems.value = menuResult.status === 'fulfilled' && Array.isArray(menuResult.value) ? menuResult.value : []
  } catch (error) {
    pageError.value = error.message || 'Không thể tải dashboard nhà hàng'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadDashboard)
</script>

<template>
  <section class="restaurant-shell">
    <aside class="restaurant-sidebar">
      <h2>Nhà hàng</h2>
      <button class="nav-btn active" type="button" @click="go('/restaurant/dashboard')">Tổng quan</button>
      <button class="nav-btn" type="button" @click="go('/restaurant/menu')">Quản lý menu</button>
      <button class="nav-btn" type="button" @click="go('/restaurant/categories')">Danh mục</button>
      <button class="nav-btn" type="button" @click="go('/restaurant/orders')">Đơn hàng</button>
      <button class="nav-btn" type="button" @click="go('/restaurant/revenue')">Doanh thu</button>
      <button class="logout-btn" type="button" @click="logout">Đăng xuất</button>
    </aside>

    <main class="restaurant-main">
      <header class="page-head">
        <div>
          <h1>Dashboard nhà hàng</h1>
          <p v-if="activeRestaurant">{{ activeRestaurant.name }}</p>
          <p v-else>Chưa có nhà hàng được liên kết tài khoản này.</p>
        </div>
        <button class="refresh-btn" type="button" :disabled="isLoading" @click="loadDashboard">
          {{ isLoading ? 'Đang tải...' : 'Làm mới' }}
        </button>
      </header>

      <p v-if="pageError" class="error-text">{{ pageError }}</p>

      <section class="stats-grid">
        <article v-for="item in stats" :key="item.label" class="stat-card">
          <p>{{ item.label }}</p>
          <strong>{{ item.value }}</strong>
        </article>
      </section>

      <section class="panel">
        <h3>Đơn gần đây</h3>
        <p v-if="!recentOrders.length" class="muted">Chưa có đơn hàng gần đây.</p>
        <ul v-else class="simple-list">
          <li v-for="order in recentOrders" :key="order.id">
            <span>#{{ order.id }}</span>
            <span>{{ order.customerName || 'Khách hàng' }}</span>
            <span>{{ order.totalAmount?.toLocaleString('vi-VN') || 0 }} đ</span>
            <b>{{ order.status }}</b>
          </li>
        </ul>
      </section>
    </main>
  </section>
</template>

<style scoped src="@/assets/styles/restaurant-views.css"></style>
