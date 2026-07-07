<template>
  <div class="calendar-view">
    <div class="header-row">
      <h1>Calendar</h1>
      <div class="month-nav">
        <button class="nav-btn" @click="prevMonth">‹</button>
        <span class="month-label">{{ monthLabel }}</span>
        <button class="nav-btn" @click="nextMonth">›</button>
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

    <p class="placeholder-note">Leave events will appear on dates once connected to the API (Sprint 4).</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  font-size: 16px;
  cursor: pointer;
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
  color: #6b7280;
  margin-bottom: 8px;
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
  border-radius: 6px;
}

.day-cell:not(.empty):hover {
  background: #f3f4f6;
  cursor: pointer;
}

.day-cell.today {
  background: #2563eb;
  color: white;
  font-weight: 600;
}

.placeholder-note {
  margin-top: 16px;
  font-size: 13px;
  color: #9ca3af;
}
</style>