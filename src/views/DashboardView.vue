<template>
  <div class="dashboard-view">
    <h1>Welcome, {{ auth.user?.name || 'User' }}</h1>

    <!-- Admin dashboard -->
    <div v-if="auth.isAdmin" class="cards">
      <div class="card">
        <span class="card-icon icon-blue"><Users :size="18" :stroke-width="1.8" /></span>
        <p class="card-label">Total Students</p>
        <p class="card-value">100</p>
      </div>
      <div class="card">
        <span class="card-icon icon-amber"><Clock :size="18" :stroke-width="1.8" /></span>
        <p class="card-label">Pending Requests</p>
        <p class="card-value">20</p>
      </div>
      <div class="card">
        <span class="card-icon icon-green"><CheckCircle :size="18" :stroke-width="1.8" /></span>
        <p class="card-label">Approved Requests</p>
        <p class="card-value">25</p>
      </div>
      <div class="card">
        <span class="card-icon icon-red"><XCircle :size="18" :stroke-width="1.8" /></span>
        <p class="card-label">Rejected Requests</p>
        <p class="card-value">5</p>
      </div>
    </div>

    <!-- Staff / Trainer dashboard -->
    <div v-else-if="auth.isTrainer" class="cards">
      <div class="card">
        <span class="card-icon icon-amber"><ClipboardList :size="18" :stroke-width="1.8" /></span>
        <p class="card-label">Pending Reviews</p>
        <p class="card-value">12</p>
      </div>
      <div class="card">
        <span class="card-icon icon-green"><CheckCircle :size="18" :stroke-width="1.8" /></span>
        <p class="card-label">Approved Today</p>
        <p class="card-value">4</p>
      </div>
      <div class="card">
        <span class="card-icon icon-blue"><Users :size="18" :stroke-width="1.8" /></span>
        <p class="card-label">Assigned Students</p>
        <p class="card-value">38</p>
      </div>
      <div class="card">
        <span class="card-icon icon-red"><XCircle :size="18" :stroke-width="1.8" /></span>
        <p class="card-label">Rejected Today</p>
        <p class="card-value">1</p>
      </div>
    </div>

    <!-- Student dashboard -->
    <div v-else-if="auth.isStudent" class="cards">
      <div class="card">
        <span class="card-icon icon-blue"><CalendarDays :size="18" :stroke-width="1.8" /></span>
        <p class="card-label">My Leave Balance</p>
        <p class="card-value">8</p>
      </div>
      <div class="card">
        <span class="card-icon icon-amber"><Clock :size="18" :stroke-width="1.8" /></span>
        <p class="card-label">Pending Requests</p>
        <p class="card-value">1</p>
      </div>
      <div class="card">
        <span class="card-icon icon-green"><CheckCircle :size="18" :stroke-width="1.8" /></span>
        <p class="card-label">Approved</p>
        <p class="card-value">3</p>
      </div>
      <div class="card">
        <span class="card-icon icon-red"><XCircle :size="18" :stroke-width="1.8" /></span>
        <p class="card-label">Rejected</p>
        <p class="card-value">0</p>
      </div>
    </div>

    <!-- Fallback if role is missing/unknown -->
    <div v-else class="cards">
      <p class="placeholder-text">Unable to determine your role. Please log in again.</p>
    </div>

    <div class="recent-activity">
      <h2>
        <Activity :size="18" :stroke-width="1.8" />
        Recent Activity
      </h2>
      <p class="placeholder-text">No activity yet (placeholder).</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
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

<style scoped>
.dashboard-view h1 {
  margin-bottom: 20px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.icon-blue {
  background: #dbeafe;
  color: #1e3a8a;
}

.icon-amber {
  background: #fef3c7;
  color: #b45309;
}

.icon-green {
  background: #dcfce7;
  color: #15803d;
}

.icon-red {
  background: #fee2e2;
  color: #b91c1c;
}

.card-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
}

.recent-activity {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.recent-activity h2 {
  display: flex;
  align-items: center;
  gap: 8px;
}

.placeholder-text {
  color: #9ca3af;
}
</style>
