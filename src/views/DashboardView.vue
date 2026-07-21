<template>
  <div>
    <h1 class="mb-5">Welcome, {{ auth.user?.name || 'User' }}</h1>

    <!-- Admin dashboard -->
    <div v-if="auth.isAdmin" class="mb-8 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
      <StatCard :icon="Users" label="Total Students" :value="100" color="blue" />
      <StatCard :icon="Clock" label="Pending Requests" :value="20" color="amber" />
      <StatCard :icon="CheckCircle" label="Approved Requests" :value="25" color="green" />
      <StatCard :icon="XCircle" label="Rejected Requests" :value="5" color="red" />
    </div>

    <!-- Staff / Trainer dashboard -->
    <div v-else-if="auth.isTrainer" class="mb-8 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
      <StatCard :icon="ClipboardList" label="Pending Reviews" :value="12" color="amber" />
      <StatCard :icon="CheckCircle" label="Approved Today" :value="4" color="green" />
      <StatCard :icon="Users" label="Assigned Students" :value="38" color="blue" />
      <StatCard :icon="XCircle" label="Rejected Today" :value="1" color="red" />
    </div>

    <!-- Student dashboard -->
    <div v-else-if="auth.isStudent" class="mb-8 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
      <StatCard :icon="CalendarDays" label="My Leave Balance" :value="8" color="blue" />
      <StatCard :icon="Clock" label="Pending Requests" :value="1" color="amber" />
      <StatCard :icon="CheckCircle" label="Approved" :value="3" color="green" />
      <StatCard :icon="XCircle" label="Rejected" :value="0" color="red" />
    </div>

    <!-- Fallback if role is missing/unknown -->
    <div v-else class="mb-8">
      <p class="text-gray-400">Unable to determine your role. Please log in again.</p>
    </div>

    <div class="rounded-[10px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
      <h2 class="flex items-center gap-2">
        <Activity :size="18" :stroke-width="1.8" />
        Recent Activity
      </h2>
      <p class="text-gray-400">No activity yet (placeholder).</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import StatCard from '@/components/ui/StatCard.vue'
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ClipboardList,
  CalendarDays,
  Activity,
} from 'lucide-vue-next'

const auth = useAuthStore()
</script>
