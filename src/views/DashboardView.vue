<template>
  <div>
    <h1 class="mb-5 text-2xl font-bold text-gray-900">Welcome, {{ auth.user?.name || 'User' }}</h1>

    <!-- Admin dashboard -->
    <div v-if="auth.isAdmin" class="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <template v-if="statsLoading">
        <StatCardSkeleton v-for="n in 4" :key="n" />
      </template>
      <template v-else>
        <StatCard :icon="Users" label="Total Requests" :value="totalRequests" color="blue" />
        <StatCard :icon="Clock" label="Pending Requests" :value="pendingCount" color="amber" />
        <StatCard :icon="CheckCircle" label="Approved Requests" :value="approvedCount" color="green" />
        <StatCard :icon="XCircle" label="Rejected Requests" :value="rejectedCount" color="red" />
      </template>
    </div>

    <!-- Staff / Trainer dashboard -->
    <div v-else-if="auth.isTrainer" class="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <template v-if="statsLoading">
        <StatCardSkeleton v-for="n in 4" :key="n" />
      </template>
      <template v-else>
        <StatCard :icon="ClipboardList" label="Pending Reviews" :value="pendingCount" color="amber" />
        <StatCard :icon="CheckCircle" label="Approved Requests" :value="approvedCount" color="green" />
        <StatCard :icon="Users" label="Assigned Students" :value="assignedStudents" color="blue" />
        <StatCard :icon="XCircle" label="Rejected Requests" :value="rejectedCount" color="red" />
      </template>
    </div>

    <!-- Student dashboard -->
    <div v-else-if="auth.isStudent" class="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <template v-if="statsLoading">
        <StatCardSkeleton v-for="n in 4" :key="n" />
      </template>
      <template v-else>
        <StatCard :icon="CalendarDays" label="Total Requests" :value="totalRequests" color="blue" />
        <StatCard :icon="Clock" label="Pending Requests" :value="pendingCount" color="amber" />
        <StatCard :icon="CheckCircle" label="Approved" :value="approvedCount" color="green" />
        <StatCard :icon="XCircle" label="Rejected" :value="rejectedCount" color="red" />
      </template>
    </div>

    <!-- Fallback if role is missing/unknown -->
    <div v-else class="mb-8">
      <p class="text-gray-400">Unable to determine your role. Please log in again.</p>
    </div>

    <div class="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <PendingTodayCard />
      <ApprovedTodayCard />
      <RejectedTodayCard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { leaveService } from '@/services/leaveService'
import api from '@/services/api'
import StatCard from '@/components/ui/StatCard.vue'
import StatCardSkeleton from '@/components/shared/StatCardSkeleton.vue'
import PendingTodayCard from '@/components/dashboard/PendingTodayCard.vue'
import ApprovedTodayCard from '@/components/dashboard/ApprovedTodayCard.vue'
import RejectedTodayCard from '@/components/dashboard/RejectedTodayCard.vue'
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ClipboardList,
  CalendarDays,
} from 'lucide-vue-next'
import { usePolling } from '@/composables/usePolling'

interface AssignedStudent {
  id: number
  role: string
}

const auth = useAuthStore()

const statsLoading = ref(true)
const assignedStudents = ref(0)
const totalRequests = ref(0)
const pendingCount = ref(0)
const approvedCount = ref(0)
const rejectedCount = ref(0)

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
      const { data } = await api.get<{ students: AssignedStudent[]; count: number }>('/trainer/students')
      assignedStudents.value = data.count
    }
  } catch {
    // Leave stats at their defaults (0) if the request fails.
  } finally {
    statsLoading.value = false
  }
}

usePolling(() => loadStats(), { interval: 20000 })
</script>
