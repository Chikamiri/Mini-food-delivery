<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import adminService from '@/services/adminService'

const sidebarItems = [
  'Tổng quan',
  'Duyệt nhà hàng',
  'Người dùng',
  'Đơn hàng',
  'Doanh thu',
  'Khiếu nại',
  'Khuyến mãi',
  'Cài đặt',
]

const stats = ref({
  totalUsers: 0,
  totalRestaurants: 0,
  totalOrders: 0,
  totalRevenue: 0,
})
const approvalQueue = ref([])
const users = ref([])
const isLoading = ref(false)
const actionLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const keyword = ref('')

const kpiCards = computed(() => [
  { title: 'Tổng đơn', value: Number(stats.value.totalOrders || 0).toLocaleString('vi-VN'), icon: '🧾' },
  { title: 'Nhà hàng', value: Number(stats.value.totalRestaurants || 0).toLocaleString('vi-VN'), icon: '🏬' },
  { title: 'Người dùng', value: Number(stats.value.totalUsers || 0).toLocaleString('vi-VN'), icon: '👥' },
  { title: 'Doanh thu', value: formatCurrency(stats.value.totalRevenue), icon: '💰' },
])

const filteredApprovals = computed(() =>
  approvalQueue.value.filter((item) =>
    `${item.name} ${item.ownerName} ${item.address || ''}`
      .toLowerCase()
      .includes(keyword.value.trim().toLowerCase()),
  ),
)

const filteredUsers = computed(() =>
  users.value
    .filter((item) =>
      `${item.fullName || ''} ${item.email || ''}`.toLowerCase().includes(keyword.value.trim().toLowerCase()),
    )
    .slice(0, 6),
)

const router = useRouter()
const authStore = useAuthStore()

async function logout() {
  await authStore.logout()
  router.push('/')
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`
}

async function loadDashboardData() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [statsData, pendingRestaurants, usersData] = await Promise.all([
      adminService.getSystemStats(),
      adminService.getPendingRestaurants(),
      adminService.getAllUsers(),
    ])
    stats.value = statsData || stats.value
    approvalQueue.value = Array.isArray(pendingRestaurants) ? pendingRestaurants : []
    users.value = Array.isArray(usersData) ? usersData : []
  } catch (error) {
    errorMessage.value = error.message || 'Không thể tải dữ liệu admin'
  } finally {
    isLoading.value = false
  }
}

async function approveRestaurant(restaurantId) {
  actionLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    await adminService.approveRestaurant(restaurantId)
    successMessage.value = 'Đã duyệt nhà hàng thành công'
    await loadDashboardData()
  } catch (error) {
    errorMessage.value = error.message || 'Duyệt nhà hàng thất bại'
  } finally {
    actionLoading.value = false
  }
}

async function rejectRestaurant(restaurantId) {
  const reason = window.prompt('Nhập lý do từ chối nhà hàng:', 'Thiếu thông tin hồ sơ')
  if (reason === null) return
  actionLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    await adminService.rejectRestaurant(restaurantId, reason)
    successMessage.value = 'Đã từ chối nhà hàng'
    await loadDashboardData()
  } catch (error) {
    errorMessage.value = error.message || 'Từ chối nhà hàng thất bại'
  } finally {
    actionLoading.value = false
  }
}

async function toggleUser(user) {
  actionLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    await adminService.toggleUserActive(user.id, !user.active)
    successMessage.value = `Đã ${user.active ? 'khóa' : 'mở'} tài khoản ${user.fullName || user.email}`
    await loadDashboardData()
  } catch (error) {
    errorMessage.value = error.message || 'Không thể cập nhật trạng thái người dùng'
  } finally {
    actionLoading.value = false
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<template>
  <section class="admin-page">
    <aside class="admin-sidebar">
      <div class="brand">
        <h1>MiniFood</h1>
        <p>Bảng điều khiển quản trị</p>
      </div>

      <nav class="menu">
        <a
          v-for="(item, index) in sidebarItems"
          :key="item"
          href="#"
          :class="{ active: index === 0 }"
        >
          {{ item }}
        </a>
      </nav>

      <div class="sidebar-note">
        <p>Khuyến nghị</p>
        <strong>7 nhà hàng đang chờ duyệt hồ sơ mới.</strong>
      </div>
    </aside>

    <main class="admin-main">
      <header class="topbar">
        <div>
          <h2>Dashboard</h2>
          <p>Theo dõi vận hành hệ thống giao đồ ăn theo thời gian thực.</p>
        </div>
        <div class="topbar-right">
          <input v-model="keyword" type="text" placeholder="Tìm nhà hàng, người dùng..." />
          <button type="button" @click="loadDashboardData">Làm mới</button>
          <button type="button" class="logout-btn" @click="logout">Đăng xuất</button>
        </div>
      </header>
      <p v-if="isLoading">Đang tải dữ liệu...</p>
      <p v-if="errorMessage">{{ errorMessage }}</p>
      <p v-if="successMessage">{{ successMessage }}</p>

      <section class="kpi-grid">
        <article v-for="card in kpiCards" :key="card.title" class="kpi-card">
          <span class="kpi-icon">{{ card.icon }}</span>
          <div>
            <p>{{ card.title }}</p>
            <h3>{{ card.value }}</h3>
            <small>Dữ liệu realtime từ backend</small>
          </div>
        </article>
      </section>

      <section class="chart-row">
        <article class="panel">
          <div class="panel-head">
            <h3>Tỉ lệ đơn theo trạng thái</h3>
            <span>Hôm nay</span>
          </div>
          <div class="donut-wrap">
            <div class="donut">68%</div>
            <ul>
              <li><span class="dot success"></span> Hoàn thành: 68%</li>
              <li><span class="dot warn"></span> Đang xử lý: 21%</li>
              <li><span class="dot danger"></span> Hủy: 11%</li>
            </ul>
          </div>
        </article>

        <article class="panel">
          <div class="panel-head">
            <h3>Doanh thu 7 ngày</h3>
            <span>Tuần này</span>
          </div>
          <div class="fake-line-chart"></div>
        </article>
      </section>

      <section class="bottom-grid">
        <article class="panel">
          <div class="panel-head">
            <h3>Hàng đợi duyệt nhà hàng</h3>
            <span>{{ filteredApprovals.length }} chờ xử lý</span>
          </div>
          <div class="table">
            <div v-for="item in filteredApprovals" :key="item.id" class="row">
              <div>
                <strong>{{ item.name }}</strong>
                <p>{{ item.ownerName || 'Chưa có chủ quán' }} • {{ item.address || 'Chưa có địa chỉ' }}</p>
              </div>
              <div class="row-actions">
                <button type="button" :disabled="actionLoading" @click="approveRestaurant(item.id)">Duyệt</button>
                <button type="button" class="danger-action" :disabled="actionLoading" @click="rejectRestaurant(item.id)">
                  Từ chối
                </button>
              </div>
            </div>
          </div>
        </article>

        <article class="panel">
          <div class="panel-head">
            <h3>Quản lý người dùng</h3>
            <span>{{ filteredUsers.length }} hiển thị</span>
          </div>
          <div class="feedback-list">
            <div v-for="user in filteredUsers" :key="user.id" class="feedback-item">
              <strong>{{ user.fullName || 'Không tên' }}</strong>
              <p>{{ user.email }}</p>
              <small>Vai trò: {{ user.role }} • Trạng thái: {{ user.active ? 'Đang hoạt động' : 'Đã khóa' }}</small>
              <div class="user-actions">
                <button type="button" :disabled="actionLoading" @click="toggleUser(user)">
                  {{ user.active ? 'Khóa' : 'Mở' }} tài khoản
                </button>
              </div>
            </div>
          </div>
        </article>
      </section>
    </main>
  </section>
</template>

<style scoped src="@/assets/styles/admin-dashboard.css"></style>
