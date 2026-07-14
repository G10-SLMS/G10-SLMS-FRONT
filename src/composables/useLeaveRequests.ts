import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { leaveService } from '@/services/leaveService'
import type { AxiosError } from 'axios'
import type { LeaveRequestListItem, LeaveType, LeaveRequestPayload } from '@/types/leave'
import {
  AlertOctagon,
  Ban,
  CheckCircle,
  Clock,
} from 'lucide-vue-next'

export function useLeaveRequests() {
  const router = useRouter()
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()

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

  const filters = reactive({
    search: '',
    leave_type_id: '' as string | number,
    status: '',
    date_from: '',
    date_to: '',
  })

  const totalPages = computed(() => lastPage.value)

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

  const stats = computed(() => {
    const pending = items.value.filter((i) => i.status === 'pending').length
    const approved = items.value.filter((i) => i.status === 'approved').length
    const rejected = items.value.filter((i) => i.status === 'rejected').length
    const cancelled = items.value.filter((i) => i.status === 'cancelled').length

    return [
      { icon: Clock, count: pending, label: 'Pending', bg: '#fef3c7', fg: '#d97706' },
      { icon: CheckCircle, count: approved, label: 'Approved', bg: '#dcfce7', fg: '#16a34a' },
      { icon: AlertOctagon, count: rejected, label: 'Rejected', bg: '#fee2e2', fg: '#dc2626' },
      { icon: Ban, count: cancelled, label: 'Cancelled', bg: '#f1f5f9', fg: '#64748b' },
    ]
  })

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
    const d = new Date(dateStr + 'T00:00:00')
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
      items.value = result.data
      total.value = result.total
      lastPage.value = result.last_page
    } catch (err) {
      errMsg.value =
        (err as AxiosError<{ message?: string }>).response?.data?.message || 'Failed to load leave requests.'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  function viewRequest(id: number) {
    router.push(`/leave/${id}/edit`)
  }

  function editRequest(id: number) {
    router.push(`/leave/${id}/edit`)
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
      await fetchRequests(page.value)
    } catch (err) {
      errMsg.value = (err as AxiosError<{ message?: string }>).response?.data?.message || 'Failed to cancel request.'
    } finally {
      cancelling.value = false
    }
  }

  onMounted(async () => {
    try {
      leaveTypes.value = await leaveService.getLeaveTypes()
    } catch {}
    await fetchRequests()
  })

  return {
    authStore,
    items,
    leaveTypes,
    loading,
    errMsg,
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

// Keeps compatibility for future refactors; not used directly in this view.
export type { LeaveRequestPayload }
