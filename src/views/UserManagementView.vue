<template>
  <div class="user-mgmt-view">
    <div class="header-row">
      <div>
        <h1>User Management</h1>
        <p class="sub-label">Manage students, trainers, and admin accounts</p>
      </div>
      <button class="primary-btn" @click="openAddModal">
        <UserPlus :size="16" :stroke-width="1.8" />
        Add User
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-icon icon-blue"><Users :size="18" :stroke-width="1.8" /></span>
        <p class="stat-label">Total Users</p>
        <p class="stat-value">{{ users.length }}</p>
      </div>
      <div class="stat-card">
        <span class="stat-icon icon-green"><GraduationCap :size="18" :stroke-width="1.8" /></span>
        <p class="stat-label">Students</p>
        <p class="stat-value">{{ counts.student }}</p>
      </div>
      <div class="stat-card">
        <span class="stat-icon icon-amber"><UserCheck :size="18" :stroke-width="1.8" /></span>
        <p class="stat-label">Trainers</p>
        <p class="stat-value">{{ counts.trainer }}</p>
      </div>
      <div class="stat-card">
        <span class="stat-icon icon-blue"><ShieldCheck :size="18" :stroke-width="1.8" /></span>
        <p class="stat-label">Admins</p>
        <p class="stat-value">{{ counts.admin }}</p>
      </div>
    </div>

    <div class="card table-card">
      <div class="card-header">
        <h2>All Users</h2>
        <div class="toolbar">
          <div class="search-box">
            <Search :size="15" :stroke-width="1.8" />
            <input v-model="search" type="text" placeholder="Search by name or email" />
          </div>
          <select v-model="roleFilter" class="role-select">
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="trainer">Trainer</option>
            <option value="student">Student</option>
          </select>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in filteredUsers" :key="u.id">
              <td>
                <div class="user-cell">
                  <span class="avatar-dot">{{ initials(u.name) }}</span>
                  <p class="user-name">{{ u.name }}</p>
                </div>
              </td>
              <td>{{ u.email }}</td>
              <td>
                <span class="badge" :class="u.role">{{ roleLabel(u.role) }}</span>
              </td>
              <td>{{ u.joined }}</td>
              <td>
                <div class="row-actions">
                  <button class="icon-btn" aria-label="Edit user" @click="openEditModal(u)">
                    <Pencil :size="15" :stroke-width="1.8" />
                  </button>
                  <button class="icon-btn danger" aria-label="Remove user" @click="removeUser(u.id)">
                    <Trash2 :size="15" :stroke-width="1.8" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="5" class="empty-row">No users match your search.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="modalOpen" class="modal-backdrop" @click.self="closeModal">
        <div class="modal">
          <h2>{{ editingUser ? 'Edit User' : 'Add User' }}</h2>

          <label class="field">
            <span>Full Name</span>
            <input v-model="form.name" type="text" placeholder="e.g. Sokha Chan" />
          </label>

          <label class="field">
            <span>Email</span>
            <input v-model="form.email" type="email" placeholder="name@example.com" />
          </label>

          <label class="field">
            <span>Role</span>
            <select v-model="form.role">
              <option value="student">Student</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <div class="modal-actions">
            <button class="secondary-btn" @click="closeModal">Cancel</button>
            <button class="primary-btn" @click="saveUser">
              {{ editingUser ? 'Save Changes' : 'Add User' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import {
  UserPlus,
  Users,
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Search,
  Pencil,
  Trash2,
} from 'lucide-vue-next'
import type { UserRole } from '@/types/user'

interface ManagedUser {
  id: number
  name: string
  email: string
  role: UserRole
  joined: string
}

// Placeholder data — will come from GET /api/users later
const users = ref<ManagedUser[]>([
  { id: 1, name: 'Chanthy Chet', email: 'chanthy.chet@example.com', role: 'student', joined: 'Jan 12, 2026' },
  { id: 2, name: 'Yon Yen', email: 'yon.yen@example.com', role: 'trainer', joined: 'Feb 3, 2026' },
  { id: 3, name: 'Kunthea Yon', email: 'kunthea.yon@example.com', role: 'student', joined: 'Mar 8, 2026' },
  { id: 4, name: 'Sokha Chan', email: 'sokha.chan@example.com', role: 'admin', joined: 'Nov 20, 2025' },
  { id: 5, name: 'Dara Pich', email: 'dara.pich@example.com', role: 'trainer', joined: 'Apr 15, 2026' },
])

const search = ref('')
const roleFilter = ref<'all' | UserRole>('all')

const counts = computed(() => ({
  student: users.value.filter((u) => u.role === 'student').length,
  trainer: users.value.filter((u) => u.role === 'trainer').length,
  admin: users.value.filter((u) => u.role === 'admin').length,
}))

const filteredUsers = computed(() =>
  users.value.filter((u) => {
    const matchesRole = roleFilter.value === 'all' || u.role === roleFilter.value
    const q = search.value.trim().toLowerCase()
    const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    return matchesRole && matchesSearch
  }),
)

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function roleLabel(role: UserRole) {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

const modalOpen = ref(false)
const editingUser = ref<ManagedUser | null>(null)
const form = reactive({ name: '', email: '', role: 'student' as UserRole })

function openAddModal() {
  editingUser.value = null
  form.name = ''
  form.email = ''
  form.role = 'student'
  modalOpen.value = true
}

function openEditModal(u: ManagedUser) {
  editingUser.value = u
  form.name = u.name
  form.email = u.email
  form.role = u.role
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

function saveUser() {
  if (!form.name.trim() || !form.email.trim()) return

  if (editingUser.value) {
    // Will call PUT /api/users/:id later
    const idx = users.value.findIndex((u) => u.id === editingUser.value!.id)
    if (idx !== -1) {
      users.value[idx] = { ...users.value[idx], name: form.name, email: form.email, role: form.role }
    }
  } else {
    // Will call POST /api/users later
    users.value.push({
      id: Math.max(0, ...users.value.map((u) => u.id)) + 1,
      name: form.name,
      email: form.email,
      role: form.role,
      joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    })
  }

  modalOpen.value = false
}

function removeUser(id: number) {
  // Will call DELETE /api/users/:id later
  users.value = users.value.filter((u) => u.id !== id)
}
</script>

<style scoped>
.user-mgmt-view {
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
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.card h2 {
  font-size: 16px;
  margin: 0;
}

.toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 10px;
  color: #6b7280;
}

.search-box input {
  border: none;
  background: none;
  outline: none;
  font-size: 13px;
  width: 200px;
  color: #111827;
}

.role-select {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
  color: #374151;
  background: white;
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
    min-width: 640px;
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

.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.badge.admin {
  background: #dbeafe;
  color: #1e3a8a;
}

.badge.trainer {
  background: #dcfce7;
  color: #15803d;
}

.badge.student {
  background: #fef3c7;
  color: #b45309;
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

.field input,
.field select {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 9px 10px;
  font-size: 14px;
  color: #111827;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 640px) {
  .search-box input {
    width: 140px;
  }
}
</style>
