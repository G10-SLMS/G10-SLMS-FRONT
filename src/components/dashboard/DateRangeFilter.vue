<template>
  <div class="flex flex-wrap items-center gap-2.5">
    <select
      :value="preset"
      class="rounded-md border border-gray-200 bg-white px-2.5 py-[7px] text-[13px] text-gray-700 outline-none focus:border-blue-400"
      @change="$emit('update:preset', ($event.target as HTMLSelectElement).value as DateRangePreset)"
    >
      <option v-for="opt in DATE_RANGE_PRESET_OPTIONS" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>

    <template v-if="preset === 'custom'">
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
  </div>
</template>

<script setup lang="ts">
import { DATE_RANGE_PRESET_OPTIONS, type DateRangePreset } from '@/utils/dateRange'

withDefaults(
  defineProps<{
    preset: DateRangePreset
    startDate?: string
    endDate?: string
  }>(),
  {
    startDate: '',
    endDate: '',
  },
)

defineEmits<{
  'update:preset': [value: DateRangePreset]
  'update:startDate': [value: string]
  'update:endDate': [value: string]
}>()
</script>
