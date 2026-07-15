<template>
  <div
    class="absolute flex flex-col gap-0.5 overflow-hidden rounded-lg border-l-4 p-2 px-2.5"
    :class="statusClasses"
    :style="blockStyle"
    :title="title"
  >
    <span class="truncate text-xs font-bold">
      <slot name="title" />
    </span>
    <span class="truncate text-[11px] opacity-85">
      <slot name="subtitle" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
  title: string
  blockStyle: Record<string, string>
}>()

const STATUS_MAP: Record<string, string> = {
  approved: 'bg-green-100 text-green-700 border-l-green-500',
  rejected: 'bg-red-100 text-red-700 border-l-red-500',
  pending: 'bg-amber-100 text-amber-700 border-l-amber-500'
}

const statusClasses = computed(() => {
  const normalizedStatus = props.status.toLowerCase()
  return STATUS_MAP[normalizedStatus] || STATUS_MAP.pending
})

</script>
