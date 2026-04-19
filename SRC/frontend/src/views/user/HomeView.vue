<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import iconFacebook from '@/assets/icon/facebook.svg'
import iconInstagram from '@/assets/icon/instagram.svg'
import iconYoutube from '@/assets/icon/youtube.svg'
import iconTwitter from '@/assets/icon/twitter.svg'
import iconClose from '@/assets/icon/close.svg'

const navLinks = ['Vì sao chọn chúng tôi', 'Dịch vụ', 'Thực đơn', 'Liên hệ']

const loginOpen = ref(false)
/** Trên mobile: 'login' = khối trái, 'register' = khối phải (trượt ngang). Desktop: hiển thị cả hai. */
const authTab = ref('login')

const loginEmail = ref('')
const loginPassword = ref('')
const loginRemember = ref(false)

const regFullName = ref('')
const regEmail = ref('')
const regPassword = ref('')
const regConfirm = ref('')

function openLoginModal() {
  authTab.value = 'login'
  loginOpen.value = true
}

function closeLoginModal() {
  loginOpen.value = false
}

function showRegisterPanel() {
  authTab.value = 'register'
}

function showLoginPanel() {
  authTab.value = 'login'
}

function onLoginSubmit() {
  // Khi backend sẵn sàng: gọi API đăng nhập tại đây
  closeLoginModal()
}

function onRegisterSubmit() {
  // Khi backend sẵn sàng: gọi API đăng ký + kiểm tra trùng mật khẩu tại đây
  closeLoginModal()
}

watch(loginOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (!open) authTab.value = 'login'
})

function onKeydownEscape(e) {
  if (e.key === 'Escape' && loginOpen.value) closeLoginModal()
}

onMounted(() => window.addEventListener('keydown', onKeydownEscape))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydownEscape)
  document.body.style.overflow = ''
})

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
        <div class="logo-box">FD</div>
        <span>Giao Đồ Ăn</span>
      </div>
      <ul class="hero-links">
        <li v-for="item in navLinks" :key="item">{{ item }}</li>
      </ul>
      <button type="button" class="login-btn" @click="openLoginModal">Đăng nhập</button>
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

    <footer class="home-footer">
      <div class="footer-brand">
        <div class="logo-box">FO</div>
        <div>
          <strong>Giao Đồ Ăn</strong>
          <p>Ngon nhanh, giao tận nơi.</p>
        </div>
      </div>

      <div class="footer-links">
        <a href="#">Thực đơn</a>
        <a href="#">Dịch vụ</a>
        <a href="#">Liên hệ</a>
        <a href="#">Chính sách</a>
      </div>

      <div class="footer-social">
        <a href="https://www.facebook.com/" aria-label="Facebook">
          <img :src="iconFacebook" alt="" width="18" height="18" />
        </a>
        <a href="https://www.instagram.com/" aria-label="Instagram">
          <img :src="iconInstagram" alt="" width="18" height="18" />
        </a>
        <a href="https://www.youtube.com/" aria-label="YouTube">
          <img :src="iconYoutube" alt="" width="18" height="18" />
        </a>
        <a href="https://twitter.com/" aria-label="Twitter">
          <img :src="iconTwitter" alt="" width="18" height="18" />
        </a>
      </div>

      <p class="footer-copy">© 2026 Giao Đồ Ăn. Bảo lưu mọi quyền.</p>
    </footer>

    <Teleport to="body">
      <div
        v-if="loginOpen"
        class="login-overlay"
        @click.self="closeLoginModal"
      >
        <div
          class="login-panel auth-dialog"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="authTab === 'login' ? 'login-title' : 'register-title'"
          @click.stop
        >
          <button
            type="button"
            class="login-close"
            aria-label="Đóng"
            @click="closeLoginModal"
          >
            <img :src="iconClose" alt="" width="20" height="20" />
          </button>
          <div
            class="auth-inner"
            :class="{ 'auth-inner--register': authTab === 'register' }"
          >
            <section class="auth-col auth-col--login" aria-label="Đăng nhập">
              <h2 id="login-title" class="login-title">Đăng nhập</h2>
              <p class="login-sub">Nhập email và mật khẩu để tiếp tục đặt món.</p>
              <form class="login-form" @submit.prevent="onLoginSubmit">
                <label class="login-label">
                  Email
                  <input
                    v-model="loginEmail"
                    type="email"
                    name="email"
                    autocomplete="email"
                    required
                    placeholder="ten@email.com"
                  />
                </label>
                <label class="login-label">
                  Mật khẩu
                  <input
                    v-model="loginPassword"
                    type="password"
                    name="password"
                    autocomplete="current-password"
                    required
                    placeholder="••••••••"
                  />
                </label>
                <div class="login-row">
                  <label class="login-remember">
                    <input v-model="loginRemember" type="checkbox" name="remember" />
                    Ghi nhớ đăng nhập
                  </label>
                  <a href="#" class="login-forgot" @click.prevent>Quên mật khẩu?</a>
                </div>
                <button type="submit" class="login-submit">Đăng nhập</button>
              </form>
              <p class="login-alt">
                Chưa có tài khoản?
                <button type="button" class="auth-link" @click="showRegisterPanel">
                  Đăng ký
                </button>
              </p>
            </section>
            <section class="auth-col auth-col--register" aria-label="Đăng ký">
              <h2 id="register-title" class="login-title">Đăng ký</h2>
              <p class="login-sub">Tạo tài khoản để lưu địa chỉ và đặt món nhanh hơn.</p>
              <form class="login-form" @submit.prevent="onRegisterSubmit">
                <label class="login-label">
                  Họ và tên
                  <input
                    v-model="regFullName"
                    type="text"
                    name="fullName"
                    autocomplete="name"
                    required
                    placeholder="Nguyễn Văn A"
                  />
                </label>
                <label class="login-label">
                  Email
                  <input
                    v-model="regEmail"
                    type="email"
                    name="regEmail"
                    autocomplete="email"
                    required
                    placeholder="ten@email.com"
                  />
                </label>
                <label class="login-label">
                  Mật khẩu
                  <input
                    v-model="regPassword"
                    type="password"
                    name="newPassword"
                    autocomplete="new-password"
                    required
                    minlength="6"
                    placeholder="Ít nhất 6 ký tự"
                  />
                </label>
                <label class="login-label">
                  Xác nhận mật khẩu
                  <input
                    v-model="regConfirm"
                    type="password"
                    name="confirmPassword"
                    autocomplete="new-password"
                    required
                    placeholder="Nhập lại mật khẩu"
                  />
                </label>
                <button type="submit" class="login-submit">Tạo tài khoản</button>
              </form>
              <p class="login-alt">
                Đã có tài khoản?
                <button type="button" class="auth-link" @click="showLoginPanel">
                  Đăng nhập
                </button>
              </p>
            </section>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped src="@/assets/styles/home-view.css"></style>
