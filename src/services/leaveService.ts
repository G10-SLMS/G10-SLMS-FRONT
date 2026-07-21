import api from './api'
import type {
  LeaveType,
  LeaveTypePayload,
  LeaveTypeResponse,
  LeaveRequestPayload,
  LeaveRequestResponse,
  LeaveRequestListItem,
  RawApiEnvelope,
  RawLeaveRequest,
} from '@/types/leave'

export const LEAVE_REQUESTS_API_AVAILABLE = true

function formatSubmissionDate(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function toDateOnly(dateStr: string): Date {
  const datePart = dateStr.split('T')[0]
  return new Date(datePart + 'T00:00:00')
}

function totalDaysBetween(start: string, end: string): number {
  const startDate = toDateOnly(start)
  const endDate = toDateOnly(end)
  const diff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(diff + 1, 0)
}

function toListItem(raw: RawLeaveRequest): LeaveRequestListItem {
  return {
    id: raw.id,
    user_id: raw.user_id,
    user: raw.user ?? null,
    leave_type_id: raw.leave_type_id,
    leave_type_name: raw.leave_type?.name ?? 'Leave',
    start_date: raw.start_date.split('T')[0],
    end_date: raw.end_date.split('T')[0],
    total_days: totalDaysBetween(raw.start_date, raw.end_date),
    reason: raw.reason,
    status: raw.status,
    submission_date: formatSubmissionDate(raw.created_at),
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    reviewed_at: raw.reviewed_at ?? null,
  }
}

function toRequestResponse(raw: RawLeaveRequest): LeaveRequestResponse {
  return {
    id: raw.id,
    user_id: raw.user_id,
    user: raw.user ?? null,
    leave_type_id: raw.leave_type_id,
    leave_type_name: raw.leave_type?.name ?? 'Leave',
    start_date: raw.start_date.split('T')[0],
    end_date: raw.end_date.split('T')[0],
    total_days: totalDaysBetween(raw.start_date, raw.end_date),
    reason: raw.reason,
    supporting_document: null,
    status: raw.status,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  }
}

export const leaveService = {
  async getLeaveTypes(): Promise<LeaveType[]> {
    const { data } = await api.get<{ success: boolean; message: string; data: LeaveType[] }>('/leave-types')
    return data.data
  },

  async createLeaveType(payload: LeaveTypePayload): Promise<LeaveType> {
    const { data } = await api.post<LeaveTypeResponse>('/leave-types', payload)
    return data.data
  },

  async updateLeaveType(id: number, payload: Partial<LeaveTypePayload>): Promise<LeaveType> {
    const { data } = await api.put<LeaveTypeResponse>(`/leave-types/${id}`, payload)
    return data.data
  },

  async deleteLeaveType(id: number): Promise<void> {
    await api.delete(`/leave-types/${id}`)
  },

  async getLeaveRequests(params?: {
    search?: string
    leave_type_id?: number | string
    status?: string
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
  }) {
    const { data } = await api.get<RawApiEnvelope<RawLeaveRequest[]>>('/leave-requests', { params })
    const meta = data.meta
    return {
      data: data.data.map(toListItem),
      current_page: meta?.current_page ?? 1,
      last_page: meta?.last_page ?? 1,
      per_page: meta?.per_page ?? 10,
      total: meta?.total ?? data.data.length,
    }
  },

  async getLeaveRequest(id: number): Promise<LeaveRequestResponse> {
    const { data } = await api.get<RawApiEnvelope<RawLeaveRequest>>(`/leave-requests/${id}`)
    return toRequestResponse(data.data)
  },

  async createLeaveRequest(payload: LeaveRequestPayload): Promise<LeaveRequestResponse> {
    const formData = new FormData()

    if (payload.custom_leave_type) {
      formData.append('leave_type_id', '')
      formData.append('custom_leave_type', payload.custom_leave_type)
    } else {
      formData.append('leave_type_id', String(payload.leave_type_id))
    }

    formData.append('start_date', payload.start_date)
    formData.append('end_date', payload.end_date)
    formData.append('reason', payload.reason)
    if (payload.supporting_document) {
      formData.append('supporting_document', payload.supporting_document)
    }

    const { data } = await api.post<RawLeaveRequest>('/leave-requests', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return toRequestResponse(data)
  },

  async updateLeaveRequest(id: number, payload: LeaveRequestPayload): Promise<LeaveRequestResponse> {
    const formData = new FormData()

    if (payload.custom_leave_type) {
      formData.append('leave_type_id', '')
      formData.append('custom_leave_type', payload.custom_leave_type)
    } else {
      formData.append('leave_type_id', String(payload.leave_type_id))
    }

    formData.append('start_date', payload.start_date)
    formData.append('end_date', payload.end_date)
    formData.append('reason', payload.reason)
    if (payload.supporting_document) {
      formData.append('supporting_document', payload.supporting_document)
    }
    formData.append('_method', 'PUT')

    const { data } = await api.post<RawApiEnvelope<RawLeaveRequest>>(`/leave-requests/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return toRequestResponse(data.data)
  },

  async cancelLeaveRequest(id: number): Promise<void> {
    await api.put(`/leave-requests/${id}`, { status: 'cancelled' })
  },

  async approveLeaveRequest(id: number, reviewNote: string): Promise<LeaveRequestResponse> {
    const { data } = await api.put<RawApiEnvelope<RawLeaveRequest>>(`/leave-requests/${id}`, {
      status: 'approved',
      review_note: reviewNote,
    })
    return toRequestResponse(data.data)
  },

  async rejectLeaveRequest(id: number, reviewNote: string): Promise<LeaveRequestResponse> {
    const { data } = await api.put<RawApiEnvelope<RawLeaveRequest>>(`/leave-requests/${id}`, {
      status: 'rejected',
      review_note: reviewNote,
    })
    return toRequestResponse(data.data)
  },
}
