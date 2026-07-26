import { computed, onMounted, ref, watch } from 'vue'
import { reportService } from '@/services/reportService'
import type {
  ReportRange,
  ReportSummary,
  ReportByLeaveType,
  ReportMonthly,
  ReportTopStudent,
} from '@/types/stats'

const RANGE_LABELS: Record<Exclude<ReportRange, 'custom'>, string> = {
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  ytd: 'Year to date',
}

export function useReportData() {
  const range = ref<ReportRange>('30d')
  const startDate = ref('')
  const endDate = ref('')

  const loading = ref(false)
  const error = ref('')

  const summary = ref<ReportSummary>({ total: 0, approved: 0, pending: 0, rejected: 0 })
  const byType = ref<ReportByLeaveType[]>([])
  const monthly = ref<ReportMonthly[]>([])
  const topStudents = ref<ReportTopStudent[]>([])
  const resolvedStartDate = ref('')
  const resolvedEndDate = ref('')

  const maxCount = computed(() => Math.max(...byType.value.map((r) => r.count), 1))

  const hasData = computed(
    () =>
      summary.value.total > 0 ||
      byType.value.length > 0 ||
      monthly.value.length > 0 ||
      topStudents.value.length > 0,
  )

  const dateRangeInvalid = computed(() => {
    if (range.value !== 'custom') return false
    if (!startDate.value || !endDate.value) return true
    return new Date(startDate.value) > new Date(endDate.value)
  })

  const rangeLabel = computed(() => {
    if (range.value === 'custom') {
      if (resolvedStartDate.value && resolvedEndDate.value) {
        return `${resolvedStartDate.value} to ${resolvedEndDate.value}`
      }
      return 'Custom range'
    }
    return RANGE_LABELS[range.value]
  })

  function barWidth(count: number) {
    return `${Math.round((count / maxCount.value) * 100)}%`
  }

  async function loadReport() {
    if (range.value === 'custom' && dateRangeInvalid.value) {
      // Wait for the user to finish picking a valid custom range before calling the API.
      return
    }

    loading.value = true
    error.value = ''

    try {
      const data = await reportService.getDashboard({
        range: range.value,
        startDate: startDate.value,
        endDate: endDate.value,
      })
      summary.value = data.summary
      byType.value = data.by_leave_type
      monthly.value = data.monthly
      topStudents.value = data.top_students
      resolvedStartDate.value = data.start_date
      resolvedEndDate.value = data.end_date
    } catch (err) {
      error.value = 'Failed to load report data. Please try again.'
      console.error('[useReportData] Failed to load report data:', err)
      topStudents.value = []
    } finally {
      loading.value = false
    }
  }

  watch(range, (newRange, oldRange) => {
    if (newRange !== 'custom') {
      startDate.value = ''
      endDate.value = ''
    }
    if (newRange !== oldRange) {
      loadReport()
    }
  })

  watch([startDate, endDate], () => {
    if (range.value === 'custom' && !dateRangeInvalid.value) {
      loadReport()
    }
  })

  onMounted(loadReport)

  return {
    range,
    startDate,
    endDate,
    loading,
    error,
    summary,
    byType,
    monthly,
    topStudents,
    hasData,
    dateRangeInvalid,
    rangeLabel,
    barWidth,
    loadReport,
  }
}
