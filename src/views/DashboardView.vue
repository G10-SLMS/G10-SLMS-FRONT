<template>
  <div>
    <h1 class="mb-5 text-2xl font-bold text-gray-900">Welcome, {{ auth.user?.name || 'User' }}</h1>

    <!-- Admin dashboard -->
    <div v-if="auth.isAdmin" class="mb-8 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
      <StatCard :icon="Users" label="Total Requests" :value="statsLoading ? '—' : totalRequests" color="blue" />
      <StatCard :icon="Clock" label="Pending Requests" :value="statsLoading ? '—' : pendingCount" color="amber" />
      <StatCard :icon="CheckCircle" label="Approved Requests" :value="statsLoading ? '—' : approvedCount" color="green" />
      <StatCard :icon="XCircle" label="Rejected Requests" :value="statsLoading ? '—' : rejectedCount" color="red" />
    </div>

    <!-- Staff / Trainer dashboard -->
    <div v-else-if="auth.isTrainer" class="mb-8 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
      <StatCard :icon="ClipboardList" label="Pending Reviews" :value="statsLoading ? '—' : pendingCount" color="amber" />
      <StatCard :icon="CheckCircle" label="Approved Requests" :value="statsLoading ? '—' : approvedCount" color="green" />
      <StatCard :icon="Users" label="Assigned Students" :value="statsLoading ? '—' : assignedStudents" color="blue" />
      <StatCard :icon="XCircle" label="Rejected Requests" :value="statsLoading ? '—' : rejectedCount" color="red" />
    </div>

    <!-- Student dashboard -->
    <div v-else-if="auth.isStudent" class="mb-8 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
      <StatCard :icon="CalendarDays" label="Total Requests" :value="statsLoading ? '—' : totalRequests" color="blue" />
      <StatCard :icon="Clock" label="Pending Requests" :value="statsLoading ? '—' : pendingCount" color="amber" />
      <StatCard :icon="CheckCircle" label="Approved" :value="statsLoading ? '—' : approvedCount" color="green" />
      <StatCard :icon="XCircle" label="Rejected" :value="statsLoading ? '—' : rejectedCount" color="red" />
    </div>

    <!-- Fallback if role is missing/unknown -->
    <div v-else class="mb-8">
      <p class="text-gray-400">Unable to determine your role. Please log in again.</p>
    </div>

    <div class="rounded-[10px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
      <h2 class="mb-4 flex items-center gap-2">
        <Activity :size="18" :stroke-width="1.8" />
        Recent Activity
      </h2>

      <p v-if="activityLoading" class="text-gray-400">Loading recent activity…</p>
      <p v-else-if="activityError" class="text-red-500">{{ activityError }}</p>
      <p v-else-if="recentActivity.length === 0" class="text-gray-400">No leave requests yet.</p>

      <ul v-else class="flex flex-col divide-y divide-gray-100">
        <li
          v-for="item in recentActivity"
          :key="item.id"
          class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
        >
          <span
            :class="['flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white', getAvatarColor(item.user?.name || 'Leave')]"
          >
            {{ getInitials(item.user?.name || 'Leave') }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="m-0 truncate text-sm text-gray-800">
              <span class="font-medium">{{ item.user?.name || 'Unknown user' }}</span>
              requested <span class="font-medium">{{ item.leave_type_name }}</span>
            </p>
            <p class="m-0 text-xs text-gray-400">{{ item.submission_date }}</p>
          </div>
          <LeaveStatusBadge :status="item.status" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { leaveService } from '@/services/leaveService'
import api from '@/services/api'
import StatCard from '@/components/ui/StatCard.vue'
import LeaveStatusBadge from '@/components/leave-common/LeaveStatusBadge.vue'
import { getInitials, getAvatarColor } from '@/utils/initials'
import type { LeaveRequestListItem } from '@/types/leave'
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ClipboardList,
  CalendarDays,
  Activity,
} from 'lucide-vue-next'

interface DirectoryUser {
  id: number
  role: string
  trainer_id: number | null
}

const auth = useAuthStore()

const statsLoading = ref(true)
const assignedStudents = ref(0)
const totalRequests = ref(0)
const pendingCount = ref(0)
const approvedCount = ref(0)
const rejectedCount = ref(0)

const recentActivity = ref<LeaveRequestListItem[]>([])
const activityLoading = ref(true)
const activityError = ref('')

async function loadStats() {
  statsLoading.value = true
  try {
    const [pending, approved, rejected] = await Promise.all([
      leaveService.getLeaveRequests({ status: 'pending', per_page: 1 }),
      leaveService.getLeaveRequests({ status: 'approved', per_page: 1 }),
      leaveService.getLeaveRequests({ status: 'rejected', per_page: 1 }),
    ])

    pendingCount.value = pending.total
    approvedCount.value = approved.total
    rejectedCount.value = rejected.total
    totalRequests.value = pending.total + approved.total + rejected.total

    if (auth.isTrainer) {
      const { data } = await api.get<{ users: DirectoryUser[]; count: number }>('/users')
      const students = data.users.filter((u) => u.role === 'student')

      assignedStudents.value = students.filter((u) => u.trainer_id === auth.user?.id).length
    }
  } catch {
    // Leave stats at their defaults (0) if the request fails.
  } finally {
    statsLoading.value = false
  }
}

async function loadRecentActivity() {
  activityLoading.value = true
  activityError.value = ''
  try {
    const { data } = await leaveService.getLeaveRequests({ per_page: 5 })
    recentActivity.value = data
  } catch {
    activityError.value = 'Failed to load recent activity.'
  } finally {
    activityLoading.value = false
  }
}

onMounted(() => {
  loadStats()
  loadRecentActivity()
})
</script>
