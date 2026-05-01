<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import restaurantService from '@/services/restaurantService'
import orderService from '@/services/orderService'
import RestaurantSidebar from '@/components/RestaurantSidebar.vue'

import { loadRestaurantRevenueDataAction } from '@/utils/restaurantDataUtils'

const loading = ref(false)
const errorMessage = ref('')
const restaurants = ref([])
const orders = ref([])
const router = useRouter()
const authStore = useAuthStore()

const activeRestaurantId = computed(() => restaurants.value[0]?.id || null)
const deliveredOrders = computed(() =>
  orders.value.filter((o) => String(o.status || '').toUpperCase() === 'DELIVERED'),
)
const totalRevenue = computed(() =>
  deliveredOrders.value.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
)

const loadData = () =>
  loadRestaurantRevenueDataAction({
    loading,
    errorMessage,
    restaurantService,
    restaurants,
    activeRestaurantIdRef: activeRestaurantId,
    orderService,
    orders,
  })
const logout = async () => {
  await authStore.logout()
  router.push('/')
}

onMounted(loadData)
</script>

<template>
  <section class="restaurant-shell">
    <RestaurantSidebar active-key="revenue" :show-logout="true" @logout="logout" />

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
        <div class="revenue-total-card revenue-total-card--success">
          <span class="page-tag page-tag--success">Đơn thành công</span>
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
<style scoped src="@/assets/styles/restaurant-revenue-stats.css"></style>
