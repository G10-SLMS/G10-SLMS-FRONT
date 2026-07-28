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

      <div
        v-if="selectedCount > 0"
        class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5"
      >
        <p class="m-0 text-sm font-medium text-blue-900">{{ selectedCount }} selected</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-if="auth.isAdmin"
            class="inline-flex items-center gap-1.5 rounded-md border-none bg-white px-3 py-1.5 text-xs font-medium text-green-700 shadow-sm cursor-pointer hover:bg-green-50"
            @click="requestBulkToggle('enable')"
          >
            <CircleCheck :size="14" :stroke-width="1.8" /> Enable
          </button>
          <button
            v-if="auth.isAdmin"
            class="inline-flex items-center gap-1.5 rounded-md border-none bg-white px-3 py-1.5 text-xs font-medium text-amber-700 shadow-sm cursor-pointer hover:bg-amber-50"
            @click="requestBulkToggle('disable')"
          >
            <Ban :size="14" :stroke-width="1.8" /> Disable
          </button>
          <button
            v-if="auth.isAdmin"
            class="inline-flex items-center gap-1.5 rounded-md border-none bg-white px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm cursor-pointer hover:bg-red-50"
            @click="requestBulkDelete"
          >
            <Trash2 :size="14" :stroke-width="1.8" /> Delete
          </button>
          <button
            class="inline-flex items-center gap-1.5 rounded-md border-none bg-transparent px-3 py-1.5 text-xs font-medium text-blue-700 cursor-pointer hover:bg-blue-100"
            @click="clearSelection"
          >
            Clear
          </button>
        </div>
      </div>

      <UsersTable
        :users="users"
        :loading="loading"
        :deleting-id="deletingId"
        :toggling-id="togglingId"
        :can-delete="auth.isAdmin"
        :can-toggle-status="auth.isAdmin"
        :current-user-id="auth.user?.id ?? null"
        :is-selected="isSelected"
        :all-selected="allSelected"
        @edit="openEditModal"
        @remove="requestRemoveUser"
        @toggle-status="requestToggleStatus"
        @toggle-select="toggleSelect"
        @toggle-select-all="toggleSelectAll"
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

    <ConfirmDialog
      :open="confirmToggleOpen"
      :title="pendingToggleUser?.is_active ? 'Disable user' : 'Enable user'"
      :message="confirmToggleMessage"
      :confirm-label="pendingToggleUser?.is_active ? 'Disable' : 'Enable'"
      :loading-label="pendingToggleUser?.is_active ? 'Disabling…' : 'Enabling…'"
      :loading="!!togglingId"
      @confirm="confirmToggleStatus"
      @cancel="cancelToggleStatus"
    />

    <ConfirmDialog
      :open="bulkDeleteConfirmOpen"
      title="Remove selected users"
      :message="bulkDeleteMessage"
      confirm-label="Remove"
      loading-label="Removing…"
      :loading="bulkDeleting"
      @confirm="confirmBulkDelete"
      @cancel="cancelBulkDelete"
    />

    <ConfirmDialog
      :open="bulkToggleConfirmOpen"
      :title="pendingBulkAction === 'enable' ? 'Enable selected users' : 'Disable selected users'"
      :message="bulkToggleMessage"
      :confirm-label="pendingBulkAction === 'enable' ? 'Enable' : 'Disable'"
      :loading-label="pendingBulkAction === 'enable' ? 'Enabling…' : 'Disabling…'"
      :loading="bulkToggling"
      @confirm="confirmBulkToggle"
      @cancel="cancelBulkToggle"
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
  Ban,
  CircleCheck,
  Trash2,
} from 'lucide-vue-next'
import StatCard from '@/components/ui/StatCard.vue'
import StatCardSkeleton from '@/components/shared/StatCardSkeleton.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import UsersPagination from '@/components/leave-request/LeaveRequestsPagination.vue'
import UsersTable from '@/components/user/UsersTable.vue'
import UserFormModal from '@/components/user/UserFormModal.vue'
import ImportUsersModal from '@/components/user/ImportUsersModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useUserManagement } from '@/composables/user/useUserManagement'

const auth = useAuthStore()

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
  selectedCount,
  allSelected,
  isSelected,
  toggleSelect,
  toggleSelectAll,
  clearSelection,
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
  togglingId,
  confirmToggleOpen,
  pendingToggleUser,
  confirmToggleMessage,
  requestToggleStatus,
  cancelToggleStatus,
  confirmToggleStatus,
  bulkDeleting,
  bulkDeleteConfirmOpen,
  bulkDeleteMessage,
  requestBulkDelete,
  cancelBulkDelete,
  confirmBulkDelete,
  bulkToggling,
  bulkToggleConfirmOpen,
  pendingBulkAction,
  bulkToggleMessage,
  requestBulkToggle,
  cancelBulkToggle,
  confirmBulkToggle,
  counts,
  importModalOpen,
  onUsersImported,
} = useUserManagement()
</script>
