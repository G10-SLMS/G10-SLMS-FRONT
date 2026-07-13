<template>
  <div class="leave-requests">
    <LeaveRequestsHeader
      :show-new-button="auth.isStudent"
      @new="leaveModal.openCreate()"
    />

    <LeaveRequestTable
      :requests="requests"
      :show-actions="auth.isStudent"
      @edit="leaveModal.openEdit($event)"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLeaveFormModalStore } from '@/stores/leaveFormModal'
import LeaveRequestsHeader from '@/components/leave/LeaveRequestsHeader.vue'
import LeaveRequestTable from '@/components/leave/LeaveRequestTable.vue'

const auth = useAuthStore()
const leaveModal = useLeaveFormModalStore()

const allRequests = ref([
  {
    id: 1,
    studentId: 101,
    student: 'Sok Dara',
    type: 'Sick Leave',
    leaveDate: 'Jul 9, 2026',
    status: 'Pending',
    submittedAt: '2026-07-13T06:30:00',
  },
  {
    id: 2,
    studentId: 102,
    student: 'Chan Sophea',
    type: 'Personal Leave',
    leaveDate: 'Jul 10, 2026',
    status: 'Approved',
    submittedAt: '2026-07-12T14:00:00',
  },
  {
    id: 3,
    studentId: 103,
    student: 'Vann Vuthy',
    type: 'Emergency Leave',
    leaveDate: 'Jul 6, 2026',
    status: 'Rejected',
    submittedAt: '2026-07-05T09:15:00',
  },
])

// Role-based visibility: admins see every request, students only see their own.
const visibleRequests = computed(() => {
  if (auth.isAdmin) return allRequests.value
  if (auth.isStudent) return allRequests.value.filter((r) => r.studentId === auth.user?.id)
  return []
})

// Most recently submitted requests first.
const requests = computed(() =>
  [...visibleRequests.value].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  )
)
</script>

<style scoped>
.leave-requests {
  max-width: 100%;
}
</style>
