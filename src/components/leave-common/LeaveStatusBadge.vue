<template>
  <span
    class="inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize"
    :class="statusClasses"
  >
    {{ normalizedStatus || 'Unknown' }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getStatusColor, STATUS_COLORS } from '@/utils/leaveStatusConfig'

const KNOWN_STATUSES = Object.keys(STATUS_COLORS)

const props = defineProps<{
  status: string
}>()

const normalizedStatus = computed(() => (props.status ?? '').trim().toLowerCase())

const statusClasses = computed(() => {
  if (KNOWN_STATUSES.includes(normalizedStatus.value)) {
    const cfg = getStatusColor(props.status)
    return `${cfg.bg} ${cfg.text}`
  }
  return 'bg-gray-100 text-gray-500'
})
</script>
