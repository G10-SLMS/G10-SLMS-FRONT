<template>
  <div class="vuecal__header flex border-b border-gray-200 bg-white">
    <div class="w-[52px] shrink-0 border-r border-gray-200"></div>
    <div class="flex flex-1" v-if="view === 'Week'">
      <div
        v-for="day in weekDays"
        :key="day.dateKey"
        class="vuecal__cell flex flex-1 flex-col items-center justify-center py-3"
        :class="[day.isToday ? 'bg-cyan-50' : 'bg-white', 'border-l border-gray-200']"
      >
        <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">{{ day.dayName }}</span>
        <span
          class="mt-1 inline-flex h-7 w-7 items-center justify-center text-sm font-semibold"
          :class="day.isToday ? 'rounded-full bg-cyan-500 text-white' : 'text-gray-800'"
        >
          {{ day.dayNum }}
        </span>
      </div>
    </div>
    <div v-else-if="view === 'Day'" class="flex flex-1 border-l border-gray-200">
      <div
        class="flex flex-1 flex-col items-center justify-center py-3"
        :class="weekDays[0]?.isToday ? 'bg-cyan-50' : 'bg-white'"
      >
        <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">{{ weekDays[0]?.dayName }}</span>
        <span
          class="mt-1 inline-flex h-7 w-7 items-center justify-center text-sm font-semibold"
          :class="weekDays[0]?.isToday ? 'rounded-full bg-cyan-500 text-white' : 'text-gray-800'"
        >
          {{ weekDays[0]?.dayNum }}
        </span>
      </div>
    </div>
    <div v-else-if="view === 'Month'" class="flex flex-1">
      <div
        v-for="dayName in ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']"
        :key="dayName"
        class="vuecal__cell flex flex-1 flex-col items-center justify-center py-2 border-l border-gray-200"
      >
        <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">{{ dayName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CalendarDayCell } from '@/composables/calendar/useCalendarNavigation'

defineOptions({ name: 'CalendarGridHeader' })

defineProps<{
  view: 'Day' | 'Week' | 'Month'
  weekDays: CalendarDayCell[]
}>()
</script>
