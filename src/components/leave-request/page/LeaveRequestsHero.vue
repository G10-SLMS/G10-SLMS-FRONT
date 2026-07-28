<template>
  <div class="mb-6 flex flex-col items-start justify-between gap-4 rounded-2xl bg-blue-600 px-6 py-6 sm:flex-row sm:items-center sm:px-8">
    <div class="flex items-center gap-4">
      <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
        <FileText :size="22" />
      </div>
      <div>
        <h1 class="text-xl font-extrabold text-white sm:text-2xl">Leave Requests</h1>
        <p class="mt-0.5 text-[13px] text-blue-100">
          {{ auth.isStudent ? 'Manage and track your submitted leave requests' : 'Review leave requests submitted by students' }}
        </p>
      </div>
    </div>

    <button
      v-if="auth.isStudent"
      class="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:enabled:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
      :disabled="!requestsAvailable"
      :title="requestsAvailable ? '' : 'Not available yet — the backend for leave requests hasn\'t shipped.'"
      @click="leaveModal.openCreate()"
    >
      <Plus :size="18" />
      New Request
    </button>
  </div>
</template>

<script setup lang="ts">
import { FileText, Plus } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useLeaveFormModalStore } from '@/stores/leaveFormModal'
import { LEAVE_REQUESTS_API_AVAILABLE as requestsAvailable } from '@/services/leaveService'

const auth = useAuthStore()
const leaveModal = useLeaveFormModalStore()
</script>
