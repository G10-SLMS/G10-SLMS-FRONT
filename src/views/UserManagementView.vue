<template>
  <div class="max-w-full">
    <div class="mb-5 flex items-start justify-between">
      <div>
        <h1>User Management</h1>
        <p class="mt-1 text-[13px] text-gray-500">Manage students, trainers, and admin accounts</p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-md border-none bg-blue-600 px-4 py-2.5 text-sm text-white cursor-pointer hover:bg-blue-700"
        @click="openAddModal"
      >
        <UserPlus :size="16" :stroke-width="1.8" />
        Add User
      </button>
    </div>

    <div class="mb-5 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
      <template v-if="loading">
        <StatCardSkeleton v-for="n in 4" :key="n" />
      </template>
      <template v-else>
        <StatCard :icon="Users" label="Total Users" :value="users.length" color="blue" />
        <StatCard :icon="GraduationCap" label="Students" :value="counts.student" color="green" />
        <StatCard :icon="UserCheck" label="Trainers" :value="counts.trainer" color="amber" />
        <StatCard :icon="ShieldCheck" label="Admins" :value="counts.admin" color="blue" />
      </template>
    </div>

    <div v-if="errorMsg" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ errorMsg }}
    </div>

    <div class="rounded-[10px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h2 class="m-0 text-base">All Users</h2>
        <div class="flex flex-wrap gap-2.5">
          <div class="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2 text-gray-500">
            <Search :size="15" :stroke-width="1.8" />
            <input
              v-model="search"
              type="text"
              placeholder="Search by name or email"
              class="w-[200px] border-none bg-transparent text-[13px] text-gray-900 outline-none max-sm:w-[140px]"
            />
          </div>
          <select
            v-model="roleFilter"
            class="rounded-md border border-gray-200 bg-white px-2.5 py-2 text-[13px] text-gray-700"
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="trainer">Trainer</option>
            <option value="student">Student</option>
          </select>
        </div>
      </div>

      <div class="w-full overflow-x-auto">
        <table class="w-full min-w-[640px] border-collapse text-sm md:min-w-0">
          <thead>
            <tr>
              <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">User</th>
              <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Email</th>
              <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Role</th>
              <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Joined</th>
              <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody>
            <TableRowSkeleton v-if="loading" :rows="5" :columns="5" />
            <template v-else>
              <tr v-for="u in filteredUsers" :key="u.id" class="border-b border-gray-100 last:border-none">
              <td class="px-2 py-3 text-left">
                <div class="flex items-center gap-2.5">
                  <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-xs font-semibold text-white">
                    {{ initials(u.name) }}
                  </span>
                  <p class="m-0 font-medium">{{ u.name }}</p>
                </div>
              </td>
              <td class="px-2 py-3 text-left">{{ u.email }}</td>
              <td class="px-2 py-3 text-left">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-medium capitalize"
                  :class="{
                    'bg-blue-600/20 text-[#0a1628]': u.role === 'admin',
                    'bg-green-100 text-green-700': u.role === 'trainer',
                    'bg-amber-100 text-amber-700': u.role === 'student',
                  }"
                >{{ roleLabel(u.role) }}</span>
              </td>
              <td class="px-2 py-3 text-left">{{ u.joined }}</td>
              <td class="px-2 py-3 text-left">
                <div class="flex gap-1.5">
                  <button
                    class="inline-flex h-[30px] w-[30px] items-center justify-center rounded-md border-none bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200"
                    aria-label="Edit user"
                    @click="openEditModal(u)"
                  >
                    <Pencil :size="15" :stroke-width="1.8" />
                  </button>
                  <button
                    class="inline-flex h-[30px] w-[30px] items-center justify-center rounded-md border-none bg-gray-100 text-gray-700 cursor-pointer hover:bg-red-100 hover:text-red-700"
                    aria-label="Remove user"
                    @click="removeUser(u.id)"
                  >
                    <Trash2 :size="15" :stroke-width="1.8" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="5" class="px-2 py-6 text-center text-gray-400">No users match your search.</td>
            </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="modalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-white/45 p-4" @click.self="closeModal">
        <div class="w-full max-w-[420px] rounded-xl bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
          <h2 class="mb-4 text-lg">{{ editingUser ? 'Edit User' : 'Add User' }}</h2>

          <label class="mb-3.5 flex flex-col gap-1.5 text-[13px] text-gray-700">
            <span>Full Name</span>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. Sokha Chan"
              class="rounded-md border border-gray-200 px-2.5 py-[9px] text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
            />
          </label>

          <label class="mb-3.5 flex flex-col gap-1.5 text-[13px] text-gray-700">
            <span>Email</span>
            <input
              v-model="form.email"
              type="email"
              placeholder="name@example.com"
              class="rounded-md border border-gray-200 px-2.5 py-[9px] text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
            />
          </label>

          <label class="mb-3.5 flex flex-col gap-1.5 text-[13px] text-gray-700">
            <span>Role</span>
            <select
              v-model="form.role"
              class="rounded-md border border-gray-200 px-2.5 py-[9px] text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="student">Student</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <div class="mt-5 flex justify-end gap-2.5">
            <button
              class="rounded-md border-none bg-gray-100 px-4 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-gray-200"
              @click="closeModal"
            >Cancel</button>
            <button
              class="rounded-md border-none bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer hover:bg-blue-700"
              @click="saveUser"
            >
              {{ editingUser ? 'Save Changes' : 'Add User' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
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
import StatCard from '@/components/ui/StatCard.vue'
import StatCardSkeleton from '@/components/shared/StatCardSkeleton.vue'
import TableRowSkeleton from '@/components/shared/TableRowSkeleton.vue'
import api from '@/services/api'
import { extractErrorMessage } from '@/utils/errors'
import { formatDate } from '@/utils/date'

interface ManagedUser {
  id: number
  name: string
  email: string
  role: UserRole
  joined: string
}

interface RawUser {
  id: number
  name: string
  email: string
  role: UserRole
  created_at: string
}

const users = ref<ManagedUser[]>([])
const loading = ref(true)
const errorMsg = ref('')

function formatJoined(dateStr: string): string {
  if (!dateStr) return '—'
  return formatDate(dateStr)
}

async function loadUsers() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await api.get<{ users: RawUser[]; count: number }>('/users')
    users.value = data.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      joined: formatJoined(u.created_at),
    }))
  } catch (err) {
    errorMsg.value = extractErrorMessage(err, 'Failed to load users.')
  } finally {
    loading.value = false
  }
}

onMounted(loadUsers)

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
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
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
    const idx = users.value.findIndex((u) => u.id === editingUser.value!.id)
    if (idx !== -1) {
      users.value[idx] = { ...users.value[idx], name: form.name, email: form.email, role: form.role }
    }
  } else {
    users.value.push({
      id: Math.max(0, ...users.value.map((u) => u.id)) + 1,
      name: form.name,
      email: form.email,
      role: form.role,
      joined: formatDate(new Date()),
    })
  }

  modalOpen.value = false
}

function removeUser(id: number) {
  users.value = users.value.filter((u) => u.id !== id)
}
</script>
