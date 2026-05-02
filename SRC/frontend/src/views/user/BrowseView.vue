<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
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
import iconImage from '@/assets/icon/image.svg'
import iconFlash from '@/assets/icon/monet-bill.svg'
import iconReceipt from '@/assets/icon/reciept.svg'
import iconClose from '@/assets/icon/close.svg'
import {
  isItemFavorite,
  toggleFavoriteItem,
  handleBrowseSidebarClick,
  openDishDetailModal,
  closeDishDetailModal,
  addItemToCartFromDish,
  loadBrowseDataAction,
  getSizeAdjustedPrice,
  formatDishPrice,
} from '@/utils/browseViewUtils'

const sidebarMenus = [
  { key: 'overview', label: 'Trang tổng quan', icon: iconHome, scrollTo: null },
  { key: 'promo', label: 'Ưu đãi', icon: iconTag, scrollTo: null },
  { key: 'favorites', label: 'Yêu thích', icon: iconLove, scrollTo: 'recommend-section' },
  { key: 'flashsale', label: 'Flash sale', icon: iconFlash, scrollTo: 'popular-section' },
  { key: 'orders', label: 'Đơn hàng', icon: iconReceipt, scrollTo: null },
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
const notifications = ref([])
const isNoticeOpen = ref(false)
const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()
const route = useRoute()
const cartCount = computed(() => cartStore.itemCount)
const unreadNoticeCount = computed(
  () => notifications.value.filter((item) => item?.isRead === false).length,
)
const favoriteIds = ref([])
const favoriteStorageKey = computed(
  () => `browse_favorite_ids_${String(authStore.user?.id || authStore.user?.email || 'guest')}`,
)
const activeCategoryKeyword = ref('')
const searchKeyword = ref('')
const isSearchOpen = ref(false)
const isPromoView = computed(() => activeMenu.value === 'promo')
const isFavoritesView = computed(() => activeMenu.value === 'favorites')
const isFlashSaleView = computed(() => activeMenu.value === 'flashsale')
const isOrdersView = computed(() => activeMenu.value === 'orders')
const orderHistory = ref([])
const isOrderHistoryLoading = ref(false)
const orderHistoryError = ref('')
const formattedOrderHistory = computed(() =>
  (Array.isArray(orderHistory.value) ? orderHistory.value : []).map((order) => {
    const status = String(order?.status || '').toUpperCase()
    let statusLabel = 'Đang xử lý'
    let statusClass = 'pending'
    if (status === 'DELIVERED') {
      statusLabel = 'Đã giao'
      statusClass = 'delivered'
    } else if (status === 'CANCELLED') {
      statusLabel = 'Đã hủy'
      statusClass = 'cancelled'
    } else if (status === 'DELIVERING' || status === 'SHIPPING') {
      statusLabel = 'Đang giao'
      statusClass = 'delivering'
    }
    return {
      id: order?.id,
      restaurantName: order?.restaurantName || 'Nhà hàng',
      createdAtLabel: order?.createdAt
        ? new Date(order.createdAt).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '---',
      totalLabel: `${Number(order?.totalAmount || 0).toLocaleString('vi-VN')}đ`,
      status,
      statusLabel,
      statusClass,
    }
  }),
)
const promoItems = computed(() => {
  const merged = [...popularDishes.value, ...recommendedItems.value]
  const seen = new Set()
  const deduped = merged.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
  if (!activeCategoryKeyword.value) return deduped
  const keyword = activeCategoryKeyword.value.toLowerCase()
  return deduped.filter((item) =>
    `${item.name || ''} ${item.categoryName || ''}`.toLowerCase().includes(keyword),
  )
})
const favoriteItems = computed(() => promoItems.value.filter((item) => favoriteIds.value.includes(item.id)))
const filteredPopularDishes = computed(() => {
  if (!activeCategoryKeyword.value) return popularDishes.value
  const keyword = activeCategoryKeyword.value.toLowerCase()
  return popularDishes.value.filter((item) =>
    `${item.name || ''} ${item.categoryName || ''}`.toLowerCase().includes(keyword),
  )
})
const filteredRecommendedItems = computed(() => {
  if (!activeCategoryKeyword.value) return recommendedItems.value
  const keyword = activeCategoryKeyword.value.toLowerCase()
  return recommendedItems.value.filter((item) =>
    `${item.name || ''} ${item.categoryName || ''}`.toLowerCase().includes(keyword),
  )
})

/** Ba đơn đã giao hiển thị dưới dạng món — mới nhất trước (theo thời gian đặt). */
const recentOrdersPreview = computed(() => {
  const copy = [...recentOrders.value]
  copy.sort((a, b) => {
    const tb = new Date(b.createdAt ?? 0).getTime()
    const ta = new Date(a.createdAt ?? 0).getTime()
    if (tb !== ta) return tb - ta
    return Number(b.id || 0) - Number(a.id || 0)
  })
  return copy.slice(0, 3)
})

const quickSearchResults = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return []
  const merged = [...popularDishes.value, ...recommendedItems.value]
  const map = new Map()
  merged.forEach((item) => {
    if (!item?.id || map.has(item.id)) return
    const haystack = `${item.name || ''} ${item.restaurant || ''} ${item.categoryName || ''}`.toLowerCase()
    if (haystack.includes(keyword)) {
      map.set(item.id, item)
    }
  })
  return Array.from(map.values()).slice(0, 6)
})

const selectedDish = ref(null)
const dishNote = ref('')
const selectedSize = ref('Vừa')
const selectedDishDisplayPrice = computed(() => {
  if (!selectedDish.value) return '0đ'
  return formatDishPrice(getSizeAdjustedPrice(selectedDish.value, selectedSize.value))
})
const isFavorite = (itemId) => isItemFavorite(favoriteIds, itemId)
const toggleFavorite = (item) => toggleFavoriteItem(favoriteIds, item, favoriteStorageKey.value)
const handleSidebarClick = (menu) => handleBrowseSidebarClick(activeMenu, menu, router)
const openDishDetail = (item) => openDishDetailModal(selectedDish, dishNote, selectedSize, item)
const closeDishDetail = () => closeDishDetailModal(selectedDish)
const addToCart = (item) =>
  addItemToCartFromDish(cartStore, closeDishDetail, dishNote, selectedSize, item)
const reorderRecentDish = (dish) => {
  if (!dish?.menuItemId) return
  cartStore.addItem(
    {
      id: dish.menuItemId,
      name: dish.name || 'Món ăn',
      price: Number(dish.reorderUnitPrice || 0),
      imageUrl: dish.imageUrl || null,
      restaurantId: dish.restaurantId || null,
      restaurantName: dish.restaurantName || 'Nha hang',
      note: '',
      size: 'Vừa',
    },
    1,
  )
}
const loadBrowseData = () =>
  loadBrowseDataAction({
    isLoading,
    loadError,
    authStore,
    profileName,
    categories,
    popularDishes,
    recommendedItems,
    recentOrders,
    restaurantService,
    orderService,
    userService,
    profileAvatar,
  })
const loadOrderHistory = async () => {
  isOrderHistoryLoading.value = true
  orderHistoryError.value = ''
  try {
    const data = await orderService.getByUser()
    orderHistory.value = Array.isArray(data) ? data : []
  } catch (error) {
    orderHistoryError.value = error?.message || 'Không thể tải lịch sử đơn hàng.'
    orderHistory.value = []
  } finally {
    isOrderHistoryLoading.value = false
  }
}
const openOrderHistoryView = () => {
  activeMenu.value = 'orders'
}
const loadNotifications = async () => {
  try {
    const data = await userService.getNotifications()
    notifications.value = Array.isArray(data) ? data : []
  } catch {
    notifications.value = []
  }
}
const toggleNoticePanel = async () => {
  const next = !isNoticeOpen.value
  isNoticeOpen.value = next
  if (next) {
    await loadNotifications()
  }
}
const markNotificationRead = async (notice) => {
  if (!notice?.id || notice?.isRead) return
  try {
    await userService.markNotificationRead(notice.id)
    notifications.value = notifications.value.map((item) =>
      item.id === notice.id ? { ...item, isRead: true } : item,
    )
  } catch {
    // ignore mark-read errors to keep UI responsive
  }
}
const markAllNotificationsRead = async () => {
  try {
    await userService.markAllNotificationsRead(null)
    notifications.value = notifications.value.map((item) => ({ ...item, isRead: true }))
  } catch {
    // ignore mark-all errors
  }
}
const openSettings = () => {
  router.push('/profile?openSettings=1')
}
const openRestaurantDetail = (dish) => {
  if (!dish?.restaurantId) return
  selectedDish.value = null
  document.body.style.overflow = ''
  router.push(`/restaurants/${dish.restaurantId}`)
}
const applyCategoryFilter = (item) => {
  activeMenu.value = 'overview'
  activeCategoryKeyword.value = String(item?.keyword || item?.label || '').trim()
  const section = document.getElementById('popular-section')
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
const clearCategoryFilter = () => {
  activeCategoryKeyword.value = ''
}
const loadFavoritesByStorageKey = (key) => {
  try {
    const current = JSON.parse(localStorage.getItem(key) || '[]')
    if (Array.isArray(current) && current.length) {
      favoriteIds.value = current
      return
    }
    // One-time migration from legacy shared key
    const legacy = JSON.parse(localStorage.getItem('browse_favorite_ids') || '[]')
    if (Array.isArray(legacy) && legacy.length) {
      favoriteIds.value = legacy
      localStorage.setItem(key, JSON.stringify(legacy))
      localStorage.removeItem('browse_favorite_ids')
      return
    }
    favoriteIds.value = []
  } catch {
    favoriteIds.value = []
  }
}
const onSearchFocus = () => {
  isSearchOpen.value = true
}
const onSearchBlur = () => {
  setTimeout(() => {
    isSearchOpen.value = false
  }, 120)
}
const selectSearchResult = (item) => {
  if (!item) return
  searchKeyword.value = ''
  isSearchOpen.value = false
  openDishDetail(item)
}
const submitSearch = () => {
  if (!quickSearchResults.value.length) return
  selectSearchResult(quickSearchResults.value[0])
}
const formatNoticeTime = (value) => {
  if (!value) return 'Vừa xong'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Vừa xong'
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

watch(selectedDish, (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
})

onMounted(() => {
  loadFavoritesByStorageKey(favoriteStorageKey.value)
  loadBrowseData()
  loadOrderHistory()
  loadNotifications()
  if (String(route.query.view || '').toLowerCase() === 'orders') {
    openOrderHistoryView()
  }
})

watch(
  () => favoriteStorageKey.value,
  (key) => {
    loadFavoritesByStorageKey(key)
  },
)

watch(
  () => route.query.view,
  (view) => {
    if (String(view || '').toLowerCase() === 'orders') {
      openOrderHistoryView()
    }
  },
)

onUnmounted(() => {
  document.body.style.overflow = ''
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
          <button
            type="button"
            class="action-btn"
            :class="{ 'has-dot': unreadNoticeCount > 0 }"
            aria-label="Thông báo"
            @click="toggleNoticePanel"
          >
            <img :src="iconNotice" alt="" width="22" height="22" />
          </button>
          <button type="button" class="action-btn" aria-label="Cài đặt" @click="openSettings">
            <img :src="iconSetting" alt="" width="22" height="22" />
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
        <div class="popular-grid">
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
