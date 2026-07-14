<template>
  <div
    class="absolute flex flex-col gap-0.5 overflow-hidden rounded-lg border-l-[3px] p-2 px-2.5"
    :class="statusClasses"
    :style="blockStyle"
    :title="title"
  >
    <span class="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold">
      <slot name="title" />
    </span>
    <span class="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] opacity-85">
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

const statusClasses = computed(() => {
  switch (props.status.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-700 border-l-green-500'
    case 'rejected':
      return 'bg-red-100 text-red-700 border-l-red-500'
    default:
      return 'bg-amber-100 text-amber-700 border-l-amber-500'
  }
})
</script>
