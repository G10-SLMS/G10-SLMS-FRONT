import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Notification {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  read: boolean
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])

  function addNotification(notification: Omit<Notification, 'id'>) {
    notifications.value.push({
      id: Date.now(),
      ...notification,
    })
  }

  function markAsRead(id: number) {
    const notif = notifications.value.find((n) => n.id === id)
    if (notif) {
      notif.read = true
    }
  }

  function clearNotifications() {
    notifications.value = []
  }

  function removeNotification(id: number) {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  return { notifications, addNotification, markAsRead, clearNotifications, removeNotification }
})