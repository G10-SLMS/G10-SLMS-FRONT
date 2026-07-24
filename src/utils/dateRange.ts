import { todayKey } from './date'

export type DateRangePreset = 'today' | 'last_7_days' | 'last_30_days' | 'this_month' | 'custom'

export interface DateRangePresetOption {
  value: DateRangePreset
  label: string
}

export const DATE_RANGE_PRESET_OPTIONS: DateRangePresetOption[] = [
  { value: 'today', label: 'Today' },
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' },
]

export interface ResolvedDateRange {
  startDate: string
  endDate: string
}

function toKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function daysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

export function resolveDateRange(
  preset: DateRangePreset,
  customStart?: string,
  customEnd?: string,
): ResolvedDateRange | null {
  const today = todayKey()

  switch (preset) {
    case 'today':
      return { startDate: today, endDate: today }

    case 'last_7_days':
      return { startDate: toKey(daysAgo(6)), endDate: today }

    case 'last_30_days':
      return { startDate: toKey(daysAgo(29)), endDate: today }

    case 'this_month': {
      const now = new Date()
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      return { startDate: toKey(firstOfMonth), endDate: today }
    }

    case 'custom': {
      if (!customStart || !customEnd) return null
      if (new Date(customStart) > new Date(customEnd)) return null
      return { startDate: customStart, endDate: customEnd }
    }

    default:
      return null
  }
}
