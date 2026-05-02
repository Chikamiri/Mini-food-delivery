import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/user/HomeView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import { useAuthStore } from '@/stores/auth'

// Lazy-load all non-home views for code splitting (#14)
const BrowseView = () => import('@/views/user/BrowseView.vue')
const RestaurantDetail = () => import('@/views/user/RestaurantDetail.vue')
const CartView = () => import('@/views/user/CartView.vue')
const CheckoutView = () => import('@/views/user/CheckoutView.vue')
const OrderTracking = () => import('@/views/user/OrderTracking.vue')
const OrderHistory = () => import('@/views/user/OrderHistory.vue')
const ProfileView = () => import('@/views/user/ProfileView.vue')
const AddressManager = () => import('@/views/user/AddressManager.vue')
const RestaurantDashboard = () => import('@/views/restaurant/DashboardView.vue')
const MenuManager = () => import('@/views/restaurant/MenuManager.vue')
const CategoryManager = () => import('@/views/restaurant/CategoryManager.vue')
const OrderManager = () => import('@/views/restaurant/OrderManager.vue')
const RevenueStats = () => import('@/views/restaurant/RevenueStats.vue')
const RestaurantSettings = () => import('@/views/restaurant/SettingsView.vue')
const ShipperDashboard = () => import('@/views/shipper/DashboardView.vue')
const DeliveryDetail = () => import('@/views/shipper/DeliveryDetail.vue')
const DeliveryHistory = () => import('@/views/shipper/DeliveryHistory.vue')
const ShipperSettings = () => import('@/views/shipper/SettingsView.vue')
const AdminDashboard = () => import('@/views/admin/DashboardView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 }
  },
  routes: [
    { path: '/', name: 'home', component: HomeView },

    // User (customer) routes — OWNER / SHIPPER / ADMIN được chuyển về đúng panel
    {
      path: '/browse',
      name: 'browse',
      component: BrowseView,
      meta: { requiresAuth: true, customerFlow: true },
    },
    {
      path: '/restaurants/:id',
      name: 'restaurant-detail',
      component: RestaurantDetail,
      meta: { requiresAuth: true, customerFlow: true },
    },
    { path: '/cart', name: 'cart', component: CartView, meta: { requiresAuth: true, customerFlow: true } },
    { path: '/checkout', name: 'checkout', component: CheckoutView, meta: { requiresAuth: true, customerFlow: true } },
    {
      path: '/orders/:id/tracking',
      name: 'order-tracking',
      component: OrderTracking,
      meta: { requiresAuth: true, customerFlow: true },
    },
    {
      path: '/orders/history',
      name: 'order-history',
      component: OrderHistory,
      meta: { requiresAuth: true, customerFlow: true },
    },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
    { path: '/addresses', name: 'addresses', component: AddressManager, meta: { requiresAuth: true } },

    // Restaurant Owner routes
    { path: '/restaurant/dashboard', name: 'restaurant-dashboard', component: RestaurantDashboard, meta: { requiresAuth: true, roles: ['OWNER', 'ADMIN'] } },
    { path: '/restaurant/menu', name: 'restaurant-menu', component: MenuManager, meta: { requiresAuth: true, roles: ['OWNER', 'ADMIN'] } },
    { path: '/restaurant/categories', name: 'restaurant-categories', component: CategoryManager, meta: { requiresAuth: true, roles: ['OWNER', 'ADMIN'] } },
    { path: '/restaurant/orders', name: 'restaurant-orders', component: OrderManager, meta: { requiresAuth: true, roles: ['OWNER', 'ADMIN'] } },
    { path: '/restaurant/revenue', name: 'restaurant-revenue', component: RevenueStats, meta: { requiresAuth: true, roles: ['OWNER', 'ADMIN'] } },
    { path: '/restaurant/settings', name: 'restaurant-settings', component: RestaurantSettings, meta: { requiresAuth: true, roles: ['OWNER', 'ADMIN'] } },

    // Shipper routes
    { path: '/shipper/dashboard', name: 'shipper-dashboard', component: ShipperDashboard, meta: { requiresAuth: true, roles: ['SHIPPER', 'ADMIN'] } },
    { path: '/shipper/delivery/:id', name: 'delivery-detail', component: DeliveryDetail, meta: { requiresAuth: true, roles: ['SHIPPER', 'ADMIN'] } },
    { path: '/shipper/history', name: 'shipper-history', component: DeliveryHistory, meta: { requiresAuth: true, roles: ['SHIPPER', 'ADMIN'] } },
    { path: '/shipper/settings', name: 'shipper-settings', component: ShipperSettings, meta: { requiresAuth: true, roles: ['SHIPPER', 'ADMIN'] } },

    // Admin routes — meta.tab syncs with DashboardView's activeTab
    { path: '/admin/dashboard', name: 'admin-dashboard', component: AdminDashboard, meta: { requiresAuth: true, roles: ['ADMIN'], tab: 'overview' } },
    { path: '/admin/users', name: 'admin-users', component: AdminDashboard, meta: { requiresAuth: true, roles: ['ADMIN'], tab: 'users' } },
    { path: '/admin/restaurants/approval', name: 'admin-restaurants-approval', component: AdminDashboard, meta: { requiresAuth: true, roles: ['ADMIN'], tab: 'approval' } },

    // 404 catch-all
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
  ],
})

// Navigation guard — async to allow fetchProfile before role check (#1 fix)
router.beforeEach(async (to, _from) => {
  const token = localStorage.getItem('token')
  const authStore = useAuthStore()

  // Check auth requirement
  if (to.meta.requiresAuth && !token) {
    return { name: 'home' }
  }

  // Chỉ khách (USER/CUSTOMER) dùng luồng đặt món — OWNER/SHIPPER/ADMIN vào đúng dashboard
  if (to.meta.customerFlow && token) {
    let role = String(authStore.user?.role || '').toUpperCase().replace(/^ROLE_/, '')
    if (!role) {
      try {
        await authStore.fetchProfile()
        role = String(authStore.user?.role || '').toUpperCase().replace(/^ROLE_/, '')
      } catch {
        localStorage.removeItem('token')
        return { name: 'home' }
      }
    }
    if (role === 'ADMIN') return { name: 'admin-dashboard' }
    if (role === 'OWNER') return { name: 'restaurant-dashboard' }
    if (role === 'SHIPPER') return { name: 'shipper-dashboard' }
  }

  // Check role requirement — use authStore user data (set after login/fetchProfile)
  if (to.meta.roles && to.meta.roles.length && token) {
    let role = String(authStore.user?.role || '').toUpperCase().replace(/^ROLE_/, '')

    // If authStore.user not yet loaded (page refresh), call fetchProfile from server
    if (!role) {
      try {
        await authStore.fetchProfile()
        role = String(authStore.user?.role || '').toUpperCase().replace(/^ROLE_/, '')
      } catch {
        // Token invalid/expired — clear and redirect to home
        localStorage.removeItem('token')
        return { name: 'home' }
      }
    }

    if (!role || !to.meta.roles.includes(role)) {
      return { name: 'home' }
    }
  }
  return true
})

export default router
