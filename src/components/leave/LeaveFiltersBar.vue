<template>
  <div
    class="mb-5 flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm transition sm:p-5"
    :class="hasActiveFilters ? 'border-blue-200' : 'border-slate-100'"
  >
    <div class="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <div class="relative flex-1">
        <Search :size="16" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search by ID or leave type..."
          class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
          @input="onSearchDebounced"
        />
        <button
          v-if="filters.search"
          class="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
          @click="clearSearch"
        >
          <X :size="14" />
        </button>
      </div>

      <button
        v-if="hasActiveFilters"
        class="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-[13px] font-semibold text-blue-600 transition hover:bg-blue-100"
        @click="clearAllFilters"
      >
        <RotateCcw :size="14" />
        Reset Filters
      </button>
    </div>

    <div class="flex flex-wrap items-center gap-2.5">
      <select
        v-model="filters.leave_type_id"
        class="min-w-[150px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-blue-500 focus:bg-white"
        @change="fetchRequests(1)"
      >
        <option value="">All Types</option>
        <option v-for="t in leaveTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>

      <select
        v-model="filters.status"
        class="min-w-[150px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-blue-500 focus:bg-white"
        @change="fetchRequests(1)"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <div class="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
        <Calendar :size="14" class="text-slate-400" />
        <input
          type="date"
          v-model="filters.date_from"
          title="From date"
          class="bg-transparent text-[13px] outline-none"
          @change="fetchRequests(1)"
        />
        <span class="text-slate-400">—</span>
        <input
          type="date"
          v-model="filters.date_to"
          title="To date"
          class="bg-transparent text-[13px] outline-none"
          @change="fetchRequests(1)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LeaveType } from '@/types/leave'
import { Search, X, Calendar, RotateCcw } from 'lucide-vue-next'

type Filters = {
  search: string
  leave_type_id: string | number
  status: string
  date_from: string
  date_to: string
}

defineProps<{
  filters: Filters
  leaveTypes: LeaveType[]
  hasActiveFilters: boolean
  onSearchDebounced: () => void
  clearSearch: () => void
  clearAllFilters: () => void
  fetchRequests: (p?: number) => Promise<void>
}>()
</script>
