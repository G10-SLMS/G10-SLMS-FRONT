import api from './api'
import type { LeaveType, LeaveRequestPayload, LeaveRequestResponse } from '@/types/leave'

export const leaveService = {
  async getLeaveTypes(): Promise<LeaveType[]> {
    const { data } = await api.get<LeaveType[]>('/leave-types')
    return data
  },

  async createLeaveRequest(payload: LeaveRequestPayload): Promise<LeaveRequestResponse> {
    const formData = new FormData()

    if (payload.custom_leave_type) {
      // Custom type: send custom_leave_type + leave_type_id as null
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
}