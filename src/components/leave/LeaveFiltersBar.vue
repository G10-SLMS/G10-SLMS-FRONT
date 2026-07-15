<template>
  <div class="lr-filters" :class="{ 'has-active': props.hasActiveFilters }">
    <div class="lr-filter-row">
      <div class="lr-search-box">
        <Search :size="16" class="lr-search-ico" />
        <input
          v-model="props.filters.search"
          type="text"
          placeholder="Search by ID or leave type..."
          class="lr-search"
          @input="onSearchDebounced"
        />
        <button v-if="props.filters.search" class="lr-search-clear" @click="clearSearch">
          <X :size="14" />
        </button>
      </div>

      <button v-if="props.hasActiveFilters" class="lr-filter-clear" @click="clearAllFilters">
        <RotateCcw :size="14" />
        Reset Filters
      </button>
    </div>

    <div class="lr-filter-group">
      <div class="lr-filter-item">
        <select v-model="props.filters.leave_type_id" @change="fetchRequests(1)">
          <option value="">All Types</option>
          <option v-for="t in props.leaveTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
      </div>

      <div class="lr-filter-item">
        <select v-model="props.filters.status" @change="fetchRequests(1)">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div class="lr-filter-item lr-date-range">
        <Calendar :size="14" class="lr-filter-ico" />
        <input type="date" v-model="props.filters.date_from" @change="fetchRequests(1)" placeholder="From" title="From date" />
        <span class="lr-date-sep">—</span>
        <input type="date" v-model="props.filters.date_to" @change="fetchRequests(1)" placeholder="To" title="To date" />
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

const props = defineProps<{
  filters: Filters
  leaveTypes: LeaveType[]
  hasActiveFilters: boolean
  onSearchDebounced: () => void
  clearSearch: () => void
  clearAllFilters: () => void
  fetchRequests: (p?: number) => Promise<void>
}>()
</script>

