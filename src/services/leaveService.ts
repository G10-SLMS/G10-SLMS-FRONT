import api from './api'
import type { LeaveType, LeaveRequestPayload, LeaveRequestResponse, LeaveRequestListItem, PaginatedResponse } from '@/types/leave'

export const leaveService = {
  async getLeaveTypes(): Promise<LeaveType[]> {
    const { data } = await api.get<{ success: boolean; message: string; data: LeaveType[] }>('/leave-types')
    return data.data
  },

  async getLeaveRequests(params?: {
    search?: string
    leave_type_id?: number
    status?: string
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
  }): Promise<PaginatedResponse<LeaveRequestListItem>> {
    const { data } = await api.get<PaginatedResponse<LeaveRequestListItem>>('/leave-requests', { params })
    return data
  },

  async getLeaveRequest(id: number): Promise<LeaveRequestResponse> {
    const { data } = await api.get<LeaveRequestResponse>(`/leave-requests/${id}`)
    return data
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

    const { data } = await api.post<LeaveRequestResponse>('/leave-requests', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
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

    const { data } = await api.post<LeaveRequestResponse>(`/leave-requests/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { _method: 'PUT' },
    })
    return data
  },

  async cancelLeaveRequest(id: number): Promise<void> {
    await api.patch(`/leave-requests/${id}/cancel`)
  },
}
