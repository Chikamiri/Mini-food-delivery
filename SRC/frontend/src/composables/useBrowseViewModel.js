import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import restaurantService from '@/services/restaurantService'
import orderService from '@/services/orderService'
import userService from '@/services/userService'
import {
  addItemToCartFromDish,
  closeDishDetailModal,
  formatDishPrice,
  getSizeAdjustedPrice,
  handleBrowseSidebarClick,
  isItemFavorite,
  loadBrowseDataAction,
  openDishDetailModal,
  toggleFavoriteItem,
} from '@/utils/browseViewUtils'

export function useBrowseViewModel() {
  const authStore = useAuthStore()
  const cartStore = useCartStore()
  const router = useRouter()
  const route = useRoute()

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
  const favoriteIds = ref([])
  const activeCategoryKeyword = ref('')
  const searchKeyword = ref('')
  const isSearchOpen = ref(false)
  const orderHistory = ref([])
  const isOrderHistoryLoading = ref(false)
  const orderHistoryError = ref('')
  const selectedDish = ref(null)
  const dishNote = ref('')
  const selectedSize = ref('Vừa')
  const orderStatusReadKeys = ref(new Set())
  let notificationRefreshTimer = null

  const cartCount = computed(() => cartStore.itemCount)
  const unreadNoticeCount = computed(
    () => notifications.value.filter((item) => item?.isRead === false).length,
  )
  const favoriteStorageKey = computed(
    () => `browse_favorite_ids_${String(authStore.user?.id || authStore.user?.email || 'guest')}`,
  )
  const orderStatusReadStorageKey = computed(
    () => `browse_order_status_read_${String(authStore.user?.id || authStore.user?.email || 'guest')}`,
  )
  const isPromoView = computed(() => activeMenu.value === 'promo')
  const isFavoritesView = computed(() => activeMenu.value === 'favorites')
  const isFlashSaleView = computed(() => activeMenu.value === 'flashsale')
  const isOrdersView = computed(() => activeMenu.value === 'orders')
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
  const favoriteItems = computed(() =>
    promoItems.value.filter((item) => favoriteIds.value.includes(item.id)),
  )
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
        restaurantName: dish.restaurantName || 'Nhà hàng',
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
  const normalizeOrderStatus = (status) => String(status || '').trim().toUpperCase()
  const orderStatusNoticeMeta = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          title: 'Nhà hàng đã xác nhận đơn',
          message: 'Đơn hàng của bạn đã được nhà hàng xác nhận.',
        }
      case 'PREPARING':
        return {
          title: 'Nhà hàng đang chuẩn bị món',
          message: 'Đơn hàng của bạn đang được chuẩn bị.',
        }
      case 'READY':
        return {
          title: 'Đơn hàng đã sẵn sàng',
          message: 'Nhà hàng đã chuẩn bị xong, đang chờ shipper nhận đơn.',
        }
      case 'DELIVERING':
      case 'SHIPPING':
      case 'PICKED_UP':
        return {
          title: 'Shipper đang giao hàng',
          message: 'Đơn hàng của bạn đang trên đường giao đến.',
        }
      case 'DELIVERED':
        return {
          title: 'Giao hàng thành công',
          message: 'Đơn hàng của bạn đã được giao thành công.',
        }
      case 'CANCELLED':
        return {
          title: 'Đơn hàng đã hủy',
          message: 'Đơn hàng của bạn đã bị hủy.',
        }
      case 'REJECTED':
        return {
          title: 'Đơn hàng bị từ chối',
          message: 'Nhà hàng đã từ chối đơn hàng của bạn.',
        }
      default:
        return null
    }
  }
  const loadOrderStatusReadState = (key) => {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]')
      if (Array.isArray(parsed)) {
        orderStatusReadKeys.value = new Set(parsed.map((item) => String(item)))
        return
      }
    } catch {
      // ignore parse errors
    }
    orderStatusReadKeys.value = new Set()
  }
  const persistOrderStatusReadState = () => {
    try {
      localStorage.setItem(
        orderStatusReadStorageKey.value,
        JSON.stringify(Array.from(orderStatusReadKeys.value)),
      )
    } catch {
      // ignore storage write errors
    }
  }
  const buildOrderStatusNotifications = async () => {
    try {
      const orders = await orderService.getByUser()
      if (!Array.isArray(orders)) return []
      const notices = []
      orders.forEach((order) => {
        const normalizedStatus = normalizeOrderStatus(order?.status)
        const noticeMeta = orderStatusNoticeMeta(normalizedStatus)
        if (!noticeMeta || !order?.id) return
        const noticeId = `order-status-${order.id}-${normalizedStatus}`
        notices.push({
          id: noticeId,
          type: 'ORDER_STATUS',
          title: noticeMeta.title,
          message: `${noticeMeta.message} (Đơn #${order.id})`,
          createdAt: order?.updatedAt || order?.createdAt || new Date().toISOString(),
          isRead: orderStatusReadKeys.value.has(noticeId),
          source: 'local-order-status',
        })
      })
      notices.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      return notices
    } catch {
      return []
    }
  }
  const openOrderHistoryView = () => {
    activeMenu.value = 'orders'
  }
  const extractOrderIdFromNotice = (notice) => {
    const directOrderId = Number(notice?.orderId || notice?.order?.id)
    if (Number.isFinite(directOrderId) && directOrderId > 0) return directOrderId

    const noticeId = String(notice?.id || '')
    const localMatch = noticeId.match(/^order-status-(\d+)-/i)
    if (localMatch) return Number(localMatch[1])

    const textMatch = String(notice?.message || '').match(/đơn\s*#?\s*(\d+)/i)
    if (textMatch) return Number(textMatch[1])

    return null
  }
  const loadNotifications = async () => {
    try {
      const [remoteNotifications, orderStatusNotifications] = await Promise.all([
        userService.getNotifications(),
        buildOrderStatusNotifications(),
      ])
      const remote = Array.isArray(remoteNotifications) ? remoteNotifications : []
      notifications.value = [...orderStatusNotifications, ...remote].sort(
        (a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime(),
      )
    } catch {
      notifications.value = await buildOrderStatusNotifications()
    }
  }
  const toggleNoticePanel = async () => {
    const next = !isNoticeOpen.value
    isNoticeOpen.value = next
    if (next) await loadNotifications()
  }
  const markNotificationRead = async (notice) => {
    if (!notice?.id) return
    const noticeId = String(notice.id)
    if (!notice?.isRead) {
      if (noticeId.startsWith('order-status-')) {
        orderStatusReadKeys.value.add(noticeId)
        persistOrderStatusReadState()
        notifications.value = notifications.value.map((item) =>
          item.id === notice.id ? { ...item, isRead: true } : item,
        )
      } else {
        try {
          await userService.markNotificationRead(notice.id)
          notifications.value = notifications.value.map((item) =>
            item.id === notice.id ? { ...item, isRead: true } : item,
          )
        } catch {
          // ignore mark-read errors to keep UI responsive
        }
      }
    }

    const orderId = extractOrderIdFromNotice(notice)
    if (orderId) {
      isNoticeOpen.value = false
      router.push(`/orders/${orderId}/tracking`)
    }
  }
  const markAllNotificationsRead = async () => {
    const orderStatusIds = notifications.value
      .map((item) => String(item?.id || ''))
      .filter((id) => id.startsWith('order-status-'))
    if (orderStatusIds.length) {
      orderStatusIds.forEach((id) => orderStatusReadKeys.value.add(id))
      persistOrderStatusReadState()
    }
    try {
      await userService.markAllNotificationsRead(null)
      notifications.value = notifications.value.map((item) => ({ ...item, isRead: true }))
    } catch {
      notifications.value = notifications.value.map((item) => ({ ...item, isRead: true }))
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
    loadOrderStatusReadState(orderStatusReadStorageKey.value)
    loadBrowseData()
    loadOrderHistory()
    loadNotifications()
    notificationRefreshTimer = setInterval(() => {
      loadNotifications()
    }, 30000)
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
    () => orderStatusReadStorageKey.value,
    (key) => {
      loadOrderStatusReadState(key)
      loadNotifications()
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
    if (notificationRefreshTimer) {
      clearInterval(notificationRefreshTimer)
      notificationRefreshTimer = null
    }
  })

  return {
    router,
    activeMenu,
    categories,
    popularDishes,
    recentOrders,
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
    orderHistory,
    isOrderHistoryLoading,
    orderHistoryError,
    formattedOrderHistory,
    promoItems,
    favoriteItems,
    filteredPopularDishes,
    filteredRecommendedItems,
    recentOrdersPreview,
    quickSearchResults,
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
    selectSearchResult,
    submitSearch,
    formatNoticeTime,
  }
}
