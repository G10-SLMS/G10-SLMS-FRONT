<template>
  <div class="max-w-full">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-gray-900">Approvals</h1>
      <div class="flex gap-0.5 rounded-lg bg-slate-100 p-0.5">
        <button
          v-for="tab in tabs"
          :key="tab"
          type="button"
          class="flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-medium text-slate-500 transition-all"
          :class="activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-800'"
          @click="activeTab = tab"
        >
          {{ tab }}
          <span
            v-if="tab === 'Pending' && pendingCount > 0"
            class="rounded-full bg-cyan-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white"
          >
            {{ pendingCount }}
          </span>
        </button>
      </div>
    </div>

    <div class="overflow-x-auto rounded-xl bg-white shadow-sm border border-gray-100">
      <table v-if="filteredRequests.length" class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-gray-100 bg-gray-50/50">
            <th class="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold text-gray-500">Student</th>
            <th class="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold text-gray-500">Leave Type</th>
            <th class="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold text-gray-500">Start Date</th>
            <th class="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold text-gray-500">End Date</th>
            <th class="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold text-gray-500">Reason</th>
            <th class="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold text-gray-500">Status</th>
            <th v-if="activeTab === 'Pending'" class="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <ApprovalRow
            v-for="request in filteredRequests"
            :key="request.id"
            :request="request"
            :show-actions="activeTab === 'Pending'"
            @decide="(decision) => handleDecision(request, decision)"
          />
        </tbody>
      </table>

      <div v-else class="flex flex-col items-center justify-center gap-2 px-5 py-16 text-center text-gray-400">
        <CheckCircle2 :size="36" :stroke-width="1.5" />
        <p class="text-sm">No {{ activeTab.toLowerCase() }} requests.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CheckCircle2 } from 'lucide-vue-next'
import ApprovalRow from '@/components/approval/ApprovalRow.vue'

const tabs = ['Pending', 'Approved', 'Rejected'] as const
type TabType = (typeof tabs)[number]

const activeTab = ref<TabType>('Pending')

interface LeaveRequest {
  id: number
  student: string
  type: string
  startDate: string
  endDate: string
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
  processing?: boolean
}

// Placeholder data — will come from GET /api/leave-requests?scope=approvals later
const requests = ref<LeaveRequest[]>([
  { id: 1, student: 'Sok Dara', type: 'Sick Leave', startDate: 'Jul 8, 2026', endDate: 'Jul 9, 2026', reason: 'Fever and flu symptoms', status: 'Pending' },
  { id: 2, student: 'Chan Sophea', type: 'Personal Leave', startDate: 'Jul 10, 2026', endDate: 'Jul 10, 2026', reason: 'Family event', status: 'Approved' },
  { id: 3, student: 'Vann Vuthy', type: 'Emergency Leave', startDate: 'Jul 5, 2026', endDate: 'Jul 6, 2026', reason: 'Family emergency', status: 'Rejected' },
  { id: 4, student: 'Ly Sreymom', type: 'Sick Leave', startDate: 'Jul 14, 2026', endDate: 'Jul 15, 2026', reason: 'Medical appointment', status: 'Pending' },
])

const pendingCount = computed(() => requests.value.filter((r) => r.status === 'Pending').length)

const filteredRequests = computed(() =>
  requests.value.filter((r) => r.status === activeTab.value)
)

async function handleDecision(request: LeaveRequest, decision: 'Approved' | 'Rejected') {
  request.processing = true
  try {
    // TODO: replace with real API call
    // await api.patch(`/leave-requests/${request.id}`, { status: decision })
    await new Promise((resolve) => setTimeout(resolve, 400))
    request.status = decision
  } finally {
    request.processing = false
  }
}
</script>
