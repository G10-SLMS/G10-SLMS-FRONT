export type StudentColorEntry = {
  background: string
  color: string
  border: string
  hoverBackground: string
}

// ── Color Palette ─────────────────────────────────────────
const PALETTE: StudentColorEntry[] = [
  { background: '#dbeafe', color: '#1e40af', border: '#3b82f6', hoverBackground: '#bfdbfe' }, // blue
  { background: '#ede9fe', color: '#6d28d9', border: '#8b5cf6', hoverBackground: '#ddd6fe' }, // purple
  { background: '#fce7f3', color: '#be185d', border: '#ec4899', hoverBackground: '#fbcfe8' }, // pink
  { background: '#ffedd5', color: '#c2410c', border: '#f97316', hoverBackground: '#fed7aa' }, // orange
  { background: '#ccfbf1', color: '#0f766e', border: '#14b8a6', hoverBackground: '#99f6e4' }, // teal
  { background: '#e0e7ff', color: '#4338ca', border: '#6366f1', hoverBackground: '#c7d2fe' }, // indigo
  { background: '#ffe4e6', color: '#be123c', border: '#f43f5e', hoverBackground: '#fecdd3' }, // rose
  { background: '#ecfccb', color: '#4d7c0f', border: '#84cc16', hoverBackground: '#d9f99d' }, // lime
  { background: '#cffafe', color: '#0e7490', border: '#06b6d4', hoverBackground: '#a5f3fc' }, // cyan
  { background: '#fef3c7', color: '#b45309', border: '#f59e0b', hoverBackground: '#fde68a' }, // amber
  { background: '#fae8ff', color: '#a21caf', border: '#d946ef', hoverBackground: '#f5d0fe' }, // fuchsia
  { background: '#d1fae5', color: '#047857', border: '#10b981', hoverBackground: '#a7f3d0' }, // emerald
  { background: '#e0f2fe', color: '#0369a1', border: '#0ea5e9', hoverBackground: '#bae6fd' }, // sky
  { background: '#f3e8ff', color: '#7e22ce', border: '#a855f7', hoverBackground: '#e9d5ff' }, // violet
]

// ── Deterministic Color Assignment ──────────────────────
function paletteIndex(studentId: number | string): number {
  const n = typeof studentId === 'number' ? studentId : Number(studentId) || 0
  const hashed = Math.imul(n, 2654435761) >>> 0
  return hashed % PALETTE.length
}

export function getStudentColor(studentId: number | string): StudentColorEntry {
  return PALETTE[paletteIndex(studentId)]
}

export function studentChipStyle(studentId: number | string): Record<string, string> {
  const c = getStudentColor(studentId)
  return {
    background: c.background,
    color: c.color,
    borderLeft: `3px solid ${c.border}`,
  }
}

export function studentDotColor(studentId: number | string): string {
  return getStudentColor(studentId).border
}

export function studentMiniStyle(studentId: number | string): Record<string, string> {
  const c = getStudentColor(studentId)
  return { background: c.background, color: c.color }
}

export function studentMiniDotStyle(studentId: number | string): Record<string, string> {
  return { background: getStudentColor(studentId).border }
}
