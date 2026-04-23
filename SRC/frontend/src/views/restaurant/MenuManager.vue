<script setup>
import { computed, onMounted, ref } from 'vue'
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
      <div class="sidebar-brand">
        <div class="logo-box">FD</div>
        <span>Nhà hàng</span>
      </div>

      <span class="sidebar-section-label">Điều hướng</span>
      <button class="nav-btn" type="button" @click="go('/restaurant/dashboard')">
        <img :src="iconDashboard" alt="" />Tổng quan
      </button>
      <button class="nav-btn active" type="button" @click="go('/restaurant/menu')">
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
      <div class="sidebar-spacer"></div>
    </aside>

    <main class="restaurant-main">
      <header class="page-head">
        <div>
          <span class="page-tag">Menu</span>
          <h1>Quản lý menu</h1>
          <p class="subtitle">Cập nhật danh sách món ăn và giá bán của nhà hàng.</p>
        </div>
        <button class="refresh-btn" type="button" :disabled="loading" @click="loadData">
          {{ loading ? 'Đang tải...' : 'Làm mới' }}
        </button>
      </header>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <!-- Menu cards -->
      <section class="panel">
        <div class="panel-head">
          <h3>Danh sách món ({{ menuItems.length }})</h3>
        </div>

        <div v-if="!menuItems.length" class="empty-state">
          <p>Chưa có món nào trong menu. Hãy thêm món đầu tiên!</p>
        </div>

        <div v-else class="menu-card-grid">
          <article v-for="item in menuItems" :key="item.id" class="menu-card">
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.name"
              class="menu-card-img"
            />
            <div v-else class="menu-card-img" style="background:#f0f2f8; display:grid; place-items:center; color:#bbb; font-size:2rem;">🍽</div>
            <div class="menu-card-body">
              <h4>{{ item.name }}</h4>
              <div class="menu-card-meta">
                <span class="price">{{ Number(item.price || 0).toLocaleString('vi-VN') }} đ</span>
                <span :class="item.available !== false ? 'badge badge-available' : 'badge badge-unavailable'">
                  {{ item.available !== false ? 'Đang bán' : 'Tạm hết' }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  </section>
</template>

<style scoped src="@/assets/styles/restaurant-views.css"></style>
