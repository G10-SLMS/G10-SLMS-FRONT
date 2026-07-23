import api from './api'
import type { RawApiEnvelope } from '@/types/leave'
import type { ReportDashboardData, ReportQueryParams } from '@/types/stats'

export const reportService = {
  async getDashboard(params: ReportQueryParams): Promise<ReportDashboardData> {
    const { range, startDate, endDate } = params

    const { data } = await api.get<RawApiEnvelope<ReportDashboardData>>('/reports/summary', {
      params: {
        range,
        ...(range === 'custom' ? { start_date: startDate, end_date: endDate } : {}),
      },
    })

    return data.data
  },
}
