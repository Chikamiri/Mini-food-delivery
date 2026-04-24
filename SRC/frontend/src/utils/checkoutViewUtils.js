export function formatPriceVND(value) {
  return Number(value || 0).toLocaleString('vi-VN') + 'đ'
}

export async function loadCheckoutAddressesAction(userService, deliveryAddresses, selectedAddressId, errorMessage) {
  try {
    const addresses = await userService.getAddresses()
    deliveryAddresses.value = Array.isArray(addresses) ? addresses : []
    selectedAddressId.value =
      deliveryAddresses.value.find((item) => item.isDefault)?.id ||
      deliveryAddresses.value[0]?.id ||
      null
  } catch (error) {
    errorMessage.value = error.message || 'Khong the tai danh sach dia chi'
  }
}

export async function submitCheckoutOrderAction({
  errorMessage,
  successMessage,
  cartItems,
  selectedAddress,
  isSubmitting,
  orderNote,
  orderStore,
  cartStore,
  router,
}) {
  errorMessage.value = ''
  successMessage.value = ''
  if (!cartItems.value.length) {
    errorMessage.value = 'Gio hang dang trong'
    return
  }
  if (!selectedAddress.value) {
    errorMessage.value = 'Vui long chon dia chi giao hang'
    return
  }

  isSubmitting.value = true
  try {
    const firstRestaurantId = cartItems.value.find((item) => item.restaurantId)?.restaurantId
    const payload = {
      restaurantId: firstRestaurantId,
      addressId: selectedAddress.value.id,
      deliveryAddress: selectedAddress.value.addressLine || selectedAddress.value.detail || '',
      deliveryLat: Number(selectedAddress.value.latitude ?? 0),
      deliveryLng: Number(selectedAddress.value.longitude ?? 0),
      paymentMethod: 'COD',
      note: orderNote.value,
      items: cartItems.value.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
        note: item.note || '',
      })),
    }

    if (!payload.restaurantId) {
      errorMessage.value = 'Không tìm thấy nhà hàng của món ăn trong giỏ hàng'
      isSubmitting.value = false
      return
    }
    await orderStore.createOrder(payload)
    cartStore.clearCart()
    successMessage.value = 'Dat don thanh cong'
    setTimeout(() => router.push('/orders/history'), 800)
  } catch (error) {
    errorMessage.value = error.message || 'Khong the dat don'
  } finally {
    isSubmitting.value = false
  }
}
