<script setup>
import { RouterLink } from 'vue-router'
import iconMessage from '@/assets/icon/messaging.svg'
import iconNotice from '@/assets/icon/notice.svg'
import iconSetting from '@/assets/icon/setting.svg'

const sidebarMenus = [
  'Trang tổng quan',
  'Ưu đãi',
  'Yêu thích',
  'Flash sale',
  'Đơn hàng',
  'Cài đặt',
]

const categories = [
  {
    icon: '🥖',
    label: 'Bánh mì',
    subtitle: 'Giòn nóng mỗi ngày',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
  },
  {
    icon: '🍔',
    label: 'Burger',
    subtitle: 'Đậm vị Âu Mỹ',
    image:
      'https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=900&q=80',
  },
  {
    icon: '🧋',
    label: 'Trà sữa',
    subtitle: 'Mát lạnh giải khát',
    image:
      'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=900&q=80',
  },
  {
    icon: '🍗',
    label: 'Gà rán',
    subtitle: 'Giòn cay hấp dẫn',
    image:
      'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=900&q=80',
  },
  {
    icon: '🍕',
    label: 'Pizza',
    subtitle: 'Phô mai kéo sợi',
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
  },
  {
    icon: '🥗',
    label: 'Healthy',
    subtitle: 'Ít calo, nhiều chất',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
  },
]

const popularDishes = [
  { id: 1, name: 'Burger Cá', price: '55.000đ', badge: 'Giảm 15%' },
  { id: 2, name: 'Burger Bò', price: '59.000đ', badge: 'Giảm 10%' },
  { id: 3, name: 'Burger Phô Mai', price: '62.000đ', badge: 'Mới' },
]

const recentOrders = [
  { id: 1, name: 'Pizza Hải Sản', price: '129.000đ', eta: '30 phút' },
  { id: 2, name: 'Mì Ramen', price: '89.000đ', eta: '22 phút' },
  { id: 3, name: 'Cơm Gà Nướng', price: '69.000đ', eta: '18 phút' },
]

</script>

<template>
  <section class="browse-page">
    <aside class="left-sidebar">
      <div class="brand">
        <span class="logo">FO</span>
        <strong>MiniFood</strong>
      </div>

      <nav class="menu-list">
        <a
          v-for="(menu, index) in sidebarMenus"
          :key="menu"
          href="#"
          :class="{ active: index === 0 }"
        >
          {{ menu }}
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="header-actions">
          <button type="button" class="action-btn has-dot" aria-label="Tin nhắn">
            <img :src="iconMessage" alt="" width="22" height="22" />
          </button>
          <button type="button" class="action-btn has-dot" aria-label="Thông báo">
            <img :src="iconNotice" alt="" width="22" height="22" />
          </button>
          <button type="button" class="action-btn" aria-label="Cài đặt">
            <img :src="iconSetting" alt="" width="22" height="22" />
          </button>
        </div>
        <RouterLink to="/profile" class="profile-shortcut" aria-label="Trang cá nhân">
          <img
            class="profile-avatar"
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
            alt="Ảnh đại diện"
          />
          <span class="profile-name">Nguyễn Văn A</span>
        </RouterLink>
      </div>

    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div>
          <h1>Xin chào, bạn quay lại rồi!</h1>
          <p>Hôm nay bạn muốn ăn món gì?</p>
        </div>
        <div class="search-input">
          <input type="text" placeholder="Tìm món ăn, nhà hàng..." />
        </div>
      </header>

      <section class="voucher-banner">
        <div>
          <h2>Ưu đãi trong ngày đến 20%</h2>
          <p>Áp dụng cho đơn từ 100.000đ tại các nhà hàng đối tác.</p>
        </div>
        <button>Nhận mã ngay</button>
      </section>

      <section class="section-block">
        <div class="section-head">
          <h3>Danh mục món</h3>
          <a href="#">Xem tất cả</a>
        </div>
        <div class="category-grid">
          <article v-for="item in categories" :key="item.label" class="category-card">
            <img class="category-image" :src="item.image" :alt="item.label" />
            <div class="category-overlay">
              <span class="category-icon">{{ item.icon }}</span>
              <h4>{{ item.label }}</h4>
              <p>{{ item.subtitle }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="section-block">
        <div class="section-head">
          <h3>Món phổ biến</h3>
          <a href="#">Xem tất cả</a>
        </div>
        <div class="dish-grid">
          <article v-for="dish in popularDishes" :key="dish.id" class="dish-card">
            <span class="badge">{{ dish.badge }}</span>
            <div class="dish-img">🍔</div>
            <h4>{{ dish.name }}</h4>
            <p>{{ dish.price }}</p>
            <button>+</button>
          </article>
        </div>
      </section>

      <section class="section-block">
        <div class="section-head">
          <h3>Đặt gần đây</h3>
          <a href="#">Xem tất cả</a>
        </div>
        <div class="dish-grid recent">
          <article v-for="dish in recentOrders" :key="dish.id" class="dish-card">
            <div class="dish-img">🍽️</div>
            <h4>{{ dish.name }}</h4>
            <p>{{ dish.price }}</p>
            <small>Giao dự kiến: {{ dish.eta }}</small>
          </article>
        </div>
      </section>
    </main>

  </section>
</template>

<style scoped src="@/assets/styles/browse-view.css"></style>
