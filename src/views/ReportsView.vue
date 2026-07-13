<template>
  <div class="reports-view">
    <div class="header-row">
      <div>
        <h1>Reports</h1>
        <p class="sub-label">Leave activity and trends across the organization</p>
      </div>
      <div class="toolbar">
        <select v-model="range" class="range-select">
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="ytd">Year to date</option>
        </select>
        <button class="primary-btn">
          <Download :size="16" :stroke-width="1.8" />
          Export
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-icon icon-blue"><FileText :size="18" :stroke-width="1.8" /></span>
        <p class="stat-label">Total Requests</p>
        <p class="stat-value">{{ summary.total }}</p>
      </div>
      <div class="stat-card">
        <span class="stat-icon icon-green"><CheckCircle :size="18" :stroke-width="1.8" /></span>
        <p class="stat-label">Approved</p>
        <p class="stat-value">{{ summary.approved }}</p>
      </div>
      <div class="stat-card">
        <span class="stat-icon icon-amber"><Clock :size="18" :stroke-width="1.8" /></span>
        <p class="stat-label">Pending</p>
        <p class="stat-value">{{ summary.pending }}</p>
      </div>
      <div class="stat-card">
        <span class="stat-icon icon-red"><XCircle :size="18" :stroke-width="1.8" /></span>
        <p class="stat-label">Rejected</p>
        <p class="stat-value">{{ summary.rejected }}</p>
      </div>
    </div>

    <div class="mid-row">
      <div class="card breakdown-card">
        <div class="card-header">
          <h2>Requests by Leave Type</h2>
        </div>
        <div class="bar-chart">
          <div v-for="row in byType" :key="row.name" class="bar-row">
            <span class="bar-label">{{ row.name }}</span>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: barWidth(row.count) }"></div>
            </div>
            <span class="bar-count">{{ row.count }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Top Departments</h2>
        </div>
        <ul class="dept-list">
          <li v-for="d in byDepartment" :key="d.name">
            <span>{{ d.name }}</span>
            <span class="dept-count">{{ d.count }} requests</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="card recent-activity-card-table-wrap">
      <div class="card-header">
        <h2>Monthly Summary</h2>
      </div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Submitted</th>
              <th>Approved</th>
              <th>Rejected</th>
              <th>Approval Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in monthly" :key="m.month">
              <td>{{ m.month }}</td>
              <td>{{ m.submitted }}</td>
              <td>{{ m.approved }}</td>
              <td>{{ m.rejected }}</td>
              <td>{{ approvalRate(m) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Download, FileText, CheckCircle, Clock, XCircle } from 'lucide-vue-next'

const range = ref<'30d' | '90d' | 'ytd'>('30d')

// Placeholder data — will come from GET /api/reports/summary later
const summary = ref({
  total: 142,
  approved: 98,
  pending: 24,
  rejected: 20,
})

const byType = ref([
  { name: 'Sick Leave', count: 52 },
  { name: 'Annual Leave', count: 41 },
  { name: 'Personal Leave', count: 28 },
  { name: 'Emergency Leave', count: 21 },
])

const byDepartment = ref([
  { name: 'Backend Cohort', count: 38 },
  { name: 'Frontend Cohort', count: 34 },
  { name: 'Data Cohort', count: 29 },
  { name: 'Design Cohort', count: 22 },
])

const monthly = ref([
  { month: 'April 2026', submitted: 45, approved: 32, rejected: 5 },
  { month: 'May 2026', submitted: 51, approved: 36, rejected: 7 },
  { month: 'June 2026', submitted: 46, approved: 30, rejected: 8 },
])

const maxCount = computed(() => Math.max(...byType.value.map((r) => r.count), 1))

function barWidth(count: number) {
  return `${Math.round((count / maxCount.value) * 100)}%`
}

function approvalRate(m: { submitted: number; approved: number }) {
  if (!m.submitted) return 0
  return Math.round((m.approved / m.submitted) * 100)
}
</script>

<style scoped>
.reports-view {
  max-width: 100%;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.sub-label {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
}

.range-select {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 9px 10px;
  font-size: 13px;
  color: #374151;
  background: white;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.primary-btn:hover {
  background: #1d4ed8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  margin-bottom: 10px;
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

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 6px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.mid-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card h2 {
  font-size: 16px;
  margin: 0;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bar-row {
  display: grid;
  grid-template-columns: 110px 1fr 32px;
  align-items: center;
  gap: 10px;
}

.bar-label {
  font-size: 13px;
  color: #374151;
}

.bar-track {
  background: #f3f4f6;
  border-radius: 999px;
  height: 10px;
  overflow: hidden;
}

.bar-fill {
  background: #2563eb;
  height: 100%;
  border-radius: 999px;
}

.bar-count {
  font-size: 13px;
  color: #6b7280;
  text-align: right;
}

.dept-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dept-list li {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #374151;
}

.dept-list li:last-child {
  border-bottom: none;
}

.dept-count {
  color: #6b7280;
  font-size: 13px;
}

.recent-activity-card-table-wrap {
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.table-scroll table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

@media (max-width: 768px) {
  .table-scroll table {
    min-width: 560px;
  }
}

.table-scroll th,
.table-scroll td {
  text-align: left;
  padding: 12px 8px;
}

.table-scroll th {
  color: #6b7280;
  font-weight: 500;
  font-size: 13px;
  border-bottom: 1px solid #e5e7eb;
}

.table-scroll tbody tr {
  border-bottom: 1px solid #f3f4f6;
}

.table-scroll tbody tr:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .mid-row {
    grid-template-columns: 1fr;
  }
}
</style>
