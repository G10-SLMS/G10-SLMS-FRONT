import { STATUS_COLORS } from './leaveStatusConfig'

// ── Vue-Calendar Event Classes/Styles ────────────────────
export function statusEventClass(status: string): string {
  const s = status.toLowerCase()
  if (s === 'approved') return 'vc-approved'
  if (s === 'rejected') return 'vc-rejected'
  if (s === 'cancelled') return 'vc-cancelled'
  if (s === 'pending') return 'vc-pending'
  if (s === 'under_review') return 'vc-under_review'
  return 'vc-unknown'
}

export function statusDotBg(status: string): string {
  const key = status.toLowerCase()
  return STATUS_COLORS[key]?.css.background ?? STATUS_COLORS.pending.css.background
}

export function miniStyle(status: string): Record<string, string> {
  const s = status.toLowerCase()
  const map: Record<string, { bg: string; text: string }> = {
    approved: { bg: STATUS_COLORS.approved.css.background, text: STATUS_COLORS.approved.css.color },
    rejected: { bg: STATUS_COLORS.rejected.css.background, text: STATUS_COLORS.rejected.css.color },
    cancelled: { bg: STATUS_COLORS.cancelled.css.background, text: STATUS_COLORS.cancelled.css.color },
    pending: { bg: STATUS_COLORS.pending.css.background, text: STATUS_COLORS.pending.css.color },
    under_review: { bg: STATUS_COLORS.under_review.css.background, text: STATUS_COLORS.under_review.css.color },
  }
  const c = map[s] ?? map.pending
  return { background: c.bg, color: c.text }
}

export function miniDotStyle(status: string): Record<string, string> {
  const key = status.toLowerCase()
  return { background: STATUS_COLORS[key]?.css.background ?? STATUS_COLORS.pending.css.background }
}

// ── CSS Custom Properties (for the calendar theme) ──────
export function statusColorVars(): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const [status, cfg] of Object.entries(STATUS_COLORS)) {
    vars[`--vc-${status}-bg`] = cfg.css.background
    vars[`--vc-${status}-color`] = cfg.css.color
    vars[`--vc-${status}-border`] = cfg.css.borderLeft
    vars[`--vc-${status}-hover-bg`] = cfg.css.hoverBackground
  }
  return vars
}
