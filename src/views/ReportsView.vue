<template>
  <div class="max-w-full">
    <div
      class="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between"
    >
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Reports</h1>
        <p class="mt-1 text-sm text-gray-500">Leave activity and trends across the organization</p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <select
          v-model="range"
          class="w-full rounded-md border border-gray-200 bg-white px-2.5 py-[9px] text-[13px] text-gray-700 sm:w-auto"
        >
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="ytd">Year to date</option>
          <option value="custom">Custom range</option>
        </select>

        <template v-if="range === 'custom'">
          <input
            v-model="startDate"
            type="date"
            :max="endDate || undefined"
            class="w-full rounded-md border border-gray-200 bg-white px-2.5 py-[9px] text-[13px] text-gray-700 sm:w-auto"
          />
          <span class="text-[13px] text-gray-400">to</span>
          <input
            v-model="endDate"
            type="date"
            :min="startDate || undefined"
            class="w-full rounded-md border border-gray-200 bg-white px-2.5 py-[9px] text-[13px] text-gray-700 sm:w-auto"
          />
        </template>

        <div class="relative">
          <button
            class="inline-flex shrink-0 items-center gap-2 rounded-md border-none bg-blue-600 px-4 py-2.5 text-sm text-white cursor-pointer hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="loading || exporting || !hasData"
            @click="showExportMenu = !showExportMenu"
          >
            <Download :size="16" :stroke-width="1.8" />
            {{ exporting ? 'Exporting…' : 'Export' }}
          </button>

          <div
            v-if="showExportMenu"
            v-click-outside="closeExportMenu"
            class="absolute right-0 z-10 mt-1.5 w-40 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
          >
            <button
              class="block w-full cursor-pointer border-none bg-transparent px-3.5 py-2.5 text-left text-[13px] text-gray-700 hover:bg-gray-50"
              @click="handleExport('pdf')"
            >
              Export as PDF
            </button>
            <button
              class="block w-full cursor-pointer border-none bg-transparent px-3.5 py-2.5 text-left text-[13px] text-gray-700 hover:bg-gray-50"
              @click="handleExport('excel')"
            >
              Export as Excel
            </button>
          </div>
        </div>
      </div>
    </div>

    <p
      v-if="range === 'custom' && dateRangeInvalid"
      class="mb-4 rounded-md bg-amber-50 px-3 py-2 text-[13px] text-amber-700"
    >
      Select both a start and end date (end date on or after start date) to load this range.
    </p>

    <p v-if="error" class="mb-4 rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-600">
      {{ error }}
      <button class="ml-2 cursor-pointer border-none bg-transparent text-[13px] font-medium text-red-700 underline" @click="loadReport">
        Retry
      </button>
    </p>

    <p v-if="exportError" class="mb-4 rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-600">
      {{ exportError }}
    </p>

    <div class="mb-5 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
      <template v-if="loading">
        <StatCardSkeleton v-for="n in 4" :key="n" />
      </template>
      <template v-else>
        <StatCard :icon="FileText" label="Total Requests" :value="summary.total" color="blue" />
        <StatCard :icon="CheckCircle" label="Approved" :value="summary.approved" color="green" />
        <StatCard :icon="Clock" label="Pending" :value="summary.pending" color="amber" />
        <StatCard :icon="XCircle" label="Rejected" :value="summary.rejected" color="red" />
      </template>
    </div>

    <div class="mb-5">
      <div class="rounded-[10px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="m-0 text-base">Requests by Leave Type</h2>
        </div>

        <div v-if="loading" class="flex flex-col gap-3.5">
          <div v-for="n in 4" :key="n" class="h-2.5 animate-pulse rounded-full bg-gray-100"></div>
        </div>
        <p v-else-if="!byType.length" class="text-[13px] text-gray-400">
          No leave requests in this period.
        </p>
        <div v-else class="flex flex-col gap-3.5">
          <ReportBarRow
            v-for="row in byType"
            :key="row.leave_type_id"
            :label="row.name"
            :count="row.count"
            :width-percent="barWidth(row.count)"
          />
        </div>
      </div>
    </div>

    <div class="rounded-[10px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
      <div class="flex items-center justify-between p-5 pb-4">
        <h2 class="m-0 text-base">Monthly Summary</h2>
      </div>

      <TableRowSkeleton v-if="loading" :rows="3" :columns="5" />

      <template v-else>
        <p v-if="!monthly.length" class="px-5 pb-5 text-[13px] text-gray-400">
          No data available for this period.
        </p>

        <template v-else>
          <!-- Mobile card list -->
          <ul class="divide-y divide-gray-100 px-5 pb-5 sm:hidden">
            <li
              v-for="m in monthly"
              :key="m.month"
              class="flex flex-col gap-2 py-3 first:pt-0 last:pb-0"
            >
              <p class="m-0 text-sm font-semibold text-gray-900">{{ m.month }}</p>
              <div class="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[13px]">
                <div>
                  <span class="text-[11px] font-medium uppercase tracking-wide text-gray-400"
                    >Submitted</span
                  >
                  <p class="m-0 text-gray-700">{{ m.submitted }}</p>
                </div>
                <div>
                  <span class="text-[11px] font-medium uppercase tracking-wide text-gray-400"
                    >Approved</span
                  >
                  <p class="m-0 text-gray-700">{{ m.approved }}</p>
                </div>
                <div>
                  <span class="text-[11px] font-medium uppercase tracking-wide text-gray-400"
                    >Rejected</span
                  >
                  <p class="m-0 text-gray-700">{{ m.rejected }}</p>
                </div>
                <div>
                  <span class="text-[11px] font-medium uppercase tracking-wide text-gray-400"
                    >Approval Rate</span
                  >
                  <p class="m-0 text-gray-700">{{ m.approval_rate }}%</p>
                </div>
              </div>
            </li>
          </ul>

          <!-- Desktop / tablet table -->
          <div class="hidden w-full overflow-x-auto px-5 pb-5 sm:block">
            <table class="w-full min-w-[560px] border-collapse text-sm md:min-w-0">
              <thead>
                <tr>
                  <th
                    class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500"
                  >
                    Month
                  </th>
                  <th
                    class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500"
                  >
                    Submitted
                  </th>
                  <th
                    class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500"
                  >
                    Approved
                  </th>
                  <th
                    class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500"
                  >
                    Rejected
                  </th>
                  <th
                    class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500"
                  >
                    Approval Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="m in monthly"
                  :key="m.month"
                  class="border-b border-gray-100 last:border-none"
                >
                  <td class="px-2 py-3 text-left">{{ m.month }}</td>
                  <td class="px-2 py-3 text-left">{{ m.submitted }}</td>
                  <td class="px-2 py-3 text-left">{{ m.approved }}</td>
                  <td class="px-2 py-3 text-left">{{ m.rejected }}</td>
                  <td class="px-2 py-3 text-left">{{ m.approval_rate }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Download, FileText, CheckCircle, Clock, XCircle } from 'lucide-vue-next'
import StatCard from '@/components/ui/StatCard.vue'
import StatCardSkeleton from '@/components/shared/StatCardSkeleton.vue'
import TableRowSkeleton from '@/components/shared/TableRowSkeleton.vue'
import ReportBarRow from '@/components/reports/ReportBarRow.vue'
import { reportService } from '@/services/reportService'
import { exportReportToExcel, exportReportToPdf } from '@/utils/reportExport'
import type { ReportRange, ReportSummary, ReportByLeaveType, ReportMonthly } from '@/types/stats'

const RANGE_LABELS: Record<Exclude<ReportRange, 'custom'>, string> = {
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  ytd: 'Year to date',
}

const range = ref<ReportRange>('30d')
const startDate = ref('')
const endDate = ref('')

const loading = ref(false)
const error = ref('')

const exporting = ref(false)
const exportError = ref('')
const showExportMenu = ref(false)

const summary = ref<ReportSummary>({ total: 0, approved: 0, pending: 0, rejected: 0 })
const byType = ref<ReportByLeaveType[]>([])
const monthly = ref<ReportMonthly[]>([])
const resolvedStartDate = ref('')
const resolvedEndDate = ref('')

const maxCount = computed(() => Math.max(...byType.value.map((r) => r.count), 1))

const hasData = computed(
  () => summary.value.total > 0 || byType.value.length > 0 || monthly.value.length > 0,
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
    resolvedStartDate.value = data.start_date
    resolvedEndDate.value = data.end_date
  } catch (err) {
    error.value = 'Failed to load report data. Please try again.'
    console.error('[ReportsView] Failed to load report data:', err)
  } finally {
    loading.value = false
  }
}

function closeExportMenu() {
  showExportMenu.value = false
}

async function handleExport(format: 'pdf' | 'excel') {
  showExportMenu.value = false
  exportError.value = ''
  exporting.value = true

  try {
    const payload = {
      rangeLabel: rangeLabel.value,
      summary: summary.value,
      byType: byType.value,
      monthly: monthly.value,
    }

    if (format === 'pdf') {
      exportReportToPdf(payload)
    } else {
      exportReportToExcel(payload)
    }
  } catch (err) {
    exportError.value = 'Failed to export the report. Please try again.'
    console.error('[ReportsView] Failed to export report:', err)
  } finally {
    exporting.value = false
  }
}

// Simple click-outside directive scoped to this component (no external deps required).
const vClickOutside = {
  mounted(el: HTMLElement & { __clickOutsideHandler__?: (e: MouseEvent) => void }, binding: { value: () => void }) {
    el.__clickOutsideHandler__ = (event: MouseEvent) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.__clickOutsideHandler__, true)
  },
  unmounted(el: HTMLElement & { __clickOutsideHandler__?: (e: MouseEvent) => void }) {
    if (el.__clickOutsideHandler__) {
      document.removeEventListener('click', el.__clickOutsideHandler__, true)
    }
  },
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
</script>
