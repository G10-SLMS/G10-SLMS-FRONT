export type LeaveNotificationType =
  | 'leave_submitted'
  | 'leave_under_review'
  | 'leave_approved'
  | 'leave_rejected'
  | 'leave_cancelled'
  | 'comment_added'
  | 'comment_reply'
  | 'comment_mention'

export interface LeaveNotificationActor {
  id: number
  name: string
  avatar_id?: number | null
}

export interface LeaveNotificationItem {
  id: number
  type: LeaveNotificationType
  title: string
  message: string
  leave_request_id: number
  actor: LeaveNotificationActor | null
  read: boolean
  created_at: string
}

export interface RawLeaveNotification {
  id: number
  type: LeaveNotificationType
  title: string
  message: string
  leave_request_id: number
  actor?: LeaveNotificationActor | null
  read_at: string | null
  created_at: string
}

export interface LeaveNotificationsResponse {
  data: LeaveNotificationItem[]
  unread_count: number
}
