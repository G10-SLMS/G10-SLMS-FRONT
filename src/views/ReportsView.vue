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
        <ReportFiltersBar
          :range="range"
          :start-date="startDate"
          :end-date="endDate"
          @update:range="range = $event"
          @update:startDate="startDate = $event"
          @update:endDate="endDate = $event"
        />

        <ReportExportMenu
          :disabled="loading || !hasData"
          :exporting="exporting"
          @export="handleExport"
        />
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

      <ResponsiveDataTable
        :rows="monthly"
        :columns="monthlyColumns"
        :loading="loading"
        row-key="month"
        min-width="560px"
        empty-message="No data available for this period."
      >
        <template #mobile-card="{ row }">
          <div class="flex flex-col gap-2">
            <p class="m-0 text-sm font-semibold text-gray-900">{{ row.month }}</p>
            <div class="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[13px]">
              <div>
                <span class="text-[11px] font-medium uppercase tracking-wide text-gray-400"
                  >Submitted</span
                >
                <p class="m-0 text-gray-700">{{ row.submitted }}</p>
              </div>
              <div>
                <span class="text-[11px] font-medium uppercase tracking-wide text-gray-400"
                  >Approved</span
                >
                <p class="m-0 text-gray-700">{{ row.approved }}</p>
              </div>
              <div>
                <span class="text-[11px] font-medium uppercase tracking-wide text-gray-400"
                  >Rejected</span
                >
                <p class="m-0 text-gray-700">{{ row.rejected }}</p>
              </div>
              <div>
                <span class="text-[11px] font-medium uppercase tracking-wide text-gray-400"
                  >Approval Rate</span
                >
                <p class="m-0 text-gray-700">{{ row.approval_rate }}%</p>
              </div>
            </div>
          </div>
        </template>

        <template #desktop-row="{ row }">
          <td class="px-2 py-3 text-left">{{ row.month }}</td>
          <td class="px-2 py-3 text-left">{{ row.submitted }}</td>
          <td class="px-2 py-3 text-left">{{ row.approved }}</td>
          <td class="px-2 py-3 text-left">{{ row.rejected }}</td>
          <td class="px-2 py-3 text-left">{{ row.approval_rate }}%</td>
        </template>
      </ResponsiveDataTable>
    </div>

    <div class="mt-5 rounded-[10px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
      <div class="flex items-center justify-between p-5 pb-4">
        <h2 class="m-0 text-base">Top 10 Students by Leave Requests</h2>
      </div>

      <ResponsiveDataTable
        :rows="topStudents"
        :columns="topStudentColumns"
        :loading="loading"
        row-key="user_id"
        min-width="420px"
        empty-message="No student leave requests in this period."
      >
        <template #mobile-card="{ row, index }">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="m-0 text-sm font-semibold text-gray-900">
                {{ index + 1 }}. {{ row.name }}
              </p>
              <p class="m-0 truncate text-[13px] text-gray-500">{{ row.email }}</p>
            </div>
            <span class="shrink-0 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700">
              {{ row.total_requests }}
            </span>
          </div>
        </template>

        <template #desktop-row="{ row, index }">
          <td class="px-2 py-3 text-left text-gray-500">{{ index + 1 }}</td>
          <td class="px-2 py-3 text-left font-medium text-gray-900">{{ row.name }}</td>
          <td class="px-2 py-3 text-left text-gray-600">{{ row.email }}</td>
          <td class="px-2 py-3 text-right">{{ row.total_requests }}</td>
        </template>
      </ResponsiveDataTable>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-vue-next'
import StatCard from '@/components/ui/StatCard.vue'
import StatCardSkeleton from '@/components/shared/StatCardSkeleton.vue'
import ResponsiveDataTable from '@/components/shared/ResponsiveDataTable.vue'
import type { ResponsiveDataTableColumn } from '@/components/shared/ResponsiveDataTable.vue'
import ReportBarRow from '@/components/reports/ReportBarRow.vue'
import ReportFiltersBar from '@/components/reports/ReportFiltersBar.vue'
import ReportExportMenu from '@/components/reports/ReportExportMenu.vue'
import { useReportData } from '@/composables/reports/useReportData'
import { exportReportToExcel, exportReportToPdf } from '@/utils/reportExport'

const monthlyColumns: ResponsiveDataTableColumn[] = [
  { label: 'Month' },
  { label: 'Submitted' },
  { label: 'Approved' },
  { label: 'Rejected' },
  { label: 'Approval Rate' },
]

const topStudentColumns: ResponsiveDataTableColumn[] = [
  { label: '#' },
  { label: 'Student' },
  { label: 'Email' },
  { label: 'Total Requests', align: 'right' },
]

const {
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
} = useReportData()

const exporting = ref(false)
const exportError = ref('')

async function handleExport(format: 'pdf' | 'excel') {
  exportError.value = ''
  exporting.value = true

  try {
    const payload = {
      rangeLabel: rangeLabel.value,
      summary: summary.value,
      byType: byType.value,
      monthly: monthly.value,
      topStudents: topStudents.value,
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
</script>
