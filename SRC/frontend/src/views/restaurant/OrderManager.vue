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
    errorMessage.value = error.message || 'Không thể tải đơn hàng'
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
      <button class="nav-btn active" type="button" @click="go('/restaurant/orders')">Đơn hàng</button>
      <button class="nav-btn" type="button" @click="go('/restaurant/revenue')">Doanh thu</button>
    </aside>

    <main class="restaurant-main">
      <header class="page-head">
        <div>
          <h1>Quản lý đơn hàng</h1>
          <p>Theo dõi trạng thái và xử lý đơn mới.</p>
        </div>
        <button class="refresh-btn" type="button" :disabled="loading" @click="loadData">
          {{ loading ? 'Đang tải...' : 'Làm mới' }}
        </button>
      </header>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <section class="panel">
        <h3>Danh sách đơn</h3>
        <p v-if="!orders.length" class="muted">Chưa có đơn hàng.</p>
        <ul v-else class="simple-list">
          <li v-for="order in orders" :key="order.id">
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
