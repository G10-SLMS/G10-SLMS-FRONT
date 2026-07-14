<template>
  <tr class="border-b border-gray-100 last:border-none">
    <td class="px-4 py-3.5 text-left">{{ request.student }}</td>
    <td class="px-4 py-3.5 text-left">{{ request.type }}</td>
    <td class="px-4 py-3.5 text-left">{{ request.leaveDate }}</td>
    <td class="whitespace-nowrap px-4 py-3.5 text-left text-gray-500">{{ timeAgo }}</td>
    <td class="px-4 py-3.5 text-left">
      <LeaveStatusBadge :status="request.status" />
    </td>
    <td v-if="showActions" class="px-4 py-3.5 text-left">
      <button
        v-if="request.status === 'Pending'"
        class="flex items-center gap-1 rounded-md border-none bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-600 cursor-pointer hover:bg-blue-100"
        @click="$emit('edit', request.id)"
      >
        <Pencil :size="14" />
        Edit
      </button>
      <span v-else class="text-[13px] text-gray-400">—</span>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Pencil } from 'lucide-vue-next'
import LeaveStatusBadge from './LeaveStatusBadge.vue'

const props = defineProps({
  request: {
    type: Object,
    required: true,
  },
  showActions: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['edit'])

const timeAgo = computed(() => {
  const submitted = new Date(props.request.submittedAt)
  if (Number.isNaN(submitted.getTime())) return ''

  const diffMs = Date.now() - submitted.getTime()
  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return submitted.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
})
</script>
