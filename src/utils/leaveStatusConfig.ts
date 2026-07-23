export type StatusColorCss = {
  background: string
  color: string
  borderLeft: string
  hoverBackground: string
}

export type StatusColorConfig = {
  bg: string
  text: string
  border: string
  css: StatusColorCss
}

export const STATUS_COLORS: Record<string, StatusColorConfig> = {
  approved: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-l-green-500',
    css: {
      background: '#dcfce7',
      color: '#15803d',
      borderLeft: '3px solid #22c55e',
      hoverBackground: '#bbf7d0',
    },
  },
  rejected: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-l-red-500',
    css: {
      background: '#fee2e2',
      color: '#991b1b',
      borderLeft: '3px solid #ef4444',
      hoverBackground: '#fecaca',
    },
  },
  cancelled: {
    bg: 'bg-slate-200',
    text: 'text-slate-600',
    border: 'border-l-slate-500',
    css: {
      background: '#e5e7eb',
      color: '#4b5563',
      borderLeft: '3px solid #9ca3af',
      hoverBackground: '#d1d5db',
    },
  },
  pending: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-l-amber-500',
    css: {
      background: '#fef3c7',
      color: '#92400e',
      borderLeft: '3px solid #f59e0b',
      hoverBackground: '#fde68a',
    },
  },
  unknown: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-l-gray-500',
    css: {
      background: '#4b5563',
      color: '#fff',
      borderLeft: '3px solid #374151',
      hoverBackground: '#374151',
    },
  },
}

export function getStatusColor(status: string): StatusColorConfig {
  const key = (status ?? '').toLowerCase()
  return STATUS_COLORS[key] ?? STATUS_COLORS.pending
}
