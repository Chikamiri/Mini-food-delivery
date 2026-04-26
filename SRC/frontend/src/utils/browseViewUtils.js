export function isItemFavorite(favoriteIdsRef, itemId) {
  return favoriteIdsRef.value.includes(itemId)
}

export function toggleFavoriteItem(favoriteIdsRef, item) {
  if (!item?.id) return
  const exists = favoriteIdsRef.value.includes(item.id)
  favoriteIdsRef.value = exists
    ? favoriteIdsRef.value.filter((id) => id !== item.id)
    : [...favoriteIdsRef.value, item.id]
  localStorage.setItem('browse_favorite_ids', JSON.stringify(favoriteIdsRef.value))
}

export function handleBrowseSidebarClick(activeMenuRef, menu, router) {
  activeMenuRef.value = menu.key
  if (['promo', 'favorites', 'flashsale'].includes(menu.key)) return
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

export function openDishDetailModal(selectedDishRef, dishNoteRef, selectedSizeRef, item) {
  selectedDishRef.value = item
  dishNoteRef.value = ''
  selectedSizeRef.value = 'Vừa'
}

export function closeDishDetailModal(selectedDishRef) {
  selectedDishRef.value = null
}

export function mapBrowseCategory(item) {
  return {
    icon: '🍽️',
    label: item.name || 'Danh mục',
    subtitle: 'Mon an noi bat',
    image:
      item.iconUrl ||
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80',
  }
}

export function mapBrowseMenuItem(item, restaurantMap) {
  const restaurant = restaurantMap.get(item.restaurantId)
  const basePrice = Number(item.price || 0)
  const parsedSizePrices = parseSizePricesFromDescription(item.description, basePrice)
  return {
    id: item.id,
    name: item.name,
    distance: restaurant?.address ? 'Gan ban' : '---',
    rating: String(restaurant?.rating ?? 4.7),
    reviews: 'new',
    price: `$${basePrice.toFixed(2)}`,
    basePrice,
    sizePrices: parsedSizePrices,
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

function parseSizePricesFromDescription(description, fallbackPrice) {
  const content = String(description || '')
  const matched = content.match(/\[SIZE_PRICES\](\{.*\})$/s)
  const fallback = {
    small: Number((Number(fallbackPrice || 0) * 0.9).toFixed(2)),
    medium: Number((Number(fallbackPrice || 0) * 1).toFixed(2)),
    large: Number((Number(fallbackPrice || 0) * 1.2).toFixed(2)),
  }
  if (!matched) return fallback
  try {
    const parsed = JSON.parse(matched[1])
    return {
      small: Number(parsed.small || fallback.small),
      medium: Number(parsed.medium || fallback.medium),
      large: Number(parsed.large || fallback.large),
    }
  } catch {
    return fallback
  }
}

const SIZE_MULTIPLIERS = {
  'Nhỏ': 0.9,
  'Vừa': 1,
  'Lớn': 1.2,
}

export function getSizeAdjustedPrice(item, size = 'Vừa') {
  if (item?.sizePrices && typeof item.sizePrices === 'object') {
    if (size === 'Nhỏ') return Number(item.sizePrices.small || 0)
    if (size === 'Lớn') return Number(item.sizePrices.large || 0)
    return Number(item.sizePrices.medium || 0)
  }
  const baseSource =
    item?.basePrice ?? Number(String(item?.price || '').replace('$', '') || 0)
  const base = Number(baseSource || 0)
  const multiplier = SIZE_MULTIPLIERS[size] || 1
  return Number((base * multiplier).toFixed(2))
}

export function formatDishPrice(amount) {
  return `$${Number(amount || 0).toFixed(2)}`
}

export function formatRecentOrderTime(value) {
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

export function mapRecentBrowseOrder(order) {
  return {
    id: order.id,
    name: order.restaurantName || `Đơn hàng #${order.id}`,
    price: `${Number(order.totalAmount || 0).toLocaleString('vi-VN')}đ`,
    eta: formatRecentOrderTime(order.createdAt),
  }
}

export function addItemToCartFromDish(cartStore, closeModal, dishNoteRef, selectedSizeRef, item) {
  if (!item?.isAvailable) return
  const adjustedPrice = getSizeAdjustedPrice(item, selectedSizeRef.value)
  cartStore.addItem(
    {
      id: item.menuItemId || item.id,
      name: item.name,
      price: adjustedPrice,
      imageUrl: item.image,
      restaurantId: item.restaurantId || null,
      restaurantName: item.restaurant || 'Nha hang',
      note: dishNoteRef.value,
      size: selectedSizeRef.value,
    },
    1,
  )
  closeModal()
}

export async function loadBrowseDataAction({
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
}) {
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
    categories.value = (categoryData || []).slice(0, 6).map(mapBrowseCategory)
    const restaurantMap = new Map((restaurants || []).map((restaurant) => [restaurant.id, restaurant]))
    const menus = await Promise.all(
      (restaurants || []).slice(0, 4).map((restaurant) => restaurantService.getMenuByRestaurant(restaurant.id)),
    )
    const flatMenus = menus.flat().slice(0, 12).map((item) => mapBrowseMenuItem(item, restaurantMap))
    popularDishes.value = flatMenus.slice(0, 6)
    recommendedItems.value = flatMenus.slice(6, 12).length ? flatMenus.slice(6, 12) : flatMenus.slice(0, 6)
    const orderHistory = await orderService.getByUser()
    recentOrders.value = (Array.isArray(orderHistory) ? orderHistory : [])
      .filter((order) => String(order?.status || '').toUpperCase() === 'DELIVERED')
      .slice(0, 6)
      .map(mapRecentBrowseOrder)
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
