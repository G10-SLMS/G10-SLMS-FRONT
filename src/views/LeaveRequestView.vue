<template>
  <div class="leave-requests">
    <div class="header-row">
      <h1>Leave Requests</h1>
      <button class="new-btn">+ New Request</button>
    </div>

    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in requests" :key="request.id">
            <td>{{ request.student }}</td>
            <td>{{ request.type }}</td>
            <td>{{ request.startDate }}</td>
            <td>{{ request.endDate }}</td>
            <td>
              <span class="badge" :class="request.status.toLowerCase()">
                {{ request.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Placeholder data — will come from GET /api/leave-requests later
const requests = ref([
  { id: 1, student: 'Sok Dara', type: 'Sick Leave', startDate: 'Jul 8, 2026', endDate: 'Jul 9, 2026', status: 'Pending' },
  { id: 2, student: 'Chan Sophea', type: 'Personal Leave', startDate: 'Jul 10, 2026', endDate: 'Jul 10, 2026', status: 'Approved' },
  { id: 3, student: 'Vann Vuthy', type: 'Emergency Leave', startDate: 'Jul 5, 2026', endDate: 'Jul 6, 2026', status: 'Rejected' },
])
</script>

<style scoped>
.leave-requests {
  max-width: 100%;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.new-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.new-btn:hover {
  background: #1d4ed8;
}

.table-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th, td {
  text-align: left;
  padding: 14px 16px;
}

th {
  color: #6b7280;
  font-weight: 500;
  font-size: 13px;
  border-bottom: 1px solid #e5e7eb;
}

tbody tr {
  border-bottom: 1px solid #f3f4f6;
}

tbody tr:last-child {
  border-bottom: none;
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
</style>