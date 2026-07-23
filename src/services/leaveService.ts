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

function latestAttachment(raw: RawLeaveRequest) {
  const attachments = raw.attachments ?? []
  return attachments.length > 0 ? attachments[attachments.length - 1] : null
}

function toRequestResponse(raw: RawLeaveRequest): LeaveRequestResponse {
  const attachment = latestAttachment(raw)
  const startParts = raw.start_date.split('T')
  const endParts = raw.end_date.split('T')
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
    supporting_document: attachment?.url ?? null,
    status: raw.status,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    reviewer: raw.reviewer ?? null,
    reviewed_at: raw.reviewed_at ?? null,
    review_note: raw.review_note ?? null,
    start_time: startParts.length > 1 ? startParts[1]! : null,
    end_time: endParts.length > 1 ? endParts[1]! : null,
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

  async getLeaveRequestsForCalendar(
    dateFrom: string,
    dateTo: string,
    controller?: AbortController,
  ): Promise<CalendarEvent[]> {
    const REQUEST_TIMEOUT = 20000
    let collected: RawLeaveRequest[] = []
    let page = 1
    let lastPage = 1
    let timedOut = false
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const abortPromise = new Promise<never>((_, reject) => {
      const reason = controller?.signal?.reason ?? new Error('Request aborted')
      if (controller?.signal?.aborted) {
        reject(reason)
        return
      }
      if (controller) {
        controller.signal.addEventListener(
          'abort',
          () => reject(reason),
          { once: true },
        )
      }
      timeoutId = setTimeout(() => {
        timedOut = true
        controller?.abort()
        reject(new Error(`Calendar request timed out after ${REQUEST_TIMEOUT}ms`))
      }, REQUEST_TIMEOUT)
    })

    try {
      do {
        const { data } = await Promise.race([
          api.get<RawApiEnvelope<RawLeaveRequest[]>>('/leave-requests', {
            params: {
              start_date: dateFrom,
              end_date: dateTo,
              per_page: 500,
              page,
            },
            signal: timedOut ? undefined : controller?.signal,
          }),
          abortPromise,
        ])
        collected = collected.concat(data.data)
        const meta = data.meta
        if (!meta) break
        lastPage = meta.last_page
        page++
      } while (page <= lastPage)
    } finally {
      clearTimeout(timeoutId)
      controller?.signal.removeEventListener('abort', () => {})
    }

    return collected.map((raw) => {
      const start = raw.start_date.split('T')[0]
      const end = raw.end_date.split('T')[0]
      const startParts = raw.start_date.split('T')
      const endParts = raw.end_date.split('T')
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
        startTime: startParts.length > 1 ? startParts[1]! : undefined,
        endTime: endParts.length > 1 ? endParts[1]! : undefined,
      } as CalendarEvent
    })
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
    if (payload.supporting_document) {
      formData.append('supporting_document', payload.supporting_document)
    } else if (payload.supporting_document === null) {
 
      formData.append('remove_attachment', '1')
    }
    formData.append('_method', 'PUT')

    const { data } = await api.post<RawApiEnvelope<RawLeaveRequest>>(`/leave-requests/${id}`, formData)
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
