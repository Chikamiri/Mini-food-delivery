export function goRestaurantPath(router, path) {
  router.push(path)
}

export function restaurantStatusBadge(status) {
  const s = String(status || '').toUpperCase()
  if (s === 'DELIVERED') return 'badge badge-delivered'
  if (s === 'CANCELLED' || s === 'REJECTED') return 'badge badge-cancelled'
  if (s === 'CONFIRMED') return 'badge badge-confirmed'
  if (s === 'PREPARING' || s === 'READY') return 'badge badge-preparing'
  if (s === 'SHIPPING') return 'badge badge-shipping'
  return 'badge badge-pending'
}

export function restaurantStatusLabel(key) {
  const labels = {
    ALL: 'Tất cả',
    PENDING: 'Chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    PREPARING: 'Đang chuẩn bị',
    READY: 'Sẵn sàng giao',
    SHIPPING: 'Đang giao',
    DELIVERED: 'Đã giao',
    CANCELLED: 'Đã huỷ',
    REJECTED: 'Từ chối',
  }
  return labels[key] || key
}
