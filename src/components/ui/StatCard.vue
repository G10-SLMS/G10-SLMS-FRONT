<template>
  <div class="rounded-xl bg-white p-4 shadow-sm sm:p-5 dark:bg-surface-card">
    <span
      class="mb-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors sm:mb-3 sm:h-9 sm:w-9"
      :class="colorClasses"
    >
      <component :is="icon" :size="18" :stroke-width="1.8" />
    </span>
    <p class="mb-1 text-[11px] font-medium text-gray-500 sm:text-xs">{{ label }}</p>
    <p class="text-2xl font-bold text-gray-900 sm:text-3xl">{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'

type StatCardColor = 'blue' | 'amber' | 'green' | 'red'

interface StatCardProps {
  icon: Component | string
  label: string
  value: string | number
  color?: StatCardColor
}

const props = withDefaults(defineProps<StatCardProps>(), {
  color: 'blue'
})

const colorClasses = computed(() => {
  switch (props.color) {
    case 'amber':
      return 'bg-amber-100 text-amber-700'
    case 'green':
      return 'bg-green-100 text-green-700'
    case 'red':
      return 'bg-red-100 text-red-700'
    case 'blue':
    default:
      return 'bg-blue-100 text-blue-700'
  }
})
</script>
