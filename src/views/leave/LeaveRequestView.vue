<template>
  <div class="lr-page">
    <!-- ═══ Hero Header ═══ -->
    <div class="lr-hero">
      <div class="lr-hero-bg">
        <div class="lr-hero-shape lr-hero-shape--1"></div>
        <div class="lr-hero-shape lr-hero-shape--2"></div>
        <div class="lr-hero-shape lr-hero-shape--3"></div>
      </div>
      <div class="lr-header">
        <div class="lr-header-left">
          <div class="lr-header-icon">
            <FileText :size="22" />
          </div>
          <div>
            <h1>Leave Requests</h1>
            <p class="lr-header-sub" v-if="authStore.isStudent">
              Manage and track your submitted leave requests
            </p>
          </div>
        </div>
        <button class="lr-btn lr-btn-primary" @click="$router.push('/leave/new')">
          <Plus :size="18" />
          <span>New Request</span>
        </button>
      </div>
    </div>

    <!-- ═══ Stats Row ═══ -->
    <LeaveStatsRow :stats="stats" />

    <!-- ═══ Filter Bar ═══ -->
    <LeaveFiltersBar
      :filters="filters"
      :leaveTypes="leaveTypes"
      :hasActiveFilters="hasActiveFilters"
      :onSearchDebounced="onSearchDebounced"
      :clearSearch="clearSearch"
      :clearAllFilters="clearAllFilters"
      :fetchRequests="fetchRequests"
    />

    <!-- ═══ Error Banner ═══ -->
    <Transition name="slide-down">
      <div v-if="errMsg" class="lr-banner lr-banner-err">
        <AlertCircle :size="16" />
        <span>{{ errMsg }}</span>
        <button @click="errMsg = ''"><X :size="14" /></button>
      </div>
    </Transition>

    <!-- ═══ Table Card ═══ -->
    <div class="lr-card">
      <!-- Loading skeleton -->
      <div v-if="loading" class="lr-loading">
        <div class="lr-skeleton-row" v-for="n in 4" :key="n">
          <div class="lr-sk lr-sk-id"></div>
          <div class="lr-sk lr-sk-type"></div>
          <div class="lr-sk lr-sk-date"></div>
          <div class="lr-sk lr-sk-date"></div>
          <div class="lr-sk lr-sk-days"></div>
          <div class="lr-sk lr-sk-date"></div>
          <div class="lr-sk lr-sk-status"></div>
          <div class="lr-sk lr-sk-actions"></div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="items.length === 0" class="lr-empty">
        <div class="lr-empty-illust">
          <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
            <rect x="10" y="20" width="100" height="65" rx="8" stroke="#e2e8f0" stroke-width="2" fill="#f8fafc" />
            <rect x="20" y="32" width="80" height="4" rx="2" fill="#e2e8f0" />
            <rect x="20" y="42" width="60" height="4" rx="2" fill="#e2e8f0" />
            <rect x="20" y="52" width="70" height="4" rx="2" fill="#e2e8f0" />
            <circle cx="60" cy="72" r="12" fill="#e2e8f0" />
            <path d="M56 72h8M60 68v8" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
            <circle cx="30" cy="72" r="4" fill="#e2e8f0" />
            <circle cx="90" cy="72" r="4" fill="#e2e8f0" />
            <path d="M5 30l-3 8M115 30l3 8" stroke="#e2e8f0" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </div>
        <h3>No leave requests yet</h3>
        <p>
          {{ hasActiveFilters ? 'Try adjusting your search or filters' : 'Submit your first leave request to get started' }}
        </p>
        <button v-if="!hasActiveFilters" class="lr-btn lr-btn-primary" @click="$router.push('/leave/new')">
          <Plus :size="16" /> Submit a Request
        </button>
        <button v-else class="lr-btn lr-btn-ghost" @click="clearAllFilters">
          <RotateCcw :size="16" /> Clear Filters
        </button>
      </div>

      <!-- Table -->
      <LeaveRequestsTable
        v-else
        :items="items"
        :formatDate="formatDate"
        :viewRequest="viewRequest"
        :editRequest="editRequest"
        :confirmCancel="confirmCancel"
      />

      <!-- Pagination -->
      <div v-if="items.length > 0" class="lr-pagination">
        <div class="lr-page-info">
          Showing <strong>{{ from }}</strong>–<strong>{{ to }}</strong> of <strong>{{ total }}</strong> requests
        </div>
        <div class="lr-page-controls">
          <button class="lr-page-btn" :disabled="page <= 1" @click="fetchRequests(page - 1)" title="Previous">
            <ChevronLeft :size="16" />
          </button>
          <template v-for="p in visiblePages" :key="p">
            <span v-if="p === -1" class="lr-page-ellipsis">...</span>
            <button
              v-else
              class="lr-page-btn"
              :class="{ active: p === page }"
              @click="fetchRequests(p)"
            >{{ p }}</button>
          </template>
          <button
            class="lr-page-btn"
            :disabled="page >= totalPages"
            @click="fetchRequests(page + 1)"
            title="Next"
          >
            <ChevronRight :size="16" />
          </button>
        </div>
        <div class="lr-page-size">
          <select v-model.number="perPage" @change="fetchRequests(1)">
            <option :value="5">5 / page</option>
            <option :value="10">10 / page</option>
            <option :value="20">20 / page</option>
            <option :value="50">50 / page</option>
          </select>
        </div>
      </div>
    </div>

    <!-- ═══ Confirm Cancel Modal ═══ -->
    <CancelLeaveModal
      :cancelTarget="cancelTarget"
      :cancelling="cancelling"
      :formatDate="formatDate"
      :doCancel="doCancel"
      :emitClose="() => (cancelTarget = null)"
    />
  </div>
</template>

<script setup lang="ts">
import { useLeaveRequests } from '@/composables/useLeaveRequests'

import LeaveStatsRow from '@/components/leave/LeaveStatsRow.vue'
import LeaveFiltersBar from '@/components/leave/LeaveFiltersBar.vue'
import LeaveRequestsTable from '@/components/leave/LeaveRequestsTable.vue'
import CancelLeaveModal from '@/components/leave/CancelLeaveModal.vue'

import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus,
  RotateCcw,
  X,
} from 'lucide-vue-next'


const {
  authStore,
  items,
  leaveTypes,
  loading,
  errMsg,
  page,
  total,
  perPage,
  cancelTarget,
  cancelling,
  filters,
  totalPages,
  from,
  to,
  hasActiveFilters,
  stats,
  visiblePages,
  formatDate,
  statusLabel,
  onSearchDebounced,
  clearSearch,
  clearAllFilters,
  fetchRequests,
  viewRequest,
  editRequest,
  confirmCancel,
  doCancel,
} = useLeaveRequests()
</script>

<style>
@import './LeaveRequestView.css';
</style>

