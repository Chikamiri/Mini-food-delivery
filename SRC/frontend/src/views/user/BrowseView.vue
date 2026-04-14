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

<style scoped>
.browse-page {
  min-height: 100vh;
  background: #fff4f6;
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 1rem;
  padding: 1rem;
}

.left-sidebar,
.main-content {
  background: #fff;
  border-radius: 16px;
}

.left-sidebar {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.logo {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #f8143f;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 0.8rem;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.menu-list a {
  text-decoration: none;
  color: #666c77;
  padding: 0.6rem 0.7rem;
  border-radius: 10px;
}

.menu-list a.active {
  background: #f8143f;
  color: #fff;
}

.upgrade-box {
  margin-top: auto;
  background: #ffe8ee;
  border-radius: 12px;
  padding: 0.85rem;
}

.upgrade-box p {
  margin: 0;
  color: #7a3142;
  font-size: 0.85rem;
}

.upgrade-box button {
  margin-top: 0.75rem;
  border: 0;
  border-radius: 8px;
  background: #f8143f;
  color: #fff;
  padding: 0.5rem 0.8rem;
  font-weight: 600;
}

.main-content {
  padding: 1rem;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.top-bar h1 {
  margin: 0;
  font-size: 1.3rem;
}

.top-bar p {
  margin: 0.3rem 0 0;
  color: #7a818c;
}

.search-input input {
  width: 280px;
  border: 1px solid #e8ebf1;
  border-radius: 10px;
  padding: 0.6rem 0.8rem;
}

.voucher-banner {
  margin-top: 1rem;
  border-radius: 12px;
  background: linear-gradient(120deg, #f8143f 0%, #ff5578 100%);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.voucher-banner h2 {
  margin: 0;
  color: #fff;
  font-size: 1.2rem;
}

.voucher-banner p {
  margin: 0.35rem 0 0;
  color: #ffe9ef;
}

.voucher-banner button {
  border: 0;
  border-radius: 10px;
  background: #fff;
  color: #e01846;
  font-weight: 700;
  padding: 0.7rem 1rem;
}

.section-block {
  margin-top: 1rem;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-head h3 {
  margin: 0;
}

.section-head a {
  color: #f8143f;
  text-decoration: none;
}

.category-grid {
  margin-top: 0.7rem;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.6rem;
}

.category-card {
  border: 1px solid #eceff5;
  border-radius: 10px;
  text-align: center;
  padding: 0.7rem 0.3rem;
}

.category-card span {
  font-size: 1.2rem;
}

.category-card p {
  margin: 0.45rem 0 0;
  font-size: 0.85rem;
}

.dish-grid {
  margin-top: 0.7rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.dish-card {
  border: 1px solid #eceff5;
  border-radius: 12px;
  padding: 0.75rem;
  position: relative;
}

.dish-card .badge {
  position: absolute;
  left: 0.75rem;
  top: 0.75rem;
  background: #ffecf0;
  color: #e84b62;
  font-size: 0.72rem;
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
}

.dish-img {
  margin-top: 1rem;
  font-size: 2.1rem;
}

.dish-card h4 {
  margin: 0.5rem 0 0.2rem;
}

.dish-card p {
  margin: 0;
  color: #414856;
  font-weight: 600;
}

.dish-card button {
  margin-top: 0.6rem;
  border: 0;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #f8143f;
  color: #fff;
}

.dish-card small {
  display: block;
  margin-top: 0.25rem;
  color: #868d98;
}

@media (max-width: 1200px) {
  .browse-page {
    grid-template-columns: 1fr;
  }

  .left-sidebar {
    order: 2;
  }

  .category-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .top-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-input input {
    width: 100%;
  }

  .dish-grid {
    grid-template-columns: 1fr;
  }

  .voucher-banner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
