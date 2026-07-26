<template>
  <div class="max-w-full">
    <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
        <p class="mt-1 text-[13px] text-gray-500">Manage students, educators, and admin accounts</p>
      </div>
      <div class="flex flex-col gap-2.5 sm:flex-row sm:self-start">
        <button
          class="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-gray-50"
          @click="importModalOpen = true"
        >
          <FileSpreadsheet :size="16" :stroke-width="1.8" />
          Import from Excel
        </button>
        <button
          class="inline-flex items-center justify-center gap-2 rounded-md border-none bg-blue-600 px-4 py-2.5 text-sm text-white cursor-pointer hover:bg-blue-700"
          @click="openAddModal"
        >
          <UserPlus :size="16" :stroke-width="1.8" />
          Add User
        </button>
      </div>
    </div>

    <div class="mb-5 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
      <template v-if="loading">
        <StatCardSkeleton v-for="n in 4" :key="n" />
      </template>
      <template v-else>
        <StatCard :icon="Users" label="Total Users" :value="counts.total" color="blue" />
        <StatCard :icon="GraduationCap" label="Students" :value="counts.student" color="green" />
        <StatCard :icon="UserCheck" label="Educators" :value="counts.educator" color="amber" />
        <StatCard :icon="ShieldCheck" label="Admins" :value="counts.admin" color="blue" />
      </template>
    </div>

    <div v-if="errorMsg" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ errorMsg }}
    </div>

    <div v-if="successMsg" class="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
      {{ successMsg }}
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
              @input="onSearchDebounced"
            />
          </div>
          <select
            v-model="roleFilter"
            class="rounded-md border border-gray-200 bg-white px-2.5 py-2 text-[13px] text-gray-700"
            @change="fetchUsers(1)"
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="educator">Educator</option>
            <option value="student">Student</option>
          </select>
        </div>
      </div>

      <UsersTable
        :users="users"
        :loading="loading"
        :deleting-id="deletingId"
        @edit="openEditModal"
        @remove="requestRemoveUser"
      />

      <UsersPagination
        v-if="!loading && total > 0"
        :page="page"
        :totalPages="totalPages"
        :total="total"
        :from="from"
        :to="to"
        :perPage="perPage"
        :visiblePages="visiblePages"
        :fetchRequests="fetchUsers"
        @update:per-page="perPage = $event"
      />
    </div>

    <UserFormModal
      :open="modalOpen"
      :user="editingUser"
      :saving="saving"
      :server-error="formError"
      :default-password-hint="defaultPasswordHint"
      @close="closeModal"
      @submit="saveUser"
    />

    <ConfirmDialog
      :open="confirmOpen"
      title="Remove user"
      :message="confirmMessage"
      confirm-label="Remove"
      :loading="!!deletingId"
      @confirm="confirmRemoveUser"
      @cancel="cancelRemoveUser"
    />

    <ImportUsersModal
      :open="importModalOpen"
      @close="importModalOpen = false"
      @imported="onUsersImported"
    />
  </div>
</template>

<script setup lang="ts">
import {
  UserPlus,
  Users,
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Search,
  FileSpreadsheet,
} from 'lucide-vue-next'
import StatCard from '@/components/ui/StatCard.vue'
import StatCardSkeleton from '@/components/shared/StatCardSkeleton.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import UsersPagination from '@/components/leave-request/LeaveRequestsPagination.vue'
import UsersTable from '@/components/user/UsersTable.vue'
import UserFormModal from '@/components/user/UserFormModal.vue'
import ImportUsersModal from '@/components/user/ImportUsersModal.vue'
import { useUserManagement } from '@/composables/user/useUserManagement'

const {
  users,
  loading,
  errorMsg,
  successMsg,
  defaultPasswordHint,
  search,
  roleFilter,
  page,
  perPage,
  total,
  totalPages,
  from,
  to,
  visiblePages,
  onSearchDebounced,
  fetchUsers,
  modalOpen,
  editingUser,
  saving,
  formError,
  openAddModal,
  openEditModal,
  closeModal,
  saveUser,
  deletingId,
  confirmOpen,
  confirmMessage,
  requestRemoveUser,
  cancelRemoveUser,
  confirmRemoveUser,
  counts,
  importModalOpen,
  onUsersImported,
} = useUserManagement()
</script>
