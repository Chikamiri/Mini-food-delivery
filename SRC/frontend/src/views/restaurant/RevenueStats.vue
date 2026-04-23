<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import restaurantService from '@/services/restaurantService'
import orderService from '@/services/orderService'

const router = useRouter()
const loading = ref(false)
const errorMessage = ref('')
const restaurants = ref([])
const orders = ref([])

const activeRestaurantId = computed(() => restaurants.value[0]?.id || null)
const deliveredOrders = computed(() =>
  orders.value.filter((order) => String(order.status || '').toUpperCase() === 'DELIVERED'),
)
const totalRevenue = computed(() =>
  deliveredOrders.value.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
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
      <h2>Nhà hàng</h2>
      <button class="nav-btn" type="button" @click="go('/restaurant/dashboard')">Tổng quan</button>
      <button class="nav-btn" type="button" @click="go('/restaurant/menu')">Quản lý menu</button>
      <button class="nav-btn" type="button" @click="go('/restaurant/categories')">Danh mục</button>
      <button class="nav-btn" type="button" @click="go('/restaurant/orders')">Đơn hàng</button>
      <button class="nav-btn active" type="button" @click="go('/restaurant/revenue')">Doanh thu</button>
    </aside>

    <main class="restaurant-main">
      <header class="page-head">
        <div>
          <h1>Doanh thu nhà hàng</h1>
          <p>Báo cáo nhanh theo đơn đã giao.</p>
        </div>
        <button class="refresh-btn" type="button" :disabled="loading" @click="loadData">
          {{ loading ? 'Đang tải...' : 'Làm mới' }}
        </button>
      </header>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <section class="stats-grid">
        <article class="stat-card">
          <p>Tổng đơn đã giao</p>
          <strong>{{ deliveredOrders.length }}</strong>
        </article>
        <article class="stat-card">
          <p>Tổng doanh thu</p>
          <strong>{{ totalRevenue.toLocaleString('vi-VN') }} đ</strong>
        </article>
      </section>

      <section class="panel">
        <h3>Đơn đã giao</h3>
        <p v-if="!deliveredOrders.length" class="muted">Chưa có đơn đã giao.</p>
        <ul v-else class="simple-list">
          <li v-for="order in deliveredOrders" :key="order.id">
            <span>#{{ order.id }}</span>
            <span>{{ order.customerName || 'Khách hàng' }}</span>
            <span>{{ Number(order.totalAmount || 0).toLocaleString('vi-VN') }} đ</span>
            <b>{{ order.status }}</b>
          </li>
        </ul>
      </section>
    </main>
  </section>
</template>

<style scoped src="@/assets/styles/restaurant-views.css"></style>
