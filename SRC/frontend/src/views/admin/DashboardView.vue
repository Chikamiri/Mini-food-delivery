<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import adminService from '@/services/adminService'
import {
  logoutAdminAction,
  formatAdminCurrency,
  loadAdminDashboardDataAction,
  approveAdminRestaurantAction,
  rejectAdminRestaurantAction,
  toggleAdminUserAction,
} from '@/utils/adminDashboardUtils'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('overview')
const tabs = [
  { key: 'overview', label: 'Tổng quan' },
  { key: 'approval', label: 'Duyệt nhà hàng' },
  { key: 'users', label: 'Người dùng' },
  { key: 'orders', label: 'Đơn hàng' },
  { key: 'revenue', label: 'Doanh thu' },
  { key: 'complaints', label: 'Khiếu nại' },
  { key: 'promo', label: 'Khuyến mãi' },
  { key: 'settings', label: 'Cài đặt' },
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
  users.value.filter((item) =>
    `${item.fullName || ''} ${item.email || ''}`.toLowerCase().includes(keyword.value.trim().toLowerCase()),
  ),
)

const logout = () => logoutAdminAction(authStore, router)
const formatCurrency = (value) => formatAdminCurrency(value)
const loadDashboardData = () =>
  loadAdminDashboardDataAction(isLoading, errorMessage, adminService, stats, approvalQueue, users)
const approveRestaurant = (restaurantId) =>
  approveAdminRestaurantAction(
    restaurantId,
    actionLoading,
    successMessage,
    errorMessage,
    adminService,
    loadDashboardData,
  )
const rejectRestaurant = (restaurantId) =>
  rejectAdminRestaurantAction(
    restaurantId,
    actionLoading,
    successMessage,
    errorMessage,
    adminService,
    loadDashboardData,
  )
const toggleUser = (user) =>
  toggleAdminUserAction(
    user,
    actionLoading,
    successMessage,
    errorMessage,
    adminService,
    loadDashboardData,
  )

onMounted(() => {
  loadDashboardData()
})
</script>

<template>
  <section class="admin-page">
    <!-- Sidebar -->
    <aside class="admin-sidebar">
      <div class="brand">
        <h1>MiniFood</h1>
        <p>Bảng điều khiển quản trị</p>
      </div>

      <nav class="menu">
        <a
          v-for="tab in tabs"
          :key="tab.key"
          href="#"
          :class="{ active: activeTab === tab.key }"
          @click.prevent="activeTab = tab.key"
        >
          {{ tab.label }}
        </a>
      </nav>

      <div class="sidebar-note">
        <p>Khuyến nghị</p>
        <strong>{{ approvalQueue.length }} nhà hàng đang chờ duyệt hồ sơ mới.</strong>
      </div>
    </aside>

    <!-- Main -->
    <main class="admin-main">
      <header class="topbar">
        <div>
          <h2>{{ tabs.find((t) => t.key === activeTab)?.label || 'Dashboard' }}</h2>
          <p>Theo dõi vận hành hệ thống giao đồ ăn theo thời gian thực.</p>
        </div>
        <div class="topbar-right">
          <input v-model="keyword" type="text" placeholder="Tìm nhà hàng, người dùng..." />
          <button type="button" @click="loadDashboardData">Làm mới</button>
          <button type="button" class="logout-btn" @click="logout">Đăng xuất</button>
        </div>
      </header>

      <p v-if="isLoading" class="status-msg loading">Đang tải dữ liệu...</p>
      <p v-if="errorMessage" class="status-msg error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="status-msg success">{{ successMessage }}</p>

      <!-- ========= TAB: Tổng quan ========= -->
      <template v-if="activeTab === 'overview'">
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

        <!-- Quick glance: approval + users -->
        <section class="bottom-grid">
          <article class="panel">
            <div class="panel-head">
              <h3>Hàng đợi duyệt nhà hàng</h3>
              <a href="#" @click.prevent="activeTab = 'approval'">Xem tất cả →</a>
            </div>
            <div class="table">
              <div v-if="!filteredApprovals.length" class="empty-row">Không có nhà hàng nào chờ duyệt.</div>
              <div v-for="item in filteredApprovals.slice(0, 4)" :key="item.id" class="row">
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
              <h3>Người dùng gần đây</h3>
              <a href="#" @click.prevent="activeTab = 'users'">Xem tất cả →</a>
            </div>
            <div class="feedback-list">
              <div v-if="!filteredUsers.length" class="empty-row">Chưa có dữ liệu người dùng.</div>
              <div v-for="user in filteredUsers.slice(0, 5)" :key="user.id" class="feedback-item">
                <strong>{{ user.fullName || 'Không tên' }}</strong>
                <p>{{ user.email }}</p>
                <small>Vai trò: {{ user.role }} • Trạng thái: {{ user.active ? 'Đang hoạt động' : 'Đã khóa' }}</small>
              </div>
            </div>
          </article>
        </section>
      </template>

      <!-- ========= TAB: Duyệt nhà hàng ========= -->
      <template v-else-if="activeTab === 'approval'">
        <section class="panel full-panel">
          <div class="panel-head">
            <h3>Danh sách nhà hàng chờ duyệt ({{ filteredApprovals.length }})</h3>
          </div>
          <div class="table">
            <div v-if="!filteredApprovals.length" class="empty-row">Không có nhà hàng nào chờ duyệt.</div>
            <div v-for="item in filteredApprovals" :key="item.id" class="row">
              <div>
                <strong>{{ item.name }}</strong>
                <p>{{ item.ownerName || 'Chưa có chủ quán' }} • {{ item.address || 'Chưa có địa chỉ' }}</p>
                <small v-if="item.phone">SĐT: {{ item.phone }}</small>
              </div>
              <div class="row-actions">
                <button type="button" :disabled="actionLoading" @click="approveRestaurant(item.id)">Duyệt</button>
                <button type="button" class="danger-action" :disabled="actionLoading" @click="rejectRestaurant(item.id)">
                  Từ chối
                </button>
              </div>
            </div>
          </div>
        </section>
      </template>

      <!-- ========= TAB: Người dùng ========= -->
      <template v-else-if="activeTab === 'users'">
        <section class="panel full-panel">
          <div class="panel-head">
            <h3>Quản lý người dùng ({{ filteredUsers.length }})</h3>
          </div>
          <div class="feedback-list">
            <div v-if="!filteredUsers.length" class="empty-row">Chưa có dữ liệu người dùng.</div>
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
        </section>
      </template>

      <!-- ========= TAB: Đơn hàng ========= -->
      <template v-else-if="activeTab === 'orders'">
        <section class="panel full-panel">
          <div class="panel-head">
            <h3>Quản lý đơn hàng</h3>
          </div>
          <div class="coming-soon">
            <span class="coming-icon">📦</span>
            <h3>Đang phát triển</h3>
            <p>Chức năng quản lý đơn hàng toàn hệ thống sẽ được cập nhật trong bản tiếp theo.</p>
          </div>
        </section>
      </template>

      <!-- ========= TAB: Doanh thu ========= -->
      <template v-else-if="activeTab === 'revenue'">
        <section class="kpi-grid" style="margin-bottom:1rem;">
          <article class="kpi-card">
            <span class="kpi-icon">💰</span>
            <div>
              <p>Tổng doanh thu</p>
              <h3>{{ formatCurrency(stats.totalRevenue) }}</h3>
              <small>Toàn hệ thống</small>
            </div>
          </article>
          <article class="kpi-card">
            <span class="kpi-icon">🧾</span>
            <div>
              <p>Tổng đơn hoàn thành</p>
              <h3>{{ Number(stats.totalOrders || 0).toLocaleString('vi-VN') }}</h3>
              <small>Đơn đã giao</small>
            </div>
          </article>
        </section>
        <section class="panel full-panel">
          <div class="panel-head">
            <h3>Biểu đồ doanh thu</h3>
            <span>Tuần này</span>
          </div>
          <div class="fake-line-chart"></div>
        </section>
      </template>

      <!-- ========= TAB: Khiếu nại ========= -->
      <template v-else-if="activeTab === 'complaints'">
        <section class="panel full-panel">
          <div class="panel-head">
            <h3>Quản lý khiếu nại</h3>
          </div>
          <div class="coming-soon">
            <span class="coming-icon">📋</span>
            <h3>Đang phát triển</h3>
            <p>Chức năng quản lý khiếu nại từ khách hàng sẽ được cập nhật trong bản tiếp theo.</p>
          </div>
        </section>
      </template>

      <!-- ========= TAB: Khuyến mãi ========= -->
      <template v-else-if="activeTab === 'promo'">
        <section class="panel full-panel">
          <div class="panel-head">
            <h3>Quản lý khuyến mãi</h3>
          </div>
          <div class="coming-soon">
            <span class="coming-icon">🎁</span>
            <h3>Đang phát triển</h3>
            <p>Tạo và quản lý mã giảm giá, chương trình khuyến mãi sẽ được cập nhật trong bản tiếp theo.</p>
          </div>
        </section>
      </template>

      <!-- ========= TAB: Cài đặt ========= -->
      <template v-else-if="activeTab === 'settings'">
        <section class="panel full-panel">
          <div class="panel-head">
            <h3>Cài đặt hệ thống</h3>
          </div>
          <div class="coming-soon">
            <span class="coming-icon">⚙️</span>
            <h3>Đang phát triển</h3>
            <p>Cấu hình phí giao hàng, thời gian xử lý, chính sách hoàn tiền sẽ được cập nhật trong bản tiếp theo.</p>
          </div>
        </section>
      </template>
    </main>
  </section>
</template>

<style scoped src="@/assets/styles/admin-dashboard.css"></style>
