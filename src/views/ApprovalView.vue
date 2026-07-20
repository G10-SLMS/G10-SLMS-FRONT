<template>
  <div class="max-w-full">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Approvals</h1>
        <p class="mt-1 text-sm text-slate-500">Review and act on student leave requests.</p>
      </div>

      <div class="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
        <!-- Search -->
        <div class="relative">
          <Search :size="16" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search student or reason…"
            class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 sm:w-56"
          />
          <button
            v-if="searchQuery"
            type="button"
            aria-label="Clear search"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            @click="searchQuery = ''"
          >
            <X :size="14" />
          </button>
        </div>

        <!-- Leave type filter -->
        <div class="relative">
          <select
            v-model="typeFilter"
            class="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 sm:w-auto"
          >
            <option value="All">All leave types</option>
            <option v-for="type in leaveTypes" :key="type" :value="type">{{ type }}</option>
          </select>
          <ChevronDown :size="14" class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>
    </div>

    <div v-if="errorMsg" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ errorMsg }}
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <template v-if="loading || filteredRequests.length">
        <!-- Mobile card list -->
        <ul class="divide-y divide-slate-100 sm:hidden">
          <template v-if="loading">
            <li v-for="n in 4" :key="n" class="animate-pulse p-4">
              <div class="flex items-center gap-2.5">
                <div class="h-9 w-9 shrink-0 rounded-full bg-slate-200"></div>
                <div class="h-4 w-28 rounded bg-slate-200"></div>
              </div>
              <div class="mt-3 h-4 w-20 rounded bg-slate-200"></div>
              <div class="mt-3 h-4 w-full rounded bg-slate-200"></div>
            </li>
          </template>
          <template v-else>
            <ApprovalCard
              v-for="request in filteredRequests"
              :key="request.id"
              :request="request"
              :show-actions="true"
              @decide="(decision) => handleDecision(request, decision)"
              @view="leaveFormModal.openView(request.id)"
            />
          </template>
        </ul>

        <!-- Desktop / tablet table -->
        <div class="hidden overflow-x-auto sm:block">
          <table class="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/60">
                <th class="whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Student</th>
                <th class="whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Leave Type</th>
                <th class="whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Start Date</th>
                <th class="whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">End Date</th>
                <th class="whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Reason</th>
                <th class="whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Status</th>
                <th class="whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <ApprovalLoadingSkeleton v-if="loading" :rows="4" />
              <template v-else>
                <ApprovalRow
                  v-for="request in filteredRequests"
                  :key="request.id"
                  :request="request"
                  :show-actions="true"
                  class="transition-colors hover:bg-slate-50/60"
                  @decide="(decision) => handleDecision(request, decision)"
                  @view="leaveFormModal.openView(request.id)"
                />
              </template>
            </tbody>
          </table>
        </div>
      </template>

      <div v-else class="flex flex-col items-center justify-center gap-2 px-5 py-16 text-center text-slate-400">
        <SearchX v-if="hasActiveFilters" :size="36" :stroke-width="1.5" />
        <CheckCircle2 v-else :size="36" :stroke-width="1.5" />
        <p class="text-sm">
          {{ hasActiveFilters ? 'No requests match your search or filter.' : 'No pending requests.' }}
        </p>
        <button
          v-if="hasActiveFilters"
          class="mt-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700"
          @click="clearFilters"
        >
          Clear search & filter
        </button>
      </div>
    </div>

    <RejectReasonModal
      :open="rejectTarget !== null"
      :submitting="rejecting"
      @close="rejectTarget = null"
      @confirm="confirmReject"
    />
    <ConfirmDialog
      :open="approveTarget !== null"
      title="Approve Leave Request"
      message="Are you sure you want to approve this leave request?"
      confirm-label="Approve"
      :loading="approving"
      @confirm="confirmApprove"
      @cancel="approveTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CheckCircle2, Search, SearchX, ChevronDown, X } from 'lucide-vue-next'
import ApprovalRow from '@/components/approval/ApprovalRow.vue'
import ApprovalCard from '@/components/approval/ApprovalCard.vue'
import ApprovalLoadingSkeleton from '@/components/approval/ApprovalLoadingSkeleton.vue'
import RejectReasonModal from '@/components/approval/RejectReasonModal.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import { leaveService } from '@/services/leaveService'
import { extractErrorMessage } from '@/utils/errors'
import { formatDate } from '@/utils/date'
import type { RawApiEnvelope, RawLeaveRequest } from '@/types/leave'
import api from '@/services/api'
import type { AxiosError } from 'axios'
import { useLeaveFormModalStore } from '@/stores/leaveFormModal'
import { useNotificationStore } from '@/stores/notification'

const leaveFormModal = useLeaveFormModalStore()
const notificationStore = useNotificationStore()

const searchQuery = ref('')
const typeFilter = ref('All')

interface LeaveRequest {
  id: number
  student: string
  studentAvatarUrl?: string | null
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

const approveTarget = ref<LeaveRequest | null>(null)
const approving = ref(false)

function statusToTab(status: string): LeaveRequest['status'] {
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  return 'Pending'
}

function toRow(raw: RawLeaveRequest): LeaveRequest {
  return {
    id: raw.id,
    student: raw.user?.name ?? `User #${raw.user_id}`,
    studentAvatarUrl: raw.user?.avatar?.url ?? null,
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

const leaveTypes = computed(() => {
  const types = new Set<string>()
  for (const r of requests.value) types.add(r.type)
  return Array.from(types).sort()
})

const hasActiveFilters = computed(() => searchQuery.value.trim().length > 0 || typeFilter.value !== 'All')

const filteredRequests = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return requests.value.filter((r) => {
    // Approvals only ever lists actionable requests — once a request is
    // approved or rejected it drops off this page.
    if (r.status !== 'Pending') return false
    if (typeFilter.value !== 'All' && r.type !== typeFilter.value) return false
    if (query && !r.student.toLowerCase().includes(query) && !r.reason.toLowerCase().includes(query)) {
      return false
    }
    return true
  })
})

function clearFilters() {
  searchQuery.value = ''
  typeFilter.value = 'All'
}

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

  if (decision === 'Approved') {
    approveTarget.value = request
    return
  }
}

async function confirmApprove() {
  if (!approveTarget.value) return
  const request = approveTarget.value
  approving.value = true
  errorMsg.value = ''
  try {
    await leaveService.approveLeaveRequest(request.id)
    request.status = 'Approved'
    notificationStore.addNotification({
      message: 'Leave request approved successfully.',
      type: 'success',
      read: false,
    })
    approveTarget.value = null
  } catch (err) {
    errorMsg.value = friendlyErrorMessage(err)
  } finally {
    approving.value = false
  }
}

async function confirmReject(reason: string) {
  if (!rejectTarget.value) return
  rejecting.value = true
  errorMsg.value = ''
  try {
    await leaveService.rejectLeaveRequest(rejectTarget.value.id, reason)
    rejectTarget.value.status = 'Rejected'
    notificationStore.addNotification({
      message: 'Leave request rejected successfully.',
      type: 'success',
      read: false,
    })
    rejectTarget.value = null
  } catch (err) {
    errorMsg.value = friendlyErrorMessage(err)
  } finally {
    rejecting.value = false
  }
}
</script>
