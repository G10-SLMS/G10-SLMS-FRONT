<template>
  <div class="leave-types-view">
    <div class="header-row">
      <div>
        <h1>Leave Types Management</h1>
        <p class="sub-label">Define the leave categories available to students and trainers</p>
      </div>
      <button class="primary-btn" @click="openAddModal">
        <Plus :size="16" :stroke-width="1.8" />
        Add Leave Type
      </button>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>All Leave Types</h2>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Default Days / Year</th>
              <th>Requires Approval</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lt in leaveTypes" :key="lt.id">
              <td>
                <div class="type-cell">
                  <FileText :size="15" :stroke-width="1.8" />
                  {{ lt.name }}
                </div>
              </td>
              <td>{{ lt.defaultDays }} days</td>
              <td>{{ lt.requiresApproval ? 'Yes' : 'No' }}</td>
              <td>
                <span class="badge" :class="lt.active ? 'active' : 'inactive'">
                  {{ lt.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <div class="row-actions">
                  <button class="icon-btn" aria-label="Edit leave type" @click="openEditModal(lt)">
                    <Pencil :size="15" :stroke-width="1.8" />
                  </button>
                  <button class="icon-btn" aria-label="Toggle status" @click="toggleActive(lt.id)">
                    <Power :size="15" :stroke-width="1.8" />
                  </button>
                  <button class="icon-btn danger" aria-label="Remove leave type" @click="removeType(lt.id)">
                    <Trash2 :size="15" :stroke-width="1.8" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="leaveTypes.length === 0">
              <td colspan="5" class="empty-row">No leave types yet. Add one to get started.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="modalOpen" class="modal-backdrop" @click.self="closeModal">
        <div class="modal">
          <h2>{{ editingType ? 'Edit Leave Type' : 'Add Leave Type' }}</h2>

          <label class="field">
            <span>Name</span>
            <input v-model="form.name" type="text" placeholder="e.g. Sick Leave" />
          </label>

          <label class="field">
            <span>Default Days / Year</span>
            <input v-model.number="form.defaultDays" type="number" min="0" />
          </label>

          <label class="field checkbox-field">
            <input v-model="form.requiresApproval" type="checkbox" />
            <span>Requires approval</span>
          </label>

          <label class="field checkbox-field">
            <input v-model="form.active" type="checkbox" />
            <span>Active</span>
          </label>

          <div class="modal-actions">
            <button class="secondary-btn" @click="closeModal">Cancel</button>
            <button class="primary-btn" @click="saveType">
              {{ editingType ? 'Save Changes' : 'Add Leave Type' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus, FileText, Pencil, Power, Trash2 } from 'lucide-vue-next'

interface LeaveType {
  id: number
  name: string
  defaultDays: number
  requiresApproval: boolean
  active: boolean
}

// Placeholder data — will come from GET /api/leave-types later
const leaveTypes = ref<LeaveType[]>([
  { id: 1, name: 'Sick Leave', defaultDays: 10, requiresApproval: true, active: true },
  { id: 2, name: 'Personal Leave', defaultDays: 5, requiresApproval: true, active: true },
  { id: 3, name: 'Emergency Leave', defaultDays: 3, requiresApproval: false, active: true },
  { id: 4, name: 'Annual Leave', defaultDays: 15, requiresApproval: true, active: true },
])

const modalOpen = ref(false)
const editingType = ref<LeaveType | null>(null)
const form = reactive({ name: '', defaultDays: 0, requiresApproval: true, active: true })

function openAddModal() {
  editingType.value = null
  form.name = ''
  form.defaultDays = 0
  form.requiresApproval = true
  form.active = true
  modalOpen.value = true
}

function openEditModal(lt: LeaveType) {
  editingType.value = lt
  form.name = lt.name
  form.defaultDays = lt.defaultDays
  form.requiresApproval = lt.requiresApproval
  form.active = lt.active
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

function saveType() {
  if (!form.name.trim()) return

  if (editingType.value) {
    // Will call PUT /api/leave-types/:id later
    const idx = leaveTypes.value.findIndex((lt) => lt.id === editingType.value!.id)
    if (idx !== -1) {
      leaveTypes.value[idx] = { ...leaveTypes.value[idx], ...form }
    }
  } else {
    // Will call POST /api/leave-types later
    leaveTypes.value.push({
      id: Math.max(0, ...leaveTypes.value.map((lt) => lt.id)) + 1,
      name: form.name,
      defaultDays: form.defaultDays,
      requiresApproval: form.requiresApproval,
      active: form.active,
    })
  }

  modalOpen.value = false
}

function toggleActive(id: number) {
  // Will call PATCH /api/leave-types/:id later
  const lt = leaveTypes.value.find((item) => item.id === id)
  if (lt) lt.active = !lt.active
}

function removeType(id: number) {
  // Will call DELETE /api/leave-types/:id later
  leaveTypes.value = leaveTypes.value.filter((lt) => lt.id !== id)
}
</script>

<style scoped>
.leave-types-view {
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

.secondary-btn {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.secondary-btn:hover {
  background: #e5e7eb;
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

.type-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #111827;
}

.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

.badge.active {
  background: #dcfce7;
  color: #15803d;
}

.badge.inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.row-actions {
  display: flex;
  gap: 6px;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: none;
  background: #f3f4f6;
  color: #374151;
  cursor: pointer;
}

.icon-btn:hover {
  background: #e5e7eb;
}

.icon-btn.danger:hover {
  background: #fee2e2;
  color: #b91c1c;
}

.empty-row {
  text-align: center;
  color: #9ca3af;
  padding: 24px 8px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.modal h2 {
  font-size: 18px;
  margin: 0 0 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
  font-size: 13px;
  color: #374151;
}

.field input[type='text'],
.field input[type='number'] {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 9px 10px;
  font-size: 14px;
  color: #111827;
}

.checkbox-field {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.checkbox-field input {
  width: 16px;
  height: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
