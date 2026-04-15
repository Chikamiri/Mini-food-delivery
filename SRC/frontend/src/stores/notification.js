import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', () => {
  const items = ref([])

  const unreadCount = computed(() =>
    items.value.filter((item) => !item.isRead).length,
  )

  function pushNotification(payload) {
    const notification = {
      id: Date.now(),
      type: payload.type || 'SYSTEM',
      title: payload.title || 'Thong bao',
      message: payload.message || '',
      isRead: false,
      createdAt: new Date().toISOString(),
    }
    items.value = [notification, ...items.value]
    return notification
  }

  function markAsRead(id) {
    items.value = items.value.map((item) =>
      item.id === id ? { ...item, isRead: true } : item,
    )
  }

  function markAllAsRead() {
    items.value = items.value.map((item) => ({ ...item, isRead: true }))
  }

  function clearNotifications() {
    items.value = []
  }

  return {
    items,
    unreadCount,
    pushNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  }
})
