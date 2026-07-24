<template>
  <div class="mb-4 flex flex-wrap items-center gap-2.5">
    <select
      :value="range"
      class="rounded-md border border-gray-200 bg-white px-2.5 py-[7px] text-[13px] text-gray-700 outline-none focus:border-blue-400"
      @change="$emit('update:range', ($event.target as HTMLSelectElement).value as ReportRange)"
    >
      <option v-for="opt in rangeOptions" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>

    <template v-if="range === 'custom'">
      <input
        type="date"
        :value="startDate"
        :max="endDate || undefined"
        class="rounded-md border border-gray-200 bg-white px-2.5 py-[7px] text-[13px] text-gray-700 outline-none focus:border-blue-400"
        @change="$emit('update:startDate', ($event.target as HTMLInputElement).value)"
      />
      <span class="text-[13px] text-gray-400">to</span>
      <input
        type="date"
        :value="endDate"
        :min="startDate || undefined"
        class="rounded-md border border-gray-200 bg-white px-2.5 py-[7px] text-[13px] text-gray-700 outline-none focus:border-blue-400"
        @change="$emit('update:endDate', ($event.target as HTMLInputElement).value)"
      />
    </template>

    <div v-if="statusOptions.length" class="ml-auto flex flex-wrap gap-1.5">
      <button
        v-for="opt in statusOptions"
        :key="opt.value"
        type="button"
        class="rounded-full border px-2.5 py-1 text-[11px] font-medium transition"
        :class="
          isSelected(opt.value)
            ? 'border-transparent text-white'
            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
        "
        :style="isSelected(opt.value) ? { backgroundColor: opt.color || '#2563eb' } : undefined"
        @click="toggleStatus(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReportRange } from '@/types/stats'

export interface ChartFilterRangeOption {
  value: ReportRange
  label: string
}

export interface ChartFilterStatusOption {
  value: string
  label: string
  color?: string
}

const props = withDefaults(
  defineProps<{
    range: ReportRange
    startDate?: string
    endDate?: string
    rangeOptions?: ChartFilterRangeOption[]
    statusOptions?: ChartFilterStatusOption[]
    selectedStatuses?: string[]
  }>(),
  {
    startDate: '',
    endDate: '',
    rangeOptions: () => [
      { value: '30d', label: 'Last 30 days' },
      { value: '90d', label: 'Last 90 days' },
      { value: 'ytd', label: 'Year to date' },
      { value: 'custom', label: 'Custom range' },
    ],
    statusOptions: () => [],
    selectedStatuses: () => [],
  },
)

const emit = defineEmits<{
  'update:range': [value: ReportRange]
  'update:startDate': [value: string]
  'update:endDate': [value: string]
  'update:selectedStatuses': [value: string[]]
}>()

function isSelected(value: string) {
  return props.selectedStatuses.includes(value)
}

function toggleStatus(value: string) {
  const current = props.selectedStatuses
  const next = isSelected(value) ? current.filter((v) => v !== value) : [...current, value]
  
  if (next.length === 0) return

  emit('update:selectedStatuses', next)
}
</script>
