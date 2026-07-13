<template>
<div class="admin-view">
    <div class="header-row">
      <div>
        <h1>Admin</h1>
        <p class="sub-label">System overview and management</p>
      </div>
      <button class="export-btn">
        <Download :size="16" :stroke-width="1.8" />
        Export Summary
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-icon icon-blue"><Users :size="18" :stroke-width="1.8" /></span>
        <p class="stat-label">Active Students</p>
        <p class="stat-value">{{ stats.activeStudents }}</p>
      </div>
      <div class="stat-card">
        <span class="stat-icon icon-amber"><Clock :size="18" :stroke-width="1.8" /></span>
        <p class="stat-label">Pending Requests</p>
        <p class="stat-value">{{ stats.pendingRequests }}</p>
      </div>
      <div class="stat-card">
        <span class="stat-icon icon-green"><GraduationCap :size="18" :stroke-width="1.8" /></span>
        <p class="stat-label">Trainers</p>
        <p class="stat-value">{{ stats.trainers }}</p>
      </div>
      <div class="stat-card">
        <span class="stat-icon icon-blue"><Activity :size="18" :stroke-width="1.8" /></span>
        <p class="stat-label">System Health</p>
        <p class="stat-value">{{ stats.systemHealth }}</p>
      </div>
    </div>

    <div class="mid-row">
      <div class="card leave-types-card">
        <div class="card-header">
          <h2>Leave Types</h2>
          <button class="link-btn">Manage</button>
        </div>
        <ul class="leave-types-list">
          <li><FileText :size="15" :stroke-width="1.8" /> Sick Leave</li>
          <li><FileText :size="15" :stroke-width="1.8" /> Personal Leave</li>
          <li><FileText :size="15" :stroke-width="1.8" /> Emergency Leave</li>
        </ul>
      </div>

      <div class="card quick-actions-card">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <button class="action-btn">
            <UserPlus :size="16" :stroke-width="1.8" />
            Add User
          </button>
          <button class="action-btn">
            <FileText :size="16" :stroke-width="1.8" />
            Generate Report
          </button>
          <button class="action-btn">
            <CheckCircle :size="16" :stroke-width="1.8" />
            Approve Leaves
          </button>
          <button class="action-btn">
            <Bell :size="16" :stroke-width="1.8" />
            Bulk Notify
          </button>
        </div>
      </div>
    </div>

    <div class="card recent-activity-card-table-wrap">
      <div class="card-header">
        <h2>Recent Activity</h2>
        <button class="link-btn">View All</button>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Request Type</th>
              <th>Duration</th>
              <th>Submitted On</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in activity" :key="item.id">
              <td>
                <div class="user-cell">
                  <span class="avatar-dot">{{ item.initials }}</span>
                  <div>
                    <p class="user-name">{{ item.user }}</p>
                    <p class="user-role">{{ item.role }}</p>
                  </div>
                </div>
              </td>
              <td>{{ item.type }}</td>
              <td>{{ item.duration }}</td>
              <td>{{ item.submitted }}</td>
              <td>
                <span class="badge" :class="item.status.toLowerCase()">{{ item.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download, UserPlus, FileText, CheckCircle, Bell, Users, Clock, GraduationCap, Activity } from 'lucide-vue-next'

const stats = ref({
  activeStudents: 100,
  pendingRequests: 20,
  trainers: 8,
  systemHealth: '99.9%',
})

// Placeholder data — will come from GET /api/dashboard/stats and /api/leave-requests later
const activity = ref([
  { id: 1, user: 'Chanthy Chet', role: 'Student · ID 2026-002', initials: 'JD', type: 'Medical Leave', duration: '3 Days', submitted: 'Jul 3, 2026', status: 'Pending' },
  { id: 2, user: 'Yon Yen', role: 'Trainer · Backend Trainer', initials: 'SM', type: 'Annual Leave', duration: '5 Days', submitted: 'Jul 2, 2026', status: 'Approved' },
  { id: 3, user: 'Kunthea Yon', role: 'Student · ID 2026-076', initials: 'AK', type: 'Emergency Leave', duration: '1 Day', submitted: 'Jul 1, 2026', status: 'Rejected' },
])
</script>

<style scoped>
.admin-view {
  max-width: 100%;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.sub-label {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.export-btn {
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

.export-btn:hover {
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
  grid-template-columns: 1fr 1fr;
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
  margin-bottom: 12px;
}

.card h2 {
  font-size: 16px;
  margin: 0 0 12px;
}

.card-header h2 {
  margin: 0;
}

.link-btn {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 13px;
  cursor: pointer;
}

.leave-types-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.leave-types-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #6b7280;
}

.leave-types-list li:last-child {
  border-bottom: none;
}

.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f3f4f6;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}

.action-btn:hover {
  background: #e5e7eb;
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

@media (max-width: 768px) {
  .table-scroll {
    overflow-x: auto;
  }
}

@media (max-width: 768px) {
  .table-scroll table {
    min-width: 600px;
  }
}

.table-scroll table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
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

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #dbeafe;
  color: #1e3a8a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-name {
  margin: 0;
  font-weight: 500;
}

.user-role {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

.badge.pending {
  background: #fef3c7;
  color: #b45309;
}

.badge.approved {
  background: #dcfce7;
  color: #15803d;
}

.badge.rejected {
  background: #fee2e2;
  color: #b91c1c;
}

@media (max-width: 768px) {
  .mid-row {
    grid-template-columns: 1fr;
  }
}
</style>
