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

export interface ReportFrequentStudent {
  user_id: number
  name: string
  email: string
  /** e.g. "2026-07" */
  period: string
  /** e.g. "July 2026" */
  month_label: string
  request_count: number
}

export interface ReportDashboardData {
  range: ReportRange
  start_date: string
  end_date: string
  summary: ReportSummary
  by_leave_type: ReportByLeaveType[]
  monthly: ReportMonthly[]
  frequent_students: ReportFrequentStudent[]
}

export interface ReportQueryParams {
  range: ReportRange
  startDate?: string
  endDate?: string
}
