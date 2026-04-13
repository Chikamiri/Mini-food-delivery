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

<style scoped src="@/assets/styles/home-view.css"></style>
