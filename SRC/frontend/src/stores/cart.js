import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const note = ref('')

  const itemCount = computed(() =>
    items.value.reduce((total, item) => total + item.quantity, 0),
  )

  const subtotal = computed(() =>
    items.value.reduce((total, item) => total + item.price * item.quantity, 0),
  )

  function normalizeText(value) {
    return String(value || '').trim()
  }

  function buildLineId(menuItem) {
    const itemId = menuItem.id ?? ''
    const size = normalizeText(menuItem.size || 'Vừa')
    const noteText = normalizeText(menuItem.note || '')
    return `${itemId}::${size}::${noteText}`
  }

  function addItem(menuItem, quantity = 1) {
    const lineId = buildLineId(menuItem)
    const existing = items.value.find((item) => item.lineId === lineId)
    if (existing) {
      existing.quantity += quantity
      return
    }

    items.value.push({
      lineId,
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      imageUrl: menuItem.imageUrl ?? null,
      restaurantId: menuItem.restaurantId ?? null,
      restaurantName: menuItem.restaurantName ?? null,
      note: menuItem.note ?? '',
      size: menuItem.size ?? 'Vừa',
      quantity,
    })
  }

  function removeItem(lineId) {
    items.value = items.value.filter((item) => item.lineId !== lineId)
  }

  function updateQuantity(lineId, quantity) {
    const target = items.value.find((item) => item.lineId === lineId)
    if (!target) return
    if (quantity <= 0) {
      removeItem(lineId)
      return
    }
    target.quantity = quantity
  }

  function clearCart() {
    items.value = []
    note.value = ''
  }

  function setNote(value) {
    note.value = value
  }

  return {
    items,
    note,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setNote,
  }
})
