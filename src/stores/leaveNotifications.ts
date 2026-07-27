import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationService } from '@/services/notificationService'
import type { LeaveNotificationItem } from '@/types/notification'

export const useLeaveNotificationsStore = defineStore('leaveNotifications', () => {
  // ── State ────────────────────────────────────────────
  const items = ref<LeaveNotificationItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  // ── Getters ──────────────────────────────────────────
  const unreadCount = computed(() => items.value.filter((n) => !n.read).length)

  // ── Fetching ─────────────────────────────────────────
  async function fetchNotifications() {
    loading.value = true
    error.value = null

    try {
      const res = await notificationService.getNotifications()
      items.value = res.data
      loaded.value = true
    } catch {
      error.value = 'Unable to load notifications right now.'
    } finally {
      loading.value = false
    }
  }

  // ── Marking as Read (optimistic) ─────────────────────
  async function markAsRead(id: number) {
    const notif = items.value.find((n) => n.id === id)
    if (!notif || notif.read) return

    notif.read = true
    try {
      await notificationService.markAsRead(id)
    } catch {
      // Keep the optimistic read state even if the sync call fails.
    }
  }

  async function markAllAsRead() {
    const unread = items.value.filter((n) => !n.read)
    if (unread.length === 0) return

    unread.forEach((n) => (n.read = true))
    try {
      await notificationService.markAllAsRead()
    } catch {
      // Keep the optimistic read state even if the sync call fails.
    }
  }

  // ── Realtime Push ────────────────────────────────────
  function receiveRealtime(notification: LeaveNotificationItem) {
    if (items.value.some((n) => n.id === notification.id)) return
    items.value.unshift(notification)
  }

  return {
    items,
    loading,
    error,
    loaded,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    receiveRealtime,
  }
})
