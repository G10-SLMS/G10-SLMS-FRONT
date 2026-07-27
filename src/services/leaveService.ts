import api from './api'
import type {
  CalendarEvent,
  LeaveType,
  LeaveTypePayload,
  LeaveTypeResponse,
  LeaveRequestPayload,
  LeaveRequestResponse,
  LeaveRequestListItem,
  RawApiEnvelope,
  RawLeaveRequest,
} from '@/types/leave'

// ── Internal Helpers: normalize raw API payloads ────────
function toDurationHours(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = typeof value === 'number' ? value : parseFloat(value)
  return Number.isNaN(parsed) ? null : parsed
}

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

// Maps a raw leave request (as returned by the API) into the shape used by list views.
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
    duration_type: raw.duration_type,
    duration_hours: toDurationHours(raw.duration_hours),
    start_time: raw.start_time ?? null,
    end_time: raw.end_time ?? null,
    duration_label: raw.duration_label ?? (raw.duration_type === 'hourly' ? `${toDurationHours(raw.duration_hours) ?? ''} hours` : 'Full day'),
    status: raw.status,
    submission_date: formatSubmissionDate(raw.created_at),
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    reviewed_at: raw.reviewed_at ?? null,
  }
}

// A leave request can have multiple attachments over its edit history; only the newest matters.
function latestAttachment(raw: RawLeaveRequest) {
  const attachments = raw.attachments ?? []
  return attachments.length > 0 ? attachments[attachments.length - 1] : null
}

// Maps a raw leave request into the fuller shape used by detail/review views.
function toRequestResponse(raw: RawLeaveRequest): LeaveRequestResponse {
  const attachment = latestAttachment(raw)
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
    duration_type: raw.duration_type,
    duration_hours: toDurationHours(raw.duration_hours),
    start_time: raw.start_time ?? null,
    end_time: raw.end_time ?? null,
    duration_label: raw.duration_label ?? (raw.duration_type === 'hourly' ? `${toDurationHours(raw.duration_hours) ?? ''} hours` : 'Full day'),
    supporting_document: attachment?.url ?? null,
    supporting_document_name: attachment?.original_name ?? null,
    supporting_document_size: attachment?.size ?? null,
    status: raw.status,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    reviewer: raw.reviewer ?? null,
    reviewed_at: raw.reviewed_at ?? null,
    review_note: raw.review_note ?? null,
    custom_leave_type: raw.custom_leave_type ?? null,
  }
}

export const leaveService = {
  // ── Leave Types (CRUD) ─────────────────────────────
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

  // ── Leave Requests: list, stats, calendar ──────────
  async getLeaveRequests(params?: {
    search?: string
    leave_type_id?: number | string
    status?: string
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
  }) {
    const { date_from, date_to, ...rest } = params ?? {}
    const requestParams = {
      ...rest,
      ...(date_from ? { start_date: date_from } : {}),
      ...(date_to ? { end_date: date_to } : {}),
    }

    const { data } = await api.get<RawApiEnvelope<RawLeaveRequest[]>>('/leave-requests', { params: requestParams })
    const meta = data.meta
    return {
      data: data.data.map(toListItem),
      current_page: meta?.current_page ?? 1,
      last_page: meta?.last_page ?? 1,
      per_page: meta?.per_page ?? 10,
      total: meta?.total ?? data.data.length,
    }
  },

  async getLeaveRequestStats(): Promise<{ pending: number; approved: number; rejected: number; cancelled: number }> {
    const { data } = await api.get<{
      success: boolean
      data: { pending: number; approved: number; rejected: number; cancelled: number }
    }>('/leave-requests/stats')
    return data.data
  },

  async getLeaveRequestsForCalendar(
    dateFrom: string,
    dateTo: string,
    options?: {
      status?: string
      leave_type_id?: number | string
      search?: string
      controller?: AbortController
      view?: 'Day' | 'Week' | 'Month'
    },
  ): Promise<CalendarEvent[]> {

    const REQUEST_TIMEOUT = 20000
    let collected: RawLeaveRequest[] = []
    let lastPage = 1
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    timeoutId = setTimeout(() => {
      options?.controller?.abort()
    }, REQUEST_TIMEOUT)

    const perPage = options?.view === 'Month' ? 500 : 100
    const requestParams: Record<string, string | number> = {
      start_date: dateFrom,
      end_date: dateTo,
      per_page: perPage,
    }
    if (options?.status) requestParams.status = options.status
    if (options?.leave_type_id) requestParams.leave_type_id = options.leave_type_id
    if (options?.search) requestParams.search = options.search

    try {
      const first = await api.get<RawApiEnvelope<RawLeaveRequest[]>>('/leave-requests', {
        params: { ...requestParams, page: 1 },
        signal: options?.controller?.signal,
      })
      collected = collected.concat(first.data.data)
      lastPage = first.data.meta?.last_page ?? 1

      if (lastPage > 1) {
        const remainingPages = Array.from({ length: lastPage - 1 }, (_, i) => i + 2)
        const rest = await Promise.all(
          remainingPages.map((p) =>
            api.get<RawApiEnvelope<RawLeaveRequest[]>>('/leave-requests', {
              params: { ...requestParams, page: p },
              signal: options?.controller?.signal,
            }),
          ),
        )
        for (const { data } of rest) collected = collected.concat(data.data)
      }
    } finally {
      clearTimeout(timeoutId)
      options?.controller?.signal.removeEventListener('abort', () => {})
    }

    return collected.map((raw) => {
      const start = raw.start_date.split('T')[0]
      const end = raw.end_date.split('T')[0]
      return {
        id: raw.id,
        studentId: raw.user_id,
        student: raw.user?.name ?? 'Unknown',
        studentGeneration: raw.user?.generation ?? null,
        studentClassName: raw.user?.class_name ?? null,
        type: raw.leave_type?.name ?? 'Leave',
        status: raw.status,
        startDate: start,
        endDate: end,
        startTime: raw.start_time ?? undefined,
        endTime: raw.end_time ?? undefined,
        leaveTypeId: raw.leave_type_id,
        duration_type: raw.duration_type,
      } as CalendarEvent
    })
  },

  // ── Leave Requests: single-record read/write ───────
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
    formData.append('duration_type', payload.duration_type)
    if (payload.duration_type === 'hourly') {
      if (payload.start_time) formData.append('start_time', payload.start_time)
      if (payload.end_time) formData.append('end_time', payload.end_time)
    }
    if (payload.supporting_document) {
      formData.append('supporting_document', payload.supporting_document)
    }

    const { data } = await api.post<RawApiEnvelope<RawLeaveRequest>>('/leave-requests', formData)
    return toRequestResponse(data.data)
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
    formData.append('duration_type', payload.duration_type)
    if (payload.duration_type === 'hourly') {
      if (payload.start_time) formData.append('start_time', payload.start_time)
      if (payload.end_time) formData.append('end_time', payload.end_time)
    }
    if (payload.supporting_document) {
      formData.append('supporting_document', payload.supporting_document)
    } else if (payload.supporting_document === null) {
      // Explicit null means the user removed the existing attachment without picking a new one.
      formData.append('remove_attachment', '1')
    }
    formData.append('_method', 'PUT')

    const { data } = await api.post<RawApiEnvelope<RawLeaveRequest>>(`/leave-requests/${id}`, formData)
    return toRequestResponse(data.data)
  },

  async cancelLeaveRequest(id: number): Promise<void> {
    await api.put(`/leave-requests/${id}`, { status: 'cancelled' })
  },

  // ── Approval Workflow ────────────────────────────────
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
