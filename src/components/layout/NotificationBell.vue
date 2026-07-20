<template>
  <div ref="bellRef" class="relative">
    <button
      type="button"
      class="relative flex items-center justify-center rounded-md text-slate-500 p-2 transition-colors hover:bg-slate-100 hover:text-slate-900"
      title="Notifications"
      aria-haspopup="true"
      :aria-expanded="open"
      @click="toggle"
    >
      <Bell :size="20" />
      <span
        v-if="store.unreadCount > 0"
        class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white"
      >
        {{ badgeCount }}
      </span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-full z-10 mt-1 flex max-h-[28rem] w-80 flex-col overflow-hidden rounded-lg border border-gray-100 bg-white text-gray-800 shadow-md sm:w-96"
    >
      <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 class="text-sm font-semibold text-slate-900">Notifications</h3>
        <button
          type="button"
          class="text-xs font-medium text-cyan-600 transition-colors hover:text-cyan-700 disabled:cursor-not-allowed disabled:text-slate-300"
          :disabled="store.unreadCount === 0"
          @click="store.markAllAsRead()"
        >
          Mark all as read
        </button>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto">
        <div v-if="store.loading" class="px-4 py-3">
          <ActivityListSkeleton :rows="3" />
        </div>

        <div
          v-else-if="store.error"
          class="flex flex-col items-center gap-2 px-5 py-10 text-center"
        >
          <AlertTriangle :size="22" class="text-slate-300" />
          <p class="text-sm text-slate-500">{{ store.error }}</p>
          <button
            type="button"
            class="text-xs font-medium text-cyan-600 hover:text-cyan-700"
            @click="store.fetchNotifications()"
          >
            Try again
          </button>
        </div>

        <div
          v-else-if="store.items.length === 0"
          class="flex flex-col items-center gap-2 px-5 py-10 text-center"
        >
          <BellOff :size="22" class="text-slate-300" />
          <p class="text-sm font-medium text-slate-600">You're all caught up</p>
          <p class="text-xs text-slate-400">New leave request updates will show up here.</p>
        </div>

        <div v-else class="divide-y divide-slate-100">
          <NotificationItem
            v-for="notification in store.items"
            :key="notification.id"
            :notification="notification"
            @open="handleOpen"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, BellOff, AlertTriangle } from 'lucide-vue-next'
import { useLeaveNotificationsStore } from '@/stores/leaveNotifications'
import { useAuthStore } from '@/stores/auth'
import NotificationItem from '@/components/layout/NotificationItem.vue'
import ActivityListSkeleton from '@/components/shared/ActivityListSkeleton.vue'
import type { LeaveNotificationItem } from '@/types/notification'

const router = useRouter()
const auth = useAuthStore()
const store = useLeaveNotificationsStore()

const open = ref(false)
const bellRef = ref<HTMLElement | null>(null)

const badgeCount = computed(() => (store.unreadCount > 9 ? '9+' : store.unreadCount))

function toggle() {
  open.value = !open.value
  if (open.value && !store.loaded) {
    store.fetchNotifications()
  }
}

function handleOpen(notification: LeaveNotificationItem) {
  store.markAsRead(notification.id)
  open.value = false

  const destination = auth.isStudent ? 'LeaveRequests' : 'Approvals'
  router.push({ name: destination, query: { leaveRequestId: String(notification.leave_request_id) } })
}

function handleClickOutside(e: MouseEvent) {
  if (bellRef.value && !bellRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  store.fetchNotifications()
})
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
</script>
