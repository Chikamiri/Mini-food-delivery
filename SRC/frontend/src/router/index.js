import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import HomeView from '@/views/user/BrowseView.vue'
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
import ShipperDashboard from '@/views/shipper/DashboardView.vue'
import DeliveryDetail from '@/views/shipper/DeliveryDetail.vue'
import DeliveryHistory from '@/views/shipper/DeliveryHistory.vue'
import AdminDashboard from '@/views/admin/DashboardView.vue'
import UserManager from '@/views/admin/UserManager.vue'
import RestaurantApproval from '@/views/admin/RestaurantApproval.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },

    // User routes
    { path: '/restaurants/:id', name: 'restaurant-detail', component: RestaurantDetail },
    { path: '/cart', name: 'cart', component: CartView },
    { path: '/checkout', name: 'checkout', component: CheckoutView },
    { path: '/orders/:id/tracking', name: 'order-tracking', component: OrderTracking },
    { path: '/orders/history', name: 'order-history', component: OrderHistory },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/addresses', name: 'addresses', component: AddressManager },

    // Restaurant Owner routes
    { path: '/restaurant/dashboard', name: 'restaurant-dashboard', component: RestaurantDashboard },
    { path: '/restaurant/menu', name: 'restaurant-menu', component: MenuManager },
    { path: '/restaurant/categories', name: 'restaurant-categories', component: CategoryManager },
    { path: '/restaurant/orders', name: 'restaurant-orders', component: OrderManager },
    { path: '/restaurant/revenue', name: 'restaurant-revenue', component: RevenueStats },

    // Shipper routes
    { path: '/shipper/dashboard', name: 'shipper-dashboard', component: ShipperDashboard },
    { path: '/shipper/delivery/:id', name: 'delivery-detail', component: DeliveryDetail },
    { path: '/shipper/history', name: 'shipper-history', component: DeliveryHistory },

    // Admin routes
    { path: '/admin/dashboard', name: 'admin-dashboard', component: AdminDashboard },
    { path: '/admin/users', name: 'admin-users', component: UserManager },
    { path: '/admin/restaurants/approval', name: 'admin-restaurants-approval', component: RestaurantApproval },
  ],
})

export default router
