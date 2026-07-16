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

    <div v-if="errorMsg" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ errorMsg }}
    </div>

    <div class="overflow-x-auto rounded-xl bg-white shadow-sm border border-gray-100">
      <div v-if="loading" class="px-5 py-16 text-center text-sm text-gray-400">Loading requests…</div>
      <table v-else-if="filteredRequests.length" class="w-full border-collapse text-sm">
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

    <RejectReasonModal
      :open="rejectTarget !== null"
      :submitting="rejecting"
      @close="rejectTarget = null"
      @confirm="confirmReject"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CheckCircle2 } from 'lucide-vue-next'
import ApprovalRow from '@/components/approval/ApprovalRow.vue'
import RejectReasonModal from '@/components/approval/RejectReasonModal.vue'
import { leaveService } from '@/services/leaveService'
import { extractErrorMessage } from '@/utils/errors'
import type { RawApiEnvelope, RawLeaveRequest } from '@/types/leave'
import api from '@/services/api'
import type { AxiosError } from 'axios'

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

const requests = ref<LeaveRequest[]>([])
const loading = ref(true)
const errorMsg = ref('')

const rejectTarget = ref<LeaveRequest | null>(null)
const rejecting = ref(false)

function statusToTab(status: string): TabType {
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  return 'Pending'
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function toRow(raw: RawLeaveRequest): LeaveRequest {
  return {
    id: raw.id,
    student: raw.user?.name ?? `User #${raw.user_id}`,
    type: raw.leave_type?.name ?? 'Leave',
    startDate: formatDate(raw.start_date),
    endDate: formatDate(raw.end_date),
    reason: raw.reason,
    status: statusToTab(raw.status),
  }
}

async function loadRequests() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await api.get<RawApiEnvelope<RawLeaveRequest[]>>('/leave-requests', {
      params: { per_page: 100 },
    })
    requests.value = data.data.map(toRow)
  } catch (err) {
    errorMsg.value = extractErrorMessage(err, 'Failed to load leave requests.')
  } finally {
    loading.value = false
  }
}

onMounted(loadRequests)

const pendingCount = computed(() => requests.value.filter((r) => r.status === 'Pending').length)

const filteredRequests = computed(() =>
  requests.value.filter((r) => r.status === activeTab.value)
)

function friendlyErrorMessage(err: unknown): string {
  const status = (err as AxiosError)?.response?.status
  if (status === 403) {
    return 'Only accounts with the "trainer" role can approve or reject requests. ' +
      'The backend currently blocks admins and students from this action (see routes/api.php).'
  }
  return extractErrorMessage(err, 'Failed to update this request.')
}

async function handleDecision(request: LeaveRequest, decision: 'Approved' | 'Rejected') {
  if (decision === 'Rejected') {
    rejectTarget.value = request
    return
  }

  request.processing = true
  errorMsg.value = ''
  try {
    await leaveService.approveLeaveRequest(request.id)
    request.status = 'Approved'
  } catch (err) {
    errorMsg.value = friendlyErrorMessage(err)
  } finally {
    request.processing = false
  }
}

async function confirmReject(reason: string) {
  if (!rejectTarget.value) return
  rejecting.value = true
  errorMsg.value = ''
  try {
    await leaveService.rejectLeaveRequest(rejectTarget.value.id, reason)
    rejectTarget.value.status = 'Rejected'
    rejectTarget.value = null
  } catch (err) {
    errorMsg.value = friendlyErrorMessage(err)
  } finally {
    rejecting.value = false
  }
}
</script>
