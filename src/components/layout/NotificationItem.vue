<template>
  <button
    type="button"
    class="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
    :class="notification.read ? 'bg-white' : 'bg-cyan-50/60'"
    @click="$emit('open', notification)"
  >
    <span
      class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
      :class="iconStyle.bg"
    >
      <component :is="iconStyle.icon" :size="15" :class="iconStyle.text" />
    </span>

    <span class="min-w-0 flex-1">
      <span class="flex items-start justify-between gap-2">
        <span class="text-sm font-semibold leading-snug text-slate-900">{{ notification.title }}</span>
        <span
          v-if="!notification.read"
          class="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-500"
          aria-label="Unread"
        />
      </span>
      <span class="mt-0.5 block text-sm leading-snug text-slate-500">{{ notification.message }}</span>
      <span class="mt-1 block text-xs text-slate-400">{{ relativeTime }}</span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, XCircle, Ban, Clock3 } from 'lucide-vue-next'
import { formatRelativeTime } from '@/utils/date'
import type { LeaveNotificationItem } from '@/types/notification'

const props = defineProps<{
  notification: LeaveNotificationItem
}>()

defineEmits<{
  open: [notification: LeaveNotificationItem]
}>()

const relativeTime = computed(() => formatRelativeTime(props.notification.created_at))

const iconStyle = computed(() => {
  switch (props.notification.type) {
    case 'leave_approved':
      return { icon: CheckCircle2, bg: 'bg-green-100', text: 'text-green-600' }
    case 'leave_rejected':
      return { icon: XCircle, bg: 'bg-red-100', text: 'text-red-600' }
    case 'leave_cancelled':
      return { icon: Ban, bg: 'bg-slate-200', text: 'text-slate-500' }
    case 'leave_submitted':
    default:
      return { icon: Clock3, bg: 'bg-amber-100', text: 'text-amber-600' }
  }
})
</script>
