<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed inset-x-3 top-4 z-[200] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:items-end"
    >
      <TransitionGroup name="toast">
        <div
          v-for="notification in store.notifications"
          :key="notification.id"
          class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-3.5 shadow-lg"
          :class="styleFor(notification.type).wrapper"
        >
          <component :is="styleFor(notification.type).icon" :size="18" class="mt-0.5 shrink-0" :class="styleFor(notification.type).icon_color" />
          <p class="min-w-0 flex-1 text-sm font-medium leading-snug" :class="styleFor(notification.type).text">
            {{ notification.message }}
          </p>
          <button
            type="button"
            aria-label="Dismiss"
            class="shrink-0 rounded-md p-0.5 text-current opacity-60 transition-opacity hover:opacity-100"
            @click="store.removeNotification(notification.id)"
          >
            <X :size="14" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-vue-next'
import { useNotificationStore } from '@/stores/notification'
import type { Notification } from '@/stores/notification'

const AUTO_DISMISS_MS = 4000

const store = useNotificationStore()

const timers = new Map<number, ReturnType<typeof setTimeout>>()

function scheduleDismiss(id: number) {
  if (timers.has(id)) return
  timers.set(
    id,
    setTimeout(() => {
      timers.delete(id)
      store.removeNotification(id)
    }, AUTO_DISMISS_MS),
  )
}

watch(
  () => store.notifications.map((n) => n.id),
  (ids) => {
    for (const id of ids) scheduleDismiss(id)
    for (const [id, timer] of timers) {
      if (!ids.includes(id)) {
        clearTimeout(timer)
        timers.delete(id)
      }
    }
  },
  { immediate: true },
)

function styleFor(type: Notification['type']) {
  switch (type) {
    case 'success':
      return { wrapper: 'border-green-100 bg-green-50 text-green-800', icon: CheckCircle2, icon_color: 'text-green-600', text: 'text-green-800' }
    case 'error':
      return { wrapper: 'border-red-100 bg-red-50 text-red-800', icon: XCircle, icon_color: 'text-red-600', text: 'text-red-800' }
    case 'warning':
      return { wrapper: 'border-amber-100 bg-amber-50 text-amber-800', icon: AlertTriangle, icon_color: 'text-amber-600', text: 'text-amber-800' }
    case 'info':
    default:
      return { wrapper: 'border-slate-200 bg-white text-slate-800', icon: Info, icon_color: 'text-slate-500', text: 'text-slate-800' }
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
