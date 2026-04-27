<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import orderService from '@/services/orderService'

const router = useRouter()
const authStore = useAuthStore()
const isOnline = ref(true)
const isLoading = ref(false)
const errorMessage = ref('')
const availableOrders = ref([])
const activeDelivery = ref(null)

const userName = computed(() => authStore.user?.fullName || 'Shipper')
const formatPrice = (val) => `${Number(val || 0).toLocaleString('vi-VN')}đ`

const loadOrders = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const data = await orderService.getAvailableForDelivery()
    availableOrders.value = Array.isArray(data) ? data : []
  } catch (err) {
    errorMessage.value = err.message || 'Không thể tải đơn hàng'
  } finally {
    isLoading.value = false
  }
}

const acceptOrder = async (order) => {
  try {
    await orderService.acceptDelivery(order.id)
    activeDelivery.value = order
    availableOrders.value = availableOrders.value.filter((o) => o.id !== order.id)
  } catch (err) {
    errorMessage.value = err.message || 'Không thể nhận đơn'
  }
}

const completeDelivery = async () => {
  if (!activeDelivery.value) return
  try {
    await orderService.completeDelivery(activeDelivery.value.id)
    activeDelivery.value = null
    await loadOrders()
  } catch (err) {
    errorMessage.value = err.message || 'Không thể hoàn thành giao hàng'
  }
}

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

onMounted(loadOrders)
</script>

<template>
  <section class="shipper-page">
    <aside class="shipper-sidebar">
      <div class="sidebar-brand">
        <div class="logo-box">FD</div>
        <span>Shipper</span>
      </div>
      <nav class="sidebar-nav">
        <button class="nav-btn active" type="button">🏠 Tổng quan</button>
        <button class="nav-btn" type="button" @click="router.push('/shipper/history')">📋 Lịch sử</button>
      </nav>
      <div class="sidebar-spacer"></div>
      <button class="nav-btn logout" type="button" @click="logout">🚪 Đăng xuất</button>
    </aside>

    <main class="shipper-main">
      <header class="shipper-header">
        <div>
          <h1>Xin chào, {{ userName }}!</h1>
          <p>Quản lý đơn giao hàng của bạn.</p>
        </div>
        <div class="header-actions">
          <button
            type="button"
            :class="['toggle-btn', { online: isOnline }]"
            @click="isOnline = !isOnline"
          >
            {{ isOnline ? '🟢 Đang hoạt động' : '⚫ Đã tắt' }}
          </button>
          <button type="button" class="refresh-btn" :disabled="isLoading" @click="loadOrders">
            {{ isLoading ? 'Đang tải...' : '🔄 Làm mới' }}
          </button>
        </div>
      </header>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <!-- Active delivery -->
      <section v-if="activeDelivery" class="active-delivery">
        <h2>🚀 Đang giao</h2>
        <div class="delivery-card highlight">
          <div class="delivery-info">
            <strong>Đơn #{{ activeDelivery.id }}</strong>
            <p>{{ activeDelivery.deliveryAddress || 'Chưa có địa chỉ' }}</p>
            <span>{{ formatPrice(activeDelivery.totalAmount) }}</span>
          </div>
          <button type="button" class="action-btn complete" @click="completeDelivery">
            ✅ Hoàn thành giao hàng
          </button>
        </div>
      </section>

      <!-- Available orders -->
      <section class="orders-section">
        <h2>📦 Đơn chờ nhận ({{ availableOrders.length }})</h2>
        <p v-if="!availableOrders.length && !isLoading" class="empty-text">
          Hiện không có đơn hàng nào cần giao.
        </p>
        <div v-else class="orders-grid">
          <article v-for="order in availableOrders" :key="order.id" class="delivery-card">
            <div class="delivery-info">
              <strong>Đơn #{{ order.id }}</strong>
              <p>{{ order.deliveryAddress || order.address || 'Chưa có địa chỉ' }}</p>
              <span class="price">{{ formatPrice(order.totalAmount) }}</span>
            </div>
            <button
              type="button"
              class="action-btn accept"
              :disabled="!!activeDelivery"
              @click="acceptOrder(order)"
            >
              Nhận đơn
            </button>
          </article>
        </div>
      </section>
    </main>
  </section>
</template>

<style scoped src="@/assets/styles/shipper-views.css"></style>
