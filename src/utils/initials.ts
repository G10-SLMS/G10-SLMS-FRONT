export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const AVATAR_COLORS = [
  'bg-cyan-400',
  'bg-violet-400',
  'bg-rose-400',
  'bg-amber-400',
  'bg-emerald-400',
  'bg-blue-400',
  'bg-fuchsia-400',
  'bg-orange-400',
  'bg-teal-400',
  'bg-indigo-400',
]

export function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i)
    hash |= 0
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
