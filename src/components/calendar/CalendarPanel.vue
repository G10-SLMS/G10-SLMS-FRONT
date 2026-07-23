<template>
  <div class="flex h-[calc(100vh-120px)] max-w-full flex-col gap-5">
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600">
          <CalendarDays :size="22" :stroke-width="1.8" />
        </div>
        <h1 class="text-lg font-semibold text-gray-900">Calendar</h1>
        <div class="flex flex-1 items-center justify-end gap-2">
          <button
            @click="goToday"
            class="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
          >
            Today
          </button>
          <div class="flex items-center gap-0.5">
            <button
              :aria-label="prevLabel"
              @click="prev"
              class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 active:scale-[0.95]"
            >
              <ChevronLeft :size="18" :stroke-width="1.8" />
            </button>
            <button
              :aria-label="nextLabel"
              @click="next"
              class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 active:scale-[0.95]"
            >
              <ChevronRight :size="18" :stroke-width="1.8" />
            </button>
          </div>
          <span class="min-w-[180px] text-sm font-semibold text-gray-800 sm:text-base">{{ rangeLabel }}</span>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2.5">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search student, ID, class..."
              :value="searchQuery"
              @input="onSearchInput(($event.target as HTMLInputElement).value)"
              class="h-9 w-52 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 shadow-sm placeholder:text-gray-400 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <select
            :value="statusFilter"
            @change="onStatusFilterChange(($event.target as HTMLSelectElement).value)"
            class="h-9 rounded-lg border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-700 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            :value="leaveTypeFilter"
            @change="onLeaveTypeFilterChange(($event.target as HTMLSelectElement).value)"
            class="h-9 rounded-lg border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-700 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="">All Leave Types</option>
            <option v-for="t in filteredLeaveTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
          <div class="flex items-center gap-0 rounded-lg border border-gray-200 bg-white px-2.5 shadow-sm">
            <input
              type="date"
              :value="dateFrom"
              @input="onDateFromChange(($event.target as HTMLInputElement).value)"
              class="h-9 bg-transparent text-sm outline-none text-gray-700"
            />
            <span class="text-gray-400 text-xs font-medium">→</span>
            <input
              type="date"
              :value="dateTo"
              @input="onDateToChange(($event.target as HTMLInputElement).value)"
              class="h-9 bg-transparent text-sm outline-none text-gray-700"
            />
          </div>
        </div>
        <div class="flex items-center gap-0.5 rounded-xl bg-slate-100 p-[3px]">
          <button
            v-for="v in viewOptions"
            :key="v"
            class="rounded-lg border-none px-4 py-1.5 text-sm font-semibold transition"
            :class="view === v ? 'bg-white text-cyan-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'"
            @click="$emit('view-change', v)"
          >
            {{ v }}
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 min-h-0 overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-gray-200">
      <div v-if="fetching" class="flex h-full flex-col gap-4 p-6">
        <div class="flex items-center gap-2">
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
          <p class="text-sm text-gray-500 font-medium">Loading leave requests...</p>
        </div>
        <div class="flex-1 animate-pulse flex-col gap-3">
          <div v-for="n in 6" :key="n" class="h-12 w-full rounded-lg bg-slate-100"></div>
          <div v-if="view === 'Week'" class="grid grid-cols-7 gap-3">
            <div v-for="n in 14" :key="n" class="h-12 rounded-lg bg-slate-100"></div>
          </div>
        </div>
      </div>

      <div v-else-if="fetchError" class="flex flex-col items-center justify-center gap-4 px-5 py-20">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertCircle :size="24" class="text-red-500" />
        </div>
        <p class="text-sm text-gray-600 font-medium">{{ fetchError }}</p>
        <button
          class="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-600 active:scale-[0.98]"
          @click="$emit('retry')"
        >
          Try again
        </button>
      </div>

      <div v-else-if="filteredEvents.length === 0" class="flex flex-col items-center justify-center gap-4 px-5 py-20">
        <template v-if="auth.isTrainer">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
            <AlertTriangle :size="24" class="text-amber-500" />
          </div>
          <p class="text-sm text-gray-500 font-medium">No leave requests found for your assigned students.</p>
        </template>
        <template v-else-if="searchQuery.trim().length > 0">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Inbox :size="24" class="text-gray-400" />
          </div>
          <p class="text-sm text-gray-500 font-medium">Try adjusting your search or filters.</p>
        </template>
        <template v-else>
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Inbox :size="24" class="text-gray-400" />
          </div>
          <p class="text-sm text-gray-500 font-medium">No leave requests found.</p>
        </template>
      </div>

      <div v-else class="flex h-full flex-col min-w-0 bg-white" :style="statusColorVars">
        <!-- Day / Week / Month headers -->
        <div class="vuecal__header flex border-b border-gray-200 bg-white">
          <div class="w-[52px] shrink-0 border-r border-gray-200"></div>
          <div class="flex flex-1" v-if="view === 'Week'">
            <div
              v-for="day in weekDays"
              :key="day.dateKey"
              class="vuecal__cell flex flex-1 flex-col items-center justify-center py-3"
              :class="[day.isToday ? 'bg-cyan-50' : 'bg-white', 'border-l border-gray-200']"
            >
              <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">{{ day.dayName }}</span>
              <span
                class="mt-1 inline-flex h-7 w-7 items-center justify-center text-sm font-semibold"
                :class="day.isToday ? 'rounded-full bg-cyan-500 text-white' : 'text-gray-800'"
              >
                {{ day.dayNum }}
              </span>
            </div>
          </div>
          <div v-else-if="view === 'Day'" class="flex flex-1 border-l border-gray-200">
            <div
              class="flex flex-1 flex-col items-center justify-center py-3"
              :class="isToday(weekDays[0]?.dateKey) ? 'bg-cyan-50' : 'bg-white'"
            >
              <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">{{ weekDays[0]?.dayName }}</span>
              <span
                class="mt-1 inline-flex h-7 w-7 items-center justify-center text-sm font-semibold"
                :class="isToday(weekDays[0]?.dateKey) ? 'rounded-full bg-cyan-500 text-white' : 'text-gray-800'"
              >
                {{ weekDays[0]?.dayNum }}
              </span>
            </div>
          </div>
          <div v-else-if="view === 'Month'" class="flex flex-1">
            <div
              v-for="dayName in ['SUN','MON','TUE','WED','THU','FRI','SAT']"
              :key="dayName"
              class="vuecal__cell flex flex-1 flex-col items-center justify-center py-2 border-l border-gray-200"
            >
              <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">{{ dayName }}</span>
            </div>
          </div>
        </div>

        <!-- All Day Row (Week view only) -->
        <div v-if="hasAllDayEvents && (view === 'Week' || view === 'Day')" class="vuecal__all-day flex border-b border-gray-200 bg-white">
          <div class="w-[52px] shrink-0 border-r border-gray-200 py-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">All</span>
          </div>
          <div class="flex flex-1">
            <div
              v-for="day in weekDays"
              :key="day.dateKey"
              class="flex-1 border-l border-gray-200 px-1.5 py-1 space-y-1"
              :class="{ 'bg-cyan-50/30': day.isToday }"
            >
              <div
                v-for="ev in getDayAllDayEvents(day.dateKey)"
                :key="ev.id"
                class="vuecal-custom-event cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition hover:opacity-80 border-l-[3px]"
                :class="statusEventClass(ev.status)"
                @click="openDetailModal(ev.id)"
              >
                <div class="font-semibold truncate">{{ ev.student }} - {{ ev.type }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Time Grid -->
        <div v-if="view === 'Week' || view === 'Day'" class="vuecal__body flex-1 overflow-y-auto relative">
          <div class="flex relative">
            <!-- Time Column -->
            <div class="vuecal__time-column w-[52px] shrink-0 border-r border-gray-200 bg-white">
              <div v-for="hour in hours" :key="hour" class="vuecal__time-cell h-[56px] flex items-start justify-end pr-2 pt-0.5">
                <span class="text-xs font-medium text-gray-500">{{ formatHour(hour) }}</span>
              </div>
            </div>

            <!-- Days Area -->
            <div class="flex flex-1" :class="view === 'Day' ? 'w-full' : ''">
              <div
                v-for="day in (view === 'Day' ? [weekDays[0]] : weekDays)"
                :key="day.dateKey"
                class="vuecal__day-col flex-1 relative border-l border-gray-200 min-w-0"
                :class="{ 'bg-cyan-50/40': day.isToday }"
              >
                <div class="absolute inset-0 pointer-events-none">
                  <div
                    v-for="hour in hours"
                    :key="`line-${hour}`"
                    class="border-t border-gray-100"
                    :style="{ height: CELL_HEIGHT + 'px' }"
                  ></div>
                </div>
                <template v-for="ev in getDayTimedEvents(day.dateKey)" :key="ev.id">
                  <div
                    class="vuecal-custom-event absolute rounded-md px-2 py-1 text-xs font-medium cursor-pointer transition hover:opacity-80 border-l-[3px] z-10 overflow-hidden"
                    :class="statusEventClass(ev.status)"
                    :style="{
                      top: getEventTop(ev) + 'px',
                      height: Math.max(getEventHeight(ev), 24) + 'px',
                      ...getEventColumnStyle(ev, day.dateKey)
                    }"
                    @click="openDetailModal(ev.id)"
                  >
                    <div class="font-semibold truncate">{{ ev.student }}</div>
                    <div
                      v-if="ev.startTime && ev.endTime"
                      class="truncate opacity-80"
                    >
                      {{ formatTimeLabel(ev.startTime) }} - {{ formatTimeLabel(ev.endTime) }}
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Month grid (simple 6x7) -->
        <div v-else-if="view === 'Month'" class="vuecal__body flex-1 overflow-y-auto">
          <div class="grid flex-1" style="grid-template-columns: repeat(7, minmax(0, 1fr)); grid-template-rows: repeat(6, minmax(80px, 1fr))">
            <div
              v-for="day in monthDays"
              :key="day.dateKey"
              class="vuecal__cell border-l border-t border-gray-200 p-1.5 transition-colors"
              :class="[day.isToday ? 'bg-cyan-50' : 'bg-white', !day.isCurrentMonth ? 'text-gray-300' : '']"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-gray-600">{{ day.dayNum }}</span>
                <div class="flex flex-wrap gap-0.5">
                  <div
                    v-for="ev in getDayMiniEvents(day.dateKey)"
                    :key="ev.id"
                    class="h-1.5 w-1.5 rounded-full"
                    :class="miniDotClass(ev.status)"
                  ></div>
                </div>
              </div>
              <div class="mt-1 space-y-0.5 overflow-hidden">
                <div
                  v-for="ev in getDayMiniEvents(day.dateKey)"
                  :key="ev.id"
                  class="truncate rounded px-1.5 py-0.5 text-[10px] font-medium cursor-pointer transition hover:opacity-80"
                  :class="miniClass(ev.status)"
                  @click="openDetailModal(ev.id)"
                >
                  {{ ev.student }} - {{ ev.type }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <CalendarEventDetailModal
      :is-open="isDetailModalOpen"
      :event-id="selectedEventId ?? undefined"
      @close="closeDetailModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { CalendarDays, ChevronLeft, ChevronRight, Search, Inbox, AlertCircle, AlertTriangle } from 'lucide-vue-next'
import type { CalendarEvent, LeaveType } from '@/types/leave'
import { STATUS_COLORS } from '@/utils/leaveStatusConfig'
import CalendarEventDetailModal from '@/components/calendar/CalendarEventDetailModal.vue'
import { formatWeekday, todayKey } from '@/utils/date'
import { useAuthStore } from '@/stores/auth'

defineOptions({ name: 'CalendarPanel' })

const props = defineProps<{
  view: 'Day' | 'Week' | 'Month'
  currentDate: Date
  events: CalendarEvent[]
  fetching: boolean
  fetchError: string | null
  auth: ReturnType<typeof useAuthStore>
  statusFilter: string
  leaveTypeFilter: number | ''
  dateFrom: string
  dateTo: string
  searchQuery: string
  filteredLeaveTypes: LeaveType[]
  assignedStudentIds: number[]
}>()

const emit = defineEmits<{
  'update:currentDate': [date: Date]
  'view-change': [view: 'Day' | 'Week' | 'Month']
  'fetch-events': []
  'fetch-leave-types': []
  'clear-search': []
  'search': [value: string]
  'status-filter': [value: string]
  'leave-type-filter': [value: number | '']
  'date-from-change': [value: string]
  'date-to-change': [value: string]
  'retry': []
  'load-assigned-students': []
}>()

const selectedEventId = ref<number | null>(null)
const isDetailModalOpen = ref(false)

const CELL_HEIGHT = 56
const START_HOUR = 0
const END_HOUR = 24

const hours = computed(() => {
  const h: number[] = []
  for (let i = START_HOUR; i < END_HOUR; i++) h.push(i)
  return h
})

function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`
}

const statusColorVars = computed(() => {
  const vars: Record<string, string> = {}
  for (const [status, cfg] of Object.entries(STATUS_COLORS)) {
    const key = status as keyof typeof STATUS_COLORS
    vars[`--vc-${key}-bg`] = cfg.css.background
    vars[`--vc-${key}-color`] = cfg.css.color
    vars[`--vc-${key}-border`] = cfg.css.borderLeft
    vars[`--vc-${key}-hover-bg`] = cfg.css.hoverBackground
  }
  return vars
})

const filteredByPermission = computed(() => {
  if (props.auth.isAdmin) return props.events
  if (props.auth.isStudent) return props.events.filter((r) => r.studentId === props.auth.user?.id)
  if (props.auth.isTrainer) {
    if (props.assignedStudentIds.length > 0) {
      return props.events.filter((r) => props.assignedStudentIds.includes(r.studentId))
    }
    return []
  }
  return []
})

const filteredEvents = computed(() => {
  const visible = filteredByPermission.value
  const sf = props.statusFilter.trim().toLowerCase()
  const lt = props.leaveTypeFilter
  const df = props.dateFrom.trim()
  const dt = props.dateTo.trim()
  const query = props.searchQuery.trim().toLowerCase()

  return visible.filter((ev) => {
    const matchStatus = !sf || ev.status.toLowerCase() === sf
    const matchLeaveType = !lt || ev.leaveTypeId === lt
    const matchDate = !df || ev.endDate >= df
    const matchDateTo = !dt || ev.startDate <= dt
    const matchSearch =
      !query ||
      (ev.student ?? '').toLowerCase().includes(query) ||
      String(ev.studentId).includes(query) ||
      (ev.studentGeneration ?? '').toLowerCase().includes(query) ||
      (ev.studentClassName ?? '').toLowerCase().includes(query)
    return matchStatus && matchLeaveType && matchDate && matchDateTo && matchSearch
  })
})

const allDayEvents = computed(() =>
  filteredEvents.value.filter((ev) => !ev.startTime && !ev.endTime),
)

const timedEvents = computed(() =>
  filteredEvents.value.filter((ev) => ev.startTime && ev.endTime),
)

const hasAllDayEvents = computed(() => allDayEvents.value.length > 0)

function getDayAllDayEvents(dateKey: string) {
  return allDayEvents.value.filter((ev) => ev.startDate <= dateKey && ev.endDate >= dateKey)
}

function getDayTimedEvents(dateKey: string) {
  return timedEvents.value.filter((ev) => ev.startDate <= dateKey && ev.endDate >= dateKey)
}

function getDayMiniEvents(dateKey: string) {
  return filteredEvents.value.filter((ev) => ev.startDate <= dateKey && ev.endDate >= dateKey)
}

const weekDays = computed(() => {
  const days: { date: Date; dateKey: string; dayName: string; dayNum: number; isToday: boolean }[] = []
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  if (props.view === 'Day') {
    const d = props.currentDate
    days.push({
      date: d,
      dateKey: formatDateKey(d),
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
      isToday: formatDateKey(d) === todayKey(),
    })
    return days
  }

  const start = new Date(props.currentDate)
  const dayOfWeek = start.getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  start.setDate(start.getDate() + diffToMonday)
  start.setHours(0, 0, 0, 0)

  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    days.push({
      date: d,
      dateKey: formatDateKey(d),
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
      isToday: formatDateKey(d) === todayKey(),
    })
  }
  return days
})

const monthDays = computed(() => {
  const y = props.currentDate.getFullYear()
  const m = props.currentDate.getMonth()
  const first = new Date(y, m, 1)
  const last = new Date(y, m + 1, 0)
  const startDay = first.getDay()
  const offset = startDay === 0 ? 6 : startDay - 1

  const days: {
    date: Date
    dateKey: string
    dayName: string
    dayNameShort: string
    dayNum: number
    isToday: boolean
    isCurrentMonth: boolean
  }[] = []
  const dayNamesThis = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const dayNamesPrev = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

  const prevMonthLast = new Date(y, m, 0).getDate()
  for (let i = offset - 1; i >= 0; i--) {
    const d = new Date(y, m - 1, prevMonthLast - i)
    days.push(createMonthDay(d, false, dayNamesPrev))
  }

  for (let i = 1; i <= last.getDate(); i++) {
    const d = new Date(y, m, i)
    days.push(createMonthDay(d, true, dayNamesThis))
  }

  const totalCells = Math.ceil(days.length / 7) * 7
  let nextDay = 1
  while (days.length < totalCells) {
    const d = new Date(y, m + 1, nextDay)
    days.push(createMonthDay(d, false, dayNamesThis))
    nextDay++
  }

  return days
})

function createMonthDay(d: Date, isCurrent: boolean, dayNames: string[]) {
  return {
    date: d,
    dateKey: formatDateKey(d),
    dayName: dayNames[d.getDay()],
    dayNameShort: dayNames[d.getDay()],
    dayNum: d.getDate(),
    isToday: formatDateKey(d) === todayKey(),
    isCurrentMonth: isCurrent,
  }
}

function isToday(dateKey: string | undefined): boolean {
  if (!dateKey) return false
  return dateKey === todayKey()
}

  function parseTime(time: string | undefined) {
    if (!time) return null
    const parts = time.split(':').map(Number)
    return { hour: parts[0], min: parts[1] ?? 0 }
  }

  function timeToMinutes(time: string | undefined): number {
    const t = parseTime(time)
    if (!t) return 0
    return t.hour * 60 + t.min
  }

  function eventsOverlap(a: CalendarEvent, b: CalendarEvent): boolean {
    const aStart = timeToMinutes(a.startTime)
    const aEnd = timeToMinutes(a.endTime)
    const bStart = timeToMinutes(b.startTime)
    const bEnd = timeToMinutes(b.endTime)
    return aStart < bEnd && bStart < aEnd
  }

  function assignEventColumns(events: CalendarEvent[]): Map<number, { column: number; totalColumns: number }> {
    if (events.length === 0) return new Map()

    const sorted = [...events].sort((a, b) => {
      const aStart = timeToMinutes(a.startTime)
      const bStart = timeToMinutes(b.startTime)
      if (aStart !== bStart) return aStart - bStart
      const aDuration = timeToMinutes(a.endTime) - aStart
      const bDuration = timeToMinutes(b.endTime) - bStart
      return bDuration - aDuration
    })

    const groups: CalendarEvent[][] = []

    for (const event of sorted) {
      let mergedGroupIndex: number | null = null

      for (let i = 0; i < groups.length; i++) {
        const group = groups[i]
        const overlaps = group.some((other) => eventsOverlap(event, other))
        if (overlaps) {
          if (mergedGroupIndex === null) {
            mergedGroupIndex = i
            group.push(event)
          } else {
            groups[mergedGroupIndex].push(...group)
            groups.splice(i, 1)
            i--
          }
        }
      }

      if (mergedGroupIndex === null) {
        groups.push([event])
      }
    }

    const result = new Map<number, { column: number; totalColumns: number }>()

    for (const group of groups) {
      const totalColumns = group.length
      const sortedGroup = [...group].sort((a, b) => {
        const aStart = timeToMinutes(a.startTime)
        const bStart = timeToMinutes(b.startTime)
        return aStart - bStart
      })

      sortedGroup.forEach((event, index) => {
        result.set(event.id, { column: index, totalColumns })
      })
    }

    return result
  }

  const columnCache = new Map<string, { idsKey: string; result: Map<number, { column: number; totalColumns: number }> }>()

  const dayEventColumns = computed(() => {
    const map = new Map<string, Map<number, { column: number; totalColumns: number }>>()
    for (const day of weekDays.value) {
      const dayEvents = getDayTimedEvents(day.dateKey)
      if (dayEvents.length === 0) {
        map.set(day.dateKey, new Map())
        continue
      }
      const sortedIds = dayEvents.map((e) => e.id).sort((a, b) => a - b).join(',')
      const cached = columnCache.get(day.dateKey)
      if (cached && cached.idsKey === sortedIds) {
        map.set(day.dateKey, cached.result)
        continue
      }
      const result = assignEventColumns(dayEvents)
      columnCache.set(day.dateKey, { idsKey: sortedIds, result })
      map.set(day.dateKey, result)
    }
    return map
  })

  function getEventTop(ev: CalendarEvent): number {
    const t = parseTime(ev.startTime)
    if (!t) return 0
    return ((t.hour - START_HOUR) * 60 + t.min) / 60 * CELL_HEIGHT
  }

  function getEventHeight(ev: CalendarEvent): number {
    const start = parseTime(ev.startTime)
    const end = parseTime(ev.endTime)
    if (!start || !end) return 24
    const durationMin = (end.hour - start.hour) * 60 + (end.min - start.min)
    return (durationMin / 60) * CELL_HEIGHT
  }

  function getEventColumnStyle(ev: CalendarEvent, dateKey: string): Record<string, string> {
    const columns = dayEventColumns.value.get(dateKey)
    if (!columns) return {}

    const assignment = columns.get(ev.id)
    if (!assignment || assignment.totalColumns <= 1) {
      return {}
    }

    const { column, totalColumns } = assignment
    const gapPercent = 1
    const availableWidth = 100 - gapPercent
    const columnWidth = availableWidth / totalColumns
    const left = gapPercent / 2 + column * columnWidth
    const width = columnWidth - gapPercent / 2

    return {
      left: `${left}%`,
      width: `${width}%`,
    }
  }


function statusEventClass(status: string): string {
  const s = status.toLowerCase()
  if (s === 'approved') return 'vc-approved'
  if (s === 'rejected') return 'vc-rejected'
  if (s === 'cancelled') return 'vc-cancelled'
  if (s === 'pending') return 'vc-pending'
  return 'vc-unknown'
}

function miniClass(status: string): string {
  const s = status.toLowerCase()
  const map: Record<string, { bg: string; text: string }> = {
    approved: { bg: STATUS_COLORS.approved.css.background, text: STATUS_COLORS.approved.css.color },
    rejected: { bg: STATUS_COLORS.rejected.css.background, text: STATUS_COLORS.rejected.css.color },
    cancelled: { bg: STATUS_COLORS.cancelled.css.background, text: STATUS_COLORS.cancelled.css.color },
    pending: { bg: STATUS_COLORS.pending.css.background, text: STATUS_COLORS.pending.css.color },
  }
  const c = map[s] ?? map.pending
  return `bg-[${c.bg}] text-[${c.text}]`
}

function miniDotClass(status: string): string {
  const s = status.toLowerCase()
  const map: Record<string, string> = {
    approved: 'bg-green-500',
    rejected: 'bg-red-500',
    cancelled: 'bg-gray-400',
    pending: 'bg-amber-400',
  }
  return map[s] ?? 'bg-amber-400'
}

function openDetailModal(id: number) {
  selectedEventId.value = id
  isDetailModalOpen.value = true
}

function closeDetailModal() {
  isDetailModalOpen.value = false
}


function prev() {
  const d = new Date(props.currentDate)
  if (props.view === 'Day') {
    d.setDate(d.getDate() - 1)
  } else if (props.view === 'Week') {
    d.setDate(d.getDate() - 7)
  } else {
    d.setMonth(d.getMonth() - 1, 1)
  }
  emit('update:currentDate', d)
}

function next() {
  const d = new Date(props.currentDate)
  if (props.view === 'Day') {
    d.setDate(d.getDate() + 1)
  } else if (props.view === 'Week') {
    d.setDate(d.getDate() + 7)
  } else {
    d.setMonth(d.getMonth() + 1, 1)
  }
  emit('update:currentDate', d)
}

function goToday() {
  emit('update:currentDate', new Date())
}

function formatTimeLabel(time: string): string {
  const parts = time.split(':')
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`
  return time
}

function mondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDaysSingle(date: Date, n: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const rangeLabel = computed(() => {
  if (props.view === 'Day') {
    const d = props.currentDate
    return `${formatWeekday(d)} ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
  if (props.view === 'Week') {
    const start = mondayOfWeek(props.currentDate)
    const end = addDaysSingle(start, 6)
    const sameMonth = start.getMonth() === end.getMonth()
    const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (sameMonth) return `${startLabel} – ${end.getDate()}, ${end.getFullYear()}`
    return `${startLabel} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
  if (props.view === 'Month') {
    return props.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
  return ''
})

const prevLabel = computed(() => {
  if (props.view === 'Day') return 'Previous day'
  if (props.view === 'Week') return 'Previous week'
  return 'Previous month'
})

const nextLabel = computed(() => {
  if (props.view === 'Day') return 'Next day'
  if (props.view === 'Week') return 'Next week'
  return 'Next month'
})

let searchTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput(value: string) {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    emit('search', value)
  }, 300)
}

function onStatusFilterChange(value: string) {
  emit('status-filter', value)
  emit('fetch-events')
}

function onLeaveTypeFilterChange(value: string) {
  const num = value === '' ? '' : Number(value)
  emit('leave-type-filter', num)
  emit('fetch-events')
}

function onDateFromChange(value: string) {
  emit('date-from-change', value)
  emit('fetch-events')
}

function onDateToChange(value: string) {
  emit('date-to-change', value)
  emit('fetch-events')
}

onUnmounted(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
    searchTimer = null
  }
})

const viewOptions: Array<'Day' | 'Week' | 'Month'> = ['Day', 'Week', 'Month']

const view = computed({
  get: () => props.view,
  set: (v) => emit('view-change', v),
})
</script>

<style scoped>
.vuecal__header {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.vuecal__cell {
  cursor: default;
  min-height: 0;
}

.vuecal__time-column {
  min-width: 52px;
  background: #fff;
  border-right: 1px solid #e5e7eb;
}

.vuecal__time-cell {
  height: 56px;
  color: #6b7280;
  font-size: 11px;
  font-weight: 500;
  padding-right: 8px;
  text-align: right;
  vertical-align: top;
  line-height: 1;
}

.vuecal__day-col {
  border-left: 1px solid #f3f4f6;
}

.vuecal__day-col:first-child {
  border-left: none;
}

.vuecal-custom-event {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
  z-index: 10;
}

.vuecal-custom-event.vc-approved {
  background: var(--vc-approved-bg);
  color: var(--vc-approved-color);
  border-left: var(--vc-approved-border);
}
.vuecal-custom-event.vc-approved:hover {
  background: var(--vc-approved-hover-bg);
}

.vuecal-custom-event.vc-pending {
  background: var(--vc-pending-bg);
  color: var(--vc-pending-color);
  border-left: var(--vc-pending-border);
}
.vuecal-custom-event.vc-pending:hover {
  background: var(--vc-pending-hover-bg);
}

.vuecal-custom-event.vc-rejected {
  background: var(--vc-rejected-bg);
  color: var(--vc-rejected-color);
  border-left: var(--vc-rejected-border);
}
.vuecal-custom-event.vc-rejected:hover {
  background: var(--vc-rejected-hover-bg);
}

.vuecal-custom-event.vc-cancelled {
  background: var(--vc-cancelled-bg);
  color: var(--vc-cancelled-color);
  border-left: var(--vc-cancelled-border);
}
.vuecal-custom-event.vc-cancelled:hover {
  background: var(--vc-cancelled-hover-bg);
}

.vuecal-custom-event.vc-unknown {
  background: var(--vc-unknown-bg);
  border-left: var(--vc-unknown-border);
}
.vuecal-custom-event.vc-unknown:hover {
  background: var(--vc-unknown-hover-bg);
}

.vuecal__all-day {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

@media (max-width: 640px) {
  .vuecal__time-column {
    min-width: 36px;
  }
  .vuecal__time-cell {
    font-size: 10px;
  }
  .vuecal-custom-event {
    font-size: 10px;
    padding: 3px 6px;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .vuecal__time-column {
    min-width: 44px;
  }
  .vuecal__time-cell {
    font-size: 10.5px;
    padding-right: 4px;
  }
}
</style>
