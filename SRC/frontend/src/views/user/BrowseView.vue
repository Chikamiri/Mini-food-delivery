<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import restaurantService from '@/services/restaurantService'
import orderService from '@/services/orderService'
import userService from '@/services/userService'
import iconMessage from '@/assets/icon/messaging.svg'
import iconNotice from '@/assets/icon/notice.svg'
import iconSetting from '@/assets/icon/setting.svg'
import iconFacebook from '@/assets/icon/facebook.svg'
import iconInstagram from '@/assets/icon/instagram.svg'
import iconYoutube from '@/assets/icon/youtube.svg'
import iconTwitter from '@/assets/icon/twitter.svg'
import iconSearch from '@/assets/icon/search.svg'
import iconCart from '@/assets/icon/shopping-cart.svg'
import iconHome from '@/assets/icon/home.svg'
import iconTag from '@/assets/icon/tag.svg'
import iconLove from '@/assets/icon/love.svg'
import iconFlash from '@/assets/icon/monet-bill.svg'
import iconReceipt from '@/assets/icon/reciept.svg'

const sidebarMenus = [
  { key: 'overview', label: 'Trang tổng quan', icon: iconHome, scrollTo: null },
  { key: 'promo', label: 'Ưu đãi', icon: iconTag, scrollTo: 'voucher-section' },
  { key: 'favorites', label: 'Yêu thích', icon: iconLove, scrollTo: 'recommend-section' },
  { key: 'flashsale', label: 'Flash sale', icon: iconFlash, scrollTo: 'popular-section' },
  { key: 'orders', label: 'Đơn hàng', icon: iconReceipt, route: '/orders/history' },
]

const activeMenu = ref('overview')

const categories = ref([])

const popularDishes = ref([])

const recentOrders = ref([])

const recommendedItems = ref([])
const isLoading = ref(false)
const loadError = ref('')
const profileName = ref('')
const profileAvatar = ref(
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
)
const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()
const cartCount = computed(() => cartStore.itemCount)

function handleSidebarClick(menu) {
  activeMenu.value = menu.key
  if (menu.route) {
    router.push(menu.route)
    return
  }
  if (menu.scrollTo) {
    const el = document.getElementById(menu.scrollTo)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

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

function mapCategory(item) {
  return {
    icon: '🍽️',
    label: item.name || 'Danh mục',
    subtitle: 'Mon an noi bat',
    image:
      item.iconUrl ||
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80',
  }
}

function mapMenuItem(item, restaurantMap) {
  const restaurant = restaurantMap.get(item.restaurantId)
  return {
    id: item.id,
    name: item.name,
    distance: restaurant?.address ? 'Gan ban' : '---',
    rating: String(restaurant?.rating ?? 4.7),
    reviews: 'new',
    price: `$${Number(item.price || 0).toFixed(2)}`,
    oldPrice: `$${Math.max(Number(item.price || 0) - 1, 0).toFixed(2)}`,
    badge: 'NEW',
    isAvailable: Boolean(item.isAvailable),
    image:
      item.imageUrl ||
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
    restaurant: restaurant?.name || 'Nha hang',
    restaurantId: item.restaurantId || restaurant?.id || null,
    restaurantLogo:
      restaurant?.imageUrl ||
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=120&q=80',
    menuItemId: item.id,
  }
}

function formatRecentOrderTime(value) {
  if (!value) return 'Vừa đặt'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Vừa đặt'
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function mapRecentOrder(order) {
  return {
    id: order.id,
    name: order.restaurantName || `Đơn hàng #${order.id}`,
    price: `${Number(order.totalAmount || 0).toLocaleString('vi-VN')}đ`,
    eta: formatRecentOrderTime(order.createdAt),
  }
}

function addToCart(item) {
  if (!item?.isAvailable) return
  cartStore.addItem(
    {
      id: item.menuItemId || item.id,
      name: item.name,
      price: Number(String(item.price).replace('$', '')) || 0,
      imageUrl: item.image,
      restaurantId: item.restaurantId || null,
      restaurantName: item.restaurant || 'Nha hang',
      note: dishNote.value,
      size: selectedSize.value,
    },
    1,
  )
  closeDishDetail()
}

async function loadBrowseData() {
  isLoading.value = true
  loadError.value = ''
  try {
    if (authStore.token && !authStore.user) {
      await authStore.fetchProfile()
    }
    if (authStore.user?.fullName) {
      profileName.value = authStore.user.fullName
    }
    const [categoryData, restaurants] = await Promise.all([
      restaurantService.getCategories(),
      restaurantService.getAll(),
    ])
    categories.value = (categoryData || []).slice(0, 6).map(mapCategory)
    const restaurantMap = new Map((restaurants || []).map((restaurant) => [restaurant.id, restaurant]))
    const menus = await Promise.all(
      (restaurants || []).slice(0, 4).map((restaurant) => restaurantService.getMenuByRestaurant(restaurant.id)),
    )
    const flatMenus = menus.flat().slice(0, 12).map((item) => mapMenuItem(item, restaurantMap))
    popularDishes.value = flatMenus.slice(0, 6)
    recommendedItems.value = flatMenus.slice(6, 12).length ? flatMenus.slice(6, 12) : flatMenus.slice(0, 6)
    const orderHistory = await orderService.getByUser()
    recentOrders.value = (Array.isArray(orderHistory) ? orderHistory : [])
      .filter((order) => String(order?.status || '').toUpperCase() === 'DELIVERED')
      .slice(0, 6)
      .map(mapRecentOrder)
    try {
      const profile = await userService.getProfile()
      profileName.value = profile.fullName || authStore.user?.fullName || 'Người dùng'
      if (profile.avatarUrl) profileAvatar.value = profile.avatarUrl
    } catch {
      profileName.value = authStore.user?.fullName || profileName.value || 'Người dùng'
    }
  } catch (error) {
    loadError.value = error.message || 'Khong the tai du lieu mon an'
    profileName.value = authStore.user?.fullName || profileName.value || 'Người dùng'
  } finally {
    isLoading.value = false
  }
}

watch(selectedDish, (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
})

onMounted(() => {
  loadBrowseData()
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
          v-for="menu in sidebarMenus"
          :key="menu.key"
          href="#"
          :class="{ active: activeMenu === menu.key }"
          @click.prevent="handleSidebarClick(menu)"
        >
          <img :src="menu.icon" alt="" width="18" height="18" class="menu-icon-img" />
          {{ menu.label }}
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
            :src="profileAvatar"
            alt="Ảnh đại diện"
          />
          <span class="profile-name">{{ profileName }}</span>
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
          <RouterLink to="/cart" class="cart-btn" aria-label="Giỏ hàng">
            <img :src="iconCart" alt="" />
            <span v-if="cartCount" class="cart-count">{{ cartCount }}</span>
          </RouterLink>
        </div>
      </header>
      <p v-if="isLoading">Dang tai du lieu...</p>
      <p v-if="loadError">{{ loadError }}</p>

      <section id="voucher-section" class="voucher-banner">
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

      <section id="popular-section" class="section-block">
        <div class="section-head">
          <h3>Món mới ra</h3>
          <a href="#">Xem tất cả</a>
        </div>
        <div class="popular-grid">
          <article
            v-for="dish in popularDishes"
            :key="dish.id"
            class="popular-card"
            role="button"
            tabindex="0"
            @click="openDishDetail(dish)"
            @keydown.enter="openDishDetail(dish)"
            @keydown.space.prevent="openDishDetail(dish)"
          >
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
          <p v-if="!recentOrders.length" class="muted">Chưa có đơn đã giao thành công.</p>
          <article v-for="dish in recentOrders" :key="dish.id" class="dish-card">
            <div class="dish-img">🍽️</div>
            <h4>{{ dish.name }}</h4>
            <p>{{ dish.price }}</p>
            <small>Đặt lúc: {{ dish.eta }}</small>
          </article>
        </div>
      </section>

      <section id="recommend-section" class="section-block">
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
            <p class="dish-availability">
              Tình trạng:
              <strong :class="selectedDish.isAvailable ? 'available-text' : 'soldout-text'">
                {{ selectedDish.isAvailable ? 'Còn món' : 'Hết món' }}
              </strong>
            </p>
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
              <button type="button" :disabled="!selectedDish.isAvailable" @click="addToCart(selectedDish)">
                {{ selectedDish.isAvailable ? 'Thêm vào giỏ' : 'Tạm hết món' }}
              </button>
            </div>
          </div>
        </article>
      </div>
    </Teleport>
    
  </section>
  
</template>

<style scoped src="@/assets/styles/browse-view.css"></style>
