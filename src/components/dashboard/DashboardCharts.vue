<template>
  <div class="mb-8">
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div class="rounded-[10px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)] lg:col-span-2">
        <div class="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 class="m-0 text-base text-gray-900">Requests Trend</h2>
          <router-link to="/reports" class="text-xs font-medium text-blue-600 hover:text-blue-700">
            View reports
          </router-link>
        </div>
        <p class="mb-3 text-xs text-gray-400">{{ rangeLabel }}</p>

        <DateRangeFilter
          class="mb-3"
          :preset="preset"
          :start-date="customStart"
          :end-date="customEnd"
          @update:preset="onPresetChange"
          @update:start-date="customStart = $event"
          @update:end-date="customEnd = $event"
        />

        <ChartFilterBar
          hide-range-controls
          :status-options="STATUS_OPTIONS"
          :selected-statuses="selectedStatuses"
          @update:selected-statuses="selectedStatuses = $event"
        />

        <p
          v-if="preset === 'custom' && !resolvedRange"
          class="mb-4 rounded-md bg-amber-50 px-3 py-2 text-[13px] text-amber-700"
        >
          Select both a start and end date (end date on or after start date) to load this range.
        </p>

        <div v-if="loading" class="flex h-[220px] items-center justify-center">
          <div class="h-40 w-full animate-pulse rounded-lg bg-gray-100"></div>
        </div>
        <p v-else-if="error" class="text-sm text-red-500">
          {{ error }}
          <button
            class="ml-1 cursor-pointer border-none bg-transparent text-[13px] font-medium text-red-700 underline"
            @click="load"
          >
            Retry
          </button>
        </p>
        <p v-else-if="!visibleMonthlyDatasets.length" class="text-[13px] text-gray-400">
          Select at least one status above to show the trend.
        </p>
        <Chart
          v-else
          type="line"
          :labels="monthlyLabels"
          :datasets="visibleMonthlyDatasets"
          :height="220"
          :show-legend="false"
        />
      </div>

      <div class="rounded-[10px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
        <h2 class="m-0 mb-1 text-base text-gray-900">By Leave Type</h2>
        <p class="mb-4 text-xs text-gray-400">{{ rangeLabel }}</p>

        <div v-if="loading" class="flex h-[220px] items-center justify-center">
          <div class="h-40 w-full animate-pulse rounded-lg bg-gray-100"></div>
        </div>
        <p v-else-if="error" class="text-sm text-red-500">{{ error }}</p>
        <Chart v-else type="donut" :labels="byTypeLabels" :datasets="byTypeDatasets" :height="220" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Chart from '@/components/charts/Chart.vue'
import ChartFilterBar, { type ChartFilterStatusOption } from '@/components/charts/ChartFilterBar.vue'
import DateRangeFilter from '@/components/dashboard/DateRangeFilter.vue'
import { resolveDateRange, type DateRangePreset } from '@/utils/dateRange'
import { reportService } from '@/services/reportService'
import type { ReportByLeaveType, ReportMonthly } from '@/types/stats'
import type { ChartDataset } from '@/components/charts/Chart'

interface StatusDataset extends ChartDataset {
  key: string
}

const PRESET_LABELS: Record<Exclude<DateRangePreset, 'custom'>, string> = {
  today: 'Today',
  last_7_days: 'Last 7 Days',
  last_30_days: 'Last 30 Days',
  this_month: 'This Month',
}

const STATUS_OPTIONS: ChartFilterStatusOption[] = [
  { value: 'submitted', label: 'Submitted', color: '#2563eb' },
  { value: 'approved', label: 'Approved', color: '#16a34a' },
  { value: 'rejected', label: 'Rejected', color: '#dc2626' },
]

const preset = ref<DateRangePreset>('last_30_days')
const customStart = ref('')
const customEnd = ref('')
const selectedStatuses = ref<string[]>(STATUS_OPTIONS.map((s) => s.value))

const loading = ref(true)
const error = ref('')
const monthly = ref<ReportMonthly[]>([])
const byType = ref<ReportByLeaveType[]>([])
const resolvedRange = computed(() => resolveDateRange(preset.value, customStart.value, customEnd.value))

const rangeLabel = computed(() => {
  if (preset.value === 'custom') {
    return resolvedRange.value
      ? `${resolvedRange.value.startDate} to ${resolvedRange.value.endDate}`
      : 'Custom range'
  }
  return PRESET_LABELS[preset.value]
})

const monthlyLabels = computed(() => monthly.value.map((m) => m.month))

const monthlyDatasets = computed<StatusDataset[]>(() => [
  { key: 'submitted', label: 'Submitted', data: monthly.value.map((m) => m.submitted), color: '#2563eb' },
  { key: 'approved', label: 'Approved', data: monthly.value.map((m) => m.approved), color: '#16a34a' },
  { key: 'rejected', label: 'Rejected', data: monthly.value.map((m) => m.rejected), color: '#dc2626' },
])

const visibleMonthlyDatasets = computed<ChartDataset[]>(() =>
  monthlyDatasets.value.filter((d) => selectedStatuses.value.includes(d.key)),
)

const byTypeLabels = computed(() => byType.value.map((t) => t.name))
const byTypeDatasets = computed<ChartDataset[]>(() => [
  { label: 'Requests', data: byType.value.map((t) => t.count) },
])

function onPresetChange(value: DateRangePreset) {
  preset.value = value
}

async function load() {
  const resolved = resolvedRange.value
  if (!resolved) {
    // Waiting on a valid custom range — leave the last successful data on screen.
    return
  }

  loading.value = true
  error.value = ''

  try {

    const data = await reportService.getDashboard({
      range: 'custom',
      startDate: resolved.startDate,
      endDate: resolved.endDate,
    })
    monthly.value = data.monthly
    byType.value = data.by_leave_type
  } catch {
    error.value = 'Failed to load chart data.'
  } finally {
    loading.value = false
  }
}

watch(preset, (newPreset) => {
  if (newPreset !== 'custom') {
    customStart.value = ''
    customEnd.value = ''
  }
  load()
})

watch([customStart, customEnd], () => {
  if (preset.value === 'custom') load()
})

onMounted(load)
</script>
