export function incrementCartItem(cartStore, item) {
  cartStore.updateQuantity(item.lineId, item.quantity + 1)
}

export function decrementCartItem(cartStore, item) {
  cartStore.updateQuantity(item.lineId, item.quantity - 1)
}

export function removeCartItem(cartStore, lineId) {
  cartStore.removeItem(lineId)
}

export function formatCartPrice(value) {
  return Number(value || 0).toLocaleString('vi-VN') + 'đ'
}

export function groupCartByRestaurant(cartItems) {
  const groups = {}
  cartItems.forEach((item) => {
    const key = item.restaurantName || 'Nhà hàng'
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  })
  return groups
}

export function goBrowseFromCart(router) {
  router.push('/browse')
}
