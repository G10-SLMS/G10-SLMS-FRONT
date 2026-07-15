<template>
  <div class="flex h-[calc(100vh-120px)] max-w-full flex-col">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <button class="flex h-9 w-9 items-center justify-center rounded-lg border-none bg-cyan-400/20 text-cyan-600 cursor-default" aria-hidden="true">
          <CalendarDays :size="20" :stroke-width="1.8" />
        </button>
        <h1 class="m-0">Calendar</h1>
        <button
          class="h-[34px] rounded-md border border-gray-200 bg-white px-3.5 text-[13px] font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
          @click="goToday"
        >Today</button>
        <div class="flex gap-1">
          <button
            class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 cursor-pointer hover:bg-gray-100"
            aria-label="Previous week"
            @click="prevWeek"
          >
            <ChevronLeft :size="18" :stroke-width="1.8" />
          </button>
          <button
            class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 cursor-pointer hover:bg-gray-100"
            aria-label="Next week"
            @click="nextWeek"
          >
            <ChevronRight :size="18" :stroke-width="1.8" />
          </button>
        </div>
        <span class="text-base font-semibold text-gray-800">{{ rangeLabel }}</span>
      </div>

      <div class="flex items-center">
        <div class="flex gap-0.5 rounded-lg bg-slate-100 p-[3px]">
          <button
            v-for="v in views"
            :key="v"
            class="rounded-md border-none bg-transparent px-3.5 py-1.5 text-[13px] font-medium text-slate-400 cursor-pointer"
            :class="view === v ? 'bg-white text-cyan-500 shadow-[0_1px_2px_rgba(0,0,0,0.06)]' : ''"
            @click="view = v"
          >
            {{ v }}
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-1 min-h-0 flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
      <!-- Day headers -->
      <div class="grid shrink-0 grid-cols-[56px_repeat(7,1fr)] border-b border-gray-200">
        <div class="border-r border-gray-100"></div>
        <div
          v-for="d in weekDays"
          :key="d.dateStr"
          class="flex flex-col items-center justify-center gap-0.5 px-1 py-2"
        >
          <span class="text-[11px] font-semibold tracking-wide text-gray-500" :class="d.isToday ? 'text-cyan-500' : ''">{{ d.dayName }}</span>
          <span
            class="flex h-[30px] w-[30px] items-center justify-center rounded-full text-base font-semibold text-gray-800"
            :class="d.isToday ? 'bg-cyan-400 text-white' : ''"
          >{{ d.dayNumber }}</span>
        </div>
      </div>

      <!-- Scrollable time grid -->
      <div class="flex-1 overflow-y-auto">
        <div class="relative grid grid-cols-[56px_repeat(7,1fr)]">
          <!-- Hour labels -->
          <div class="border-r border-gray-100">
            <div v-for="h in hours" :key="h" class="relative h-[56px]">
              <span class="absolute -top-[7px] right-2 bg-white px-0.5 text-[11px] text-gray-400">{{ formatHour(h) }}</span>
            </div>
          </div>

          <!-- Day columns -->
          <div v-for="d in weekDays" :key="d.dateStr" class="relative border-r border-gray-100 last:border-none">
            <div v-for="h in hours" :key="h" class="h-[56px] border-b border-gray-100"></div>

            <CalendarLeaveBlock
              v-for="(leave, i) in leavesFor(d.dateStr)"
              :key="leave.id"
              :status="leave.status"
              :title="leaveChipTitle(leave)"
              :block-style="leaveBlockStyle(i, leavesFor(d.dateStr).length)"
            >
              <template #title>
                <template v-if="auth.isAdmin">{{ leave.student }}</template>
                <template v-else>{{ leave.type }}</template>
              </template>
              <template #subtitle>
                <template v-if="auth.isAdmin">{{ leave.type }} · </template>{{ leave.status }}
              </template>
            </CalendarLeaveBlock>

            <!-- Current time line -->
            <div
              v-if="d.isToday && nowLineVisible"
              class="absolute left-0 right-0 z-[5] h-0 border-t-2 border-red-500"
              :style="{ top: nowOffset + 'px' }"
            >
              <span class="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-red-500"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import CalendarLeaveBlock from '@/components/calendar/CalendarLeaveBlock.vue'

const auth = useAuthStore()

const views = ['Day', 'Week', 'Month']
const view = ref('Week')

const currentDate = ref(new Date())
const now = ref(new Date())
let clockTimer = null

onMounted(() => {
  clockTimer = setInterval(() => { now.value = new Date() }, 60000)
})
onUnmounted(() => clearInterval(clockTimer))

const HOUR_HEIGHT = 56
const START_HOUR = 7
const END_HOUR = 23
const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR)

const leaveRequests = ref([
  { id: 101, studentId: 101, student: 'Sok Dara', type: 'Sick Leave', startDate: dateKey(addDays(startOfWeek(new Date()), 1)), endDate: dateKey(addDays(startOfWeek(new Date()), 2)), status: 'Pending' },
  { id: 102, studentId: 102, student: 'Chan Sophea', type: 'Personal Leave', startDate: dateKey(addDays(startOfWeek(new Date()), 3)), endDate: dateKey(addDays(startOfWeek(new Date()), 3)), status: 'Approved' },
  { id: 103, studentId: 103, student: 'Vann Vuthy', type: 'Emergency Leave', startDate: dateKey(addDays(startOfWeek(new Date()), 5)), endDate: dateKey(addDays(startOfWeek(new Date()), 6)), status: 'Rejected' },
])

const visibleLeaveRequests = computed(() => {
  if (auth.isAdmin) return leaveRequests.value
  if (auth.isStudent) return leaveRequests.value.filter((r) => r.studentId === auth.user?.id)
  return []
})

function leavesFor(dateStr) {
  return visibleLeaveRequests.value.filter((r) => dateStr >= r.startDate && dateStr <= r.endDate)
}

function leaveChipTitle(leave) {
  const range = leave.startDate === leave.endDate ? leave.startDate : `${leave.startDate} – ${leave.endDate}`
  return auth.isAdmin
    ? `${leave.student} · ${leave.type} · ${range} · ${leave.status}`
    : `${leave.type} · ${range} · ${leave.status}`
}

function startOfWeek(date) {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function dateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const weekDays = computed(() => {
  const start = startOfWeek(currentDate.value)
  const todayKey = dateKey(new Date())
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i)
    const key = dateKey(d)
    return { dateStr: key, dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(), dayNumber: d.getDate(), isToday: key === todayKey }
  })
})

const rangeLabel = computed(() => {
  const start = startOfWeek(currentDate.value)
  const end = addDays(start, 6)
  const sameMonth = start.getMonth() === end.getMonth()
  const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (sameMonth) return `${startLabel} – ${end.getDate()}, ${end.getFullYear()}`
  return `${startLabel} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
})

function formatHour(h) {
  if (h === 0) return '12 AM'
  if (h === 12) return '12 PM'
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}

function leaveBlockStyle(index, total) {
  const widthPercent = 100 / total
  const left = index * widthPercent
  return { top: '0px', height: `${hours.length * HOUR_HEIGHT}px`, left: `calc(${left}% + 2px)`, width: `calc(${widthPercent}% - 4px)` }
}

const nowOffset = computed(() => {
  const hoursDecimal = now.value.getHours() + now.value.getMinutes() / 60
  return (hoursDecimal - START_HOUR) * HOUR_HEIGHT
})

const nowLineVisible = computed(() => {
  const hoursDecimal = now.value.getHours() + now.value.getMinutes() / 60
  return hoursDecimal >= START_HOUR && hoursDecimal <= END_HOUR + 1
})

function prevWeek() { currentDate.value = addDays(currentDate.value, -7) }
function nextWeek() { currentDate.value = addDays(currentDate.value, 7) }
function goToday() { currentDate.value = new Date() }
</script>
