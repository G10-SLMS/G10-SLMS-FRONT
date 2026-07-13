<template>
  <div class="calendar-view">
    <div class="header-row">
      <div class="header-title">
        <span class="header-icon"><CalendarDays :size="20" :stroke-width="1.8" /></span>
        <h1>Calendar</h1>
      </div>

      <div class="month-nav">
        <button class="today-btn" @click="goToday">Today</button>
        <button class="nav-btn" aria-label="Previous month" @click="prevMonth">
          <ChevronLeft :size="18" :stroke-width="1.8" />
        </button>
        <span class="month-label">{{ monthLabel }}</span>
        <button class="nav-btn" aria-label="Next month" @click="nextMonth">
          <ChevronRight :size="18" :stroke-width="1.8" />
        </button>
      </div>
    </div>

    <div class="calendar-card">
      <div class="weekdays">
        <span v-for="day in weekdays" :key="day">{{ day }}</span>
      </div>

      <div class="days-grid">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="day-cell"
          :class="{ empty: !day, today: isToday(day) }"
        >
          <span v-if="day">{{ day }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CalendarDays, ChevronLeft, ChevronRight, Info } from 'lucide-vue-next'

const currentDate = ref(new Date())

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const monthLabel = computed(() =>
  currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  return days
})

function isToday(day) {
  if (!day) return false
  const today = new Date()
  return (
    day === today.getDate() &&
    currentDate.value.getMonth() === today.getMonth() &&
    currentDate.value.getFullYear() === today.getFullYear()
  )
}

function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

function goToday() {
  currentDate.value = new Date()
}
</script>

<style scoped>
.calendar-view {
  max-width: 100%;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title h1 {
  margin: 0;
}

.header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #dbeafe;
  color: #1d4ed8;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.today-btn {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0 12px;
  height: 32px;
  font-size: 13px;
  cursor: pointer;
  color: #374151;
}

.today-btn:hover {
  background: #f3f4f6;
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

.month-label {
  font-weight: 500;
  min-width: 140px;
  text-align: center;
}

.calendar-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 16px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border-radius: 8px;
  color: #374151;
  transition: background-color 0.15s ease;
}

.day-cell:not(.empty):hover {
  background: #eff6ff;
  cursor: pointer;
}

.day-cell.today {
  background: #2563eb;
  color: white;
  font-weight: 600;
}

</style>
