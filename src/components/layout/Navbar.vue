<template>
  <header class="sticky top-0 z-[55] flex flex-nowrap items-center justify-between border-b border-slate-200 bg-white px-6 py-3 text-slate-700 max-lg:px-4">
    <div class="flex items-center gap-3">
      <button
        class="hidden items-center justify-center rounded-md border-none bg-transparent p-2 text-slate-400 cursor-pointer transition-colors hover:bg-slate-100 hover:text-slate-900 max-lg:flex"
        @click="emit('toggle-sidebar')"
        aria-label="Toggle menu"
      >
        <Menu :size="20" />
      </button>
      <button
        v-if="auth.isStudent"
        class="flex items-center gap-1.5 rounded-md border-none bg-[#f5a623] px-3.5 py-2 text-[13px] font-semibold text-white cursor-pointer transition-colors hover:bg-[#e09510] max-lg:p-2"
        @click="leaveModal.openCreate()"
      >
        <Plus :size="16" />
        <span class="max-lg:hidden">New Request</span>
      </button>
    </div>

    <div class="flex items-center gap-2">
      <button
        class="flex items-center justify-center rounded-md border-none bg-transparent p-2 text-slate-500 cursor-pointer transition-colors hover:bg-slate-100 hover:text-slate-900"
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

const emit = defineEmits<{ 'toggle-sidebar': [] }>()
</script>
