<template>
  <div class="vuecal__body flex-1 overflow-y-auto">
    <div
      class="grid flex-1"
      style="grid-template-columns: repeat(7, minmax(0, 1fr)); grid-template-rows: repeat(6, minmax(80px, 1fr))"
    >
      <div
        v-for="day in monthDays"
        :key="day.dateKey"
        class="vuecal__cell border-l border-t border-gray-200 p-1.5 transition-colors"
        :class="[day.isToday ? 'bg-cyan-50' : 'bg-white', !day.isCurrentMonth ? 'text-gray-300' : '']"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-600">{{ day.dayNum }}</span>
          <div class="flex flex-wrap gap-0.5">
            <div
              v-for="ev in getDayMiniEvents(day.dateKey)"
              :key="ev.id"
              class="h-1.5 w-1.5 rounded-full"
              :style="studentMiniDotStyle(ev.studentId)"
            ></div>
          </div>
        </div>
        <div class="mt-1 space-y-0.5 overflow-hidden">
          <div
            v-for="ev in getDayMiniEvents(day.dateKey)"
            :key="ev.id"
            class="truncate rounded px-1.5 py-0.5 text-[10px] font-medium cursor-pointer transition hover:opacity-80"
            :style="studentMiniStyle(ev.studentId)"
            @click="$emit('event-click', ev)"
          >
            {{ ev.student }} - {{ ev.type }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CalendarEvent } from '@/types/leave'
import type { MonthDayCell } from '@/composables/calendar/useCalendarNavigation'
import { studentMiniStyle, studentMiniDotStyle } from '@/utils/studentColor'

defineOptions({ name: 'CalendarMonthGrid' })

defineProps<{
  monthDays: MonthDayCell[]
  getDayMiniEvents: (dateKey: string) => CalendarEvent[]
}>()

defineEmits<{
  'event-click': [event: CalendarEvent]
}>()
</script>
