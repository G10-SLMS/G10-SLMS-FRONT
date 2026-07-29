<template>
  <div class="flex flex-wrap items-center gap-3">
    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600">
      <CalendarDays :size="22" :stroke-width="1.8" />
    </div>
    <h1 class="text-lg font-semibold text-gray-900">Calendar</h1>
    <div class="flex flex-1 items-center justify-end gap-2">
      <button
        @click="$emit('today')"
        class="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
      >
        Today
      </button>
      <div class="flex items-center gap-0.5">
        <button
          :aria-label="prevLabel"
          @click="$emit('prev')"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 active:scale-[0.95]"
        >
          <ChevronLeft :size="18" :stroke-width="1.8" />
        </button>
        <button
          :aria-label="nextLabel"
          @click="$emit('next')"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 active:scale-[0.95]"
        >
          <ChevronRight :size="18" :stroke-width="1.8" />
        </button>
      </div>
      <span class="min-w-[180px] text-sm font-semibold text-gray-800 sm:text-base">{{ rangeLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-vue-next'

defineOptions({ name: 'CalendarToolbar' })

defineProps<{
  rangeLabel: string
  prevLabel: string
  nextLabel: string
}>()

defineEmits<{
  today: []
  prev: []
  next: []
}>()
</script>
