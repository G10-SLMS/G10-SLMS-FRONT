<template>
  <div class="flex flex-col items-center gap-3.5 px-5 py-20 text-center">
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" class="mb-2">
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

    <h3 class="m-0 text-xl font-bold text-slate-900">No leave requests yet</h3>
    <p class="m-0 max-w-xs text-sm text-slate-400">
      {{ emptyMessage }}
    </p>

    <button
      v-if="!hasActiveFilters && auth.isStudent"
      class="mt-1 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
      @click="leaveModal.openCreate()"
    >
      <Plus :size="16" /> Submit a Request
    </button>
    <button
      v-else-if="hasActiveFilters"
      class="mt-1 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
      @click="$emit('clearFilters')"
    >
      <RotateCcw :size="16" /> Clear Filters
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Plus, RotateCcw } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useLeaveFormModalStore } from '@/stores/leaveFormModal'

const props = defineProps<{
  hasActiveFilters: boolean
}>()

defineEmits<{
  clearFilters: []
}>()

const auth = useAuthStore()
const leaveModal = useLeaveFormModalStore()

const emptyMessage = computed(() => {
  if (props.hasActiveFilters) return 'Try adjusting your search or filters'
  return auth.isStudent
    ? 'Submit your first leave request to get started'
    : 'No students have submitted a leave request yet'
})
</script>
