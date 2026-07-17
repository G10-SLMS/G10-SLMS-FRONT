import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useLeaveFormModalStore } from '@/stores/leaveFormModal'
import { leaveService, LEAVE_REQUESTS_API_AVAILABLE } from '@/services/leaveService'
import type { AxiosError } from 'axios'
import type { LeaveRequestListItem, LeaveType } from '@/types/leave'
import {
  AlertOctagon,
  Ban,
  CheckCircle,
  Clock,
} from 'lucide-vue-next'

export function useLeaveRequests() {
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()
  const leaveModal = useLeaveFormModalStore()

  const items = ref<LeaveRequestListItem[]>([])
  const leaveTypes = ref<LeaveType[]>([])
  const loading = ref(true)
  const errMsg = ref('')

  const page = ref(1)
  const total = ref(0)
  const lastPage = ref(1)
  const perPage = ref(10)

  const cancelTarget = ref<LeaveRequestListItem | null>(null)
  const cancelling = ref(false)

  let searchTimeout: ReturnType<typeof setTimeout> | null = null
  let requestSeq = 0

  const filters = reactive({
    search: '',
    leave_type_id: '' as string | number,
    status: '',
    date_from: '',
    date_to: '',
  })

  const totalPages = computed(() => lastPage.value)

  const displayItems = computed(() => {
    return items.value.filter((item) => {
      if (filters.leave_type_id && String(item.leave_type_id) !== String(filters.leave_type_id)) {
        return false
      }
      if (filters.status && item.status !== filters.status) {
        return false
      }
      if (filters.date_from && item.start_date < filters.date_from) {
        return false
      }
      if (filters.date_to && item.end_date > filters.date_to) {
        return false
      }
      if (filters.search) {
        const term = filters.search.trim().toLowerCase()
        const matchesId = String(item.id).includes(term)
        const matchesType = item.leave_type_name.toLowerCase().includes(term)
        if (!matchesId && !matchesType) return false
      }
      return true
    })
  })

  const from = computed(() => (total.value === 0 ? 0 : (page.value - 1) * perPage.value + 1))
  const to = computed(() => Math.min(page.value * perPage.value, total.value))

  const hasActiveFilters = computed(
    () =>
      !!filters.search ||
      !!filters.leave_type_id ||
      !!filters.status ||
      !!filters.date_from ||
      !!filters.date_to,
  )

  const statusCounts = reactive({ pending: 0, approved: 0, rejected: 0, cancelled: 0 })
  const statsLoading = ref(false)

  async function loadStats() {
    if (!LEAVE_REQUESTS_API_AVAILABLE) return
    statsLoading.value = true
    try {

      const [pending, approved, rejected, cancelled] = await Promise.all(
        (['pending', 'approved', 'rejected', 'cancelled'] as const).map((status) =>
          leaveService.getLeaveRequests({ status, per_page: 1 }),
        ),
      )
      statusCounts.pending = pending.total
      statusCounts.approved = approved.total
      statusCounts.rejected = rejected.total
      statusCounts.cancelled = cancelled.total
    } catch {
      // Leave previous counts in place rather than zeroing them on a blip.
    } finally {
      statsLoading.value = false
    }
  }

  const stats = computed(() => [
    { icon: Clock, count: statusCounts.pending, label: 'Pending', bg: '#fef3c7', fg: '#d97706' },
    { icon: CheckCircle, count: statusCounts.approved, label: 'Approved', bg: '#dcfce7', fg: '#16a34a' },
    { icon: AlertOctagon, count: statusCounts.rejected, label: 'Rejected', bg: '#fee2e2', fg: '#dc2626' },
    { icon: Ban, count: statusCounts.cancelled, label: 'Cancelled', bg: '#f1f5f9', fg: '#64748b' },
  ])

  const visiblePages = computed(() => {
    const current = page.value
    const last = lastPage.value
    const delta = 2

    const range: number[] = []
    for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++) range.push(i)

    const pages: number[] = [1]
    if (range[0] > 2) pages.push(-1)
    pages.push(...range)
    if (range[range.length - 1] < last - 1) pages.push(-1)
    if (last > 1) pages.push(last)
    return pages
  })

  function formatDate(dateStr: string): string {
    if (!dateStr) return '—'

    const datePart = dateStr.split('T')[0]
    const d = new Date(datePart + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function statusLabel(status: string): string {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'
  }

  function onSearchDebounced() {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => fetchRequests(1), 400)
  }

  function clearSearch() {
    filters.search = ''
    fetchRequests(1)
  }

  function clearAllFilters() {
    filters.search = ''
    filters.leave_type_id = ''
    filters.status = ''
    filters.date_from = ''
    filters.date_to = ''
    fetchRequests(1)
  }

  async function fetchRequests(p: number = 1) {
    if (!LEAVE_REQUESTS_API_AVAILABLE) {
      errMsg.value = 'Leave requests are not available yet — the backend for this feature hasn\'t shipped.'
      items.value = []
      loading.value = false
      return
    }

    const seq = ++requestSeq

    loading.value = true
    errMsg.value = ''
    page.value = p

    try {
      const params: Record<string, string | number | undefined> = { page: p, per_page: perPage.value }
      if (filters.search) params.search = filters.search
      if (filters.leave_type_id) params.leave_type_id = filters.leave_type_id
      if (filters.status) params.status = filters.status
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to

      const result = await leaveService.getLeaveRequests(params)
      if (seq !== requestSeq) return // a newer request has already superseded this one

      items.value = result.data
      total.value = result.total
      lastPage.value = result.last_page
    } catch (err) {
      if (seq !== requestSeq) return

      errMsg.value =
        (err as AxiosError<{ message?: string }>).response?.data?.message || 'Failed to load leave requests.'
      items.value = []
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  function viewRequest(id: number) {
    leaveModal.openView(id)
  }

  function editRequest(id: number) {
    leaveModal.openEdit(id)
  }

  function confirmCancel(r: LeaveRequestListItem) {
    cancelTarget.value = r
  }

  async function doCancel() {
    if (!cancelTarget.value) return
    cancelling.value = true

    try {
      await leaveService.cancelLeaveRequest(cancelTarget.value.id)
      notificationStore.addNotification({
        message: 'Leave request cancelled successfully.',
        type: 'success',
        read: false,
      })
      cancelTarget.value = null
      await Promise.all([fetchRequests(page.value), loadStats()])
    } catch (err) {
      errMsg.value = (err as AxiosError<{ message?: string }>).response?.data?.message || 'Failed to cancel request.'
    } finally {
      cancelling.value = false
    }
  }

  onMounted(async () => {
    if (!LEAVE_REQUESTS_API_AVAILABLE) {
      loading.value = false
      errMsg.value = 'Leave requests are not available yet — the backend for this feature hasn\'t shipped.'
      return
    }
    await Promise.all([
      leaveService
        .getLeaveTypes()
        .then((types) => (leaveTypes.value = types))
        .catch(() => {}),
      fetchRequests(),
      loadStats(),
    ])
  })

  watch(
    () => leaveModal.refreshToken,
    () => {
      fetchRequests(page.value)
      loadStats()
    },
  )

  return {
    authStore,
    items,
    displayItems,
    leaveTypes,
    loading,
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
  }
}
