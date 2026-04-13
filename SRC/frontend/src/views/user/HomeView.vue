<script setup>
const navLinks = ['Vì sao chọn chúng tôi', 'Dịch vụ', 'Thực đơn', 'Liên hệ']

const popularItems = [
  {
    id: 1,
    name: 'Pizza Y',
    price: '$7.49',
    rating: '4.9',
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 2,
    name: 'Burger Gà',
    price: '$5.20',
    rating: '4.7',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 3,
    name: 'Salad Tươi',
    price: '$6.10',
    rating: '4.8',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80',
  },
]

const steps = [
  {
    id: 1,
    title: 'Chọn món',
    description: 'Xem thực đơn từ nhiều nhà hàng gần bạn.',
  },
  {
    id: 2,
    title: 'Đặt đơn',
    description: 'Xác nhận địa chỉ và đặt đơn nhanh gọn.',
  },
  {
    id: 3,
    title: 'Giao nhanh',
    description: 'Theo dõi đơn hàng và nhận món trong thời gian ngắn.',
  },
]
</script>

<template>
  <section class="hero">
    <div class="hero-nav">
      <div class="brand">
        <div class="logo-box">FO</div>
        <span>Giao Đồ Ăn</span>
      </div>
      <ul class="hero-links">
        <li v-for="item in navLinks" :key="item">{{ item }}</li>
      </ul>
      <button class="login-btn">Đăng nhập</button>
    </div>

    <div class="hero-content">
      <div class="left">
        <span class="pill">Nhanh hơn mong đợi</span>
        <h1 class="hero-title">
          Nhận ưu đãi tốt nhất
          <br />
          cho <span>Đồ ăn</span> và
          <br />
          <span>Nhà hàng</span>
        </h1>
        <p class="hero-description">
          Chúng tôi giúp bạn no bụng với những món ăn ngon
          <br />
          và giao hàng nhanh miễn phí
        </p>

        <div class="cta-row">
          <button class="primary-btn">Bắt đầu ngay</button>
          <button class="watch-btn">
            <i>▶</i>
            Xem video
          </button>
        </div>

        <div class="customer-row">
          <div class="avatars">
            <span>A</span>
            <span>B</span>
            <span>C</span>
          </div>
          <div>
            <strong>Khách hàng hài lòng</strong>
            <p>4.8 (12.5 nghìn đánh giá)</p>
          </div>
        </div>
      </div>

      <div class="right">
        <div class="dish-glow"></div>
        <img
          class="dish-image"
          src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80"
          alt="Món ăn"
        />

        <div class="floating courier-card">
          <div class="avatar">RW</div>
          <div class="card-text">
            <strong>Nguyễn Văn A</strong>
            <small>Nhân viên giao hàng</small>
          </div>
          <button class="call-btn">☎</button>
        </div>

        <div class="floating price-card">
          <img
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=280&q=80"
            alt="Pizza"
          />
          <div class="card-text">
            <strong>Pizza Y</strong>
            <small>★★★★★</small>
            <p>$ 7.49</p>
          </div>
        </div>
      </div>
    </div>

    <section class="section-block">
      <div class="section-heading">
        <div>
          <span class="section-tag">Món phổ biến</span>
          <h2>Chọn món bạn yêu thích</h2>
        </div>
        <button class="outline-btn">Xem tất cả món</button>
      </div>

      <div class="menu-grid">
        <article v-for="item in popularItems" :key="item.id" class="menu-card">
          <img :src="item.image" :alt="item.name" />
          <div class="menu-card-body">
            <h3>{{ item.name }}</h3>
            <div class="meta-row">
              <span class="price">{{ item.price }}</span>
              <span class="rating">★ {{ item.rating }}</span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="section-block how-it-works">
      <div class="section-heading center">
        <span class="section-tag">Cách hoạt động</span>
        <h2>Đặt món với 3 bước đơn giản</h2>
      </div>
      <div class="step-grid">
        <article v-for="step in steps" :key="step.id" class="step-card">
          <span class="step-number">0{{ step.id }}</span>
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
        </article>
      </div>
    </section>

    <section class="promo-banner">
      <div>
        <span class="section-tag">Ưu đãi đặc biệt</span>
        <h2>Giảm 20% cho đơn hàng đầu tiên</h2>
        <p>Sử dụng mã <strong>CHAO20</strong> khi thanh toán.</p>
      </div>
      <button class="primary-btn">Đặt món ngay</button>
    </section>
  </section>
</template>

<style scoped src="@/assets/styles/home-view.css"></style>
