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

  function addItem(menuItem, quantity = 1) {
    const existing = items.value.find((item) => item.id === menuItem.id)
    if (existing) {
      existing.quantity += quantity
      return
    }

    items.value.push({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      imageUrl: menuItem.imageUrl ?? null,
      quantity,
    })
  }

  function removeItem(itemId) {
    items.value = items.value.filter((item) => item.id !== itemId)
  }

  function updateQuantity(itemId, quantity) {
    const target = items.value.find((item) => item.id === itemId)
    if (!target) return
    if (quantity <= 0) {
      removeItem(itemId)
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
