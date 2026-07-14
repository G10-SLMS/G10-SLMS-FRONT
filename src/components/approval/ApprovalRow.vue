<template>
  <tr class="border-b border-gray-100 last:border-none">
    <td class="px-4 py-3.5 align-middle text-left">
      <div class="flex items-center gap-2.5 font-medium">
        <span class="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-cyan-400 text-xs font-semibold text-white">{{ initials(request.student) }}</span>
        {{ request.student }}
      </div>
    </td>
    <td class="px-4 py-3.5 align-middle text-left">{{ request.type }}</td>
    <td class="px-4 py-3.5 align-middle text-left">{{ request.startDate }}</td>
    <td class="px-4 py-3.5 align-middle text-left">{{ request.endDate }}</td>
    <td class="max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-3.5 align-middle text-left text-gray-500">{{ request.reason }}</td>
    <td class="px-4 py-3.5 align-middle text-left">
      <LeaveStatusBadge :status="request.status" />
    </td>
    <td v-if="showActions" class="px-4 py-3.5 align-middle text-left">
      <div class="flex gap-2">
        <button
          class="flex items-center gap-1 whitespace-nowrap rounded-md border border-transparent bg-green-100 px-2.5 py-1.5 text-xs font-semibold text-green-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:bg-green-200"
          :disabled="request.processing"
          @click="$emit('decide', 'Approved')"
        >
          <Check :size="15" />
          Approve
        </button>
        <button
          class="flex items-center gap-1 whitespace-nowrap rounded-md border border-transparent bg-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:bg-red-200"
          :disabled="request.processing"
          @click="$emit('decide', 'Rejected')"
        >
          <X :size="15" />
          Reject
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { Check, X } from 'lucide-vue-next'
import LeaveStatusBadge from '@/components/leave/LeaveStatusBadge.vue'

defineProps<{
  request: {
    id: number
    student: string
    type: string
    startDate: string
    endDate: string
    reason: string
    status: 'Pending' | 'Approved' | 'Rejected'
    processing?: boolean
  }
  showActions?: boolean
}>()

defineEmits<{
  decide: [decision: 'Approved' | 'Rejected']
}>()

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
</script>
