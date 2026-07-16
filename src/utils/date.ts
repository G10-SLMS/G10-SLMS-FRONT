/**
 * Centralized date formatting helpers.
 * Use these instead of calling `new Date(...).toLocaleDateString(...)`
 * inline in components — keeps date display consistent app-wide and
 * makes it a one-line change if the format needs to change later.
 */

const LOCALE = 'en-US'

/** e.g. "Jan 5, 2026" */
export function formatDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return date.toLocaleDateString(LOCALE, { month: 'short', day: 'numeric', year: 'numeric' })
}

/** e.g. "Jan 5" (no year) */
export function formatDateShort(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return date.toLocaleDateString(LOCALE, { month: 'short', day: 'numeric' })
}

/** e.g. "MON" */
export function formatWeekday(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return date.toLocaleDateString(LOCALE, { weekday: 'short' }).toUpperCase()
}

/** e.g. "Jan 5 – Jan 10, 2026" */
export function formatDateRange(start: string | Date, end: string | Date): string {
  return `${formatDateShort(start)} – ${formatDate(end)}`
}
