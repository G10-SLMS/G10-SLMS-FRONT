<template>
  <div class="max-w-full">
    <div class="mb-5 flex items-start justify-between">
      <div>
        <h1>Leave Types Management</h1>
        <p class="mt-1 text-[13px] text-gray-500">Define the leave categories available to students and trainers</p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-md border-none bg-blue-600 px-4 py-2.5 text-sm text-white cursor-pointer hover:bg-blue-700"
        @click="openAddModal"
      >
        <Plus :size="16" :stroke-width="1.8" />
        Add Leave Type
      </button>
    </div>

    <div class="rounded-[10px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="m-0 text-base">All Leave Types</h2>
      </div>

      <div class="w-full overflow-x-auto">
        <table class="w-full min-w-[560px] border-collapse text-sm md:min-w-0">
          <thead>
            <tr>
              <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Leave Type</th>
              <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Default Days / Year</th>
              <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Requires Approval</th>
              <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Status</th>
              <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody>
            <LeaveTypeRow
              v-for="lt in leaveTypes"
              :key="lt.id"
              :leave-type="lt"
              @edit="openEditModal(lt)"
              @toggle="toggleActive(lt.id)"
              @remove="removeType(lt.id)"
            />
            <tr v-if="leaveTypes.length === 0">
              <td colspan="5" class="px-2 py-6 text-center text-gray-400">No leave types yet. Add one to get started.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <LeaveTypeModal
      :open="modalOpen"
      :is-editing="!!editingType"
      :form="form"
      @cancel="closeModal"
      @save="saveType"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus } from 'lucide-vue-next'
import LeaveTypeRow from '@/components/leave/LeaveTypeRow.vue'
import LeaveTypeModal from '@/components/leave/LeaveTypeModal.vue'

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
