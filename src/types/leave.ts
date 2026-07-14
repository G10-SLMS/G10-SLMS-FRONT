export interface LeaveRequestPayload {
  leave_type_id: number | null
  start_date: string
  end_date: string
  reason: string
  supporting_document?: File | null
  custom_leave_type?: string | null
}

export interface LeaveRequestResponse {
  id: number
  user_id: number
  leave_type_id: number
  leave_type_name: string
  start_date: string
  end_date: string
  total_days: number
  reason: string
  supporting_document: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface LeaveRequestListItem {
  id: number
  user_id: number
  leave_type_id: number
  leave_type_name: string
  start_date: string
  end_date: string
  total_days: number
  reason: string
  status: string
  submission_date: string
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: { url: string | null; label: string; active: boolean }[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface LeaveType {
  id: number
  name: string
  description?: string
  default_days?: number
}
