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

    <p v-if="errMsg" class="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{{ errMsg }}</p>

    <div class="rounded-[10px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="m-0 text-base">All Leave Types</h2>
      </div>

      <div class="w-full overflow-x-auto">
        <table class="w-full min-w-[560px] border-collapse text-sm md:min-w-0">
          <thead>
            <tr>
              <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Leave Type</th>
              <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Max Days / Year</th>
              <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Requires Attachment</th>
              <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Status</th>
              <th class="border-b border-gray-200 px-2 py-3 text-left text-[13px] font-medium text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="px-2 py-6 text-center text-gray-400">Loading leave types…</td>
            </tr>
            <template v-else>
              <LeaveTypeRow
                v-for="lt in leaveTypes"
                :key="lt.id"
                :leave-type="lt"
                @edit="openEditModal(lt)"
                @toggle="toggleActive(lt)"
                @remove="removeType(lt)"
              />
              <tr v-if="leaveTypes.length === 0">
                <td colspan="5" class="px-2 py-6 text-center text-gray-400">No leave types yet. Add one to get started.</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <LeaveTypeModal
      :open="modalOpen"
      :is-editing="!!editingType"
      :form="form"
      :saving="saving"
      :error="formError"
      @cancel="closeModal"
      @save="saveType"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus } from 'lucide-vue-next'
import type { AxiosError } from 'axios'
import LeaveTypeRow from '@/components/leave/LeaveTypeRow.vue'
import LeaveTypeModal from '@/components/leave/LeaveTypeModal.vue'
import { leaveService } from '@/services/leaveService'
import type { LeaveType, LeaveTypePayload } from '@/types/leave'

const leaveTypes = ref<LeaveType[]>([])
const loading = ref(true)
const errMsg = ref('')

const modalOpen = ref(false)
const editingType = ref<LeaveType | null>(null)
const saving = ref(false)
const formError = ref('')

const form = reactive<LeaveTypePayload>({
  name: '',
  code: '',
  description: '',
  max_days_per_year: 0,
  requires_attachment: false,
  is_active: true,
})

function extractError(err: unknown, fallback: string): string {
  const axiosErr = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>
  const errors = axiosErr.response?.data?.errors
  if (errors) {
    const first = Object.values(errors)[0]?.[0]
    if (first) return first
  }
  return axiosErr.response?.data?.message ?? fallback
}

async function fetchLeaveTypes() {
  loading.value = true
  errMsg.value = ''
  try {
    leaveTypes.value = await leaveService.getLeaveTypes()
  } catch (err) {
    errMsg.value = extractError(err, 'Failed to load leave types.')
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.name = ''
  form.code = ''
  form.description = ''
  form.max_days_per_year = 0
  form.requires_attachment = false
  form.is_active = true
}

function openAddModal() {
  editingType.value = null
  formError.value = ''
  resetForm()
  modalOpen.value = true
}

function openEditModal(lt: LeaveType) {
  editingType.value = lt
  formError.value = ''
  form.name = lt.name
  form.code = lt.code
  form.description = lt.description ?? ''
  form.max_days_per_year = lt.max_days_per_year
  form.requires_attachment = lt.requires_attachment
  form.is_active = lt.is_active
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

async function saveType() {
  if (!form.name.trim() || !form.code.trim()) {
    formError.value = 'Name and code are required.'
    return
  }

  saving.value = true
  formError.value = ''
  try {
    if (editingType.value?.id) {
      const updated = await leaveService.updateLeaveType(editingType.value.id, form)
      const idx = leaveTypes.value.findIndex((lt) => lt.id === editingType.value!.id)
      if (idx !== -1) leaveTypes.value[idx] = updated
    } else {
      const created = await leaveService.createLeaveType(form)
      leaveTypes.value.push(created)
    }
    modalOpen.value = false
  } catch (err) {
    formError.value = extractError(err, 'Failed to save leave type.')
  } finally {
    saving.value = false
  }
}

async function toggleActive(lt: LeaveType) {
  if (!lt.id) return
  const previous = lt.is_active
  lt.is_active = !lt.is_active
  try {
    const updated = await leaveService.updateLeaveType(lt.id, { is_active: lt.is_active })
    Object.assign(lt, updated)
  } catch (err) {
    lt.is_active = previous
    errMsg.value = extractError(err, 'Failed to update leave type status.')
  }
}

async function removeType(lt: LeaveType) {
  if (!lt.id) return
  try {
    await leaveService.deleteLeaveType(lt.id)
    leaveTypes.value = leaveTypes.value.filter((item) => item.id !== lt.id)
  } catch (err) {
    // Backend returns 409 when the leave type is in use by existing leave requests.
    errMsg.value = extractError(err, 'Failed to delete leave type.')
  }
}

fetchLeaveTypes()
</script>
