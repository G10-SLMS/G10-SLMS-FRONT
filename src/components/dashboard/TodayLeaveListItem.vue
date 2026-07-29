<template>
  <li class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
    <component
      :is="clickable ? 'button' : 'span'"
      :type="clickable ? 'button' : undefined"
      :class="clickable ? 'shrink-0 rounded-full border-0 bg-transparent p-0 transition-opacity hover:opacity-80' : 'shrink-0'"
      @click="clickable && emit('select', item.id)"
    >
      <img
        v-if="item.user?.avatar?.url"
        :src="item.user.avatar.url"
        :alt="item.user?.name || 'User'"
        class="h-9 w-9 rounded-full object-cover"
      />
      <span
        v-else
        :class="['flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white', getAvatarColor(item.user?.name || 'Leave')]"
      >
        {{ getInitials(item.user?.name || 'Leave') }}
      </span>
    </component>
    <div class="min-w-0 flex-1">
      <p class="m-0 truncate text-sm text-gray-800">
        <component
          :is="clickable ? 'button' : 'span'"
          :type="clickable ? 'button' : undefined"
          :class="clickable ? 'border-0 bg-transparent p-0 font-medium text-inherit underline-offset-2 hover:underline' : 'font-medium'"
          @click="clickable && emit('select', item.id)"
        >
          {{ item.user?.name || 'Unknown user' }}
        </component>
        {{ verb }} <span class="font-medium">{{ item.leave_type_name }}</span>
      </p>
      <p class="m-0 text-xs text-gray-400">{{ formatDateRange(item.start_date, item.end_date) }}</p>
    </div>
    <LeaveStatusBadge v-if="showStatus" :status="item.status" />
  </li>
</template>

<script setup lang="ts">
import { getInitials, getAvatarColor } from '@/utils/initials'
import { formatDateRange } from '@/utils/date'
import LeaveStatusBadge from '@/components/leave-common/LeaveStatusBadge.vue'
import type { LeaveRequestListItem } from '@/types/leave'

withDefaults(
  defineProps<{
    item: LeaveRequestListItem
    verb?: string
    showStatus?: boolean
    clickable?: boolean
  }>(),
  {
    verb: 'requested',
    showStatus: true,
    clickable: false,
  },
)

const emit = defineEmits<{
  select: [id: number]
}>()
</script>
