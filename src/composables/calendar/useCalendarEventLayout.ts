import { computed, type Ref } from 'vue'
import type { CalendarEvent } from '@/types/leave'
import type { useAuthStore } from '@/stores/auth'
import type { CalendarDayCell } from './useCalendarNavigation'

type ColumnAssignment = { column: number; totalColumns: number }

interface UseCalendarEventLayoutOptions {
  events: () => CalendarEvent[]
  auth: ReturnType<typeof useAuthStore>
  leaveTypeFilter: () => number | ''
  dateFrom: () => string
  dateTo: () => string
  searchQuery: () => string
  weekDays: Ref<CalendarDayCell[]>
  startHour: number
  cellHeight: number
}

// ── Time Math Helpers ─────────────────────────────────────
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

// ── Column Assignment (side-by-side overlapping events) ──
function assignEventColumns(events: CalendarEvent[]): Map<number, ColumnAssignment> {
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

  const result = new Map<number, ColumnAssignment>()

  for (const group of groups) {
    const totalColumns = group.length
    const sortedGroup = [...group].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
    sortedGroup.forEach((event, index) => {
      result.set(event.id, { column: index, totalColumns })
    })
  }

  return result
}

// All-day events don't overlap by time, so they just get one column each, in order.
function assignFullDayColumns(events: CalendarEvent[]): Map<number, ColumnAssignment> {
  const result = new Map<number, ColumnAssignment>()
  const totalColumns = events.length
  events.forEach((ev, index) => {
    result.set(ev.id, { column: index, totalColumns })
  })
  return result
}

// ── CSS Positioning ───────────────────────────────────────
function columnStyle(assignment: ColumnAssignment | undefined): Record<string, string> {
  if (!assignment || assignment.totalColumns <= 1) return {}
  const { column, totalColumns } = assignment
  const gapPercent = 1
  const availableWidth = 100 - gapPercent
  const columnWidth = availableWidth / totalColumns
  const left = gapPercent / 2 + column * columnWidth
  const width = columnWidth - gapPercent / 2
  return { left: `${left}%`, width: `${width}%` }
}

// An event with no explicit times, or duration_type 'full_day', spans the whole day.
function isFullDayEvent(ev: CalendarEvent): boolean {
  const type = String(ev.duration_type ?? '').toLowerCase().replace(/[-\s]/g, '_')
  if (type === 'full_day') return true
  if (!ev.startTime || !ev.endTime) return true
  if (type === 'hourly') return false
  return true
}

export function useCalendarEventLayout(options: UseCalendarEventLayoutOptions) {
  const { auth, weekDays, startHour, cellHeight } = options

  // ── Visibility: permissions + active filters ─────────
  const filteredByPermission = computed(() => {
    const approvedOnly = options.events().filter((r) => r.status.toLowerCase() === 'approved')
    if (auth.isAdmin || auth.isEducator) return approvedOnly
    if (auth.isStudent) return approvedOnly.filter((r) => r.studentId === auth.user?.id)
    return []
  })

  const filteredEvents = computed(() => {
    const visible = filteredByPermission.value
    const lt = options.leaveTypeFilter()
    const df = options.dateFrom().trim()
    const dt = options.dateTo().trim()
    const query = options.searchQuery().trim().toLowerCase()

    return visible.filter((ev) => {
      const matchLeaveType = !lt || ev.leaveTypeId === lt
      const matchDate = !df || ev.endDate >= df
      const matchDateTo = !dt || ev.startDate <= dt
      const matchSearch =
        !query ||
        (ev.student ?? '').toLowerCase().includes(query) ||
        String(ev.studentId).includes(query) ||
        (ev.studentGeneration ?? '').toLowerCase().includes(query) ||
        (ev.studentClassName ?? '').toLowerCase().includes(query)
      return matchLeaveType && matchDate && matchDateTo && matchSearch
    })
  })

  // ── Split: All-Day vs Timed Events ────────────────────
  const allDayEvents = computed(() => filteredEvents.value.filter((ev) => isFullDayEvent(ev)))
  const timedEvents = computed(() =>
    filteredEvents.value.filter((ev) => !isFullDayEvent(ev) && ev.startTime && ev.endTime),
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

  // ── Per-Day Column Layout (cached per day's event set) ──
  const columnCache = new Map<string, { idsKey: string; result: Map<number, ColumnAssignment> }>()

  const dayEventColumns = computed(() => {
    const map = new Map<string, Map<number, ColumnAssignment>>()
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

  const fullDayColumnCache = new Map<string, { idsKey: string; result: Map<number, ColumnAssignment> }>()

  const fullDayEventColumns = computed(() => {
    const map = new Map<string, Map<number, ColumnAssignment>>()
    for (const day of weekDays.value) {
      const dayEvents = getDayAllDayEvents(day.dateKey)
      if (dayEvents.length === 0) {
        map.set(day.dateKey, new Map())
        continue
      }
      const sortedIds = dayEvents.map((e) => e.id).sort((a, b) => a - b).join(',')
      const cached = fullDayColumnCache.get(day.dateKey)
      if (cached && cached.idsKey === sortedIds) {
        map.set(day.dateKey, cached.result)
        continue
      }
      const result = assignFullDayColumns(dayEvents)
      fullDayColumnCache.set(day.dateKey, { idsKey: sortedIds, result })
      map.set(day.dateKey, result)
    }
    return map
  })

  // ── Public Accessors: style + pixel positioning ───────
  function getEventColumnStyle(ev: CalendarEvent, dateKey: string): Record<string, string> {
    return columnStyle(dayEventColumns.value.get(dateKey)?.get(ev.id))
  }

  function getFullDayColumnStyle(ev: CalendarEvent, dateKey: string): Record<string, string> {
    return columnStyle(fullDayEventColumns.value.get(dateKey)?.get(ev.id))
  }

  function getEventTop(ev: CalendarEvent): number {
    const t = parseTime(ev.startTime)
    if (!t) return 0
    return (((t.hour - startHour) * 60 + t.min) / 60) * cellHeight
  }

  function getEventHeight(ev: CalendarEvent): number {
    const start = parseTime(ev.startTime)
    const end = parseTime(ev.endTime)
    if (!start || !end) return 24
    const durationMin = (end.hour - start.hour) * 60 + (end.min - start.min)
    return (durationMin / 60) * cellHeight
  }

  return {
    filteredEvents,
    allDayEvents,
    timedEvents,
    hasAllDayEvents,
    getDayAllDayEvents,
    getDayTimedEvents,
    getDayMiniEvents,
    getEventColumnStyle,
    getFullDayColumnStyle,
    getEventTop,
    getEventHeight,
  }
}
