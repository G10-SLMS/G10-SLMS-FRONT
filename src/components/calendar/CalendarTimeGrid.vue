<template>
  <div class="vuecal__body flex-1 overflow-y-auto relative">
    <div v-if="!hasEvents && !hasAllDayEvents" class="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <p class="rounded-lg bg-white/80 px-4 py-2 text-sm font-medium text-gray-400 shadow-sm">
        No events
      </p>
    </div>
    <div class="flex relative" :class="{ 'min-w-[640px]': view === 'Week' }">
      <!-- Time Column -->
      <div class="vuecal__time-column w-[52px] shrink-0 border-r border-gray-200 bg-white">
        <div v-for="hour in hours" :key="hour" class="vuecal__time-cell h-[56px] flex items-start justify-end pr-2 pt-0.5">
          <span class="text-xs font-medium text-gray-500">{{ formatHour(hour) }}</span>
        </div>
      </div>

      <!-- Days Area -->
      <div class="flex flex-1" :class="view === 'Day' ? 'w-full' : ''">
        <div
          v-for="day in displayDays"
          :key="day.dateKey"
          class="vuecal__day-col flex-1 relative border-l border-gray-200 min-w-0"
          :class="{ 'bg-cyan-50/40': day.isToday }"
        >
          <div class="absolute inset-0 pointer-events-none">
            <div
              v-for="hour in hours"
              :key="`line-${hour}`"
              class="border-t border-gray-100"
              :style="{ height: cellHeight + 'px' }"
            ></div>
          </div>

          <!-- Current time red line -->
          <div
            v-if="isTodayView && day.isToday && currentTimePos >= 0 && currentTimePos <= hours.length * cellHeight"
            class="pointer-events-none absolute left-0 right-0 z-30"
            :style="{ top: currentTimePos + 'px' }"
          >
            <div class="flex items-center">
              <div class="h-[10px] w-[10px] -ml-[5px] rounded-full bg-red-500 shadow-[0_0_0_2px_white]"></div>
              <div class="flex-1 border-t-[2px] border-red-500"></div>
            </div>
          </div>

          <!-- Full-day events as vertical columns -->
          <CalendarEventChip
            v-for="ev in getDayAllDayEvents(day.dateKey)"
            :key="`fd-${ev.id}`"
            variant="full-day"
            :event="ev"
            :style="{
              top: '0px',
              height: hours.length * cellHeight + 'px',
              ...getFullDayColumnStyle(ev, day.dateKey),
            }"
            @click="$emit('event-click', ev)"
          />

          <template v-if="hasEvents">
            <CalendarEventChip
              v-for="ev in getDayTimedEvents(day.dateKey)"
              :key="ev.id"
              variant="timed"
              :event="ev"
              :dot-color="studentDotColor(ev.studentId)"
              :style="{
                top: getEventTop(ev) + 'px',
                height: Math.max(getEventHeight(ev), 24) + 'px',
                ...getEventColumnStyle(ev, day.dateKey),
              }"
              @click="$emit('event-click', ev)"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarEvent } from '@/types/leave'
import type { CalendarDayCell } from '@/composables/calendar/useCalendarNavigation'
import { formatHour } from '@/utils/calendarDate'
import { studentDotColor } from '@/utils/studentColor'
import CalendarEventChip from './CalendarEventChip.vue'

defineOptions({ name: 'CalendarTimeGrid' })

const props = defineProps<{
  view: 'Day' | 'Week'
  weekDays: CalendarDayCell[]
  hours: number[]
  cellHeight: number
  hasEvents: boolean
  hasAllDayEvents: boolean
  isTodayView: boolean
  currentTimePos: number
  getDayAllDayEvents: (dateKey: string) => CalendarEvent[]
  getDayTimedEvents: (dateKey: string) => CalendarEvent[]
  getFullDayColumnStyle: (ev: CalendarEvent, dateKey: string) => Record<string, string>
  getEventColumnStyle: (ev: CalendarEvent, dateKey: string) => Record<string, string>
  getEventTop: (ev: CalendarEvent) => number
  getEventHeight: (ev: CalendarEvent) => number
}>()

defineEmits<{
  'event-click': [event: CalendarEvent]
}>()

const displayDays = computed(() => (props.view === 'Day' ? props.weekDays.slice(0, 1) : props.weekDays))
</script>
