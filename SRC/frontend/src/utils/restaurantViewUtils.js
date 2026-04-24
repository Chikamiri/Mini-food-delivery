export function goRestaurantPath(router, path) {
  router.push(path)
}

export function restaurantStatusBadge(status) {
  const s = String(status || '').toUpperCase()
  if (s === 'DELIVERED') return 'badge badge-delivered'
  if (s === 'CANCELLED') return 'badge badge-cancelled'
  if (s === 'CONFIRMED') return 'badge badge-confirmed'
  return 'badge badge-pending'
}

export function restaurantStatusLabel(key) {
  const labels = {
    ALL: 'Tất cả',
    PENDING: 'Chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    DELIVERED: 'Đã giao',
    CANCELLED: 'Đã huỷ',
  }
  return labels[key] || key
}
