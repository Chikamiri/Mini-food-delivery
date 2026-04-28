<script setup>
import { useRouter } from 'vue-router'
import iconDashboard from '@/assets/icon/dashbroad.svg'
import iconMenu from '@/assets/icon/menu.svg'
import iconTag from '@/assets/icon/tag.svg'
import iconReceipt from '@/assets/icon/reciept.svg'
import iconDollar from '@/assets/icon/dollar-sign.svg'
import iconSetting from '@/assets/icon/setting.svg'
import iconSignOut from '@/assets/icon/sign-out.svg'
import { goRestaurantPath } from '@/utils/restaurantViewUtils'

const props = defineProps({
  activeKey: {
    type: String,
    default: 'dashboard',
  },
  showLogout: {
    type: Boolean,
    default: false,
  },
  restaurantName: {
    type: String,
    default: '',
  },
  restaurantAddress: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['logout'])
const router = useRouter()
const go = (path) => goRestaurantPath(router, path)

const navItems = [
  { key: 'dashboard', label: 'Tổng quan', path: '/restaurant/dashboard', icon: iconDashboard },
  { key: 'menu', label: 'Quản lý menu', path: '/restaurant/menu', icon: iconMenu },
  { key: 'categories', label: 'Danh mục', path: '/restaurant/categories', icon: iconTag },
  { key: 'orders', label: 'Đơn hàng', path: '/restaurant/orders', icon: iconReceipt },
  { key: 'revenue', label: 'Doanh thu', path: '/restaurant/revenue', icon: iconDollar },
  { key: 'settings', label: 'Cài đặt', path: '/restaurant/settings', icon: iconSetting },
]
</script>

<template>
  <aside class="restaurant-sidebar">
    <div class="sidebar-brand">
      <div class="logo-box">FD</div>
      <span>Nhà hàng</span>
    </div>

    <span class="sidebar-section-label">Điều hướng</span>
    <button
      v-for="item in navItems"
      :key="item.key"
      class="nav-btn"
      :class="{ active: activeKey === item.key }"
      type="button"
      @click="go(item.path)"
    >
      <img :src="item.icon" alt="" />{{ item.label }}
    </button>

    <div class="sidebar-spacer"></div>

    <div v-if="restaurantName" class="sidebar-restaurant-name">
      <strong>{{ restaurantName }}</strong>
      {{ restaurantAddress || 'Chưa có địa chỉ' }}
    </div>

    <button v-if="showLogout" class="logout-btn" type="button" @click="emit('logout')">
      <img :src="iconSignOut" alt="" />Đăng xuất
    </button>
  </aside>
</template>

<style scoped src="@/assets/styles/restaurant-views.css"></style>
