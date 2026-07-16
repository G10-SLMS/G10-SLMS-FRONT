import { ref, computed, unref, watch, type Ref } from 'vue'
import { authService } from '@/services/authService'
import { extractErrorMessage } from '@/utils/errors'
import type { DefaultAvatar, Gender } from '@/types/user'

type GenderArg = Gender | '' | null | undefined

const cache = new Map<string, Ref<DefaultAvatar[]>>()
const loadingKeys = ref(new Set<string>())
const errorKeys = ref(new Map<string, string>())
const inFlight = new Map<string, Promise<void>>()

function keyFor(gender: GenderArg): string {
  return gender || ''
}

function load(gender: GenderArg): Promise<void> {
  const key = keyFor(gender)
  if (cache.has(key)) return Promise.resolve()

  const existing = inFlight.get(key)
  if (existing) return existing

  loadingKeys.value = new Set(loadingKeys.value).add(key)

  const promise = authService
    .getDefaultAvatars(gender || undefined)
    .then(({ data }) => {
      cache.set(key, ref(data.avatars))
      const errors = new Map(errorKeys.value)
      errors.delete(key)
      errorKeys.value = errors
    })
    .catch((err) => {
      cache.set(key, ref([]))
      const errors = new Map(errorKeys.value)
      errors.set(key, extractErrorMessage(err, 'Failed to load avatars.'))
      errorKeys.value = errors
    })
    .finally(() => {
      const next = new Set(loadingKeys.value)
      next.delete(key)
      loadingKeys.value = next
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

  const avatars = computed(() => cache.get(key.value)?.value ?? [])
  const loading = computed(() => loadingKeys.value.has(key.value))
  const error = computed(() => errorKeys.value.get(key.value) ?? null)

  function urlFor(avatarId: number | null | undefined): string | null {
    if (!avatarId) return null
    // Look across whatever's been fetched so far, not just the current slice.
    for (const list of cache.values()) {
      const found = list.value.find((a) => a.id === avatarId)
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
