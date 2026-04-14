<script setup>
const sidebarMenus = [
  'Trang tổng quan',
  'Món đang giảm',
  'Yêu thích',
  'Tin nhắn',
  'Lịch sử đơn',
  'Cài đặt',
]

const categories = [
  { icon: '🥐', label: 'Bánh' },
  { icon: '🍔', label: 'Burger' },
  { icon: '🧋', label: 'Trà sữa' },
  { icon: '🍗', label: 'Gà rán' },
  { icon: '🍕', label: 'Pizza' },
  { icon: '🥗', label: 'Healthy' },
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

      <div class="upgrade-box">
        <p>Nâng cấp tài khoản để nhận ưu đãi dành riêng cho bạn.</p>
        <button>Nâng cấp</button>
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
            <span>{{ item.icon }}</span>
            <p>{{ item.label }}</p>
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
