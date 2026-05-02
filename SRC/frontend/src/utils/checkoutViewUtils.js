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
    errorMessage.value = error.message || 'Không thể tải danh sách địa chỉ'
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
    errorMessage.value = 'Giỏ hàng đang trống'
    return
  }
  if (!selectedAddress.value) {
    errorMessage.value = 'Vui lòng chọn địa chỉ giao hàng'
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

    // Warn if some items have no restaurantId (#21 fix)
    const droppedCount = cartItems.value.length - Object.values(groupsByRestaurant).flat().length
    if (droppedCount > 0) {
      errorMessage.value = `${droppedCount} món trong giỏ hàng thiếu thông tin nhà hàng và sẽ không được đặt.`
    }

    if (!restaurantIds.length) {
      errorMessage.value = 'Không tìm thấy nhà hàng của món ăn trong giỏ hàng'
      isSubmitting.value = false
      return
    }

    // Track successful orders for partial-commit safety (#4 fix)
    const successfulRids = []
    let lastError = null

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
      try {
        await orderStore.createOrder(payload)
        successfulRids.push(rid)
      } catch (err) {
        lastError = err
      }
    }

    if (successfulRids.length === restaurantIds.length) {
      // All succeeded
      cartStore.clearCart()
      successMessage.value = 'Đặt đơn thành công'
      setTimeout(() => router.push('/browse?view=orders'), 800)
    } else if (successfulRids.length > 0) {
      // Partial success — remove only items from successful restaurants
      for (const rid of successfulRids) {
        const items = groupsByRestaurant[rid]
        for (const item of items) {
          cartStore.removeItem(item.lineId)
        }
      }
      errorMessage.value = `Đã đặt ${successfulRids.length}/${restaurantIds.length} đơn. Các món còn lại vẫn trong giỏ hàng.`
    } else {
      errorMessage.value = lastError?.message || 'Không thể đặt đơn'
    }
  } catch (error) {
    errorMessage.value = error.message || 'Không thể đặt đơn'
  } finally {
    isSubmitting.value = false
  }
}
