<template>
  <span
    class="inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize"
    :class="{
      'bg-amber-100 text-amber-700': normalizedStatus === 'pending',
      'bg-green-100 text-green-700': normalizedStatus === 'approved',
      'bg-red-100 text-red-700': normalizedStatus === 'rejected',
      'bg-slate-200 text-slate-600': normalizedStatus === 'cancelled',
      'bg-gray-100 text-gray-500': !KNOWN_STATUSES.includes(normalizedStatus),
    }"
  >
    {{ normalizedStatus || 'Unknown' }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const KNOWN_STATUSES = ['pending', 'approved', 'rejected', 'cancelled']

const props = defineProps<{
  status: string
}>()

const normalizedStatus = computed(() => (props.status ?? '').trim().toLowerCase())
</script>
