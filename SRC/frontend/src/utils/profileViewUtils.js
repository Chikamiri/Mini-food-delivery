export function startEditingProfileAction(form, profile, isEditing) {
  form.value = {
    full_name: profile.value.full_name,
    email: profile.value.email,
    phone: profile.value.phone,
  }
  isEditing.value = true
}

export function cancelEditingProfileAction(isEditing) {
  isEditing.value = false
}

export async function logoutProfileAction(authStore, router) {
  authStore.logout()
  router.push('/')
}

export function goBackToBrowseAction(router) {
  router.push('/browse')
}

export function closeRestaurantModalAction(restaurantModalOpen, showOpenRestaurantForm) {
  restaurantModalOpen.value = false
  showOpenRestaurantForm.value = false
}

export function openRestaurantFormAction(showOpenRestaurantForm) {
  showOpenRestaurantForm.value = true
}

export function openRestaurantDashboardAction(restaurant, restaurantMessage, closeRestaurantModal, router) {
  if (!restaurant?.id) return
  if (!restaurant.isApproved) {
    restaurantMessage.value = 'Nhà hàng này chưa được admin duyệt nên chưa thể vào dashboard.'
    return
  }
  closeRestaurantModal()
  router.push(`/restaurant/dashboard?restaurantId=${restaurant.id}`)
}

export async function openRestaurantModalAction({
  restaurantModalOpen,
  showOpenRestaurantForm,
  restaurantMessage,
  restaurantLoading,
  authStore,
  profile,
  restaurants,
  restaurantService,
  ownerRequestService,
}) {
  restaurantModalOpen.value = true
  showOpenRestaurantForm.value = false
  restaurantMessage.value = ''
  restaurantLoading.value = true
  if (authStore.token) {
    try {
      await authStore.fetchProfile()
    } catch {
      // ignore profile refresh errors; fallback to current local profile state
    }
  }
  const role = String(authStore.user?.role || profile.value.role || '').toUpperCase()
  if (role !== 'OWNER') {
    restaurants.value = []
    showOpenRestaurantForm.value = true
    try {
      const myRequests = await ownerRequestService.getMyRequests()
      const pendingRequest = (Array.isArray(myRequests) ? myRequests : []).find(
        (item) => String(item?.status || '').toUpperCase() === 'PENDING',
      )
      if (pendingRequest) {
        restaurantMessage.value =
          'Bạn đã gửi đơn xin quyền OWNER và đang chờ admin duyệt. Sau khi duyệt, hãy đăng nhập lại để vào dashboard nhà hàng.'
      } else {
        restaurantMessage.value = 'Bạn có thể gửi đơn xin quyền OWNER để admin xét duyệt.'
      }
    } catch {
      restaurantMessage.value = 'Bạn có thể gửi đơn xin quyền OWNER để admin xét duyệt.'
    }
    restaurantLoading.value = false
    return
  }
  try {
    const data = await restaurantService.getMyRestaurants()
    restaurants.value = Array.isArray(data) ? data : []
  } catch (error) {
    restaurants.value = []
    const message = String(error?.message || '')
    const isAccessDenied =
      message.toLowerCase().includes('access denied') ||
      message.toLowerCase().includes('forbidden') ||
      message.includes('403')

    if (isAccessDenied) {
      restaurantMessage.value =
        'Bạn chưa có quyền xem danh sách nhà hàng. Vui lòng gửi yêu cầu mở quán để admin xét duyệt.'
      showOpenRestaurantForm.value = true
      return
    }
    restaurantMessage.value = message || 'Chưa thể tải danh sách nhà hàng'
  } finally {
    restaurantLoading.value = false
  }
}

export function handleProfileMenuClickAction(item, openRestaurantModal, router, restaurantMessage, restaurantModalOpen, showOpenRestaurantForm) {
  if (item.action === 'open-restaurant') {
    openRestaurantModal()
    return
  }
  if (item.route) {
    router.push(item.route)
    return
  }
  restaurantMessage.value = `"${item.label}" sẽ được cập nhật trong bản sau.`
  restaurantModalOpen.value = true
  showOpenRestaurantForm.value = false
}

export async function submitOpenRestaurantAction({
  restaurantMessage,
  restaurantLoading,
  authStore,
  profile,
  restaurantService,
  ownerRequestService,
  openingForm,
  showOpenRestaurantForm,
  restaurants,
}) {
  restaurantMessage.value = ''
  restaurantLoading.value = true
  try {
    const role = String(authStore.user?.role || profile.value.role || '').toUpperCase()
    if (role !== 'OWNER') {
      await ownerRequestService.submitRequest({
        restaurantName: openingForm.value.name,
        restaurantAddress: openingForm.value.address,
        restaurantPhone: openingForm.value.phone,
        description: openingForm.value.description || openingForm.value.noteToAdmin || '',
      })
      restaurantMessage.value =
        'Đã gửi đơn xin quyền OWNER cho admin. Khi được duyệt, tài khoản của bạn sẽ trở thành OWNER.'
      openingForm.value = { name: '', phone: '', address: '', description: '', noteToAdmin: '' }
      showOpenRestaurantForm.value = false
      return
    }

    await restaurantService.createRestaurant({
      name: openingForm.value.name,
      description: openingForm.value.description || '',
      phone: openingForm.value.phone,
      address: openingForm.value.address,
      latitude: 10.776889,
      longitude: 106.700806,
      imageUrl: null,
      openingTime: '08:00:00',
      closingTime: '22:00:00',
      categoryId: null,
      isOpen: true,
    })

    restaurantMessage.value = 'Đã gửi yêu cầu mở quán thành công. Quán đang ở trạng thái chờ admin duyệt.'
    openingForm.value = { name: '', phone: '', address: '', description: '', noteToAdmin: '' }
    showOpenRestaurantForm.value = false
    const data = await restaurantService.getMyRestaurants()
    restaurants.value = Array.isArray(data) ? data : []
  } catch (error) {
    restaurantMessage.value = error.message || 'Không thể gửi yêu cầu mở quán'
  } finally {
    restaurantLoading.value = false
  }
}

export async function loadProfileAction(isLoading, errorMessage, userService, profile, form) {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const data = await userService.getProfile()
    profile.value = {
      ...profile.value,
      full_name: data.fullName || profile.value.full_name,
      email: data.email || profile.value.email,
      phone: data.phone || '',
      avatar_url: data.avatarUrl || '',
      role: data.role || profile.value.role,
      created_at: data.createdAt ? String(data.createdAt).slice(0, 10) : profile.value.created_at,
    }
    form.value = {
      full_name: profile.value.full_name,
      email: profile.value.email,
      phone: profile.value.phone,
    }
  } catch (error) {
    errorMessage.value = error.message || 'Khong the tai thong tin tai khoan'
  } finally {
    isLoading.value = false
  }
}

export async function loadProfileStatsAction(orderService, userService, stats, iconOrder, iconCheck, iconFavorite, iconLocation) {
  const [ordersResult, addressesResult] = await Promise.allSettled([
    orderService.getByUser(),
    userService.getAddresses(),
  ])
  const orders =
    ordersResult.status === 'fulfilled' && Array.isArray(ordersResult.value) ? ordersResult.value : []
  const addresses =
    addressesResult.status === 'fulfilled' && Array.isArray(addressesResult.value) ? addressesResult.value : []
  const deliveredCount = orders.filter((order) => String(order?.status || '').toUpperCase() === 'DELIVERED').length
  const favoriteCount = new Set(
    orders.map((order) => order?.restaurantName || order?.restaurant?.name || '').filter((name) => Boolean(name)),
  ).size
  stats.value = [
    { label: 'Đơn hàng', value: String(orders.length), icon: iconOrder },
    { label: 'Đã giao', value: String(deliveredCount), icon: iconCheck },
    { label: 'Yêu thích', value: String(favoriteCount), icon: iconFavorite },
    { label: 'Địa chỉ', value: String(addresses.length), icon: iconLocation },
  ]
}

export async function updateProfileAction(isLoading, errorMessage, userService, form, profile, isEditing) {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const updated = await userService.updateProfile({
      fullName: form.value.full_name,
      phone: form.value.phone,
    })
    profile.value = {
      ...profile.value,
      full_name: updated.fullName || form.value.full_name,
      phone: updated.phone || form.value.phone,
    }
    isEditing.value = false
  } catch (error) {
    errorMessage.value = error.message || 'Khong the cap nhat thong tin'
  } finally {
    isLoading.value = false
  }
}
