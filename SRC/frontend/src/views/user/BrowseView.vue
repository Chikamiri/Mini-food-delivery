<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { createBrowseSidebarMenus } from '@/config/browseMenus'
import { useBrowseViewModel } from '@/composables/useBrowseViewModel'
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
import iconImage from '@/assets/icon/image.svg'
import iconFlash from '@/assets/icon/monet-bill.svg'
import iconReceipt from '@/assets/icon/reciept.svg'
import iconClose from '@/assets/icon/close.svg'

const sidebarMenus = createBrowseSidebarMenus({
  iconHome,
  iconTag,
  iconLove,
  iconFlash,
  iconReceipt,
})

const {
  router,
  activeMenu,
  categories,
  popularDishes,
  recentOrdersPreview,
  recommendedItems,
  isLoading,
  loadError,
  profileName,
  profileAvatar,
  notifications,
  isNoticeOpen,
  cartCount,
  unreadNoticeCount,
  activeCategoryKeyword,
  searchKeyword,
  isSearchOpen,
  isPromoView,
  isFavoritesView,
  isFlashSaleView,
  isOrdersView,
  isOrderHistoryLoading,
  orderHistoryError,
  formattedOrderHistory,
  promoItems,
  favoriteItems,
  filteredPopularDishes,
  filteredRecommendedItems,
  selectedDish,
  dishNote,
  selectedSize,
  selectedDishDisplayPrice,
  isFavorite,
  toggleFavorite,
  handleSidebarClick,
  openDishDetail,
  closeDishDetail,
  addToCart,
  reorderRecentDish,
  loadOrderHistory,
  toggleNoticePanel,
  markNotificationRead,
  markAllNotificationsRead,
  openSettings,
  openRestaurantDetail,
  applyCategoryFilter,
  clearCategoryFilter,
  onSearchFocus,
  onSearchBlur,
  quickSearchResults,
  selectSearchResult,
  submitSearch,
  formatNoticeTime,
} = useBrowseViewModel()

const popularScrollEl = ref(null)
const canScrollPopularPrev = ref(false)
const canScrollPopularNext = ref(false)

function updatePopularScrollState() {
  const el = popularScrollEl.value
  if (!el) {
    canScrollPopularPrev.value = false
    canScrollPopularNext.value = false
    return
  }
  const { scrollLeft, scrollWidth, clientWidth } = el
  const maxScroll = Math.max(0, scrollWidth - clientWidth)
  canScrollPopularPrev.value = scrollLeft > 4
  canScrollPopularNext.value = scrollLeft < maxScroll - 4
}

function scrollPopularCarousel(direction) {
  const el = popularScrollEl.value
  if (!el) return
  el.scrollBy({ left: direction * el.clientWidth, behavior: 'smooth' })
  window.setTimeout(updatePopularScrollState, 320)
}

watch(
  () => filteredPopularDishes.value.length,
  () => nextTick(updatePopularScrollState),
)

let popularScrollResizeObserver = null

function attachPopularScrollObserver() {
  popularScrollResizeObserver?.disconnect()
  popularScrollResizeObserver = null
  const el = popularScrollEl.value
  if (!el || typeof ResizeObserver === 'undefined') return
  popularScrollResizeObserver = new ResizeObserver(updatePopularScrollState)
  popularScrollResizeObserver.observe(el)
}

watch(
  () =>
    !isPromoView.value &&
    !isFavoritesView.value &&
    !isFlashSaleView.value &&
    !isOrdersView.value,
  (atHome) => {
    nextTick(() => {
      if (!atHome) {
        popularScrollResizeObserver?.disconnect()
        popularScrollResizeObserver = null
        return
      }
      updatePopularScrollState()
      attachPopularScrollObserver()
    })
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener('resize', updatePopularScrollState)
})

onUnmounted(() => {
  popularScrollResizeObserver?.disconnect()
  popularScrollResizeObserver = null
  window.removeEventListener('resize', updatePopularScrollState)
})

</script>

<template>
  <section class="browse-page">
    <aside class="left-sidebar">
      <div class="brand">
        <span class="logo">FD</span>
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
          <button
            type="button"
            class="action-btn"
            :class="{ 'has-dot': unreadNoticeCount > 0 }"
            aria-label="Thông báo"
            @click="toggleNoticePanel"
          >
            <img :src="iconNotice" alt="" width="22" height="22" />
          </button>
        </div>
        <div v-if="isNoticeOpen" class="notice-panel">
          <div class="notice-panel-head">
            <strong>Thông báo</strong>
            <button type="button" @click="markAllNotificationsRead">Đọc tất cả</button>
          </div>
          <p v-if="!notifications.length" class="notice-empty">Chưa có thông báo nào.</p>
          <button
            v-for="notice in notifications"
            :key="notice.id"
            type="button"
            class="notice-item"
            :class="{ unread: notice.isRead === false }"
            @click="markNotificationRead(notice)"
          >
            <strong>{{ notice.title || 'Thông báo hệ thống' }}</strong>
            <span>{{ notice.message || 'Bạn có cập nhật mới.' }}</span>
            <small>{{ formatNoticeTime(notice.createdAt) }}</small>
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
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="Tìm món ăn, nhà hàng..."
            @focus="onSearchFocus"
            @blur="onSearchBlur"
            @keydown.enter.prevent="submitSearch"
          />
          <RouterLink to="/cart" class="cart-btn" aria-label="Giỏ hàng">
            <img :src="iconCart" alt="" />
            <span v-if="cartCount" class="cart-count">{{ cartCount }}</span>
          </RouterLink>
          <div v-if="isSearchOpen && searchKeyword.trim()" class="search-popover">
            <p v-if="!quickSearchResults.length" class="search-empty">Không tìm thấy món phù hợp.</p>
            <button
              v-for="item in quickSearchResults"
              :key="item.id"
              type="button"
              class="search-result-item"
              @mousedown.prevent="selectSearchResult(item)"
            >
              <img :src="item.image" :alt="item.name" />
              <span>
                <strong>{{ item.name }}</strong>
                <small>{{ item.restaurant }}</small>
              </span>
            </button>
          </div>
        </div>
      </header>
      <p v-if="isLoading">Đang tải dữ liệu...</p>
      <p v-else-if="loadError">{{ loadError }}</p>

      <template v-if="isPromoView">
        <section id="voucher-section" class="voucher-banner">
          <div>
            <h2>Ưu đãi hot trong ngày</h2>
            <p>Chỉ hiển thị các món ưu đãi, giảm giá sâu cho bạn.</p>
          </div>
          <button>Nhận mã ngay</button>
        </section>

        <section class="section-block">
          <div class="section-head">
            <h3>Toàn bộ món ưu đãi</h3>
            <a href="#">Xem điều kiện</a>
          </div>
          <div class="recommend-list">
            <article
              v-for="item in promoItems"
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
                </div>
                <div class="recommend-price-row">
                  <strong>{{ item.price }}</strong>
                </div>
              </div>
              <button
                type="button"
                class="recommend-fav"
                :class="{ 'is-active': isFavorite(item.id) }"
                aria-label="Yêu thích"
                @click.stop.prevent="toggleFavorite(item)"
              >
                {{ isFavorite(item.id) ? '♥' : '♡' }}
              </button>
            </article>
          </div>
        </section>
      </template>

      <template v-else-if="isFavoritesView">
        <section class="section-block">
          <div class="section-head">
            <h3>Món bạn đã yêu thích</h3>
            <a href="#">Danh sách đã lưu</a>
          </div>
          <div class="recommend-list">
            <p v-if="!favoriteItems.length" class="muted">Bạn chưa nhấn yêu thích món nào.</p>
            <article
              v-for="item in favoriteItems"
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
                </div>
                <div class="recommend-price-row">
                  <strong>{{ item.price }}</strong>
                </div>
              </div>
              <button
                type="button"
                class="recommend-fav"
                :class="{ 'is-active': isFavorite(item.id) }"
                aria-label="Yêu thích"
                @click.stop.prevent="toggleFavorite(item)"
              >
                {{ isFavorite(item.id) ? '♥' : '♡' }}
              </button>
            </article>
          </div>
        </section>
      </template>

      <template v-else-if="isFlashSaleView">
        <section class="voucher-banner">
          <div>
            <h2>Flash Sale đang diễn ra</h2>
            <p>Số lượng có hạn, ưu đãi kết thúc trong hôm nay.</p>
          </div>
          <button>Mua ngay</button>
        </section>

        <section class="section-block">
          <div class="section-head">
            <h3>Danh sách Flash sale</h3>
            <a href="#">Xem điều kiện</a>
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
                <span class="popular-badge">FLASH</span>
              </div>
              <h4>{{ dish.name }}</h4>
              <div class="popular-meta">
                <span>{{ dish.distance }}</span>
                <span class="dot">|</span>
                <span class="star">★</span>
                <span>{{ dish.rating }}</span>
              </div>
              <div class="popular-price-row">
                <strong>{{ dish.price }}</strong>
                <button
                  type="button"
                  class="favorite-btn"
                  :class="{ 'is-active': isFavorite(dish.id) }"
                  aria-label="Yêu thích"
                  @click.stop.prevent="toggleFavorite(dish)"
                >
                  {{ isFavorite(dish.id) ? '♥' : '♡' }}
                </button>
              </div>
            </article>
          </div>
        </section>
      </template>

      <template v-else-if="isOrdersView">
        <section class="section-block">
          <div class="section-head">
            <h3>Lịch sử đơn hàng</h3>
            <button type="button" class="history-refresh-btn" @click="loadOrderHistory">Tải lại</button>
          </div>
          <p v-if="isOrderHistoryLoading" class="muted">Đang tải đơn hàng...</p>
          <p v-else-if="orderHistoryError" class="muted">{{ orderHistoryError }}</p>
          <div v-else class="order-history-list">
            <article v-if="!formattedOrderHistory.length" class="order-history-card empty">
              <h4>Chưa có đơn hàng nào</h4>
              <p>Hãy đặt món đầu tiên để theo dõi lịch sử tại đây.</p>
            </article>
            <article v-for="order in formattedOrderHistory" :key="order.id" class="order-history-card">
              <div class="order-history-top">
                <div>
                  <strong>#{{ order.id }}</strong>
                  <p>{{ order.restaurantName }}</p>
                </div>
                <span class="status-chip" :class="order.statusClass">{{ order.statusLabel }}</span>
              </div>
              <div class="order-history-meta">
                <span>Đặt lúc: {{ order.createdAtLabel }}</span>
                <strong>{{ order.totalLabel }}</strong>
              </div>
              <div class="order-history-actions">
                <button type="button" class="history-outline-btn" @click="router.push(`/orders/${order.id}/tracking`)">
                  Theo dõi đơn
                </button>
              </div>
            </article>
          </div>
        </section>
      </template>

      <template v-else>
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
          <button type="button" class="category-clear-btn" @click="clearCategoryFilter">Xem tất cả</button>
        </div>
        <div class="category-grid">
          <article
            v-for="item in categories"
            :key="item.label"
            class="category-card"
            :class="{ active: activeCategoryKeyword === item.keyword }"
            role="button"
            tabindex="0"
            @click="applyCategoryFilter(item)"
            @keydown.enter="applyCategoryFilter(item)"
            @keydown.space.prevent="applyCategoryFilter(item)"
          >
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
        <div class="popular-carousel">
          <button
            type="button"
            class="popular-nav popular-nav--prev"
            aria-label="Xem món trước"
            :disabled="!canScrollPopularPrev"
            @click="scrollPopularCarousel(-1)"
          >
            ‹
          </button>
          <div class="popular-viewport">
            <div
              ref="popularScrollEl"
              class="popular-scroll"
              @scroll.passive="updatePopularScrollState"
            >
              <article
                v-for="dish in filteredPopularDishes"
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
                </div>
                <div class="popular-price-row">
                  <strong>{{ dish.price }}</strong>
                  <button
                    type="button"
                    class="favorite-btn"
                    :class="{ 'is-active': isFavorite(dish.id) }"
                    aria-label="Yêu thích"
                    @click.stop.prevent="toggleFavorite(dish)"
                  >
                    {{ isFavorite(dish.id) ? '♥' : '♡' }}
                  </button>
                </div>
              </article>
            </div>
          </div>
          <button
            type="button"
            class="popular-nav popular-nav--next"
            aria-label="Xem món sau"
            :disabled="!canScrollPopularNext"
            @click="scrollPopularCarousel(1)"
          >
            ›
          </button>
        </div>
      </section>

      <section class="section-block">
        <div class="section-head">
          <h3>Đặt gần đây</h3>
          <RouterLink :to="{ name: 'order-history' }">Xem tất cả</RouterLink>
        </div>
        <div class="dish-grid recent">
          <p v-if="!recentOrdersPreview.length" class="muted">Chưa có đơn đã giao thành công.</p>
          <article v-for="dish in recentOrdersPreview" :key="dish.id" class="dish-card recent-order-card">
            <div class="dish-img">
              <img v-if="dish.imageUrl" :src="dish.imageUrl" :alt="dish.name" class="dish-photo" />
              <img v-else :src="iconImage" alt="" class="dish-img-icon" />
            </div>
            <h4>{{ dish.name }}</h4>
            <p>{{ dish.price }}</p>
            <small>Đặt lúc: {{ dish.eta }}</small>
            <button
              type="button"
              class="reorder-btn"
              :disabled="!dish.menuItemId"
              @click="reorderRecentDish(dish)"
            >
              Đặt lại
            </button>
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
            v-for="item in filteredRecommendedItems"
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
              </div>
              <div class="recommend-price-row">
                <strong>{{ item.price }}</strong>
              </div>
            </div>
            <button
              type="button"
              class="recommend-fav"
              :class="{ 'is-active': isFavorite(item.id) }"
              aria-label="Yêu thích"
              @click.stop.prevent="toggleFavorite(item)"
            >
              {{ isFavorite(item.id) ? '♥' : '♡' }}
            </button>
          </article>
        </div>
      </section>

      <footer class="home-footer">
        <div class="footer-brand">
          <div class="logo-box">FD</div>
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
      </template>
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
            <img :src="iconClose" alt="" width="14" height="14" />
          </button>

          <img :src="selectedDish.image" :alt="selectedDish.name" class="dish-detail-image" />

          <div class="dish-detail-body">
            <div class="dish-detail-head">
              <h3>{{ selectedDish.name }}</h3>
              <button type="button" class="dish-restaurant dish-restaurant-btn" @click="openRestaurantDetail(selectedDish)">
                <img :src="selectedDish.restaurantLogo" :alt="selectedDish.restaurant" />
                {{ selectedDish.restaurant }}
              </button>
            </div>
            <div class="dish-detail-meta">
              <span>{{ selectedDish.distance }}</span>
              <span class="dot">|</span>
              <span class="star">★</span>
              <span>{{ selectedDish.rating }}</span>
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
              <strong>{{ selectedDishDisplayPrice }}</strong>
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
