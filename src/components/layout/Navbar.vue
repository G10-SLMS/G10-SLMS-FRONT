<template>
  <header
    class="sticky top-0 z-[55] flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 text-slate-700 max-lg:px-4 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-300"
  >
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="hidden items-center justify-center rounded-md text-slate-400 p-2 transition-colors hover:bg-slate-100 hover:text-slate-900 max-lg:flex"
        aria-label="Toggle menu"
        @click="emit('toggle-sidebar')"
      >
        <Menu :size="20" />
      </button>
    </div>

    <div class="flex items-center gap-2">
      <ThemeToggle />
      <NotificationBell />

      <UserMenu />
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu } from 'lucide-vue-next';
import ThemeToggle from '@/components/ui/ThemeToggle.vue';
import UserMenu from '@/components/user/menu/UserMenu.vue';
import NotificationBell from '@/components/layout/NotificationBell.vue';

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void;
}>();
</script>
