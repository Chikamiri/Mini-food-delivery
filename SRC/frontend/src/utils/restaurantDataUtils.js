export async function loadRestaurantOrdersDataAction({
  loading,
  errorMessage,
  restaurantService,
  restaurants,
  activeRestaurantIdRef,
  orderService,
  orders,
}) {
  loading.value = true
  errorMessage.value = ''
  try {
    const mine = await restaurantService.getMyRestaurants()
    restaurants.value = Array.isArray(mine) ? mine : []
    if (!activeRestaurantIdRef.value) {
      orders.value = []
      return
    }
    const data = await orderService.getByRestaurant(activeRestaurantIdRef.value)
    orders.value = Array.isArray(data) ? data : []
  } catch (error) {
    errorMessage.value = error.message || 'Không thể tải đơn hàng'
  } finally {
    loading.value = false
  }
}

export async function loadRestaurantCategoriesDataAction({
  loading,
  errorMessage,
  restaurantService,
  restaurants,
  activeRestaurantIdRef,
  categories,
}) {
  loading.value = true
  errorMessage.value = ''
  try {
    const mine = await restaurantService.getMyRestaurants()
    restaurants.value = Array.isArray(mine) ? mine : []
    if (!activeRestaurantIdRef.value) {
      categories.value = []
      return
    }
    const data = await restaurantService.getMenuCategories(activeRestaurantIdRef.value)
    categories.value = Array.isArray(data) ? data : []
  } catch (error) {
    errorMessage.value = error.message || 'Không thể tải danh mục'
  } finally {
    loading.value = false
  }
}

export async function loadRestaurantMenuDataAction({
  loading,
  errorMessage,
  restaurantService,
  restaurants,
  activeRestaurantIdRef,
  menuItems,
}) {
  loading.value = true
  errorMessage.value = ''
  try {
    const mine = await restaurantService.getMyRestaurants()
    restaurants.value = Array.isArray(mine) ? mine : []
    if (!activeRestaurantIdRef.value) {
      menuItems.value = []
      return
    }
    const menu = await restaurantService.getMenuByRestaurant(activeRestaurantIdRef.value)
    menuItems.value = Array.isArray(menu) ? menu : []
  } catch (error) {
    errorMessage.value = error.message || 'Không thể tải menu'
  } finally {
    loading.value = false
  }
}

export async function loadRestaurantRevenueDataAction({
  loading,
  errorMessage,
  restaurantService,
  restaurants,
  activeRestaurantIdRef,
  orderService,
  orders,
}) {
  loading.value = true
  errorMessage.value = ''
  try {
    const mine = await restaurantService.getMyRestaurants()
    restaurants.value = Array.isArray(mine) ? mine : []
    if (!activeRestaurantIdRef.value) {
      orders.value = []
      return
    }
    const data = await orderService.getByRestaurant(activeRestaurantIdRef.value)
    orders.value = Array.isArray(data) ? data : []
  } catch (error) {
    errorMessage.value = error.message || 'Không thể tải dữ liệu doanh thu'
  } finally {
    loading.value = false
  }
}
