<script setup>
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import iconMessage from '@/assets/icon/messaging.svg'
import iconNotice from '@/assets/icon/notice.svg'
import iconSetting from '@/assets/icon/setting.svg'
import iconFacebook from '@/assets/icon/facebook.svg'
import iconInstagram from '@/assets/icon/instagram.svg'
import iconYoutube from '@/assets/icon/youtube.svg'
import iconTwitter from '@/assets/icon/twitter.svg'
import iconSearch from '@/assets/icon/search.svg'
import iconCart from '@/assets/icon/shopping-cart.svg'

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
  {
    id: 1,
    name: 'Mixed Salad Bowl',
    distance: '1.5 km',
    rating: '4.8',
    reviews: '1.2k',
    price: '$6.00',
    oldPrice: '$2.00',
    badge: 'PROMO',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    name: 'Bánh mì gà nướng',
    distance: '2.1 km',
    rating: '4.7',
    reviews: '900',
    price: '$5.40',
    oldPrice: '$1.80',
    badge: 'HOT',
    image:
      'https://images.unsplash.com/photo-1481070555726-e2fe8357725c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    name: 'Cơm gà teriyaki',
    distance: '1.8 km',
    rating: '4.9',
    reviews: '2.0k',
    price: '$6.80',
    oldPrice: '$2.30',
    badge: 'MỚI',
    image:
      'https://images.unsplash.com/photo-1604908812858-5d36f9c94b7d?auto=format&fit=crop&w=900&q=80',
  },
]

const recentOrders = [
  { id: 1, name: 'Pizza Hải Sản', price: '129.000đ', eta: '30 phút' },
  { id: 2, name: 'Mì Ramen', price: '89.000đ', eta: '22 phút' },
  { id: 3, name: 'Cơm Gà Nướng', price: '69.000đ', eta: '18 phút' },
]

const recommendedItems = [
  {
    id: 1,
    name: 'Vegetarian Noodles',
    restaurant: 'Green Bowl Kitchen',
    restaurantLogo:
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=120&q=80',
    distance: '800 m',
    rating: '4.9',
    reviews: '2.3k',
    price: '$2.00',
    image:
      'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: 'Bún bò đặc biệt',
    restaurant: 'Bún Nhà Nhiên',
    restaurantLogo:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=120&q=80',
    distance: '1.2 km',
    rating: '4.8',
    reviews: '1.9k',
    price: '$2.40',
    image:
      'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=800&q=80',
  },
]

const selectedDish = ref(null)
const dishNote = ref('')
const selectedSize = ref('Vừa')

function openDishDetail(item) {
  selectedDish.value = item
  dishNote.value = ''
  selectedSize.value = 'Vừa'
}

function closeDishDetail() {
  selectedDish.value = null
}

watch(selectedDish, (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
})

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
          <img :src="iconSearch" alt="" class="search-icon" />
          <input type="text" placeholder="Tìm món ăn, nhà hàng..." />
          <button type="button" class="cart-btn" aria-label="Giỏ hàng">
            <img :src="iconCart" alt="" />
          </button>
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
          <h3>Món mới ra</h3>
          <a href="#">Xem tất cả</a>
        </div>
        <div class="popular-grid">
          <article v-for="dish in popularDishes" :key="dish.id" class="popular-card">
            <div class="popular-image-wrap">
              <img :src="dish.image" :alt="dish.name" class="popular-image" />
              <span class="popular-badge">{{ dish.badge }}</span>
            </div>
            <h4>{{ dish.name }}</h4>
            <div class="popular-meta">
              <span>{{ dish.distance }}</span>
              <span class="dot">|</span>
              <span class="star">★</span>
              <span>{{ dish.rating }}</span>
              <span class="muted">({{ dish.reviews }})</span>
            </div>
            <div class="popular-price-row">
              <strong>{{ dish.price }}</strong>
              <span class="dot">•</span>
              <small>{{ dish.oldPrice }}</small>
              <button type="button" class="favorite-btn" aria-label="Yêu thích">♡</button>
            </div>
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

      <section class="section-block">
        <div class="section-head">
          <h3>Có thể bạn thích</h3>
          <a href="#">Xem tất cả</a>
        </div>
        <div class="recommend-list">
          <article
            v-for="item in recommendedItems"
            :key="item.id"
            class="recommend-card"
            role="button"
            tabindex="0"
            @click="openDishDetail(item)"
            @keydown.enter="openDishDetail(item)"
            @keydown.space.prevent="openDishDetail(item)"
          >
            <img :src="item.image" :alt="item.name" class="recommend-thumb" />
            <div class="recommend-content">
              <h4>{{ item.name }}</h4>
              <div class="recommend-meta">
                <span>{{ item.distance }}</span>
                <span class="dot">|</span>
                <span class="star">★</span>
                <span>{{ item.rating }}</span>
                <span class="muted">({{ item.reviews }})</span>
              </div>
              <div class="recommend-price-row">
                <span class="leaf">♻</span>
                <strong>{{ item.price }}</strong>
              </div>
            </div>
            <button
              type="button"
              class="recommend-fav"
              aria-label="Yêu thích"
              @click.stop
            >
              ♥
            </button>
          </article>
        </div>
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
    </main>

    <Teleport to="body">
      <div
        v-if="selectedDish"
        class="dish-detail-overlay"
        @click.self="closeDishDetail"
      >
        <article class="dish-detail-modal">
          <button
            type="button"
            class="dish-detail-close"
            aria-label="Đóng chi tiết món"
            @click="closeDishDetail"
          >
            ✕
          </button>

          <img :src="selectedDish.image" :alt="selectedDish.name" class="dish-detail-image" />

          <div class="dish-detail-body">
            <div class="dish-detail-head">
              <h3>{{ selectedDish.name }}</h3>
              <span class="dish-restaurant">
                <img :src="selectedDish.restaurantLogo" :alt="selectedDish.restaurant" />
                {{ selectedDish.restaurant }}
              </span>
            </div>
            <div class="dish-detail-meta">
              <span>{{ selectedDish.distance }}</span>
              <span class="dot">|</span>
              <span class="star">★</span>
              <span>{{ selectedDish.rating }}</span>
              <span class="muted">({{ selectedDish.reviews }})</span>
            </div>
            <p>
              Món ăn nổi bật được gợi ý cho bạn hôm nay. Vị ngon cân bằng, nguyên liệu tươi,
              phù hợp cho bữa ăn nhanh nhưng vẫn đầy đủ dinh dưỡng.
            </p>

            <div class="dish-size-picker">
              <span>Kích cỡ</span>
              <div class="dish-size-options">
                <button
                  type="button"
                  :class="{ active: selectedSize === 'Nhỏ' }"
                  @click="selectedSize = 'Nhỏ'"
                >
                  Nhỏ
                </button>
                <button
                  type="button"
                  :class="{ active: selectedSize === 'Vừa' }"
                  @click="selectedSize = 'Vừa'"
                >
                  Vừa
                </button>
                <button
                  type="button"
                  :class="{ active: selectedSize === 'Lớn' }"
                  @click="selectedSize = 'Lớn'"
                >
                  Lớn
                </button>
              </div>
            </div>

            <label class="dish-note-field">
              <span>Ghi chú cho quán</span>
              <textarea
                v-model="dishNote"
                maxlength="180"
                placeholder="Ví dụ: ít cay, không hành, thêm tương..."
              ></textarea>
              <small>{{ dishNote.length }}/180</small>
            </label>

            <div class="dish-detail-footer">
              <strong>{{ selectedDish.price }}</strong>
              <button type="button">Thêm vào giỏ</button>
            </div>
          </div>
        </article>
      </div>
    </Teleport>
    
  </section>
  
</template>

<style scoped src="@/assets/styles/browse-view.css"></style>
