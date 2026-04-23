<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import restaurantService from '@/services/restaurantService'

import iconDashboard from '@/assets/icon/dashbroad.svg'
import iconMenu from '@/assets/icon/menu.svg'
import iconTag from '@/assets/icon/tag.svg'
import iconReceipt from '@/assets/icon/reciept.svg'
import iconDollar from '@/assets/icon/dollar-sign.svg'

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
      <button class="nav-btn active" type="button" @click="go('/restaurant/categories')">
        <img :src="iconTag" alt="" />Danh mục
      </button>
      <button class="nav-btn" type="button" @click="go('/restaurant/orders')">
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
          <span class="page-tag">Danh mục</span>
          <h1>Quản lý danh mục</h1>
          <p class="subtitle">Nhóm món ăn theo danh mục để menu hiển thị rõ ràng hơn.</p>
        </div>
        <button class="refresh-btn" type="button" :disabled="loading" @click="loadData">
          {{ loading ? 'Đang tải...' : 'Làm mới' }}
        </button>
      </header>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <section class="panel">
        <div class="panel-head">
          <h3>Danh mục hiện có ({{ categories.length }})</h3>
        </div>

        <div v-if="!categories.length" class="empty-state">
          <p>Chưa có danh mục nào.</p>
        </div>

        <div v-else class="category-grid">
          <div v-for="category in categories" :key="category.id" class="category-chip">
            <div class="category-chip-icon">
              <img v-if="category.iconUrl" :src="category.iconUrl" :alt="category.name" />
              <span v-else style="font-size: 1.2rem;">📁</span>
            </div>
            <div class="category-chip-text">
              <strong>{{ category.name }}</strong>
              <small>{{ category.description || 'Không có mô tả' }}</small>
            </div>
          </div>
        </div>
      </section>
    </main>
  </section>
</template>

<style scoped src="@/assets/styles/restaurant-views.css"></style>
