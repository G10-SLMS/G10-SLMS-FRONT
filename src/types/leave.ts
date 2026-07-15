
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected'

export interface LeaveRequest {
  id: number
  student: string
  type: string
  startDate: string
  endDate: string
  reason: string
  status: LeaveStatus
  processing?: boolean
}

export interface LeaveType {
  id?: number | string
  name: string
  defaultDays: number
  requiresApproval: boolean
  active: boolean
}
