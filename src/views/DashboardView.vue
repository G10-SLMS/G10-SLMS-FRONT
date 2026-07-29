<template>
  <div>
    <h1 class="mb-5 text-2xl font-bold text-gray-900">Welcome, {{ auth.user?.name || 'User' }}</h1>

    <!-- Admin dashboard -->
    <div v-if="auth.isAdmin" class="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
      <template v-if="statsLoading">
        <StatCardSkeleton v-for="n in 5" :key="n" />
      </template>
      <template v-else>
        <StatCard :icon="Users" label="Total Requests" :value="totalRequests" color="blue" />
        <StatCard :icon="Clock" label="Pending Requests" :value="pendingCount" color="amber" />
        <StatCard :icon="UserSearch" label="Under Review" :value="underReviewCount" color="cyan" />
        <StatCard :icon="CheckCircle" label="Approved Requests" :value="approvedCount" color="green" />
        <StatCard :icon="XCircle" label="Rejected Requests" :value="rejectedCount" color="red" />
      </template>
    </div>

    <!-- Staff / Educator dashboard -->
    <div v-else-if="auth.isEducator" class="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
      <template v-if="statsLoading">
        <StatCardSkeleton v-for="n in 5" :key="n" />
      </template>
      <template v-else>
        <StatCard :icon="ClipboardList" label="Pending Reviews" :value="pendingCount" color="amber" />
        <StatCard :icon="UserSearch" label="Under Review" :value="underReviewCount" color="cyan" />
        <StatCard :icon="CheckCircle" label="Approved Requests" :value="approvedCount" color="green" />
        <StatCard :icon="Users" label="Assigned Students" :value="assignedStudents" color="blue" />
        <StatCard :icon="XCircle" label="Rejected Requests" :value="rejectedCount" color="red" />
      </template>
    </div>

    <!-- Student dashboard -->
    <div v-else-if="auth.isStudent" class="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
      <template v-if="statsLoading">
        <StatCardSkeleton v-for="n in 5" :key="n" />
      </template>
      <template v-else>
        <StatCard :icon="CalendarDays" label="Total Requests" :value="totalRequests" color="blue" />
        <StatCard :icon="Clock" label="Pending Requests" :value="pendingCount" color="amber" />
        <StatCard :icon="UserSearch" label="Under Review" :value="underReviewCount" color="cyan" />
        <StatCard :icon="CheckCircle" label="Approved" :value="approvedCount" color="green" />
        <StatCard :icon="XCircle" label="Rejected" :value="rejectedCount" color="red" />
      </template>
    </div>

    <!-- Fallback if role is missing/unknown -->
    <div v-else class="mb-8">
      <p class="text-gray-400">Unable to determine your role. Please log in again.</p>
    </div>

    <div class="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
      <PendingTodayCard />
      <UnderReviewTodayCard />
      <ApprovedTodayCard />
      <RejectedTodayCard />
    </div>

    <DashboardCharts v-if="auth.isAdmin" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { leaveService } from '@/services/leaveService'
import api from '@/services/api'
import StatCard from '@/components/ui/StatCard.vue'
import StatCardSkeleton from '@/components/shared/StatCardSkeleton.vue'
import PendingTodayCard from '@/components/dashboard/PendingTodayCard.vue'
import UnderReviewTodayCard from '@/components/dashboard/UnderReviewTodayCard.vue'
import ApprovedTodayCard from '@/components/dashboard/ApprovedTodayCard.vue'
import RejectedTodayCard from '@/components/dashboard/RejectedTodayCard.vue'
import DashboardCharts from '@/components/dashboard/DashboardCharts.vue'
import {
  Users,
  Clock,
  UserSearch,
  CheckCircle,
  XCircle,
  ClipboardList,
  CalendarDays,
} from 'lucide-vue-next'

interface AssignedStudent {
  id: number
  role: string
}

const auth = useAuthStore()

const statsLoading = ref(true)
const assignedStudents = ref(0)
const totalRequests = ref(0)
const pendingCount = ref(0)
const underReviewCount = ref(0)
const approvedCount = ref(0)
const rejectedCount = ref(0)

async function loadStats() {
  statsLoading.value = true
  try {
    
    const [stats, studentsRes] = await Promise.all([
      leaveService.getLeaveRequestStats(),
      auth.isEducator
        ? api.get<{ students: AssignedStudent[]; count: number }>('/educator/students')
        : Promise.resolve(null),
    ])

    pendingCount.value = stats.pending
    underReviewCount.value = stats.under_review
    approvedCount.value = stats.approved
    rejectedCount.value = stats.rejected
    totalRequests.value = stats.pending + stats.under_review + stats.approved + stats.rejected

    if (studentsRes) {
      assignedStudents.value = studentsRes.data.count
    }
  } catch {
    // Leave stats at their defaults (0) if the request fails.
  } finally {
    statsLoading.value = false
  }
}

onMounted(() => loadStats())
</script>
