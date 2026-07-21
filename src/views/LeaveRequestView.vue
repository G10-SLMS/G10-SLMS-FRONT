<template>
  <div class="mx-auto max-w-[1120px]">
    <LeaveRequestsHero />

    <LeaveStatsRow :stats="stats" />

    <LeaveFiltersBar
      :filters="filters"
      :leaveTypes="leaveTypes"
      :hasActiveFilters="hasActiveFilters"
      :onSearchDebounced="onSearchDebounced"
      :clearSearch="clearSearch"
      :clearAllFilters="clearAllFilters"
      :fetchRequests="fetchRequests"
    />

    <LeaveErrorBanner :message="errMsg" @close="errMsg = ''" />

    <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <LeaveLoadingSkeleton v-if="loading" />

      <LeaveEmptyState
        v-else-if="displayItems.length === 0"
        :hasActiveFilters="hasActiveFilters"
        @clear-filters="clearAllFilters"
      />

      <LeaveRequestsTable
        v-else
        :items="displayItems"
        :formatDate="formatDate"
        :viewRequest="viewRequest"
        :editRequest="editRequest"
        :confirmCancel="confirmCancel"
      />

      <LeaveRequestsPagination
        v-if="items.length > 0"
        :page="page"
        :totalPages="totalPages"
        :total="total"
        :from="from"
        :to="to"
        :perPage="perPage"
        :visiblePages="visiblePages"
        :fetchRequests="fetchRequests"
        @update:per-page="perPage = $event"
      />
    </div>

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
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLeaveRequests } from '@/composables/useLeaveRequests'

import LeaveRequestsHero from '@/components/leave-request/LeaveRequestsHero.vue'
import LeaveStatsRow from '@/components/leave-request/LeaveStatsRow.vue'
import LeaveFiltersBar from '@/components/leave-request/LeaveFiltersBar.vue'
import LeaveErrorBanner from '@/components/leave-request/LeaveErrorBanner.vue'
import LeaveLoadingSkeleton from '@/components/leave-request/LeaveLoadingSkeleton.vue'
import LeaveEmptyState from '@/components/leave-request/LeaveEmptyState.vue'
import LeaveRequestsTable from '@/components/leave-request/LeaveRequestsTable.vue'
import LeaveRequestsPagination from '@/components/leave-request/LeaveRequestsPagination.vue'
import CancelLeaveModal from '@/components/leave-request/CancelLeaveModal.vue'

const route = useRoute()
const router = useRouter()

const {
  items,
  displayItems,
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
  onSearchDebounced,
  clearSearch,
  clearAllFilters,
  fetchRequests,
  viewRequest,
  editRequest,
  confirmCancel,
  doCancel,
} = useLeaveRequests()

onMounted(() => {
  const idParam = route.query.request
  if (!idParam) return

  const numericId = Number(idParam)
  if (Number.isFinite(numericId)) viewRequest(numericId)
  router.replace({ query: { ...route.query, request: undefined } })
})
</script>
