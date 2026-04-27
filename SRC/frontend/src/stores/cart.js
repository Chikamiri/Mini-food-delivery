import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const note = ref('')
  const _currentUserKey = ref('')

  function _storageKey() {
    return _currentUserKey.value ? `cart_items_${_currentUserKey.value}` : ''
  }

  function _persist() {
    const key = _storageKey()
    if (!key) return
    try { localStorage.setItem(key, JSON.stringify(items.value)) } catch { /* quota */ }
  }

  function _loadFromStorage() {
    const key = _storageKey()
    if (!key) { items.value = []; return }
    try {
      const raw = localStorage.getItem(key)
      items.value = raw ? JSON.parse(raw) : []
    } catch { items.value = [] }
  }

  function setUser(userIdOrEmail) {
    const id = String(userIdOrEmail || 'guest')
    if (_currentUserKey.value === id) return
    _currentUserKey.value = id
    _loadFromStorage()
  }

  watch(items, () => _persist(), { deep: true })

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
    setUser,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setNote,
  }
})
