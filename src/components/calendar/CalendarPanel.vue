<template>
  <div class="flex h-[calc(100vh-120px)] max-w-full flex-col gap-5">
    <div class="flex flex-col gap-4">
      <CalendarToolbar
        :range-label="rangeLabel"
        :prev-label="prevLabel"
        :next-label="nextLabel"
        @today="goToday"
        @prev="prev"
        @next="next"
      />

      <CalendarFiltersBar
        :view="props.view"
        :search-query="props.searchQuery"
        :leave-type-filter="props.leaveTypeFilter"
        :date-from="props.dateFrom"
        :date-to="props.dateTo"
        :filtered-leave-types="props.filteredLeaveTypes"
        @search="(v) => emit('search', v)"
        @leave-type-filter="(v) => emit('leave-type-filter', v)"
        @date-from-change="(v) => emit('date-from-change', v)"
        @date-to-change="(v) => emit('date-to-change', v)"
        @view-change="(v) => emit('view-change', v)"
      />
    </div>

    <div class="flex-1 min-h-0 overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-gray-200">
      <CalendarLoadingSkeleton v-if="props.fetching" :view="props.view" />

      <CalendarErrorState
        v-else-if="props.fetchError"
        :message="props.fetchError"
        @retry="emit('retry')"
      />

      <div v-else class="flex h-full flex-col min-w-0 bg-white overflow-x-auto">
        <CalendarGridHeader :view="props.view" :week-days="weekDays" />

        <CalendarTimeGrid
          v-if="props.view === 'Week' || props.view === 'Day'"
          :view="props.view"
          :week-days="weekDays"
          :hours="hours"
          :cell-height="CELL_HEIGHT"
          :has-events="filteredEvents.length > 0"
          :has-all-day-events="hasAllDayEvents"
          :is-today-view="isTodayView"
          :current-time-pos="currentTimePos"
          :get-day-all-day-events="getDayAllDayEvents"
          :get-day-timed-events="getDayTimedEvents"
          :get-full-day-column-style="getFullDayColumnStyle"
          :get-event-column-style="getEventColumnStyle"
          :get-event-top="getEventTop"
          :get-event-height="getEventHeight"
          @event-click="openDetailModal"
        />

        <CalendarMonthGrid
          v-else-if="props.view === 'Month'"
          :month-days="monthDays"
          :get-day-mini-events="getDayMiniEvents"
          @event-click="openDetailModal"
        />
      </div>
    </div>

    <CalendarEventDetailModal
      :is-open="isDetailModalOpen"
      :event-id="selectedEventId ?? undefined"
      :event="selectedEvent ?? undefined"
      @close="closeDetailModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CalendarEvent, LeaveType } from '@/types/leave'
import { useAuthStore } from '@/stores/auth'
import CalendarEventDetailModal from '@/components/calendar/CalendarEventDetailModal.vue'
import CalendarToolbar from '@/components/calendar/CalendarToolbar.vue'
import CalendarFiltersBar from '@/components/calendar/CalendarFiltersBar.vue'
import CalendarGridHeader from '@/components/calendar/CalendarGridHeader.vue'
import CalendarTimeGrid from '@/components/calendar/CalendarTimeGrid.vue'
import CalendarMonthGrid from '@/components/calendar/CalendarMonthGrid.vue'
import CalendarLoadingSkeleton from '@/components/calendar/CalendarLoadingSkeleton.vue'
import CalendarErrorState from '@/components/calendar/CalendarErrorState.vue'
import { useCalendarNavigation } from '@/composables/calendar/useCalendarNavigation'
import { useCalendarEventLayout } from '@/composables/calendar/useCalendarEventLayout'
import { useCurrentTimeIndicator } from '@/composables/calendar/useCurrentTimeIndicator'

defineOptions({ name: 'CalendarPanel' })

const props = defineProps<{
  view: 'Day' | 'Week' | 'Month'
  currentDate: Date
  events: CalendarEvent[]
  fetching: boolean
  fetchError: string | null
  auth: ReturnType<typeof useAuthStore>
  leaveTypeFilter: number | ''
  dateFrom: string
  dateTo: string
  searchQuery: string
  filteredLeaveTypes: LeaveType[]
}>()

const emit = defineEmits<{
  'update:currentDate': [date: Date]
  'view-change': [view: 'Day' | 'Week' | 'Month']
  'fetch-leave-types': []
  'clear-search': []
  search: [value: string]
  'leave-type-filter': [value: number | '']
  'date-from-change': [value: string]
  'date-to-change': [value: string]
  retry: []
}>()

// ── Event Detail Modal ───────────────────────────────────
const selectedEventId = ref<number | null>(null)
const selectedEvent = ref<CalendarEvent | null>(null)
const isDetailModalOpen = ref(false)

function openDetailModal(ev: CalendarEvent) {
  selectedEventId.value = ev.id
  selectedEvent.value = ev
  isDetailModalOpen.value = true
}

function closeDetailModal() {
  isDetailModalOpen.value = false
}

// ── Business Logic (delegated to composables) ────────────
const { CELL_HEIGHT, START_HOUR, hours, weekDays, monthDays, isTodayView, rangeLabel, prevLabel, nextLabel, prev, next, goToday } =
  useCalendarNavigation(
    () => props.currentDate,
    () => props.view,
    (date) => emit('update:currentDate', date),
  )

const {
  filteredEvents,
  hasAllDayEvents,
  getDayAllDayEvents,
  getDayTimedEvents,
  getDayMiniEvents,
  getEventColumnStyle,
  getFullDayColumnStyle,
  getEventTop,
  getEventHeight,
} = useCalendarEventLayout({
  events: () => props.events,
  auth: props.auth,
  leaveTypeFilter: () => props.leaveTypeFilter,
  dateFrom: () => props.dateFrom,
  dateTo: () => props.dateTo,
  searchQuery: () => props.searchQuery,
  weekDays,
  startHour: START_HOUR,
  cellHeight: CELL_HEIGHT,
})

const { currentTimePos } = useCurrentTimeIndicator(START_HOUR, CELL_HEIGHT)
</script>
