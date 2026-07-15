import { ref, computed, type Ref } from 'vue'
import { authService } from '@/services/authService'
import type { DefaultAvatar, Gender } from '@/types/user'

// Module-level cache so every component sharing this composable reuses the
// same fetch instead of re-requesting the list on every mount.
const avatars = ref<DefaultAvatar[]>([])
const loading = ref(false)
const loaded = ref(false)
let inFlight: Promise<void> | null = null

async function load(): Promise<void> {
  if (loaded.value) return
  if (inFlight) return inFlight

  loading.value = true
  inFlight = authService
    .getDefaultAvatars()
    .then(({ data }) => {
      avatars.value = data.avatars
      loaded.value = true
    })
    .catch(() => {
      avatars.value = []
    })
    .finally(() => {
      loading.value = false
      inFlight = null
    })

  return inFlight
}

/**
 * Shared read access to the default avatar pool, plus a lookup helper for
 * resolving a user's chosen avatar to its image URL.
 */
export function useDefaultAvatars() {
  load()

  function urlFor(avatarId: number | null | undefined): string | null {
    if (!avatarId) return null
    return avatars.value.find((a) => a.id === avatarId)?.url ?? null
  }

  function forGender(gender: Gender | '' | null | undefined): Ref<DefaultAvatar[]> {
    return computed(() => (gender ? avatars.value.filter((a) => a.gender === gender) : avatars.value)) as unknown as Ref<DefaultAvatar[]>
  }

  return {
    avatars: computed(() => avatars.value),
    loading: computed(() => loading.value),
    urlFor,
    forGender,
  }
}
