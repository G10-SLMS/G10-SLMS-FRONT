<template>
  <div class="max-w-full">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 class="m-0">Approvals</h1>
      <div class="flex gap-0.5 rounded-lg bg-slate-100 p-[3px]">
        <button
          v-for="tab in tabs"
          :key="tab"
          class="flex items-center gap-1.5 rounded-md border-none bg-transparent px-3.5 py-[7px] text-[13px] font-medium text-slate-400 cursor-pointer"
          :class="activeTab === tab ? 'bg-white text-blue-600 shadow-[0_1px_2px_rgba(0,0,0,0.06)]' : ''"
          @click="activeTab = tab"
        >
          {{ tab }}
          <span
            v-if="tab === 'Pending' && pendingCount > 0"
            class="rounded-full bg-cyan-400 px-1.5 text-[11px] font-semibold leading-snug text-white"
          >{{ pendingCount }}</span>
        </button>
      </div>
    </div>

    <div class="overflow-x-auto rounded-[10px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
      <table v-if="filteredRequests.length" class="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th class="whitespace-nowrap border-b border-gray-200 px-4 py-3.5 text-left text-[13px] font-medium text-gray-500">Student</th>
            <th class="whitespace-nowrap border-b border-gray-200 px-4 py-3.5 text-left text-[13px] font-medium text-gray-500">Leave Type</th>
            <th class="whitespace-nowrap border-b border-gray-200 px-4 py-3.5 text-left text-[13px] font-medium text-gray-500">Start Date</th>
            <th class="whitespace-nowrap border-b border-gray-200 px-4 py-3.5 text-left text-[13px] font-medium text-gray-500">End Date</th>
            <th class="whitespace-nowrap border-b border-gray-200 px-4 py-3.5 text-left text-[13px] font-medium text-gray-500">Reason</th>
            <th class="whitespace-nowrap border-b border-gray-200 px-4 py-3.5 text-left text-[13px] font-medium text-gray-500">Status</th>
            <th v-if="activeTab === 'Pending'" class="whitespace-nowrap border-b border-gray-200 px-4 py-3.5 text-left text-[13px] font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          <ApprovalRow
            v-for="request in filteredRequests"
            :key="request.id"
            :request="request"
            :show-actions="activeTab === 'Pending'"
            @decide="(decision) => handleDecision(request, decision)"
          />
        </tbody>
      </table>

      <div v-else class="flex flex-col items-center justify-center gap-2.5 px-5 py-[60px] text-center text-gray-400">
        <CheckCircle2 :size="36" :stroke-width="1.5" />
        <p>No {{ activeTab.toLowerCase() }} requests.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CheckCircle2 } from 'lucide-vue-next'
import ApprovalRow from '@/components/approval/ApprovalRow.vue'

const tabs = ['Pending', 'Approved', 'Rejected'] as const
const activeTab = ref<(typeof tabs)[number]>('Pending')

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
