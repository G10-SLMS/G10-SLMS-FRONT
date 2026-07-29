import { todayKey } from './date'

export type CalendarViewMode = 'Day' | 'Week' | 'Month'

// ── Date Key Helpers ─────────────────────────────────────
export function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function mondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function isToday(dateKey: string | undefined): boolean {
  if (!dateKey) return false
  return dateKey === todayKey()
}

// ── View Range (Day/Week/Month) ─────────────────────────
export function viewDateRange(current: Date, view: CalendarViewMode): { start: string; end: string } {
  if (view === 'Day') {
    const key = formatDateKey(current)
    return { start: key, end: key }
  }
  if (view === 'Week') {
    const start = mondayOfWeek(current)
    const end = addDays(start, 6)
    return { start: formatDateKey(start), end: formatDateKey(end) }
  }
  const year = current.getFullYear()
  const month = current.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  return { start: formatDateKey(first), end: formatDateKey(last) }
}

// ── Time Formatting ──────────────────────────────────────
export function formatHour(hour: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h = hour % 12 || 12
  return `${h}${ampm}`
}

export function formatTimeLabel(time: string | undefined): string {
  if (!time) return ''
  const parts = time.split(':')
  if (parts.length >= 2) {
    const h = Number(parts[0])
    const ampm = h >= 12 ? 'PM' : 'AM'
    const displayHour = h % 12 || 12
    return `${displayHour}:${parts[1]}${ampm}`
  }
  return time
}
