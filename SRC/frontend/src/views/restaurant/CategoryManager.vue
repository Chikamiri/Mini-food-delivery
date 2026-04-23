<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import restaurantService from '@/services/restaurantService'

const router = useRouter()
const loading = ref(false)
const errorMessage = ref('')
const categories = ref([])

function go(path) {
  router.push(path)
}

async function loadData() {
  loading.value = true
  errorMessage.value = ''
  try {
    const data = await restaurantService.getCategories()
    categories.value = Array.isArray(data) ? data : []
  } catch (error) {
    errorMessage.value = error.message || 'Không thể tải danh mục'
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
      <button class="nav-btn active" type="button" @click="go('/restaurant/categories')">Danh mục</button>
      <button class="nav-btn" type="button" @click="go('/restaurant/orders')">Đơn hàng</button>
      <button class="nav-btn" type="button" @click="go('/restaurant/revenue')">Doanh thu</button>
    </aside>

    <main class="restaurant-main">
      <header class="page-head">
        <div>
          <h1>Quản lý danh mục</h1>
          <p>Quản lý nhóm món để hiển thị menu rõ ràng hơn.</p>
        </div>
        <button class="refresh-btn" type="button" :disabled="loading" @click="loadData">
          {{ loading ? 'Đang tải...' : 'Làm mới' }}
        </button>
      </header>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <section class="panel">
        <h3>Danh mục hiện có</h3>
        <p v-if="!categories.length" class="muted">Chưa có danh mục nào.</p>
        <ul v-else class="simple-list">
          <li v-for="category in categories" :key="category.id">
            <span>{{ category.name }}</span>
            <span>{{ category.description || 'Không có mô tả' }}</span>
          </li>
        </ul>
      </section>
    </main>
  </section>
</template>

<style scoped src="@/assets/styles/restaurant-views.css"></style>
