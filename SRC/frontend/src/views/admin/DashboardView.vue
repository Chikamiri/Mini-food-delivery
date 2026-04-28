<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import adminService from '@/services/adminService'
import iconOrder from '@/assets/icon/reciept.svg'
import iconRestaurant from '@/assets/icon/home.svg'
import iconUser from '@/assets/icon/check.svg'
import iconRevenue from '@/assets/icon/dollar-sign.svg'
import iconComplaint from '@/assets/icon/info.svg'
import iconPromo from '@/assets/icon/tag.svg'
import iconSettings from '@/assets/icon/setting.svg'
import {
  logoutAdminAction,
  formatAdminCurrency,
  loadAdminDashboardDataAction,
} from '@/utils/adminDashboardUtils'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const activeTab = ref(route.meta?.tab || 'overview')
watch(
  () => route.meta?.tab,
  (tab) => { if (tab) activeTab.value = tab },
)
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
const ownerRequestQueue = ref([])
const users = ref([])
const isLoading = ref(false)
const actionLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const keyword = ref('')
const rejectedRestaurantIds = ref([])
const editUserModalOpen = ref(false)
watch(editUserModalOpen, (open) => { document.body.style.overflow = open ? 'hidden' : '' })
const editingUser = ref(null)
const editRole = ref('USER')
const editActive = ref(true)
const roleOptions = ['USER', 'OWNER', 'ADMIN', 'SHIPPER', 'CUSTOMER']

const normalizeRole = (value) => String(value || '').toUpperCase().replace(/^ROLE_/, '')

const kpiCards = computed(() => [
  { title: 'Tổng đơn', value: Number(stats.value.totalOrders || 0).toLocaleString('vi-VN'), icon: iconOrder },
  { title: 'Nhà hàng', value: Number(stats.value.totalRestaurants || 0).toLocaleString('vi-VN'), icon: iconRestaurant },
  { title: 'Người dùng', value: Number(stats.value.totalUsers || 0).toLocaleString('vi-VN'), icon: iconUser },
  { title: 'Doanh thu', value: formatCurrency(stats.value.totalRevenue), icon: iconRevenue },
])

const filteredApprovals = computed(() =>
  approvalQueue.value.filter((item) =>
    `${item.name} ${item.ownerName} ${item.address || ''}`
      .toLowerCase()
      .includes(keyword.value.trim().toLowerCase()),
  ),
)

const filteredOwnerRequests = computed(() =>
  ownerRequestQueue.value.filter((item) =>
    `${item.restaurantName || ''} ${item.userEmail || ''} ${item.restaurantAddress || ''}`
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
const rejectedStorageKey = computed(() =>
  `admin_rejected_restaurant_ids_${String(authStore.user?.id || authStore.user?.email || 'admin')}`,
)
const persistRejectedRestaurantIds = () => {
  localStorage.setItem(rejectedStorageKey.value, JSON.stringify(rejectedRestaurantIds.value))
}
const loadDashboardData = async () => {
  await loadAdminDashboardDataAction(
    isLoading,
    errorMessage,
    adminService,
    stats,
    approvalQueue,
    users,
    ownerRequestQueue,
  )
  if (rejectedRestaurantIds.value.length) {
    approvalQueue.value = approvalQueue.value.filter(
      (item) => !rejectedRestaurantIds.value.includes(item.id),
    )
  }
}
const approveRestaurant = async (restaurantId) => {
  actionLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    await adminService.approveRestaurant(restaurantId)
    approvalQueue.value = approvalQueue.value.filter((item) => item.id !== restaurantId)
    successMessage.value = 'Đã duyệt nhà hàng thành công'
  } catch (error) {
    errorMessage.value = error.message || 'Duyệt nhà hàng thất bại'
  } finally {
    actionLoading.value = false
  }
}
const rejectRestaurant = async (restaurantId) => {
  const reason = window.prompt('Nhập lý do từ chối nhà hàng:', 'Thiếu thông tin hồ sơ')
  if (reason === null) return
  actionLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    await adminService.rejectRestaurant(restaurantId, reason)
    if (!rejectedRestaurantIds.value.includes(restaurantId)) {
      rejectedRestaurantIds.value = [...rejectedRestaurantIds.value, restaurantId]
      persistRejectedRestaurantIds()
    }
    approvalQueue.value = approvalQueue.value.filter((item) => item.id !== restaurantId)
    successMessage.value = 'Đã từ chối nhà hàng'
  } catch (error) {
    errorMessage.value = error.message || 'Từ chối nhà hàng thất bại'
  } finally {
    actionLoading.value = false
  }
}
const approveOwnerRequest = async (requestId) => {
  actionLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    await adminService.approveOwnerRequest(requestId)
    ownerRequestQueue.value = ownerRequestQueue.value.filter((item) => item.id !== requestId)
    successMessage.value = 'Đã duyệt đơn xin quyền OWNER'
  } catch (error) {
    errorMessage.value = error.message || 'Duyệt đơn OWNER thất bại'
  } finally {
    actionLoading.value = false
  }
}

const rejectOwnerRequest = async (requestId) => {
  const reason = window.prompt('Nhập lý do từ chối đơn OWNER:', 'Thiếu thông tin hồ sơ')
  if (reason === null) return
  actionLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    await adminService.rejectOwnerRequest(requestId, reason)
    ownerRequestQueue.value = ownerRequestQueue.value.filter((item) => item.id !== requestId)
    successMessage.value = 'Đã từ chối đơn xin quyền OWNER'
  } catch (error) {
    errorMessage.value = error.message || 'Từ chối đơn OWNER thất bại'
  } finally {
    actionLoading.value = false
  }
}

const openEditUser = (user) => {
  editingUser.value = user
  editRole.value = normalizeRole(user?.role || 'USER')
  editActive.value = Boolean(user?.active)
  editUserModalOpen.value = true
}

const closeEditUser = () => {
  editUserModalOpen.value = false
  editingUser.value = null
}

const saveUserEdit = async () => {
  if (!editingUser.value?.id) return
  actionLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    const currentRole = normalizeRole(editingUser.value.role)
    const nextRole = normalizeRole(editRole.value)
    if (currentRole !== nextRole) {
      await adminService.updateUserRole(editingUser.value.id, nextRole)
    }
    if (Boolean(editingUser.value.active) !== Boolean(editActive.value)) {
      await adminService.toggleUserActive(editingUser.value.id, editActive.value)
    }
    successMessage.value = 'Đã cập nhật thông tin người dùng'
    closeEditUser()
    await loadDashboardData()
  } catch (error) {
    errorMessage.value = error.message || 'Không thể cập nhật người dùng'
  } finally {
    actionLoading.value = false
  }
}

const deleteUser = async (user) => {
  if (!user?.id) return
  const ok = window.confirm(
    `Xác nhận xóa vĩnh viễn người dùng ${user.fullName || user.email}? Hành động này không thể hoàn tác.`,
  )
  if (!ok) return
  actionLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    await adminService.deleteUser(user.id)
    successMessage.value = 'Đã xóa người dùng khỏi hệ thống'
  } catch (error) {
    try {
      await adminService.toggleUserActive(user.id, false)
      successMessage.value =
        'Không thể xóa vĩnh viễn vì tài khoản đã có dữ liệu liên quan. Tài khoản đã được chuyển sang trạng thái khóa.'
    } catch {
      errorMessage.value = error.message || 'Không thể xóa người dùng'
    }
  } finally {
    await loadDashboardData()
    actionLoading.value = false
  }
}

onMounted(() => {
  try {
    const stored = JSON.parse(localStorage.getItem(rejectedStorageKey.value) || '[]')
    rejectedRestaurantIds.value = Array.isArray(stored) ? stored : []
  } catch {
    rejectedRestaurantIds.value = []
  }
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
        <strong>{{ approvalQueue.length + filteredOwnerRequests.length }} yêu cầu đang chờ duyệt.</strong>
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
            <span class="kpi-icon"><img :src="card.icon" alt="" width="18" height="18" /></span>
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
          <div class="table table--spaced">
            <div class="panel-head panel-head--compact">
              <h3>Đơn xin quyền OWNER ({{ filteredOwnerRequests.length }})</h3>
            </div>
            <div v-if="!filteredOwnerRequests.length" class="empty-row">Không có đơn xin OWNER nào chờ duyệt.</div>
            <div v-for="request in filteredOwnerRequests" :key="request.id" class="row">
              <div>
                <strong>{{ request.restaurantName || 'Đơn xin OWNER' }}</strong>
                <p>{{ request.userEmail || 'Không có email' }} • {{ request.restaurantAddress || 'Chưa có địa chỉ' }}</p>
                <small v-if="request.restaurantPhone">SĐT: {{ request.restaurantPhone }}</small>
              </div>
              <div class="row-actions">
                <button type="button" :disabled="actionLoading" @click="approveOwnerRequest(request.id)">Duyệt OWNER</button>
                <button type="button" class="danger-action" :disabled="actionLoading" @click="rejectOwnerRequest(request.id)">
                  Từ chối
                </button>
              </div>
            </div>
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
                <button type="button" :disabled="actionLoading" @click="openEditUser(user)">Chỉnh sửa</button>
                <button type="button" class="danger-action" :disabled="actionLoading" @click="deleteUser(user)">
                  Xóa
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
            <span class="coming-icon"><img :src="iconOrder" alt="" width="18" height="18" /></span>
            <h3>Đang phát triển</h3>
            <p>Chức năng quản lý đơn hàng toàn hệ thống sẽ được cập nhật trong bản tiếp theo.</p>
          </div>
        </section>
      </template>

      <!-- ========= TAB: Doanh thu ========= -->
      <template v-else-if="activeTab === 'revenue'">
        <section class="kpi-grid kpi-grid--spaced">
          <article class="kpi-card">
            <span class="kpi-icon"><img :src="iconRevenue" alt="" width="18" height="18" /></span>
            <div>
              <p>Tổng doanh thu</p>
              <h3>{{ formatCurrency(stats.totalRevenue) }}</h3>
              <small>Toàn hệ thống</small>
            </div>
          </article>
          <article class="kpi-card">
            <span class="kpi-icon"><img :src="iconOrder" alt="" width="18" height="18" /></span>
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
            <span class="coming-icon"><img :src="iconComplaint" alt="" width="18" height="18" /></span>
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
            <span class="coming-icon"><img :src="iconPromo" alt="" width="18" height="18" /></span>
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
            <span class="coming-icon"><img :src="iconSettings" alt="" width="18" height="18" /></span>
            <h3>Đang phát triển</h3>
            <p>Cấu hình phí giao hàng, thời gian xử lý, chính sách hoàn tiền sẽ được cập nhật trong bản tiếp theo.</p>
          </div>
        </section>
      </template>
    </main>

    <Teleport to="body">
      <div v-if="editUserModalOpen" class="restaurant-overlay" @click.self="closeEditUser">
        <article class="restaurant-modal">
          <div class="restaurant-modal-head">
            <h3>Chỉnh sửa người dùng</h3>
            <button type="button" class="modal-close-btn" @click="closeEditUser">✕</button>
          </div>
          <section class="restaurant-section">
            <label class="field">
              <span>Vai trò</span>
              <select v-model="editRole">
                <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
              </select>
            </label>
            <label class="field field--spaced">
              <span>Trạng thái</span>
              <select v-model="editActive">
                <option :value="true">Đang hoạt động</option>
                <option :value="false">Đã khóa</option>
              </select>
            </label>
            <div class="modal-actions">
              <button type="button" class="save-btn" :disabled="actionLoading" @click="saveUserEdit">Lưu thay đổi</button>
              <button type="button" class="danger-action" :disabled="actionLoading" @click="closeEditUser">Hủy</button>
            </div>
          </section>
        </article>
      </div>
    </Teleport>
  </section>
</template>

<style scoped src="@/assets/styles/admin-dashboard.css"></style>
