import api from './api'
import type { RawApiEnvelope } from '@/types/leave'
import type {
  LeaveNotificationItem,
  LeaveNotificationsResponse,
  RawLeaveNotification,
} from '@/types/notification'

function toItem(raw: RawLeaveNotification): LeaveNotificationItem {
  return {
    id: raw.id,
    type: raw.type,
    title: raw.title,
    message: raw.message,
    leave_request_id: raw.leave_request_id,
    actor: raw.actor ?? null,
    read: raw.read_at !== null,
    created_at: raw.created_at,
  }
}

export const notificationService = {
  async getNotifications(): Promise<LeaveNotificationsResponse> {
    const { data } = await api.get<RawApiEnvelope<RawLeaveNotification[]> & { unread_count?: number }>(
      '/notifications',
    )
    return {
      data: data.data.map(toItem),
      unread_count: data.unread_count ?? data.data.filter((n) => n.read_at === null).length,
    }
  },

  async markAsRead(id: number): Promise<void> {
    await api.patch(`/notifications/${id}/read`)
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/read-all')
  },
}
