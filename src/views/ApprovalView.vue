<template>
  <div class="approval-view">
    <div class="header-row">
      <h1>Approvals</h1>
      <div class="filter-tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          class="tab-btn"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ tab }}
          <span v-if="tab === 'Pending' && pendingCount > 0" class="tab-count">{{ pendingCount }}</span>
        </button>
      </div>
    </div>

    <div class="table-card">
      <table v-if="filteredRequests.length">
        <thead>
          <tr>
            <th>Student</th>
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Reason</th>
            <th>Status</th>
            <th v-if="activeTab === 'Pending'">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in filteredRequests" :key="request.id">
            <td>
              <div class="student-cell">
                <span class="avatar">{{ initials(request.student) }}</span>
                {{ request.student }}
              </div>
            </td>
            <td>{{ request.type }}</td>
            <td>{{ request.startDate }}</td>
            <td>{{ request.endDate }}</td>
            <td class="reason-cell">{{ request.reason }}</td>
            <td>
              <span class="badge" :class="request.status.toLowerCase()">
                {{ request.status }}
              </span>
            </td>
            <td v-if="activeTab === 'Pending'">
              <div class="action-buttons">
                <button
                  class="action-btn approve"
                  :disabled="request.processing"
                  @click="handleDecision(request, 'Approved')"
                >
                  <Check :size="15" />
                  Approve
                </button>
                <button
                  class="action-btn reject"
                  :disabled="request.processing"
                  @click="handleDecision(request, 'Rejected')"
                >
                  <X :size="15" />
                  Reject
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="empty-state">
        <CheckCircle2 :size="36" :stroke-width="1.5" />
        <p>No {{ activeTab.toLowerCase() }} requests.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Check, X, CheckCircle2 } from 'lucide-vue-next'

const tabs = ['Pending', 'Approved', 'Rejected'] as const
const activeTab = ref<(typeof tabs)[number]>('Pending')

interface LeaveRequest {
  id: number
  student: string
  type: string
  startDate: string
  endDate: string
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
  processing?: boolean
}

// Placeholder data — will come from GET /api/leave-requests?scope=approvals later
const requests = ref<LeaveRequest[]>([
  { id: 1, student: 'Sok Dara', type: 'Sick Leave', startDate: 'Jul 8, 2026', endDate: 'Jul 9, 2026', reason: 'Fever and flu symptoms', status: 'Pending' },
  { id: 2, student: 'Chan Sophea', type: 'Personal Leave', startDate: 'Jul 10, 2026', endDate: 'Jul 10, 2026', reason: 'Family event', status: 'Approved' },
  { id: 3, student: 'Vann Vuthy', type: 'Emergency Leave', startDate: 'Jul 5, 2026', endDate: 'Jul 6, 2026', reason: 'Family emergency', status: 'Rejected' },
  { id: 4, student: 'Ly Sreymom', type: 'Sick Leave', startDate: 'Jul 14, 2026', endDate: 'Jul 15, 2026', reason: 'Medical appointment', status: 'Pending' },
])

const pendingCount = computed(() => requests.value.filter((r) => r.status === 'Pending').length)

const filteredRequests = computed(() =>
  requests.value.filter((r) => r.status === activeTab.value)
)

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

async function handleDecision(request: LeaveRequest, decision: 'Approved' | 'Rejected') {
  request.processing = true
  try {
    // TODO: replace with real API call
    // await api.patch(`/leave-requests/${request.id}`, { status: decision })
    await new Promise((resolve) => setTimeout(resolve, 400))
    request.status = decision
  } finally {
    request.processing = false
  }
}
</script>

<style scoped>
.approval-view {
  max-width: 100%;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.header-row h1 {
  margin: 0;
}

.filter-tabs {
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  padding: 7px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
}

.tab-btn.active {
  background: white;
  color: #2563eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.tab-count {
  background: #2563eb;
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 999px;
  padding: 1px 6px;
  line-height: 1.4;
}

.tab-btn.active .tab-count {
  background: #2563eb;
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
  vertical-align: middle;
}

th {
  color: #6b7280;
  font-weight: 500;
  font-size: 13px;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

tbody tr {
  border-bottom: 1px solid #f3f4f6;
}

tbody tr:last-child {
  border-bottom: none;
}

.student-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.reason-cell {
  color: #6b7280;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
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

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
  white-space: nowrap;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn.approve {
  background: #dcfce7;
  color: #15803d;
}

.action-btn.approve:hover:not(:disabled) {
  background: #bbf7d0;
}

.action-btn.reject {
  background: #fee2e2;
  color: #b91c1c;
}

.action-btn.reject:hover:not(:disabled) {
  background: #fecaca;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px 20px;
  color: #9ca3af;
  text-align: center;
}
</style>
