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
    try {
      localStorage.setItem(key, JSON.stringify({ items: items.value, note: note.value }))
    } catch { /* quota */ }
  }

  function _loadFromStorage() {
    const key = _storageKey()
    if (!key) {
      items.value = []
      note.value = ''
      return
    }
    try {
      const raw = localStorage.getItem(key)
      if (!raw) {
        items.value = []
        note.value = ''
        return
      }
      const parsed = JSON.parse(raw)
      // Legacy: stored as plain items array only
      if (Array.isArray(parsed)) {
        items.value = parsed
        note.value = ''
      } else if (parsed && typeof parsed === 'object') {
        items.value = Array.isArray(parsed.items) ? parsed.items : []
        note.value = typeof parsed.note === 'string' ? parsed.note : ''
      } else {
        items.value = []
        note.value = ''
      }
    } catch {
      items.value = []
      note.value = ''
    }
  }

  function setUser(userIdOrEmail) {
    const id = String(userIdOrEmail || 'guest')
    if (_currentUserKey.value === id) return
    _currentUserKey.value = id
    _loadFromStorage()
  }

  watch(items, () => _persist(), { deep: true })
  watch(note, () => _persist())

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
    if (
      items.value.length > 0 &&
      menuItem.restaurantId != null &&
      items.value[0].restaurantId != null &&
      String(items.value[0].restaurantId) !== String(menuItem.restaurantId)
    ) {
      const confirmed = window.confirm(
        'Giỏ hàng đang có món từ nhà hàng khác. Bạn muốn xóa giỏ hàng cũ và thêm món mới?',
      )
      if (!confirmed) return
      items.value = []
    }

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
    const key = _storageKey()
    if (key) {
      try { localStorage.removeItem(key) } catch { /* ignore */ }
    }
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
