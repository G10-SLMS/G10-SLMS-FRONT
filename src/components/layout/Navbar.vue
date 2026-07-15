<template>
  <header class="sticky top-0 z-[55] flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 text-slate-700 max-lg:px-4">
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="hidden items-center justify-center rounded-md text-slate-400 p-2 transition-colors hover:bg-slate-100 hover:text-slate-900 max-lg:flex"
        aria-label="Toggle menu"
        @click="emit('toggle-sidebar')"
      >
        <Menu :size="20" />
      </button>

      <button
        v-if="auth.isStudent"
        type="button"
        class="flex items-center gap-1.5 rounded-md bg-[#f5a623] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#e09510] max-lg:p-2"
        @click="leaveModal.openCreate()"
      >
        <Plus :size="16" />
        <span class="max-lg:hidden">New Request</span>
      </button>
    </div>

    <div class="flex items-center gap-2">
      <button
        type="button"
        class="flex items-center justify-center rounded-md text-slate-500 p-2 transition-colors hover:bg-slate-100 hover:text-slate-900"
        title="Notifications"
      >
        <Bell :size="20" />
      </button>

      <UserMenu />
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useLeaveFormModalStore } from '@/stores/leaveFormModal'
import { Menu, Bell, Plus } from 'lucide-vue-next'
import UserMenu from '@/components/user/UserMenu.vue'

const auth = useAuthStore()
const leaveModal = useLeaveFormModalStore()

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

</script>
