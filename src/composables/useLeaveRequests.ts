import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { useLeaveFormModalStore } from '@/stores/leaveFormModal';
import { leaveService, LEAVE_REQUESTS_API_AVAILABLE } from '@/services/leaveService';
import type { AxiosError } from 'axios';
import type { LeaveRequestListItem, LeaveType } from '@/types/leave';
import { AlertOctagon, Ban, CheckCircle, Clock } from 'lucide-vue-next';

export function useLeaveRequests() {
  const authStore = useAuthStore();
  const notificationStore = useNotificationStore();
  const leaveModal = useLeaveFormModalStore();
  const route = useRoute();
  const router = useRouter();

  const items = ref<LeaveRequestListItem[]>([]);
  const leaveTypes = ref<LeaveType[]>([]);
  const loading = ref(true);
  const searching = ref(false);
  const errMsg = ref('');

  const page = ref(1);
  const total = ref(0);
  const lastPage = ref(1);
  const perPage = ref(10);

  const cancelTarget = ref<LeaveRequestListItem | null>(null);
  const cancelling = ref(false);

  let searchTimeout: ReturnType<typeof setTimeout> | null = null;
  let requestSeq = 0;
  let hasLoadedOnce = false;

  const filters = reactive({
    search: '',
    leave_type_id: '' as string | number,
    status: '',
    date_from: '',
    date_to: '',
  });

  const totalPages = computed(() => lastPage.value);

  const from = computed(() => (total.value === 0 ? 0 : (page.value - 1) * perPage.value + 1));
  const to = computed(() => Math.min(page.value * perPage.value, total.value));

  const hasActiveFilters = computed(
    () =>
      !!filters.search ||
      !!filters.leave_type_id ||
      !!filters.status ||
      !!filters.date_from ||
      !!filters.date_to,
  );

  const statusCounts = reactive({ pending: 0, approved: 0, rejected: 0, cancelled: 0 });
  const statsLoading = ref(false);

  async function loadStats() {
    if (!LEAVE_REQUESTS_API_AVAILABLE) return;

    statsLoading.value = true;

    try {
      const counts = await leaveService.getLeaveRequestStats();

      console.log('Stats:', counts);

      statusCounts.pending = counts.pending;
      statusCounts.approved = counts.approved;
      statusCounts.rejected = counts.rejected;
      statusCounts.cancelled = counts.cancelled;
    } finally {
      statsLoading.value = false;
    }
  }

  const stats = computed(() => [
    { icon: Clock, count: statusCounts.pending, label: 'Pending', bg: '#fef3c7', fg: '#d97706' },
    {
      icon: CheckCircle,
      count: statusCounts.approved,
      label: 'Approved',
      bg: '#dcfce7',
      fg: '#16a34a',
    },
    {
      icon: AlertOctagon,
      count: statusCounts.rejected,
      label: 'Rejected',
      bg: '#fee2e2',
      fg: '#dc2626',
    },
    { icon: Ban, count: statusCounts.cancelled, label: 'Cancelled', bg: '#f1f5f9', fg: '#64748b' },
  ]);

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

  function formatDate(dateStr: string): string {
    if (!dateStr) return '—';

    const datePart = dateStr.split('T')[0];
    const d = new Date(datePart + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function statusLabel(status: string): string {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  }

  function syncFiltersFromQuery() {
    const q = route.query;
    filters.search = typeof q.q === 'string' ? q.q : '';
    filters.leave_type_id = typeof q.type === 'string' ? q.type : '';
    filters.status = typeof q.status === 'string' ? q.status : '';
    filters.date_from = typeof q.from === 'string' ? q.from : '';
    filters.date_to = typeof q.to === 'string' ? q.to : '';
    const parsedPage = Number(q.page);
    page.value = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  }

  function syncQueryFromFilters(p: number) {
    const query: Record<string, string> = {};
    if (filters.search) query.q = filters.search;
    if (filters.leave_type_id) query.type = String(filters.leave_type_id);
    if (filters.status) query.status = filters.status;
    if (filters.date_from) query.from = filters.date_from;
    if (filters.date_to) query.to = filters.date_to;
    if (p > 1) query.page = String(p);
    router.replace({ query }).catch(() => {});
  }

  function onSearchDebounced() {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => fetchRequests(1), 400);
  }

  function clearSearch() {
    filters.search = '';
    fetchRequests(1);
  }

  function clearAllFilters() {
    filters.search = '';
    filters.leave_type_id = '';
    filters.status = '';
    filters.date_from = '';
    filters.date_to = '';
    fetchRequests(1);
  }

  async function fetchRequests(p: number = 1) {
    if (!LEAVE_REQUESTS_API_AVAILABLE) {
      errMsg.value =
        "Leave requests are not available yet — the backend for this feature hasn't shipped.";
      items.value = [];
      loading.value = false;
      return;
    }

    const seq = ++requestSeq;

    // Only the very first load blanks the table for the full skeleton.
    // Later fetches (search, filters, pagination) keep existing rows on
    // screen — same feel as the Approve page's real-time search.
    if (hasLoadedOnce) {
      searching.value = true;
    } else {
      loading.value = true;
    }
    errMsg.value = '';
    page.value = p;
    syncQueryFromFilters(p);

    try {
      const params: Record<string, string | number | undefined> = {
        page: p,
        per_page: perPage.value,
      };
      if (filters.search) params.search = filters.search;
      if (filters.leave_type_id) params.leave_type_id = filters.leave_type_id;
      if (filters.status) params.status = filters.status;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;

      const result = await leaveService.getLeaveRequests(params);
      if (seq !== requestSeq) return; // a newer request has already superseded this one

      items.value = result.data;
      total.value = result.total;
      lastPage.value = result.last_page;
    } catch (err) {
      if (seq !== requestSeq) return;

      errMsg.value =
        (err as AxiosError<{ message?: string }>).response?.data?.message ||
        'Failed to load leave requests.';
      items.value = [];
    } finally {
      if (seq === requestSeq) {
        loading.value = false;
        searching.value = false;
        hasLoadedOnce = true;
      }
    }
  }

  function viewRequest(id: number) {
    leaveModal.openView(id);
  }

  function editRequest(id: number) {
    leaveModal.openEdit(id);
  }

  function confirmCancel(r: LeaveRequestListItem) {
    cancelTarget.value = r;
  }

  async function doCancel() {
    if (!cancelTarget.value) return;
    cancelling.value = true;

    try {
      await leaveService.cancelLeaveRequest(cancelTarget.value.id);
      notificationStore.addNotification({
        message: 'Leave request cancelled successfully.',
        type: 'success',
        read: false,
      });
      cancelTarget.value = null;
      await Promise.all([fetchRequests(page.value), loadStats()]);
    } catch (err) {
      errMsg.value =
        (err as AxiosError<{ message?: string }>).response?.data?.message ||
        'Failed to cancel request.';
    } finally {
      cancelling.value = false;
    }
  }

  onMounted(async () => {
    if (!LEAVE_REQUESTS_API_AVAILABLE) {
      loading.value = false;
      errMsg.value =
        "Leave requests are not available yet — the backend for this feature hasn't shipped.";
      return;
    }
    syncFiltersFromQuery();
    await Promise.all([
      leaveService
        .getLeaveTypes()
        .then((types) => (leaveTypes.value = types))
        .catch(() => {}),
      fetchRequests(page.value),
      loadStats(),
    ]);
  });

  watch(
    () => leaveModal.refreshToken,
    () => {
      fetchRequests(page.value);
      loadStats();
    },
  );

  return {
    authStore,
    items,
    leaveTypes,
    loading,
    searching,
    errMsg,
    requestsAvailable: LEAVE_REQUESTS_API_AVAILABLE,
    page,
    total,
    perPage,
    lastPage,
    cancelTarget,
    cancelling,
    filters,
    totalPages,
    from,
    to,
    hasActiveFilters,
    stats,
    statsLoading,
    visiblePages,

    formatDate,
    statusLabel,

    onSearchDebounced,
    clearSearch,
    clearAllFilters,
    fetchRequests,

    viewRequest,
    editRequest,
    confirmCancel,
    doCancel,
  };
}
