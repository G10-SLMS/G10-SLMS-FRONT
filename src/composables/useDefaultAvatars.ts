import { reactive, computed, unref, watch, type Ref } from 'vue'
import { authService } from '@/services/authService'
import { extractErrorMessage } from '@/utils/errors'
import type { DefaultAvatar, Gender } from '@/types/user'

type GenderArg = Gender | '' | null | undefined

const cache = reactive(new Map<string, DefaultAvatar[]>())
const loadingKeys = reactive(new Set<string>())
const errorKeys = reactive(new Map<string, string>())
const inFlight = new Map<string, Promise<void>>()

function keyFor(gender: GenderArg): string {
  return gender || ''
}

function load(gender: GenderArg): Promise<void> {
  const key = keyFor(gender)
  if (cache.has(key)) return Promise.resolve()

  const existing = inFlight.get(key)
  if (existing) return existing

  loadingKeys.add(key)

  const promise = authService
    .getDefaultAvatars(gender || undefined)
    .then(({ data }) => {
      cache.set(key, data.avatars)
      errorKeys.delete(key)
    })
    .catch((err) => {
      cache.set(key, [])
      errorKeys.set(key, extractErrorMessage(err, 'Failed to load avatars.'))
    })
    .finally(() => {
      loadingKeys.delete(key)
      inFlight.delete(key)
    })

  inFlight.set(key, promise)
  return promise
}

export function useDefaultAvatars(gender?: GenderArg | Ref<GenderArg>) {
  const genderValue = computed(() => unref(gender) ?? null)
  const key = computed(() => keyFor(genderValue.value))

  load(genderValue.value)
  if (gender && typeof gender === 'object' && 'value' in gender) {
    watch(genderValue, (g) => load(g))
  }

  const avatars = computed(() => cache.get(key.value) ?? [])
  const loading = computed(() => loadingKeys.has(key.value))
  const error = computed(() => errorKeys.get(key.value) ?? null)

  function urlFor(avatarId: number | null | undefined): string | null {
    if (!avatarId) return null
    for (const list of cache.values()) {
      const found = list.find((a) => a.id === avatarId)
      if (found) return found.url
    }
    return null
  }

  return {
    avatars,
    loading,
    error,
    urlFor,
  }
}
