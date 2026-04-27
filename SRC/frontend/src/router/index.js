import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/user/HomeView.vue'
import BrowseView from '@/views/user/BrowseView.vue'
import RestaurantDetail from '@/views/user/RestaurantDetail.vue'
import CartView from '@/views/user/CartView.vue'
import CheckoutView from '@/views/user/CheckoutView.vue'
import OrderTracking from '@/views/user/OrderTracking.vue'
import OrderHistory from '@/views/user/OrderHistory.vue'
import ProfileView from '@/views/user/ProfileView.vue'
import AddressManager from '@/views/user/AddressManager.vue'
import RestaurantDashboard from '@/views/restaurant/DashboardView.vue'
import MenuManager from '@/views/restaurant/MenuManager.vue'
import CategoryManager from '@/views/restaurant/CategoryManager.vue'
import OrderManager from '@/views/restaurant/OrderManager.vue'
import RevenueStats from '@/views/restaurant/RevenueStats.vue'
import RestaurantSettings from '@/views/restaurant/SettingsView.vue'
import ShipperDashboard from '@/views/shipper/DashboardView.vue'
import DeliveryDetail from '@/views/shipper/DeliveryDetail.vue'
import DeliveryHistory from '@/views/shipper/DeliveryHistory.vue'
import AdminDashboard from '@/views/admin/DashboardView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 }
  },
  routes: [
    { path: '/', name: 'home', component: HomeView },

    // User routes (require login)
    { path: '/browse', name: 'browse', component: BrowseView, meta: { requiresAuth: true } },
    { path: '/restaurants/:id', name: 'restaurant-detail', component: RestaurantDetail, meta: { requiresAuth: true } },
    { path: '/cart', name: 'cart', component: CartView, meta: { requiresAuth: true } },
    { path: '/checkout', name: 'checkout', component: CheckoutView, meta: { requiresAuth: true } },
    { path: '/orders/:id/tracking', name: 'order-tracking', component: OrderTracking, meta: { requiresAuth: true } },
    { path: '/orders/history', name: 'order-history', component: OrderHistory, meta: { requiresAuth: true } },
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

    // Admin routes — meta.tab syncs with DashboardView's activeTab
    { path: '/admin/dashboard', name: 'admin-dashboard', component: AdminDashboard, meta: { requiresAuth: true, roles: ['ADMIN'], tab: 'overview' } },
    { path: '/admin/users', name: 'admin-users', component: AdminDashboard, meta: { requiresAuth: true, roles: ['ADMIN'], tab: 'users' } },
    { path: '/admin/restaurants/approval', name: 'admin-restaurants-approval', component: AdminDashboard, meta: { requiresAuth: true, roles: ['ADMIN'], tab: 'approval' } },

    // 404 catch-all
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
  ],
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')

  // Check auth requirement
  if (to.meta.requiresAuth && !token) {
    return next({ name: 'home' })
  }

  // Check role requirement — use authStore user data (set after login/fetchProfile)
  if (to.meta.roles && to.meta.roles.length && token) {
    const authStore = useAuthStore()
    const rawRole = String(authStore.user?.role || '').toUpperCase().replace(/^ROLE_/, '')

    // If authStore.user not yet loaded (page refresh), try parsing JWT as fallback
    let role = rawRole
    if (!role) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        // Spring Boot JWT may store role in: role, authorities, scope, or sub
        const jwtRole = payload.role || payload.authorities?.[0] || ''
        role = String(jwtRole).toUpperCase().replace(/^ROLE_/, '')
      } catch {
        role = ''
      }
    }

    if (!role || !to.meta.roles.includes(role)) {
      return next({ name: 'home' })
    }
  }

  next()
})

export default router
