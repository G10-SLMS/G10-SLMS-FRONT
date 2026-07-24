<template>
  <CalendarPanel
    :view="view"
    :current-date="currentDate"
    :events="events"
    :fetching="fetching"
    :fetch-error="fetchError"
    :auth="auth"
    :leave-type-filter="leaveTypeFilter"
    :date-from="dateFrom"
    :date-to="dateTo"
    :search-query="searchQuery"
    :filtered-leave-types="filteredLeaveTypes"
    @update:current-date="onCurrentDateChange"
    @view-change="onViewChange"
    @search="onSearchInput"
    @leave-type-filter="onLeaveTypeFilterChange"
    @date-from-change="onDateFromChange"
    @date-to-change="onDateToChange"
    @fetch-leave-types="fetchLeaveTypes"
    @retry="fetchEvents"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { leaveService } from '@/services/leaveService'
import { useLeaveFormModalStore } from '@/stores/leaveFormModal'
import CalendarPanel from '@/components/calendar/CalendarPanel.vue'
import type { LeaveType } from '@/types/leave'

const auth = useAuthStore()
const leaveModal = useLeaveFormModalStore()

const searchQuery = ref('')
let searchTimer: ReturnType<typeof setTimeout> | null = null
let currentDateTimer: ReturnType<typeof setTimeout> | null = null

const view = ref<'Day' | 'Week' | 'Month'>('Day')
const currentDate = ref(new Date())

let activeController: AbortController | null = null
let isMounted = true
let fetchSeq = 0

onMounted(async () => {
  await fetchLeaveTypes()
  fetchEvents()
})
onUnmounted(() => {
  isMounted = false
  if (activeController) {
    activeController.abort()
  }
  if (searchTimer) {
    clearTimeout(searchTimer)
    searchTimer = null
  }
  if (currentDateTimer) {
    clearTimeout(currentDateTimer)
    currentDateTimer = null
  }
})

const events = ref<import('@/types/leave').CalendarEvent[]>([])
const fetching = ref(false)
const fetchError = ref<string | null>(null)

const leaveTypeFilter = ref<number | ''>('')
const dateFrom = ref('')
const dateTo = ref('')
const leaveTypes = ref<LeaveType[]>([])

let prevView = view.value

watch([view, currentDate, () => leaveModal.refreshToken], ([v]) => {
  if (v !== prevView) {
    searchQuery.value = ''
    prevView = v
  }
  if (currentDateTimer) clearTimeout(currentDateTimer)
  currentDateTimer = setTimeout(() => {
    fetchEvents()
  }, 150)
})

const filteredLeaveTypes = computed(() => leaveTypes.value)

async function fetchEvents() {
  const seq = ++fetchSeq

  if (activeController) {
    activeController.abort()
  }
  const controller = new AbortController()
  activeController = controller

  fetching.value = true
  fetchError.value = null
  try {
    const { start, end } = viewDateRange(currentDate.value, view.value)
    const result = await leaveService.getLeaveRequestsForCalendar(start, end, {
      controller,
      status: 'approved',
      leave_type_id: leaveTypeFilter.value || undefined,
      view: view.value,
    })
    if (seq !== fetchSeq || !isMounted) return
    events.value = result
  } catch (err: unknown) {
    if (seq !== fetchSeq) return
    if (err instanceof DOMException && err.name === 'AbortError') return
    if (err instanceof Error && err.name === 'CanceledError') return
    if (!isMounted) return
    fetchError.value = 'Unable to load calendar. Please try again.'
    events.value = []
  } finally {
    if (seq === fetchSeq && isMounted) {
      fetching.value = false
    }
  }
}

async function fetchLeaveTypes() {
  try {
    leaveTypes.value = await leaveService.getLeaveTypes()
  } catch {
    leaveTypes.value = []
  }
}

function onSearchInput(value: string) {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (!isMounted) return
    searchQuery.value = value
  }, 300)
}

function onLeaveTypeFilterChange(value: number | '') {
  leaveTypeFilter.value = value
  fetchEvents()
}

function onDateFromChange(value: string) {
  dateFrom.value = value
  fetchEvents()
}

function onDateToChange(value: string) {
  dateTo.value = value
  fetchEvents()
}

function onViewChange(newView: 'Day' | 'Week' | 'Month') {
  view.value = newView
}

function onCurrentDateChange(date: Date) {
  currentDate.value = date
}

function addDaysSingle(date: Date, n: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function viewDateRange(current: Date, v: 'Day' | 'Week' | 'Month') {
  if (v === 'Day') {
    const key = formatDateKey(current)
    return { start: key, end: key }
  }
  if (v === 'Week') {
    const d = new Date(current)
    const day = d.getDay()
    const diff = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + diff)
    d.setHours(0, 0, 0, 0)
    const start = d
    const end = addDaysSingle(start, 6)
    return { start: formatDateKey(start), end: formatDateKey(end) }
  }
  const year = current.getFullYear()
  const month = current.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  return { start: formatDateKey(first), end: formatDateKey(last) }
}
</script>