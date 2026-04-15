export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatOrderStatus(status) {
  const labels = {
    PENDING: 'Cho xac nhan',
    CONFIRMED: 'Da xac nhan',
    PREPARING: 'Dang chuan bi',
    READY: 'San sang giao',
    DELIVERING: 'Dang giao',
    DELIVERED: 'Da giao',
    CANCELLED: 'Da huy',
  }
  return labels[status] || status
}
