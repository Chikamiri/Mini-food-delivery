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
  selectedOrderType,
  desiredDeliveryTime,
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
  if (selectedOrderType?.value === 'Giao hẹn giờ' && !desiredDeliveryTime?.value) {
    errorMessage.value = 'Vui lòng chọn giờ mong muốn để giao hàng'
    return
  }

  isSubmitting.value = true
  try {
    const groupsByRestaurant = cartItems.value.reduce((acc, item) => {
      const rid = item.restaurantId
      if (!rid) return acc
      if (!acc[rid]) acc[rid] = []
      acc[rid].push(item)
      return acc
    }, {})

    const restaurantIds = Object.keys(groupsByRestaurant)
    if (!restaurantIds.length) {
      errorMessage.value = 'Không tìm thấy nhà hàng của món ăn trong giỏ hàng'
      isSubmitting.value = false
      return
    }

    // Create one order per restaurant to match backend model
    for (const rid of restaurantIds) {
      const items = groupsByRestaurant[rid]
      const flowTags = []
      if (selectedOrderType?.value === 'Nhận tại quán') flowTags.push('[FLOW:PICKUP_AT_STORE]')
      if (selectedOrderType?.value === 'Giao hẹn giờ' && desiredDeliveryTime?.value) {
        flowTags.push(`[SCHEDULED_AT:${desiredDeliveryTime.value}]`)
      }
      const mergedNote = [flowTags.join(' '), orderNote.value || ''].filter(Boolean).join(' ').trim()
      const payload = {
        restaurantId: Number(rid),
        addressId: selectedAddress.value.id,
        deliveryAddress: selectedAddress.value.addressLine || selectedAddress.value.detail || '',
        deliveryLat: Number(selectedAddress.value.latitude ?? 0),
        deliveryLng: Number(selectedAddress.value.longitude ?? 0),
        paymentMethod: 'COD',
        note: mergedNote,
        items: items.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
          note: item.note || '',
        })),
      }
      await orderStore.createOrder(payload)
    }

    cartStore.clearCart()
    successMessage.value = 'Đặt đơn thành công'
    setTimeout(() => router.push('/orders/history'), 800)
  } catch (error) {
    errorMessage.value = error.message || 'Không thể đặt đơn'
  } finally {
    isSubmitting.value = false
  }
}
