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

/** e.g. "Just now", "5m ago", "3h ago", "Yesterday", "Jan 5" */
export function formatRelativeTime(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  if (Number.isNaN(date.getTime())) return '—'

  const seconds = Math.round((Date.now() - date.getTime()) / 1000)

  if (seconds < 45) return 'Just now'

  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.round(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`

  return formatDateShort(date)
}
