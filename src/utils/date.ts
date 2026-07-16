
const LOCALE = 'en-US'
export function formatDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return date.toLocaleDateString(LOCALE, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateShort(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return date.toLocaleDateString(LOCALE, { month: 'short', day: 'numeric' })
}

export function formatWeekday(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return date.toLocaleDateString(LOCALE, { weekday: 'short' }).toUpperCase()
}

export function formatDateRange(start: string | Date, end: string | Date): string {
  return `${formatDateShort(start)} – ${formatDate(end)}`
}
