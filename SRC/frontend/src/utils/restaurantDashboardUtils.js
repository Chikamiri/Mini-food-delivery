export async function logoutRestaurantAction(authStore, router) {
  await authStore.logout()
  router.push('/')
}

export function backToProfileAction(router) {
  router.push('/profile')
}

export async function loadRestaurantDashboardAction({
  isLoading,
  pageError,
  restaurantService,
  myRestaurants,
  activeRestaurantRef,
  orderService,
  recentOrders,
  menuItems,
}) {
  isLoading.value = true
  pageError.value = ''
  try {
    const restaurants = await restaurantService.getMyRestaurants()
    myRestaurants.value = Array.isArray(restaurants) ? restaurants : []

    if (!activeRestaurantRef.value?.id) {
      recentOrders.value = []
      menuItems.value = []
      return
    }

    const [ordersResult, menuResult] = await Promise.allSettled([
      orderService.getByRestaurant(activeRestaurantRef.value.id),
      restaurantService.getMenuByRestaurant(activeRestaurantRef.value.id),
    ])

    recentOrders.value =
      ordersResult.status === 'fulfilled' && Array.isArray(ordersResult.value)
        ? ordersResult.value.slice(0, 8)
        : []
    menuItems.value = menuResult.status === 'fulfilled' && Array.isArray(menuResult.value) ? menuResult.value : []
  } catch (error) {
    pageError.value = error.message || 'Không thể tải dashboard nhà hàng'
  } finally {
    isLoading.value = false
  }
}
