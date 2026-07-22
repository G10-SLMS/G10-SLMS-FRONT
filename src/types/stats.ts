import type { Component } from 'vue'

export type StatCardColor = 'blue' | 'amber' | 'green' | 'red'

export interface StatCardProps {
  icon: Component | string
  label: string
  value: string | number
  color?: StatCardColor
}

export type ReportRange = '30d' | '90d' | 'ytd' | 'custom'

export interface ReportSummary {
  total: number
  approved: number
  pending: number
  rejected: number
}

export interface ReportByLeaveType {
  leave_type_id: number
  name: string
  count: number
}

export interface ReportMonthly {
  month: string
  submitted: number
  approved: number
  rejected: number
  approval_rate: number
}

export interface ReportTopStudent {
  user_id: number
  name: string
  email: string
  total_requests: number
}

export interface ReportDashboardData {
  range: ReportRange
  start_date: string
  end_date: string
  summary: ReportSummary
  by_leave_type: ReportByLeaveType[]
  monthly: ReportMonthly[]
  top_students: ReportTopStudent[]
}

export interface ReportQueryParams {
  range: ReportRange
  startDate?: string
  endDate?: string
}
