<template>
  <div ref="menuRef" class="relative">
    <button
      type="button"
      class="flex items-center gap-2 rounded-md bg-transparent px-2.5 py-1.5 text-slate-700 transition-colors hover:bg-slate-100"
      @click="toggleMenu"
    >
      <span
        class="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cyan-400 text-white"
      >
        <img v-if="avatarUrl" :src="avatarUrl" alt="" class="h-full w-full object-cover" />
        <User v-else :size="18" />
      </span>
      <span class="hidden flex-col items-start leading-tight lg:flex">
        <span class="text-sm font-medium">{{ userName }}</span>
        <span class="text-[10px] font-semibold uppercase tracking-wide text-cyan-600">{{ roleLabel }}</span>
      </span>
      <ChevronDown class="text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': menuOpen }" :size="14" />
    </button>

    <div
      v-if="menuOpen"
      class="absolute right-0 top-full z-10 mt-1 min-w-[170px] overflow-hidden rounded-lg bg-white text-gray-800 shadow-md border border-gray-100 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-300"
    >
      <RouterLink
        to="/profile"
        class="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
        @click="menuOpen = false"
      >
        <UserCircle :size="16" />
        <span>Profile</span>
      </RouterLink>
      <button
        type="button"
        class="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 disabled:opacity-50"
        :disabled="loggingOut"
        @click="requestLogout"
      >
        <LogOut :size="16" />
        <span>{{ loggingOut ? 'Logging out...' : 'Logout' }}</span>
      </button>
    </div>

    <LogoutConfirmModal
      :open="confirmOpen"
      :loading="loggingOut"
      @confirm="logout"
      @cancel="confirmOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDefaultAvatars } from '@/composables/user/useDefaultAvatars'
import LogoutConfirmModal from '@/components/user/LogoutConfirmModal.vue'
import { User, ChevronDown, UserCircle, LogOut } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const { urlFor } = useDefaultAvatars()

const menuOpen = ref(false)
const loggingOut = ref(false)
const confirmOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const userName = computed(() => auth.user?.name || 'Guest User')
const avatarUrl = computed(() => urlFor(auth.user?.avatar_id))

const roleLabel = computed(() => {
  if (auth.isAdmin) return 'Admin'
  if (auth.isEducator) return 'Educator'
  if (auth.isStudent) return 'Student'
  return ''
})

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function handleClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

function requestLogout() {
  menuOpen.value = false
  confirmOpen.value = true
}

async function logout() {
  loggingOut.value = true

  try {
    await auth.logout()
  } catch {
    // Silent catch if API fails
  }

  auth.clearSession()
  await router.push('/login')
  loggingOut.value = false
  confirmOpen.value = false
}
</script>
