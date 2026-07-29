// Encodes generation/class names for use as route params. `null` (unassigned)
// gets a stable sentinel slug so it round-trips through the URL safely.
export const UNASSIGNED_SLUG = '_unassigned_'

export function toSlug(value: string | null): string {
  return value === null ? UNASSIGNED_SLUG : encodeURIComponent(value)
}

export function fromSlug(slug: string | string[] | undefined): string | null {
  if (!slug || Array.isArray(slug) || slug === UNASSIGNED_SLUG) return null
  return decodeURIComponent(slug)
}
