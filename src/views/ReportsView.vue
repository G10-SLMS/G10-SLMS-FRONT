<template>
  <div class="max-w-full">
    <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div>
        <h1>Reports</h1>
        <p class="mt-1 text-[13px] text-gray-500">Leave activity and trends across the organization</p>
      </div>
      <div class="flex items-center gap-2.5">
        <select v-model="range" class="w-full rounded-md border border-gray-200 bg-white px-2.5 py-[9px] text-[13px] text-gray-700 sm:w-auto">
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="ytd">Year to date</option>
        </select>
        <button class="inline-flex shrink-0 items-center gap-2 rounded-md border-none bg-blue-600 px-4 py-2.5 text-sm text-white cursor-pointer hover:bg-blue-700">
          <Download :size="16" :stroke-width="1.8" />
          Export
        </button>
      </div>
    </div>

    <div class="mb-5 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
      <StatCard :icon="FileText" label="Total Requests" :value="summary.total" color="blue" />
      <StatCard :icon="CheckCircle" label="Approved" :value="summary.approved" color="green" />
      <StatCard :icon="Clock" label="Pending" :value="summary.pending" color="amber" />
      <StatCard :icon="XCircle" label="Rejected" :value="summary.rejected" color="red" />
    </div>

    <div class="mb-5">
      <div class="rounded-[10px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="m-0 text-base">Requests by Leave Type</h2>
        </div>
        <div class="flex flex-col gap-3.5">
          <ReportBarRow
            v-for="row in byType"
            :key="row.name"
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

      <!-- Mobile card list -->
      <ul class="divide-y divide-gray-100 px-5 pb-5 sm:hidden">
        <li v-for="m in monthly" :key="m.month" class="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
          <p class="m-0 text-sm font-semibold text-gray-900">{{ m.month }}</p>
          <div class="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[13px]">
            <div>
              <span class="text-[11px] font-medium uppercase tracking-wide text-gray-400">Submitted</span>
              <p class="m-0 text-gray-700">{{ m.submitted }}</p>
            </div>
            <div>
              <span class="text-[11px] font-medium uppercase tracking-wide text-gray-400">Approved</span>
              <p class="m-0 text-gray-700">{{ m.approved }}</p>
            </div>
            <div>
              <span class="text-[11px] font-medium uppercase tracking-wide text-gray-400">Rejected</span>
              <p class="m-0 text-gray-700">{{ m.rejected }}</p>
            </div>
            <div>
              <span class="text-[11px] font-medium uppercase tracking-wide text-gray-400">Approval Rate</span>
              <p class="m-0 text-gray-700">{{ approvalRate(m) }}%</p>
            </div>
          </div>
        </li>
      </ul>

      <!-- Desktop / tablet table -->
      <div class="hidden w-full overflow-x-auto px-5 pb-5 sm:block">
        <table class="w-full min-w-[560px] border-collapse text-sm md:min-w-0">
          <thead>
            <tr>
              <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Month</th>
              <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Submitted</th>
              <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Approved</th>
              <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Rejected</th>
              <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Approval Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in monthly" :key="m.month" class="border-b border-gray-100 last:border-none">
              <td class="px-2 py-3 text-left">{{ m.month }}</td>
              <td class="px-2 py-3 text-left">{{ m.submitted }}</td>
              <td class="px-2 py-3 text-left">{{ m.approved }}</td>
              <td class="px-2 py-3 text-left">{{ m.rejected }}</td>
              <td class="px-2 py-3 text-left">{{ approvalRate(m) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Download, FileText, CheckCircle, Clock, XCircle } from 'lucide-vue-next'
import StatCard from '@/components/ui/StatCard.vue'
import ReportBarRow from '@/components/reports/ReportBarRow.vue'

const range = ref<'30d' | '90d' | 'ytd'>('30d')

// Placeholder data — will come from GET /api/reports/summary later
const summary = ref({
  total: 142,
  approved: 98,
  pending: 24,
  rejected: 20,
})

const byType = ref([
  { name: 'Sick Leave', count: 52 },
  { name: 'Annual Leave', count: 41 },
  { name: 'Personal Leave', count: 28 },
  { name: 'Emergency Leave', count: 21 },
])

const monthly = ref([
  { month: 'April 2026', submitted: 45, approved: 32, rejected: 5 },
  { month: 'May 2026', submitted: 51, approved: 36, rejected: 7 },
  { month: 'June 2026', submitted: 46, approved: 30, rejected: 8 },
])

const maxCount = computed(() => Math.max(...byType.value.map((r) => r.count), 1))

function barWidth(count: number) {
  return `${Math.round((count / maxCount.value) * 100)}%`
}

function approvalRate(m: { submitted: number; approved: number }) {
  if (!m.submitted) return 0
  return Math.round((m.approved / m.submitted) * 100)
}
</script>
