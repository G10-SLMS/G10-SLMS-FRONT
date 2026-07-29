import { computed } from 'vue'
import { formatDateKey, mondayOfWeek, addDays, isToday as isDateKeyToday } from '@/utils/calendarDate'
import { formatWeekday, todayKey } from '@/utils/date'

export type CalendarViewMode = 'Day' | 'Week' | 'Month'

export interface CalendarDayCell {
  date: Date
  dateKey: string
  dayName: string
  dayNum: number
  isToday: boolean
}

export interface MonthDayCell extends CalendarDayCell {
  isCurrentMonth: boolean
}

// ── Config Constants ──────────────────────────────────────
export const CALENDAR_START_HOUR = 7
export const CALENDAR_END_HOUR = 23
export const CALENDAR_CELL_HEIGHT = 56

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const DAY_NAMES_PREV_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

// ── Internal Helper ───────────────────────────────────────
function createDayCell(date: Date, dayNames: string[] = DAY_NAMES): CalendarDayCell {
  return {
    date,
    dateKey: formatDateKey(date),
    dayName: dayNames[date.getDay()],
    dayNum: date.getDate(),
    isToday: formatDateKey(date) === todayKey(),
  }
}

export function useCalendarNavigation(
  getCurrentDate: () => Date,
  getView: () => CalendarViewMode,
  onNavigate: (date: Date) => void,
) {
  // ── Grid Cells: hours / week / month ─────────────────
  const hours = computed(() => {
    const h: number[] = []
    for (let i = CALENDAR_START_HOUR; i < CALENDAR_END_HOUR; i++) h.push(i)
    return h
  })

  const weekDays = computed<CalendarDayCell[]>(() => {
    if (getView() === 'Day') {
      return [createDayCell(getCurrentDate())]
    }

    const start = mondayOfWeek(getCurrentDate())
    const days: CalendarDayCell[] = []
    for (let i = 0; i < 7; i++) {
      days.push(createDayCell(addDays(start, i)))
    }
    return days
  })

  const monthDays = computed<MonthDayCell[]>(() => {

    const current = getCurrentDate()
    const y = current.getFullYear()
    const m = current.getMonth()
    const first = new Date(y, m, 1)
    const last = new Date(y, m + 1, 0)
    const startDay = first.getDay()
    const offset = startDay === 0 ? 6 : startDay - 1

    const days: MonthDayCell[] = []

    const prevMonthLast = new Date(y, m, 0).getDate()
    for (let i = offset - 1; i >= 0; i--) {
      days.push({ ...createDayCell(new Date(y, m - 1, prevMonthLast - i), DAY_NAMES_PREV_WEEK), isCurrentMonth: false })
    }

    for (let i = 1; i <= last.getDate(); i++) {
      days.push({ ...createDayCell(new Date(y, m, i)), isCurrentMonth: true })
    }

    const totalCells = Math.ceil(days.length / 7) * 7
    let nextDay = 1
    while (days.length < totalCells) {
      days.push({ ...createDayCell(new Date(y, m + 1, nextDay)), isCurrentMonth: false })
      nextDay++
    }

    return days
  })

  // ── Display Labels ────────────────────────────────────
  const isTodayView = computed(() => {
    const view = getView()
    const current = getCurrentDate()
    if (view === 'Day') return formatDateKey(current) === todayKey()
    if (view === 'Week') {
      const monday = mondayOfWeek(current)
      const sunday = addDays(monday, 6)
      const today = todayKey()
      return formatDateKey(monday) <= today && today <= formatDateKey(sunday)
    }
    return false
  })

  const rangeLabel = computed(() => {
    const view = getView()
    const current = getCurrentDate()
    if (view === 'Day') {
      return `${formatWeekday(current)} ${current.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    }
    if (view === 'Week') {
      const start = mondayOfWeek(current)
      const end = addDays(start, 6)
      const sameMonth = start.getMonth() === end.getMonth()
      const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (sameMonth) return `${startLabel} – ${end.getDate()}, ${end.getFullYear()}`
      return `${startLabel} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    }
    return current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  })

  const prevLabel = computed(() => {
    const view = getView()
    if (view === 'Day') return 'Previous day'
    if (view === 'Week') return 'Previous week'
    return 'Previous month'
  })

  const nextLabel = computed(() => {
    const view = getView()
    if (view === 'Day') return 'Next day'
    if (view === 'Week') return 'Next week'
    return 'Next month'
  })

  // ── Navigation Actions ────────────────────────────────
  function prev() {
    const d = new Date(getCurrentDate())
    const view = getView()
    if (view === 'Day') d.setDate(d.getDate() - 1)
    else if (view === 'Week') d.setDate(d.getDate() - 7)
    else d.setMonth(d.getMonth() - 1, 1)
    onNavigate(d)
  }

  function next() {
    const d = new Date(getCurrentDate())
    const view = getView()
    if (view === 'Day') d.setDate(d.getDate() + 1)
    else if (view === 'Week') d.setDate(d.getDate() + 7)
    else d.setMonth(d.getMonth() + 1, 1)
    onNavigate(d)
  }

  function goToday() {
    onNavigate(new Date())
  }

  return {
    CELL_HEIGHT: CALENDAR_CELL_HEIGHT,
    START_HOUR: CALENDAR_START_HOUR,
    hours,
    weekDays,
    monthDays,
    isToday: isDateKeyToday,
    isTodayView,
    rangeLabel,
    prevLabel,
    nextLabel,
    prev,
    next,
    goToday,
  }
}
