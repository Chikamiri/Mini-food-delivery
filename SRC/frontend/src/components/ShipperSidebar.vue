<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import iconDashboard from '@/assets/icon/dashbroad.svg'
import iconHistory from '@/assets/icon/time.svg'
import iconSettings from '@/assets/icon/setting.svg'
import iconSignOut from '@/assets/icon/sign-out.svg'
import iconSend from '@/assets/icon/send.svg'

const props = defineProps({
  activeKey: {
    type: String,
    default: 'dashboard',
  },
})

const emit = defineEmits(['logout'])
const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => authStore.user?.fullName || 'Shipper')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

const navItems = [
  { key: 'dashboard', label: 'Tổng quan', path: '/shipper/dashboard', icon: iconDashboard },
  { key: 'history', label: 'Lịch sử giao hàng', path: '/shipper/history', icon: iconHistory },
  { key: 'settings', label: 'Cài đặt', path: '/shipper/settings', icon: iconSettings },
]
</script>

<template>
  <aside class="shipper-sidebar">
    <div class="sidebar-brand">
      <div class="logo-box">
        <img :src="iconSend" alt="" />
      </div>
      <div class="brand-text">
        <span class="brand-name">MiniFood</span>
        <span class="brand-role">Shipper</span>
      </div>
    </div>

    <div class="sidebar-user">
      <div class="user-avatar">{{ userInitial }}</div>
      <div class="user-info">
        <strong>{{ userName }}</strong>
        <span class="user-role-tag">Shipper</span>
      </div>
    </div>

    <span class="sidebar-section-label">Điều hướng</span>
    <nav class="sidebar-nav">
      <button
        v-for="item in navItems"
        :key="item.key"
        class="nav-btn"
        :class="{ active: activeKey === item.key }"
        type="button"
        @click="router.push(item.path)"
      >
        <img :src="item.icon" alt="" />
        {{ item.label }}
      </button>
    </nav>

    <div class="sidebar-spacer"></div>

    <button class="nav-btn nav-btn--logout" type="button" @click="emit('logout')">
      <img :src="iconSignOut" alt="" />
      Đăng xuất
    </button>
  </aside>
</template>

<style scoped src="@/assets/styles/shipper-views.css"></style>
