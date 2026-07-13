<template>
  <div class="calendar-view">
    <div class="header-row">
      <div class="header-left">
        <button class="icon-btn hamburger-placeholder" aria-hidden="true">
          <CalendarDays :size="20" :stroke-width="1.8" />
        </button>
        <h1>Calendar</h1>
        <button class="today-btn" @click="goToday">Today</button>
        <div class="nav-group">
          <button class="nav-btn" aria-label="Previous week" @click="prevWeek">
            <ChevronLeft :size="18" :stroke-width="1.8" />
          </button>
          <button class="nav-btn" aria-label="Next week" @click="nextWeek">
            <ChevronRight :size="18" :stroke-width="1.8" />
          </button>
        </div>
        <span class="range-label">{{ rangeLabel }}</span>
      </div>

      <div class="header-right">
        <div class="view-switch">
          <button
            v-for="v in views"
            :key="v"
            class="view-btn"
            :class="{ active: view === v }"
            @click="view = v"
          >
            {{ v }}
          </button>
        </div>
      </div>
    </div>

    <div class="calendar-card">
      <!-- Day headers -->
      <div class="days-header">
        <div class="gutter-cell"></div>
        <div
          v-for="d in weekDays"
          :key="d.dateStr"
          class="day-header"
          :class="{ today: d.isToday }"
        >
          <span class="day-name">{{ d.dayName }}</span>
          <span class="day-number">{{ d.dayNumber }}</span>
        </div>
      </div>

      <!-- Scrollable time grid -->
      <div class="time-grid-wrap">
        <div class="time-grid">
          <!-- Hour labels -->
          <div class="hours-col">
            <div v-for="h in hours" :key="h" class="hour-slot">
              <span class="hour-label">{{ formatHour(h) }}</span>
            </div>
          </div>

          <!-- Day columns -->
          <div v-for="d in weekDays" :key="d.dateStr" class="day-col">
            <div v-for="h in hours" :key="h" class="hour-cell"></div>

            <!-- Leave requests shown as full-day booking blocks (Admin: all students. Student: own only.) -->
            <div
              v-for="(leave, i) in leavesFor(d.dateStr)"
              :key="leave.id"
              class="leave-block"
              :class="leave.status.toLowerCase()"
              :style="leaveBlockStyle(i, leavesFor(d.dateStr).length)"
              :title="leaveChipTitle(leave)"
            >
              <span class="leave-block-title">
                <template v-if="auth.isAdmin">{{ leave.student }}</template>
                <template v-else>{{ leave.type }}</template>
              </span>
              <span class="leave-block-subtitle">
                <template v-if="auth.isAdmin">{{ leave.type }} · </template>{{ leave.status }}
              </span>
            </div>

            <!-- Current time line -->
            <div
              v-if="d.isToday && nowLineVisible"
              class="now-line"
              :style="{ top: nowOffset + 'px' }"
            >
              <span class="now-dot"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const views = ['Day', 'Week', 'Month']
const view = ref('Week')

const currentDate = ref(new Date())
const now = ref(new Date())
let clockTimer = null

onMounted(() => {
  clockTimer = setInterval(() => {
    now.value = new Date()
  }, 60000)
})
onUnmounted(() => clearInterval(clockTimer))

const HOUR_HEIGHT = 56 // px per hour row, must match CSS .hour-slot / .hour-cell height
const START_HOUR = 7 // 7 AM
const END_HOUR = 23 // 11 PM
const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR)

const leaveRequests = ref([
  {
    id: 101,
    studentId: 101,
    student: 'Sok Dara',
    type: 'Sick Leave',
    startDate: dateKey(addDays(startOfWeek(new Date()), 1)),
    endDate: dateKey(addDays(startOfWeek(new Date()), 2)),
    status: 'Pending',
  },
  {
    id: 102,
    studentId: 102,
    student: 'Chan Sophea',
    type: 'Personal Leave',
    startDate: dateKey(addDays(startOfWeek(new Date()), 3)),
    endDate: dateKey(addDays(startOfWeek(new Date()), 3)),
    status: 'Approved',
  },
  {
    id: 103,
    studentId: 103,
    student: 'Vann Vuthy',
    type: 'Emergency Leave',
    startDate: dateKey(addDays(startOfWeek(new Date()), 5)),
    endDate: dateKey(addDays(startOfWeek(new Date()), 6)),
    status: 'Rejected',
  },
])

const visibleLeaveRequests = computed(() => {
  if (auth.isAdmin) return leaveRequests.value
  if (auth.isStudent) return leaveRequests.value.filter((r) => r.studentId === auth.user?.id)
  return []
})

function leavesFor(dateStr) {
  return visibleLeaveRequests.value.filter(
    (r) => dateStr >= r.startDate && dateStr <= r.endDate
  )
}

function leaveChipTitle(leave) {
  const range = leave.startDate === leave.endDate
    ? leave.startDate
    : `${leave.startDate} – ${leave.endDate}`
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
  return date.toISOString().slice(0, 10)
}

const weekDays = computed(() => {
  const start = startOfWeek(currentDate.value)
  const todayKey = dateKey(new Date())

  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i)
    const key = dateKey(d)
    return {
      dateStr: key,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      dayNumber: d.getDate(),
      isToday: key === todayKey,
    }
  })
})

const rangeLabel = computed(() => {
  const start = startOfWeek(currentDate.value)
  const end = addDays(start, 6)
  const sameMonth = start.getMonth() === end.getMonth()
  const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (sameMonth) {
    return `${startLabel} – ${end.getDate()}, ${end.getFullYear()}`
  }

  const endLabel = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${startLabel} – ${endLabel}`
})

function formatHour(h) {
  if (h === 0) return '12 AM'
  if (h === 12) return '12 PM'
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}

function leaveBlockStyle(index, total) {
  const widthPercent = 100 / total
  const left = index * widthPercent
  return {
    top: '0px',
    height: `${hours.length * HOUR_HEIGHT}px`,
    left: `calc(${left}% + 2px)`,
    width: `calc(${widthPercent}% - 4px)`,
  }
}

const nowOffset = computed(() => {
  const hoursDecimal = now.value.getHours() + now.value.getMinutes() / 60
  return (hoursDecimal - START_HOUR) * HOUR_HEIGHT
})

const nowLineVisible = computed(() => {
  const hoursDecimal = now.value.getHours() + now.value.getMinutes() / 60
  return hoursDecimal >= START_HOUR && hoursDecimal <= END_HOUR + 1
})

function prevWeek() {
  currentDate.value = addDays(currentDate.value, -7)
}

function nextWeek() {
  currentDate.value = addDays(currentDate.value, 7)
}

function goToday() {
  currentDate.value = new Date()
}
</script>

<style scoped>
.calendar-view {
  max-width: 100%;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h1 {
  margin: 0;
  font-size: 22px;
}

.icon-btn.hamburger-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #dbeafe;
  color: #1d4ed8;
  border: none;
  cursor: default;
}

.today-btn {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0 14px;
  height: 34px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: #374151;
}

.today-btn:hover {
  background: #f3f4f6;
}

.nav-group {
  display: flex;
  gap: 4px;
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  color: #374151;
}

.nav-btn:hover {
  background: #f3f4f6;
}

.range-label {
  font-weight: 600;
  font-size: 16px;
  color: #1f2937;
}

.header-right {
  display: flex;
  align-items: center;
}

.view-switch {
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}

.view-btn {
  border: none;
  background: transparent;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
}

.view-btn.active {
  background: white;
  color: #2563eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.calendar-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.days-header {
  display: grid;
  grid-template-columns: 56px repeat(7, 1fr);
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.gutter-cell {
  border-right: 1px solid #f3f4f6;
}

.leave-block {
  position: absolute;
  border-radius: 8px;
  padding: 8px 10px;
  border-left: 3px solid transparent;
  cursor: default;
  overflow: hidden;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.leave-block-title {
  font-weight: 700;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.leave-block-subtitle {
  font-size: 11px;
  opacity: 0.85;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.leave-block.pending {
  background: #fef3c7;
  color: #92400e;
  border-left-color: #f59e0b;
}

.leave-block.approved {
  background: #dcfce7;
  color: #15803d;
  border-left-color: #22c55e;
}

.leave-block.rejected {
  background: #fee2e2;
  color: #b91c1c;
  border-left-color: #ef4444;
}

.day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  gap: 2px;
}

.day-name {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  letter-spacing: 0.03em;
}

.day-number {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.day-header.today .day-number {
  background: #2563eb;
  color: white;
}

.day-header.today .day-name {
  color: #2563eb;
}

.time-grid-wrap {
  overflow-y: auto;
  flex: 1;
}

.time-grid {
  display: grid;
  grid-template-columns: 56px repeat(7, 1fr);
  position: relative;
}

.hours-col {
  border-right: 1px solid #f3f4f6;
}

.hour-slot {
  height: 56px;
  position: relative;
}

.hour-label {
  position: absolute;
  top: -7px;
  right: 8px;
  font-size: 11px;
  color: #9ca3af;
  background: white;
  padding: 0 2px;
}

.day-col {
  position: relative;
  border-right: 1px solid #f3f4f6;
}

.day-col:last-child {
  border-right: none;
}

.hour-cell {
  height: 56px;
  border-bottom: 1px solid #f3f4f6;
}

.now-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
  border-top: 2px solid #ef4444;
  z-index: 5;
}

.now-dot {
  position: absolute;
  left: -4px;
  top: -4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
}
</style>
