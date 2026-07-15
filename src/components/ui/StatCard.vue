<template>
  <div class="rounded-xl bg-white p-5 shadow-sm">
    <span
      class="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
      :class="colorClasses"
    >
      <component :is="icon" :size="18" :stroke-width="1.8" />
    </span>
    <p class="mb-1 text-xs font-medium text-gray-500">{{ label }}</p>
    <p class="text-3xl font-bold text-gray-900">{{ value }}</p>
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
