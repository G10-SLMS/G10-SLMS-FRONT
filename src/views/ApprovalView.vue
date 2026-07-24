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
          <Search
            :size="16"
            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search student, ID or reason…"
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
          <ChevronDown
            :size="14"
            class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>
    </div>

    <div
      v-if="errorMsg"
      class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
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
              :ref="(el) => setRowRef(request.id, el)"
              :request="request"
              :show-actions="true"
              :class="
                request.id === highlightedId
                  ? 'bg-cyan-50 ring-2 ring-inset ring-cyan-400 transition-colors duration-700'
                  : 'transition-colors duration-700'
              "
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
                <th
                  class="whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                >
                  Student
                </th>
                <th
                  class="whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                >
                  Student ID
                </th>
                <th
                  class="whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                >
                  Leave Type
                </th>
                <th
                  class="whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                >
                  Start Date
                </th>
                <th
                  class="whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                >
                  End Date
                </th>
                <th
                  class="whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                >
                  Reason
                </th>
                <th
                  class="whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                >
                  Status
                </th>
                <th
                  class="whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <ApprovalLoadingSkeleton v-if="loading" :rows="4" />
              <template v-else>
                <ApprovalRow
                  v-for="request in filteredRequests"
                  :key="request.id"
                  :ref="(el) => setRowRef(request.id, el)"
                  :request="request"
                  :show-actions="true"
                  :class="[
                    'transition-colors duration-700 hover:bg-slate-50/60',
                    request.id === highlightedId ? 'bg-cyan-50' : '',
                  ]"
                  @decide="(decision) => handleDecision(request, decision)"
                  @view="leaveFormModal.openView(request.id)"
                />
              </template>
            </tbody>
          </table>
        </div>
      </template>

      <div
        v-else
        class="flex flex-col items-center justify-center gap-2 px-5 py-16 text-center text-slate-400"
      >
        <SearchX v-if="hasActiveFilters" :size="36" :stroke-width="1.5" />
        <CheckCircle2 v-else :size="36" :stroke-width="1.5" />
        <p class="text-sm">
          {{
            hasActiveFilters ? 'No requests match your search or filter.' : 'No pending requests.'
          }}
        </p>
        <button
          v-if="hasActiveFilters"
          class="mt-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700"
          @click="clearFilters"
        >
          Clear search & filter
        </button>
      </div>

      <LeaveRequestsPagination
        v-if="!loading && filteredRequests.length > 0"
        :page="page"
        :totalPages="lastPage"
        :total="total"
        :from="from"
        :to="to"
        :perPage="perPage"
        :visiblePages="visiblePages"
        :fetchRequests="fetchRequests"
        @update:per-page="
          perPage = $event;
          fetchRequests(1);
        "
      />
    </div>

    <ReviewCommentModal
      :open="reviewTarget !== null"
      :mode="reviewTarget?.mode ?? 'approve'"
      :student-name="reviewTarget?.request.student"
      :submitting="reviewSubmitting"
      @close="reviewTarget = null"
      @confirm="handleReviewConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CheckCircle2, Search, SearchX, ChevronDown, X } from 'lucide-vue-next';
import ApprovalRow from '@/components/approval/ApprovalRow.vue';
import ApprovalCard from '@/components/approval/ApprovalCard.vue';
import ApprovalLoadingSkeleton from '@/components/approval/ApprovalLoadingSkeleton.vue';
import ReviewCommentModal from '@/components/approval/ReviewCommentModal.vue';
import LeaveRequestsPagination from '@/components/leave-request/LeaveRequestsPagination.vue';
import { leaveService } from '@/services/leaveService';
import { extractErrorMessage } from '@/utils/errors';
import { formatDate } from '@/utils/date';
import type { RawApiEnvelope, RawLeaveRequest } from '@/types/leave';
import api from '@/services/api';
import type { AxiosError } from 'axios';
import { useLeaveFormModalStore } from '@/stores/leaveFormModal';
import { useNotificationStore } from '@/stores/notification';

const leaveFormModal = useLeaveFormModalStore();
const notificationStore = useNotificationStore();
const route = useRoute();
const router = useRouter();

const searchQuery = ref('');
const typeFilter = ref('All');
const STATUS_FILTER = 'pending';

const page = ref(1);
const lastPage = ref(1);
const total = ref(0);
const perPage = ref(10);

const from = computed(() => (total.value === 0 ? 0 : (page.value - 1) * perPage.value + 1));
const to = computed(() => Math.min(page.value * perPage.value, total.value));

const visiblePages = computed(() => {
  const current = page.value;
  const last = lastPage.value;
  const delta = 2;
  const range: number[] = [];
  for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++)
    range.push(i);
  const pages: number[] = [1];
  if (range[0] > 2) pages.push(-1);
  pages.push(...range);
  if (range[range.length - 1] < last - 1) pages.push(-1);
  if (last > 1) pages.push(last);
  return pages;
});

interface LeaveRequest {
  id: number;
  student: string;
  studentAvatarUrl?: string | null;
  studentId?: number | null;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  processing?: boolean;
}

const STATUS_MAP: Record<string, LeaveRequest['status']> = {
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  pending: 'Pending',
};

function statusToTab(status: string): LeaveRequest['status'] {
  return STATUS_MAP[status] ?? 'Pending';
}

const requests = ref<LeaveRequest[]>([]);
const loading = ref(true);
const errorMsg = ref('');

const reviewTarget = ref<{ request: LeaveRequest; mode: 'approve' | 'reject' } | null>(null);
const reviewSubmitting = ref(false);

function toRow(raw: RawLeaveRequest): LeaveRequest {
  return {
    id: raw.id,
    student: raw.user?.name ?? `User #${raw.user_id}`,
    studentAvatarUrl: raw.user?.avatar?.url ?? null,
    studentId: raw.user?.student_id ?? null,
    type: raw.leave_type?.name ?? 'Leave',
    startDate: formatDate(raw.start_date),
    endDate: formatDate(raw.end_date),
    reason: raw.reason,
    status: statusToTab(raw.status),
  };
}

async function fetchRequests(p?: number) {
  loading.value = true;
  errorMsg.value = '';
  if (p !== undefined) page.value = p;
  try {
    const { data } = await api.get<RawApiEnvelope<RawLeaveRequest[]>>('/leave-requests', {
      params: {
        page: page.value,
        per_page: perPage.value,
        status: STATUS_FILTER,
      },
    });
    requests.value = data.data.map(toRow);
    if (data.meta) {
      page.value = data.meta.current_page;
      lastPage.value = data.meta.last_page;
      total.value = data.meta.total;
    }
  } catch (err) {
    errorMsg.value = extractErrorMessage(err, 'Failed to load leave requests.');
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await fetchRequests();

  const idParam = route.query.request;
  if (idParam) {
    const numericId = Number(idParam);
    if (Number.isFinite(numericId)) focusRequest(numericId);
    router.replace({ query: { ...route.query, request: undefined } });
  }
});

const highlightedId = ref<number | null>(null);
const rowRefs = new Map<number, { $el?: HTMLElement } | HTMLElement>();

function setRowRef(id: number, el: { $el?: HTMLElement } | HTMLElement | null) {
  if (el) rowRefs.set(id, el);
  else rowRefs.delete(id);
}

async function focusRequest(id: number) {
  highlightedId.value = id;
  await nextTick();

  const el = rowRefs.get(id);
  const domEl = el && '$el' in el ? el.$el : el;
  domEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  setTimeout(() => {
    if (highlightedId.value === id) highlightedId.value = null;
  }, 3000);
}

const leaveTypes = computed(() => {
  const types = new Set<string>();
  for (const r of requests.value) types.add(r.type);
  return Array.from(types).sort();
});

const hasActiveFilters = computed(
  () => searchQuery.value.trim().length > 0 || typeFilter.value !== 'All',
);

const filteredRequests = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return requests.value.filter((r) => {
    if (typeFilter.value !== 'All' && r.type !== typeFilter.value) return false;
    if (query) {
      const studentIdStr = r.studentId != null ? String(r.studentId) : '';
      const matches =
        r.student.toLowerCase().includes(query) ||
        r.reason.toLowerCase().includes(query) ||
        studentIdStr.includes(query);
      if (!matches) return false;
    }
    return true;
  });
});

function clearFilters() {
  searchQuery.value = '';
  typeFilter.value = 'All';
  fetchRequests(1);
}

function friendlyErrorMessage(err: unknown): string {
  const status = (err as AxiosError)?.response?.status;
  if (status === 403) {
    return 'Only educators can approve or reject requests. You don\'t have permission to take this action.';
  }
  return extractErrorMessage(err, 'Failed to update this request.');
}

function handleDecision(request: LeaveRequest, decision: 'Approved' | 'Rejected') {
  reviewTarget.value = {
    request,
    mode: decision === 'Approved' ? 'approve' : 'reject',
  };
}

async function handleReviewConfirm(note: string) {
  if (!reviewTarget.value) return;
  const { request, mode } = reviewTarget.value;
  reviewSubmitting.value = true;
  errorMsg.value = '';
  try {
    if (mode === 'approve') {
      await leaveService.approveLeaveRequest(request.id, note);
      request.status = 'Approved';
      notificationStore.addNotification({
        message: 'Leave request approved successfully.',
        type: 'success',
        read: false,
      });
    } else {
      await leaveService.rejectLeaveRequest(request.id, note);
      request.status = 'Rejected';
      notificationStore.addNotification({
        message: 'Leave request rejected successfully.',
        type: 'success',
        read: false,
      });
    }
    reviewTarget.value = null;
  } catch (err) {
    errorMsg.value = friendlyErrorMessage(err);
  } finally {
    reviewSubmitting.value = false;
  }
}
</script>
