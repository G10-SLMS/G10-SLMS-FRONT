<template>
  <div class="flex flex-wrap items-center gap-2.5">
    <select
      :value="range"
      class="w-full rounded-md border border-gray-200 bg-white px-2.5 py-[9px] text-[13px] text-gray-700 sm:w-auto"
      @change="$emit('update:range', ($event.target as HTMLSelectElement).value as ReportRange)"
    >
      <option value="30d">Last 30 days</option>
      <option value="90d">Last 90 days</option>
      <option value="ytd">Year to date</option>
      <option value="custom">Custom range</option>
    </select>

    <template v-if="range === 'custom'">
      <input
        :value="startDate"
        type="date"
        :max="endDate || undefined"
        class="w-full rounded-md border border-gray-200 bg-white px-2.5 py-[9px] text-[13px] text-gray-700 sm:w-auto"
        @change="$emit('update:startDate', ($event.target as HTMLInputElement).value)"
      />
      <span class="text-[13px] text-gray-400">to</span>
      <input
        :value="endDate"
        type="date"
        :min="startDate || undefined"
        class="w-full rounded-md border border-gray-200 bg-white px-2.5 py-[9px] text-[13px] text-gray-700 sm:w-auto"
        @change="$emit('update:endDate', ($event.target as HTMLInputElement).value)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ReportRange } from '@/types/stats'

defineProps<{
  range: ReportRange
  startDate: string
  endDate: string
}>()

defineEmits<{
  (e: 'update:range', value: ReportRange): void
  (e: 'update:startDate', value: string): void
  (e: 'update:endDate', value: string): void
}>()
</script>
