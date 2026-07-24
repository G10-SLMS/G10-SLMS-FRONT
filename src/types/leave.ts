export interface LeaveRequestUser {
  id: number;
  name: string;
  email?: string;
  phone?: string | null;
  gender?: 'male' | 'female' | null;
  student_id?: number | null;
  class_name?: string | null;
  generation?: string | null;
  province?: string | null;
  avatar_id?: number | null;
  avatar?: { id: number; url: string | null } | null;
}

export type LeaveDurationType = 'full_day' | 'hourly';

export const LEAVE_MIN_HOURLY_DURATION = 0.5;
export const LEAVE_MAX_HOURLY_DURATION = 8;
export const LEAVE_HOURLY_DURATION_STEP = 0.5;

export interface LeaveRequestPayload {
  leave_type_id: number | null;
  start_date: string;
  end_date: string;
  reason: string;
  duration_type: LeaveDurationType;
  duration_hours?: number | null;
  start_time?: string | null;
  end_time?: string | null;
  supporting_document?: File | null;
  custom_leave_type?: string | null;
}

export interface RawAttachment {
  id: number;
  original_name: string;
  path: string;
  url: string | null;
  mime_type: string | null;
  size: number | null;
}

export interface LeaveRequestResponse {
  id: number
  user_id: number
  user: LeaveRequestUser | null
  leave_type_id: number
  leave_type_name: string
  start_date: string
  end_date: string
  total_days: number
  reason: string
  status: string
  duration_type: LeaveDurationType
  duration_hours: number | null
  duration_label: string
  start_time?: string | null
  end_time?: string | null
  supporting_document: string | null
  supporting_document_name?: string | null
  supporting_document_size?: number | null
  custom_leave_type?: string | null
  created_at: string
  updated_at: string
  reviewer?: { id: number; name: string } | null
  reviewed_at?: string | null
  review_note?: string | null
}

export interface LeaveRequestListItem {
  id: number;
  user_id: number;
  user: LeaveRequestUser | null;
  leave_type_id: number;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  duration_type: LeaveDurationType;
  duration_hours: number | null;
  start_time: string | null;
  end_time: string | null;
  duration_label: string;
  status: string;
  submission_date: string;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface RawLeaveTypeRef {
  id: number;
  name: string;
  code?: string;
}

export interface RawLeaveRequest {
  id: number;
  user_id: number;
  leave_type_id: number;
  leave_type?: RawLeaveTypeRef | null;
  start_date: string;
  end_date: string;
  reason: string;
  duration_type: LeaveDurationType;
  duration_hours: string | number | null;
  start_time?: string | null;
  end_time?: string | null;
  duration_label?: string;
  status: string;
  review_note?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
  user?: LeaveRequestUser | null;
  reviewer?: { id: number; name: string } | null;
  custom_leave_type?: string | null;
  attachments?: RawAttachment[];
}

export interface RawPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}

export interface RawApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: RawPaginationMeta;
}

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveRequest {
  id: number;
  student: string;
  studentAvatarUrl?: string | null;
  studentId?: number | null;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  processing?: boolean;
}

export interface LeaveType {
  id?: number;
  name: string;
  code: string;
  description: string | null;
  max_days_per_year: number;
  requires_attachment: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface LeaveTypePayload {
  name: string;
  code: string;
  description?: string | null;
  max_days_per_year: number;
  requires_attachment?: boolean;
  is_active?: boolean;
}

export interface LeaveRequestDetail {
  student: string;
  studentAvatarUrl?: string | null;
  leaveType: string;
  reason: string;
  startDate: string;
  endDate: string;
  attachment?: { name: string; url: string } | null;
  status: LeaveStatus;
  reviewer?: string | null;
  reviewDate?: string | null;
  comment?: string | null;
}

export interface CalendarEvent {
  id: number
  studentId: number
  student: string
  studentGeneration?: string | null
  studentClassName?: string | null
  type: string
  status: string
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  leaveTypeId: number
  duration_type: LeaveDurationType
}

export interface LeaveTypeResponse {
  success: boolean;
  message: string;
  data: LeaveType;
}
