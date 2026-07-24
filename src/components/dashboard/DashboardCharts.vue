<template>
  <div class="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
    <div class="rounded-[10px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)] lg:col-span-2">
      <div class="mb-1 flex items-center justify-between">
        <h2 class="m-0 text-base text-gray-900">Requests Trend</h2>
        <router-link
          to="/reports"
          class="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          View reports
        </router-link>
      </div>
      <p class="mb-4 text-xs text-gray-400">Submitted, approved and rejected over the last 30 days</p>

      <div v-if="loading" class="flex h-[220px] items-center justify-center">
        <div class="h-40 w-full animate-pulse rounded-lg bg-gray-100"></div>
      </div>
      <p v-else-if="error" class="text-sm text-red-500">{{ error }}</p>
      <Chart v-else type="line" :labels="monthlyLabels" :datasets="monthlyDatasets" :height="220" />
    </div>

    <div class="rounded-[10px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
      <h2 class="m-0 mb-1 text-base text-gray-900">By Leave Type</h2>
      <p class="mb-4 text-xs text-gray-400">Distribution over the last 30 days</p>

      <div v-if="loading" class="flex h-[220px] items-center justify-center">
        <div class="h-40 w-full animate-pulse rounded-lg bg-gray-100"></div>
      </div>
      <p v-else-if="error" class="text-sm text-red-500">{{ error }}</p>
      <Chart
        v-else
        type="donut"
        :labels="byTypeLabels"
        :datasets="byTypeDatasets"
        :height="220"
        :show-legend="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Chart from '@/components/charts/Chart.vue'
import { reportService } from '@/services/reportService'
import type { ReportByLeaveType, ReportMonthly } from '@/types/stats'
import type { ChartDataset } from '@/components/charts/Chart'

const loading = ref(true)
const error = ref('')
const monthly = ref<ReportMonthly[]>([])
const byType = ref<ReportByLeaveType[]>([])

const monthlyLabels = computed(() => monthly.value.map((m) => m.month))
const monthlyDatasets = computed<ChartDataset[]>(() => [
  { label: 'Submitted', data: monthly.value.map((m) => m.submitted), color: '#2563eb' },
  { label: 'Approved', data: monthly.value.map((m) => m.approved), color: '#16a34a' },
  { label: 'Rejected', data: monthly.value.map((m) => m.rejected), color: '#dc2626' },
])

const byTypeLabels = computed(() => byType.value.map((t) => t.name))
const byTypeDatasets = computed<ChartDataset[]>(() => [
  { label: 'Requests', data: byType.value.map((t) => t.count) },
])

async function load() {
  loading.value = true
  error.value = ''

  try {
    const data = await reportService.getDashboard({ range: '30d' })
    monthly.value = data.monthly
    byType.value = data.by_leave_type
  } catch {
    error.value = 'Failed to load chart data.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
