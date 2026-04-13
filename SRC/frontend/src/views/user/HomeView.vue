<script setup>
const navLinks = ['Why Foodeli?', 'Services', 'Menu', 'Contact']

const popularItems = [
  {
    id: 1,
    name: 'Italian Pizza',
    price: '$7.49',
    rating: '4.9',
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 2,
    name: 'Chicken Burger',
    price: '$5.20',
    rating: '4.7',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 3,
    name: 'Fresh Salad',
    price: '$6.10',
    rating: '4.8',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80',
  },
]

const steps = [
  {
    id: 1,
    title: 'Choose Food',
    description: 'Browse menu from many restaurants near you.',
  },
  {
    id: 2,
    title: 'Place Order',
    description: 'Confirm address and order with simple checkout.',
  },
  {
    id: 3,
    title: 'Fast Delivery',
    description: 'Track your order and receive food quickly.',
  },
]
</script>

<template>
  <section class="hero">
    <div class="hero-nav">
      <div class="brand">
        <div class="logo-box">FO</div>
        <span>Foodeli</span>
      </div>
      <ul class="hero-links">
        <li v-for="item in navLinks" :key="item">{{ item }}</li>
      </ul>
      <button class="login-btn">Login</button>
    </div>

    <div class="hero-content">
      <div class="left">
        <span class="pill">More than Faster</span>
        <h1 class="hero-title">
          Claim Best Offer
          <br />
          on Fast <span>Food</span> &
          <br />
          <span>Restaurants</span>
        </h1>
        <p class="hero-description">
          Our job is to filling your tummy with delicious food
          <br />
          and with fast and free delivery
        </p>

        <div class="cta-row">
          <button class="primary-btn">Get Started</button>
          <button class="watch-btn">
            <i>▶</i>
            Watch Video
          </button>
        </div>

        <div class="customer-row">
          <div class="avatars">
            <span>A</span>
            <span>B</span>
            <span>C</span>
          </div>
          <div>
            <strong>Our Happy Customer</strong>
            <p>4.8 (12.5k Review)</p>
          </div>
        </div>
      </div>

      <div class="right">
        <div class="dish-glow"></div>
        <img
          class="dish-image"
          src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80"
          alt="Food bowl"
        />

        <div class="floating courier-card">
          <div class="avatar">RW</div>
          <div class="card-text">
            <strong>Richard Watson</strong>
            <small>Food Courier</small>
          </div>
          <button class="call-btn">☎</button>
        </div>

        <div class="floating price-card">
          <img
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=280&q=80"
            alt="Pizza"
          />
          <div class="card-text">
            <strong>Italian Pizza</strong>
            <small>★★★★★</small>
            <p>$ 7.49</p>
          </div>
        </div>
      </div>
    </div>

    <section class="section-block">
      <div class="section-heading">
        <div>
          <span class="section-tag">Popular Menu</span>
          <h2>Choose your favorite food</h2>
        </div>
        <button class="outline-btn">See All Menu</button>
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
        <span class="section-tag">How it works</span>
        <h2>Get food in 3 easy steps</h2>
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
        <span class="section-tag">Special Offer</span>
        <h2>Get 20% discount for your first order</h2>
        <p>Use code <strong>WELCOME20</strong> at checkout.</p>
      </div>
      <button class="primary-btn">Order Now</button>
    </section>
  </section>
</template>

<style scoped>
.hero {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem 3rem;
}

.hero-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.2rem;
}

.logo-box {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: #f8143f;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 0.8rem;
}

.hero-links {
  list-style: none;
  display: flex;
  gap: 1.8rem;
  color: #555;
  font-size: 0.95rem;
}

.login-btn {
  border: 0;
  border-radius: 999px;
  background: #f8143f;
  color: #fff;
  padding: 0.65rem 1.35rem;
  font-weight: 600;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 1rem;
}

.pill {
  display: inline-block;
  background: #ffe8de;
  color: #f64839;
  padding: 0.55rem 1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  margin-bottom: 1.4rem;
}

.hero-title {
  font-size: clamp(2.2rem, 5vw, 4rem);
  line-height: 1.1;
  margin: 0;
  color: #061428;
}

.hero-title span {
  color: #f8143f;
  font-style: italic;
}

.hero-description {
  color: #5b5d66;
  line-height: 1.6;
}

.cta-row {
  margin-top: 1.7rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.primary-btn {
  border: 0;
  border-radius: 999px;
  background: #f8143f;
  color: #fff;
  font-weight: 600;
  padding: 0.9rem 1.6rem;
}

.watch-btn {
  border: 0;
  background: transparent;
  color: #1f2532;
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.watch-btn i {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ffd54b;
  display: grid;
  place-items: center;
  font-style: normal;
  font-size: 0.7rem;
}

.customer-row {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.avatars {
  display: flex;
}

.avatars span {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  margin-right: -8px;
  border: 2px solid #fff;
  background: #ddd;
  display: grid;
  place-items: center;
  font-size: 0.7rem;
}

.right {
  position: relative;
  min-height: 560px;
  display: grid;
  place-items: center;
}

.dish-glow {
  position: absolute;
  width: 430px;
  height: 430px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff 20%, #e9e9e9 70%);
}

.dish-image {
  position: relative;
  z-index: 2;
  width: min(520px, 95%);
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 28px 45px rgba(8, 8, 8, 0.2);
}

.floating {
  position: absolute;
  z-index: 3;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.11);
}

.courier-card {
  left: 0;
  bottom: 70px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.7rem 0.8rem;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #efeae6;
  display: grid;
  place-items: center;
  font-size: 0.7rem;
}

.call-btn {
  border: 0;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  background: #f8143f;
  color: #fff;
}

.price-card {
  right: 14px;
  bottom: 20px;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.65rem;
}

.price-card img {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  object-fit: cover;
}

.card-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.card-text small {
  color: #888;
}

.card-text p {
  margin: 0;
  font-weight: 700;
  color: #15181f;
}

.section-block {
  margin-top: 4.5rem;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.3rem;
}

.section-heading.center {
  justify-content: center;
  text-align: center;
  flex-direction: column;
}

.section-tag {
  display: inline-block;
  color: #f64839;
  font-weight: 600;
  margin-bottom: 0.45rem;
}

h2 {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  color: #061428;
}

.outline-btn {
  border: 1px solid #f8143f;
  background: #fff;
  color: #f8143f;
  border-radius: 999px;
  padding: 0.6rem 1.05rem;
  font-weight: 600;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.menu-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.07);
}

.menu-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.menu-card-body {
  padding: 0.95rem;
}

.menu-card-body h3 {
  margin: 0 0 0.45rem;
  color: #161a21;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price {
  color: #f8143f;
  font-weight: 700;
}

.rating {
  color: #8a8d97;
}

.how-it-works {
  background: #fff;
  border-radius: 18px;
  padding: 2rem 1.2rem;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
}

.step-grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.step-card {
  background: #f9fafc;
  border-radius: 14px;
  padding: 1rem;
}

.step-number {
  color: #f8143f;
  font-weight: 700;
  font-size: 1.2rem;
}

.step-card h3 {
  margin: 0.4rem 0;
  color: #151923;
}

.step-card p {
  margin: 0;
  color: #666a73;
}

.promo-banner {
  margin-top: 4rem;
  border-radius: 22px;
  padding: 2rem;
  background: linear-gradient(135deg, #ffe4e8 0%, #fff3f5 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.promo-banner p {
  margin: 0.5rem 0 0;
  color: #535761;
}

@media (max-width: 980px) {
  .hero-links {
    display: none;
  }

  .hero-content {
    grid-template-columns: 1fr;
  }

  .right {
    min-height: 470px;
  }

  .menu-grid,
  .step-grid {
    grid-template-columns: 1fr;
  }

  .section-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .promo-banner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
