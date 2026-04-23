<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import restaurantService from '@/services/restaurantService'

const router = useRouter()
const loading = ref(false)
const errorMessage = ref('')
const restaurants = ref([])
const menuItems = ref([])

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
      menuItems.value = []
      return
    }
    const menu = await restaurantService.getMenuByRestaurant(activeRestaurantId.value)
    menuItems.value = Array.isArray(menu) ? menu : []
  } catch (error) {
    errorMessage.value = error.message || 'Không thể tải menu'
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
      <button class="nav-btn active" type="button" @click="go('/restaurant/menu')">Quản lý menu</button>
      <button class="nav-btn" type="button" @click="go('/restaurant/categories')">Danh mục</button>
      <button class="nav-btn" type="button" @click="go('/restaurant/orders')">Đơn hàng</button>
      <button class="nav-btn" type="button" @click="go('/restaurant/revenue')">Doanh thu</button>
    </aside>

    <main class="restaurant-main">
      <header class="page-head">
        <div>
          <h1>Quản lý menu</h1>
          <p>Cập nhật danh sách món và giá bán.</p>
        </div>
        <button class="refresh-btn" type="button" :disabled="loading" @click="loadData">
          {{ loading ? 'Đang tải...' : 'Làm mới' }}
        </button>
      </header>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <section class="panel">
        <h3>Danh sách món</h3>
        <p v-if="!menuItems.length" class="muted">Chưa có món nào trong menu.</p>
        <ul v-else class="simple-list">
          <li v-for="item in menuItems" :key="item.id">
            <span>{{ item.name }}</span>
            <span>{{ Number(item.price || 0).toLocaleString('vi-VN') }} đ</span>
            <b>{{ item.available ? 'Đang bán' : 'Tạm hết' }}</b>
          </li>
        </ul>
      </section>
    </main>
  </section>
</template>

<style scoped src="@/assets/styles/restaurant-views.css"></style>
