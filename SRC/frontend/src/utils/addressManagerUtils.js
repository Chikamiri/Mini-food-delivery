export async function fetchAddressesAction(userService, addresses, isLoading, errorMessage) {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const data = await userService.getAddresses()
    addresses.value = Array.isArray(data) ? data : []
  } catch (error) {
    errorMessage.value = error.message || 'Khong the tai dia chi'
  } finally {
    isLoading.value = false
  }
}

export async function setDefaultAddressAction(userService, id, fetchAddresses, errorMessage) {
  try {
    await userService.setDefaultAddress(id)
    await fetchAddresses()
  } catch (error) {
    errorMessage.value = error.message || 'Khong the dat mac dinh'
  }
}
