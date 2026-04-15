import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'

export function useNotification() {
  const notificationStore = useNotificationStore()

  const notifications = computed(() => notificationStore.items)
  const unreadCount = computed(() => notificationStore.unreadCount)

  function success(message, title = 'Thanh cong') {
    return notificationStore.pushNotification({
      type: 'SYSTEM',
      title,
      message,
    })
  }

  function error(message, title = 'Loi') {
    return notificationStore.pushNotification({
      type: 'SYSTEM',
      title,
      message,
    })
  }

  return {
    notifications,
    unreadCount,
    success,
    error,
    pushNotification: notificationStore.pushNotification,
    markAsRead: notificationStore.markAsRead,
    markAllAsRead: notificationStore.markAllAsRead,
    clearNotifications: notificationStore.clearNotifications,
  }
}
