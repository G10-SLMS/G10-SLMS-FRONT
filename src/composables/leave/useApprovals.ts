import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { leaveService } from '@/services/leaveService';
import { extractErrorMessage } from '@/utils/errors';
import { formatDate } from '@/utils/date';
import type { RawApiEnvelope, RawLeaveRequest } from '@/types/leave';
import api from '@/services/api';
import type { AxiosError } from 'axios';
import { useLeaveFormModalStore } from '@/stores/leaveFormModal';
import { useNotificationStore } from '@/stores/notification';
import { usePagination } from '@/composables/shared/usePagination';

export interface LeaveRequest {
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

// ── Status Mapping ────────────────────────────────────────
const STATUS_MAP: Record<string, LeaveRequest['status']> = {
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  pending: 'Pending',
};

function statusToTab(status: string): LeaveRequest['status'] {
  return STATUS_MAP[status] ?? 'Pending';
}

export function useApprovals() {
  // ── Stores & Routing ─────────────────────────────────
  const leaveFormModal = useLeaveFormModalStore();
  const notificationStore = useNotificationStore();
  const route = useRoute();
  const router = useRouter();

  const STATUS_FILTER = 'pending';

  // ── Filters & Pagination State ───────────────────────
  const searchQuery = ref('');
  const typeFilter = ref('All');

  const page = ref(1);
  const lastPage = ref(1);
  const total = ref(0);
  const perPage = ref(10);

  const { from, to, visiblePages } = usePagination(page, lastPage, perPage, total);

  // ── Request List State ───────────────────────────────
  const requests = ref<LeaveRequest[]>([]);
  const loading = ref(true);
  const errorMsg = ref('');

  // ── Review Modal State ───────────────────────────────
  const reviewTarget = ref<{ request: LeaveRequest; mode: 'approve' | 'reject' } | null>(null);
  const reviewSubmitting = ref(false);

  // ── Fetching ─────────────────────────────────────────
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

  // ── Focus/Highlight a Specific Row ───────────────────
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

  // ── Client-Side Filtering ────────────────────────────
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

  // ── Approve/Reject Workflow ──────────────────────────
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

  // ── Lifecycle: initial load + deep-link focus ────────
  onMounted(async () => {
    await fetchRequests();

    const idParam = route.query.request;
    if (idParam) {
      const numericId = Number(idParam);
      if (Number.isFinite(numericId)) focusRequest(numericId);
      router.replace({ query: { ...route.query, request: undefined } });
    }
  });

  return {
    leaveFormModal,
    searchQuery,
    typeFilter,
    page,
    lastPage,
    total,
    perPage,
    from,
    to,
    visiblePages,
    requests,
    loading,
    errorMsg,
    reviewTarget,
    reviewSubmitting,
    fetchRequests,
    highlightedId,
    setRowRef,
    leaveTypes,
    hasActiveFilters,
    filteredRequests,
    clearFilters,
    handleDecision,
    handleReviewConfirm,
  };
}
