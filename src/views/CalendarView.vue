<template>
  <div class="flex h-[calc(100vh-120px)] max-w-full flex-col">
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div class="flex flex-wrap items-center gap-2 sm:gap-3">
        <button class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-none bg-cyan-400/20 text-cyan-600 cursor-default" aria-hidden="true">
          <CalendarDays :size="20" :stroke-width="1.8" />
        </button>
        <h1 class="m-0">Calendar</h1>
        <button
          class="h-[34px] shrink-0 rounded-md border border-gray-200 bg-white px-3.5 text-[13px] font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
          @click="goToday"
        >Today</button>
        <div class="flex shrink-0 gap-1">
          <button
            class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 cursor-pointer hover:bg-gray-100"
            :aria-label="prevLabel"
            @click="prev"
          >
            <ChevronLeft :size="18" :stroke-width="1.8" />
          </button>
          <button
            class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 cursor-pointer hover:bg-gray-100"
            :aria-label="nextLabel"
            @click="next"
          >
            <ChevronRight :size="18" :stroke-width="1.8" />
          </button>
        </div>
        <span class="text-sm font-semibold text-gray-800 sm:text-base">{{ rangeLabel }}</span>
      </div>

      <div class="flex items-center gap-3">
        <div class="relative hidden sm:block">
          <Search class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            :value="searchQuery"
            @input="onSearchInput(($event.target as HTMLInputElement).value)"
            class="h-9 w-48 rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400"
          />
        </div>

        <div class="flex gap-0.5 rounded-lg bg-slate-100 p-[3px]">
          <button
            v-for="v in viewOptions"
            :key="v"
            class="rounded-md border-none bg-transparent px-3.5 py-1.5 text-[13px] font-medium text-slate-400 cursor-pointer"
            :class="view === v ? 'bg-white text-cyan-500 shadow-[0_1px_2px_rgba(0,0,0,0.06)]' : ''"
            @click="view = v"
          >
            {{ v }}
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 min-h-0 overflow-hidden rounded-[10px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
  <div v-if="fetching" class="flex h-full flex-col gap-3 p-6">
    <p class="text-sm text-gray-500">Loading leave requests...</p>
    <div class="flex-1 animate-pulse flex-col gap-3">
      <div v-for="n in 6" :key="n" class="h-14 w-full rounded-sm bg-slate-100"></div>
      <div v-if="view === 'Week'" class="grid grid-cols-7 gap-3">
        <div v-for="n in 14" :key="n" class="h-14 rounded-sm bg-slate-100"></div>
      </div>
    </div>
  </div>

      <div v-else-if="fetchError" class="flex flex-col items-center justify-center gap-3 px-5 py-20">
        <AlertCircle :size="40" class="text-red-400" />
        <p class="text-sm text-gray-600">{{ fetchError }}</p>
        <button
          class="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-600"
          @click="fetchEvents"
        >
          Try again
        </button>
      </div>

      <div v-else-if="filteredEvents.length === 0" class="flex flex-col items-center justify-center gap-3 px-5 py-20">
        <template v-if="auth.isTrainer">
          <AlertTriangle :size="40" class="text-amber-400" />
          <p class="text-sm text-gray-500">No leave requests found for your assigned students.</p>
        </template>
        <template v-else-if="searchQuery.trim().length > 0">
          <Inbox :size="40" class="text-gray-300" />
          <p class="text-sm text-gray-500">Try adjusting your search or filters.</p>
        </template>
        <template v-else>
          <Inbox :size="40" class="text-gray-300" />
          <p class="text-sm text-gray-500">No leave requests found.</p>
        </template>
      </div>

      <div v-else class="vue-cal-wrapper h-full overflow-hidden" :style="statusColorVars">
        <VueCal
          ref="kref"
          :view="vuecalView"
          :selected-date="vuecalSelectedDate"
          :events="vuecalEvents"
          :time="showTime"
          :time-from="timeFrom"
          :time-to="timeTo"
          :twelve-hour="false"
          hide-view-selector
          hide-weekends
          :on-event-click="onEventClick"
          @view-change="onViewChange"
          @update:selected-date="onVuecalDateChange"
        />
      </div>
    </div>
  </div>

  <CalendarEventDetailModal
    :is-open="isDetailModalOpen"
    :event-id="selectedEventId ?? undefined"
    @close="closeDetailModal"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { CalendarDays, ChevronLeft, ChevronRight, Search, Inbox, AlertCircle, AlertTriangle } from 'lucide-vue-next'
import VueCal from 'vue-cal'
import { useAuthStore } from '@/stores/auth'
import { leaveService } from '@/services/leaveService'
import api from '@/services/api'
import type { CalendarEvent } from '@/types/leave'
import { STATUS_COLORS } from '@/utils/leaveStatusConfig'
import CalendarEventDetailModal from '@/components/calendar/CalendarEventDetailModal.vue'
import { formatWeekday } from '@/utils/date'

const auth = useAuthStore()

const searchQuery = ref('')
let searchTimer: ReturnType<typeof setTimeout> | null = null

const viewOptions = ['Day', 'Week', 'Month']
const view = ref('Day')

const currentDate = ref(new Date())
const now = ref(new Date())
let clockTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  clockTimer = setInterval(() => { now.value = new Date() }, 60000)
  if (auth.isTrainer) {
    loadAssignedStudents()
  }
  fetchEvents()
})
onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})

const events = ref<CalendarEvent[]>([])
const fetching = ref(false)
const fetchError = ref<string | null>(null)
const assignedStudentIds = ref<number[]>([])

const selectedEventId = ref<number | null>(null)
const isDetailModalOpen = ref(false)
const kref = ref<InstanceType<typeof VueCal> | null>(null)

const SHOW_TIME_FROM = 7
const SHOW_TIME_TO = 23
const timeFrom = SHOW_TIME_FROM * 60
const timeTo = SHOW_TIME_TO * 60

const vuecalView = computed(() => view.value.toLowerCase() as 'day' | 'week' | 'month')
const vuecalSelectedDate = computed(() => formatDateKey(currentDate.value))
const showTime = computed(() => vuecalView.value === 'day' || vuecalView.value === 'week')

const statusColorVars = computed(() => {
  const vars: Record<string, string> = {}
  for (const [status, cfg] of Object.entries(STATUS_COLORS)) {
    const key = (status as keyof typeof STATUS_COLORS)
    vars[`--vc-${key}-bg`] = cfg.css.background
    vars[`--vc-${key}-color`] = cfg.css.color
    vars[`--vc-${key}-border`] = cfg.css.borderLeft
    vars[`--vc-${key}-hover-bg`] = cfg.css.hoverBackground
  }
  return vars
})

const vuecalEvents = computed(() =>
  filteredEvents.value.map((ev) => {
    const start = buildDateTime(ev.startDate, ev.startTime)
    const end = buildDateTime(ev.endDate, ev.endTime)
    const studentName = ev.student ?? 'Unknown'
    const timeLabel =
      ev.startTime && ev.endTime
        ? `(${formatTimeLabel(ev.startTime)}–${formatTimeLabel(ev.endTime)})`
        : ''
    return {
      start,
      end,
      title: `${studentName} — ${ev.type} ${timeLabel}`.trim(),
      class: statusEventClass(ev.status),
      id: ev.id,
    }
  }),
)

function openDetailModal(id: number) {
  selectedEventId.value = id
  isDetailModalOpen.value = true
}

function closeDetailModal() {
  isDetailModalOpen.value = false
}

function onEventClick(event: Record<string, unknown>) {
  if (event && typeof event.id !== 'undefined') {
    openDetailModal(event.id as number)
  }
}

function onVuecalDateChange(newDate: string | Date) {
  const d = new Date(newDate)
  if (isNaN(d.getTime())) return
  currentDate.value = d
}

const navigating = ref(false)

function prev() {
  navigating.value = true
  kref.value?.previous()
  if (view.value === 'Day') {
    currentDate.value = addDaysSingle(currentDate.value, -1)
  } else if (view.value === 'Week') {
    currentDate.value = addDaysSingle(currentDate.value, -7)
  } else {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  }
  nextTick(() => { navigating.value = false })
}

function next() {
  navigating.value = true
  kref.value?.next()
  if (view.value === 'Day') {
    currentDate.value = addDaysSingle(currentDate.value, 1)
  } else if (view.value === 'Week') {
    currentDate.value = addDaysSingle(currentDate.value, 7)
  } else {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  }
  nextTick(() => { navigating.value = false })
}

function goToday() {
  navigating.value = true
  currentDate.value = new Date()
  kref.value?.selectDate(new Date())
  nextTick(() => { navigating.value = false })
}

const visibleEvents = computed(() => {
  if (auth.isAdmin) return events.value
  if (auth.isStudent) return events.value.filter((r) => r.studentId === auth.user?.id)
  if (auth.isTrainer) {
    if (assignedStudentIds.value.length > 0) {
      return events.value.filter((r) => assignedStudentIds.value.includes(r.studentId))
    }
    return []
  }
  return []
})

const filteredEvents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return visibleEvents.value
  return visibleEvents.value.filter((ev) => {
    return (
      (ev.student ?? '').toLowerCase().includes(query) ||
      String(ev.studentId).includes(query) ||
      (ev.studentGeneration ?? '').toLowerCase().includes(query) ||
      (ev.studentClassName ?? '').toLowerCase().includes(query)
    )
  })
})

function onSearchInput(value: string) {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchQuery.value = value
  }, 300)
}

function onViewChange(params: Record<string, unknown>) {
  const newView = (params.view as string) || ''
  if (newView === 'day') view.value = 'Day'
  else if (newView === 'week') view.value = 'Week'
  else if (newView === 'month') view.value = 'Month'
}

function formatTimeLabel(time: string): string {
  const parts = time.split(':')
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`
  return time
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
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

function viewDateRange() {
  if (view.value === 'Day') {
    const key = formatDateKey(currentDate.value)
    return { start: key, end: key }
  }
  if (view.value === 'Week') {
    const start = startOfWeek(currentDate.value)
    const end = addDaysSingle(start, 6)
    return { start: formatDateKey(start), end: formatDateKey(end) }
  }
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  return { start: formatDateKey(first), end: formatDateKey(last) }
}

async function fetchEvents() {
  const controller = new AbortController()
  fetching.value = true
  fetchError.value = null
  try {
    const { start, end } = viewDateRange()
      events.value = await leaveService.getLeaveRequestsForCalendar(start, end, controller)
  } catch (err) {
    fetchError.value = 'Unable to load calendar. Please try again.'
    events.value = []
  } finally {
    fetching.value = false
  }
}

async function loadAssignedStudents() {
  try {
    const { data } = await api.get<{ students: { id: number }[] }>('/trainer/students')
    assignedStudentIds.value = data.students.map((s) => s.id)
  } catch {
    assignedStudentIds.value = []
  }
}

watch([view, currentDate], () => {
  if (navigating.value) return
  searchQuery.value = ''
  fetchEvents()
})

const rangeLabel = computed(() => {
  if (view.value === 'Day') {
    const d = currentDate.value
    return `${formatWeekday(d)} ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
  if (view.value === 'Week') {
    const start = startOfWeek(currentDate.value)
    const end = addDaysSingle(start, 6)
    const sameMonth = start.getMonth() === end.getMonth()
    const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (sameMonth) return `${startLabel} – ${end.getDate()}, ${end.getFullYear()}`
    return `${startLabel} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
  if (view.value === 'Month') {
    return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
  return ''
})

const prevLabel = computed(() => {
  if (view.value === 'Day') return 'Previous day'
  if (view.value === 'Week') return 'Previous week'
  return 'Previous month'
})

const nextLabel = computed(() => {
  if (view.value === 'Day') return 'Next day'
  if (view.value === 'Week') return 'Next week'
  return 'Next month'
})

/**
 * Build a Date from a date string and optional time string.
 * The native Date constructor is used directly: timezone offsets present in
 * the input are preserved (not stripped), consistent with how dates are
 * parsed elsewhere in the app (src/utils/date.ts). The backend is expected
 * to return date/time as ISO-8601 fragments; if no offset is present the
 * value is treated as a local time.
 */
function buildDateTime(dateStr: string, time?: string): Date {
  const rawTime = time && time.trim() ? time.trim() : '07:00:00'
  return new Date(`${dateStr}T${rawTime}`)
}

function statusEventClass(status: string): string {
  const s = status.toLowerCase()
  if (s === 'approved') return 'vc-approved'
  if (s === 'rejected') return 'vc-rejected'
  if (s === 'cancelled') return 'vc-cancelled'
  if (s === 'pending') return 'vc-pending'
  return 'vc-unknown'
}
</script>

<style>
.vue-cal-wrapper {
  --vc-bg: #fff;
  --vc-border-color: #e5e7eb;
  --vc-header-bg: #fff;
  --vc-font-family: inherit;
  --vc-cell-height: 56px;
  --vc-min-cell-width: 76px;
  --vc-event-bg: #0891b2;
  --vc-event-color: #fff;
  --vc-today-color: #0891b2;
}

.vue-cal-wrapper .vuecal {
  border: none;
  border-radius: 0;
  height: 100%;
}

.vue-cal-wrapper .vuecal__header {
  display: none;
}

.vue-cal-wrapper .vuecal__body {
  height: 100%;
}

.vue-cal-wrapper .vuecal__cell {
  border-color: #f3f4f6;
}

.vue-cal-wrapper .vuecal__cell--day,
.vue-cal-wrapper .vuecal__cell--week {
  border-color: #f3f4f6;
  border-top-color: #e5e7eb;
}

.vue-cal-wrapper .vuecal__time-column .vuecal__time-cell {
  height: 56px;
  color: #9ca3af;
  font-size: 11px;
}

.vue-cal-wrapper .vuecal__cell--today {
  background: #ecfeff;
}

.vue-cal-wrapper .vuecal__cell--today .vuecal__cell-date {
  color: #0891b2;
}

.vue-cal-wrapper .vuecal__cell--today .vuecal__cell-date-day {
  background: #0891b2;
  color: #fff;
}

.vue-cal-wrapper .vuecal__cell--current {
  background: transparent;
}

.vue-cal-wrapper .vuecal__event {
  color: #fff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.3;
}

.vue-cal-wrapper .vuecal__event--all-day {
  display: none;
}

.vue-cal-wrapper .vc-approved {
  background: var(--vc-approved-bg);
  color: var(--vc-approved-color);
  border-left: var(--vc-approved-border);
}

.vue-cal-wrapper .vc-approved.vuecal__event:hover {
  background: var(--vc-approved-hover-bg);
}

.vue-cal-wrapper .vc-pending {
  background: var(--vc-pending-bg);
  color: var(--vc-pending-color);
  border-left: var(--vc-pending-border);
}

.vue-cal-wrapper .vc-pending.vuecal__event:hover {
  background: var(--vc-pending-hover-bg);
}

.vue-cal-wrapper .vc-rejected {
  background: var(--vc-rejected-bg);
  color: var(--vc-rejected-color);
  border-left: var(--vc-rejected-border);
}

.vue-cal-wrapper .vc-rejected.vuecal__event:hover {
  background: var(--vc-rejected-hover-bg);
}

.vue-cal-wrapper .vc-cancelled,
.vue-cal-wrapper .vc-cancelled.vuecal__event {
  background: var(--vc-cancelled-bg);
  color: var(--vc-cancelled-color);
  border-left: var(--vc-cancelled-border);
}

.vue-cal-wrapper .vc-cancelled.vuecal__event:hover {
  background: var(--vc-cancelled-hover-bg);
}

.vue-cal-wrapper .vc-unknown {
  background: var(--vc-unknown-bg);
  border-left: var(--vc-unknown-border);
}

.vue-cal-wrapper .vc-unknown.vuecal__event:hover {
  background: var(--vc-unknown-hover-bg);
}

.vue-cal-wrapper .vuecal__time-column {
  min-width: 52px;
}

.vue-cal-wrapper .vuecal__cell--day.vuecal__cell--has-week-number,
.vue-cal-wrapper .vuecal__cell--week.vuecal__cell--has-week-number {
  padding-right: 52px;
}

.vue-cal-wrapper .vuecal__cell-split {
  border-top: 1px solid #f3f4f6;
}

.vue-cal-wrapper .vuecal__column--day {
  border-left: 1px solid #e5e7eb;
}

.vue-cal-wrapper .vuecal--month-view .vuecal__cell {
  border-color: #f3f4f6;
}

.vue-cal-wrapper .vuecal--month-view .vuecal__date,
.vue-cal-wrapper .vuecal--month-view .vuecal__cell-date {
  padding-bottom: 4px;
}

.vue-cal-wrapper .vuecal--month-view .vuecal__event {
  border-radius: 4px;
  padding: 2px 6px;
  margin: 2px 0;
}

.vue-cal-wrapper .vuecal--month-view .vuecal__event--all-day {
  display: block;
}

.vue-cal-wrapper .vuecal__scrollbar {
  width: 8px;
}

.vue-cal-wrapper .vuecal__scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.vue-cal-wrapper .vuecal__scrollbar-thumb:hover {
  background: #9ca3af;
}

@media (max-width: 640px) {
  .vue-cal-wrapper .vuecal__time-column {
    min-width: 36px;
  }
  .vue-cal-wrapper .vuecal__time-cell {
    font-size: 10px;
  }
  .vue-cal-wrapper .vuecal__event {
    font-size: 10px;
    padding: 2px 4px;
  }
}

.vue-cal-wrapper .vuecal__event-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
