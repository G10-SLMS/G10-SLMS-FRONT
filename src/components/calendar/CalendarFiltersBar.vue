<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="flex flex-wrap items-center gap-2.5">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search student, ID, class..."
          :value="searchQuery"
          @input="onSearchInput(($event.target as HTMLInputElement).value)"
          class="h-9 w-52 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 shadow-sm placeholder:text-gray-400 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        />
      </div>
      <select
        :value="leaveTypeFilter"
        @change="onLeaveTypeFilterChange(($event.target as HTMLSelectElement).value)"
        class="h-9 rounded-lg border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-700 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
      >
        <option value="">All Leave Types</option>
        <option v-for="t in filteredLeaveTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
      <div class="flex items-center gap-0 rounded-lg border border-gray-200 bg-white px-2.5 shadow-sm">
        <input
          type="date"
          :value="dateFrom"
          @input="$emit('date-from-change', ($event.target as HTMLInputElement).value)"
          class="h-9 bg-transparent text-sm outline-none text-gray-700"
        />
        <span class="text-gray-400 text-xs font-medium">→</span>
        <input
          type="date"
          :value="dateTo"
          @input="$emit('date-to-change', ($event.target as HTMLInputElement).value)"
          class="h-9 bg-transparent text-sm outline-none text-gray-700"
        />
      </div>
    </div>
    <div class="flex items-center gap-0.5 rounded-xl bg-slate-100 p-[3px]">
      <button
        v-for="v in viewOptions"
        :key="v"
        class="rounded-lg border-none px-4 py-1.5 text-sm font-semibold transition"
        :class="view === v ? 'bg-white text-cyan-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'"
        @click="$emit('view-change', v)"
      >
        {{ v }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import { Search } from 'lucide-vue-next'
import type { LeaveType } from '@/types/leave'

defineOptions({ name: 'CalendarFiltersBar' })

defineProps<{
  view: 'Day' | 'Week' | 'Month'
  searchQuery: string
  leaveTypeFilter: number | ''
  dateFrom: string
  dateTo: string
  filteredLeaveTypes: LeaveType[]
}>()

const emit = defineEmits<{
  search: [value: string]
  'leave-type-filter': [value: number | '']
  'date-from-change': [value: string]
  'date-to-change': [value: string]
  'view-change': [view: 'Day' | 'Week' | 'Month']
}>()

const viewOptions: Array<'Day' | 'Week' | 'Month'> = ['Day', 'Week', 'Month']

let searchTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput(value: string) {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    emit('search', value)
  }, 300)
}

function onLeaveTypeFilterChange(value: string) {
  const num = value === '' ? '' : Number(value)
  emit('leave-type-filter', num)
}

onUnmounted(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
    searchTimer = null
  }
})
</script>
