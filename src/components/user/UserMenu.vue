<template>
  <div class="relative">
    <button
      class="flex items-center gap-2 rounded-md border-none bg-transparent px-2.5 py-1.5 text-slate-700 cursor-pointer transition-colors hover:bg-slate-100"
      @click="toggleMenu"
    >
      <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <User :size="18" />
      </span>
      <span class="hidden flex-col items-start leading-tight lg:flex">
        <span class="text-sm font-medium">{{ userName }}</span>
        <span class="text-[11px] font-medium uppercase tracking-wide text-blue-600">{{ roleLabel }}</span>
      </span>
      <ChevronDown class="text-slate-400" :size="14" />
    </button>

    <div v-if="menuOpen" class="absolute right-0 top-[52px] z-10 min-w-[170px] overflow-hidden rounded-lg bg-white text-gray-800 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
      <RouterLink
        to="/profile"
        class="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-800 no-underline hover:bg-gray-100"
        @click="menuOpen = false"
      >
        <UserCircle :size="16" />
        <span>Profile</span>
      </RouterLink>
      <button
        class="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-4 py-2.5 text-left text-sm text-red-500 hover:bg-gray-100"
        @click="logout"
      >
        <LogOut :size="16" />
        <span>Logout</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { User, ChevronDown, UserCircle, LogOut } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()

const menuOpen = ref(false)

const userName = computed(() => auth.user?.name || 'Guest User')

const roleLabel = computed(() => {
  if (auth.isAdmin) return 'Admin'
  if (auth.isTrainer) return 'Trainer'
  if (auth.isStudent) return 'Student'
  return ''
})

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

async function logout() {
  menuOpen.value = false
  await auth.logout()
  router.push('/login')
}
</script>
