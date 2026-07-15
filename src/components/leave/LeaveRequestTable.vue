<template>
  <div class="overflow-x-auto rounded-[10px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
    <table v-if="requests.length" class="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th class="border-b border-gray-200 px-4 py-3.5 text-left text-[13px] font-medium text-gray-500">Student</th>
          <th class="border-b border-gray-200 px-4 py-3.5 text-left text-[13px] font-medium text-gray-500">Leave Type</th>
          <th class="border-b border-gray-200 px-4 py-3.5 text-left text-[13px] font-medium text-gray-500">Leave Date</th>
          <th class="border-b border-gray-200 px-4 py-3.5 text-left text-[13px] font-medium text-gray-500">Submitted</th>
          <th class="border-b border-gray-200 px-4 py-3.5 text-left text-[13px] font-medium text-gray-500">Status</th>
          <th v-if="showActions" class="border-b border-gray-200 px-4 py-3.5 text-left text-[13px] font-medium text-gray-500">Actions</th>
        </tr>
      </thead>
      <tbody>
        <LeaveRequestRow
          v-for="request in requests"
          :key="request.id"
          :request="request"
          :show-actions="showActions"
          @edit="$emit('edit', $event)"
        />
      </tbody>
    </table>

    <LeaveRequestEmptyState v-else />
  </div>
</template>

<script setup lang="ts">
import LeaveRequestRow from './LeaveRequestRow.vue'
import LeaveRequestEmptyState from './LeaveRequestEmptyState.vue'
import type { LeaveRequest } from '@/types/leave'
interface TableLeaveRequest extends LeaveRequest {
  leaveDate: string
  submittedAt: string
}

withDefaults(
  defineProps<{
    requests: TableLeaveRequest[]
    showActions?: boolean
  }>(),
  {
    showActions: false,
  }
)

const emit = defineEmits<{
  (e: 'edit', id: number): void
}>()
</script>
