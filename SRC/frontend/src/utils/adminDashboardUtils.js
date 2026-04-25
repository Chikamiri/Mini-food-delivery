export async function logoutAdminAction(authStore, router) {
  await authStore.logout()
  router.push('/')
}

export function formatAdminCurrency(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`
}

export async function loadAdminDashboardDataAction(
  isLoading,
  errorMessage,
  adminService,
  stats,
  approvalQueue,
  users,
  ownerRequestQueue,
) {
  isLoading.value = true
  errorMessage.value = ''
  const [statsResult, pendingResult, usersResult, ownerRequestsResult] = await Promise.allSettled([
    adminService.getSystemStats(),
    adminService.getPendingRestaurants(),
    adminService.getAllUsers(),
    adminService.getPendingOwnerRequests(),
  ])

  if (statsResult.status === 'fulfilled' && statsResult.value) {
    stats.value = statsResult.value
  }
  approvalQueue.value =
    pendingResult.status === 'fulfilled' && Array.isArray(pendingResult.value) ? pendingResult.value : []
  users.value = usersResult.status === 'fulfilled' && Array.isArray(usersResult.value) ? usersResult.value : []
  ownerRequestQueue.value =
    ownerRequestsResult.status === 'fulfilled' && Array.isArray(ownerRequestsResult.value)
      ? ownerRequestsResult.value
      : []
  isLoading.value = false
}

export async function approveAdminRestaurantAction(
  restaurantId,
  actionLoading,
  successMessage,
  errorMessage,
  adminService,
  reload,
) {
  actionLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    await adminService.approveRestaurant(restaurantId)
    successMessage.value = 'Đã duyệt nhà hàng thành công'
    await reload()
  } catch (error) {
    errorMessage.value = error.message || 'Duyệt nhà hàng thất bại'
  } finally {
    actionLoading.value = false
  }
}

export async function rejectAdminRestaurantAction(
  restaurantId,
  actionLoading,
  successMessage,
  errorMessage,
  adminService,
  reload,
) {
  const reason = window.prompt('Nhập lý do từ chối nhà hàng:', 'Thiếu thông tin hồ sơ')
  if (reason === null) return
  actionLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    await adminService.rejectRestaurant(restaurantId, reason)
    successMessage.value = 'Đã từ chối nhà hàng'
    await reload()
  } catch (error) {
    errorMessage.value = error.message || 'Từ chối nhà hàng thất bại'
  } finally {
    actionLoading.value = false
  }
}

export async function toggleAdminUserAction(
  user,
  actionLoading,
  successMessage,
  errorMessage,
  adminService,
  reload,
) {
  actionLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    await adminService.toggleUserActive(user.id, !user.active)
    successMessage.value = `Đã ${user.active ? 'khóa' : 'mở'} tài khoản ${user.fullName || user.email}`
    await reload()
  } catch (error) {
    errorMessage.value = error.message || 'Không thể cập nhật trạng thái người dùng'
  } finally {
    actionLoading.value = false
  }
}
