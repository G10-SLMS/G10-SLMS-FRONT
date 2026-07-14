<template>
  <div class="rounded-[10px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
    <span
      class="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg"
      :class="colorClasses"
    >
      <component :is="icon" :size="18" :stroke-width="1.8" />
    </span>
    <p class="mb-2 text-[13px] text-gray-500">{{ label }}</p>
    <p class="text-[28px] font-bold">{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  icon: unknown
  label: string
  value: string | number
  color?: 'blue' | 'amber' | 'green' | 'red'
}>()

const colorClasses = computed(() => {
  switch (props.color) {
    case 'amber':
      return 'bg-amber-100 text-amber-700'
    case 'green':
      return 'bg-green-100 text-green-700'
    case 'red':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-blue-100 text-blue-900'
  }
})
</script>
