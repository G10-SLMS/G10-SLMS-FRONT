<template>
  <div class="max-w-full">
    <div class="mb-6 flex items-start justify-between">
      <div>
        <h1 class="text-[22px] font-bold tracking-tight text-slate-900">Leave Types Management</h1>
        <p class="mt-1 text-[13px] text-slate-500">Define the leave categories available to students and trainers</p>
      </div>
      <button
        class="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        @click="openAddModal"
      >
        <Plus :size="16" :stroke-width="2" />
        Add Leave Type
      </button>
    </div>

    <p v-if="errMsg" class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{{ errMsg }}</p>

    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_4px_rgba(15,23,42,0.06)]">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="m-0 text-base font-bold text-slate-900">All Leave Types</h2>
      </div>

      <div class="w-full overflow-x-auto">
        <table class="w-full min-w-[560px] border-collapse text-sm md:min-w-0">
          <thead>
            <tr>
              <th class="border-b border-slate-200 px-2 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Leave Type</th>
              <th class="border-b border-slate-200 px-2 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Max Days / Year</th>
              <th class="border-b border-slate-200 px-2 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Requires Attachment</th>
              <th class="border-b border-slate-200 px-2 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Status</th>
              <th class="border-b border-slate-200 px-2 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="px-2 py-8 text-center text-sm text-slate-400">Loading leave types…</td>
            </tr>
            <template v-else>
              <LeaveTypeRow
                v-for="lt in leaveTypes"
                :key="lt.id"
                :leave-type="lt"
                @edit="openEditModal(lt)"
                @toggle="confirmToggle(lt)"
                @remove="confirmRemove(lt)"
              />
              <tr v-if="leaveTypes.length === 0">
                <td colspan="5" class="px-2 py-8 text-center text-sm text-slate-400">No leave types yet. Add one to get started.</td>
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

    <ConfirmDialog
      :open="confirmOpen"
      :title="confirmTitle"
      :message="confirmMessage"
      :confirm-label="confirmLabel"
      :loading="confirmLoading"
      @confirm="handleConfirmed"
      @cancel="cancelConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Plus } from 'lucide-vue-next'
import type { AxiosError } from 'axios'
import LeaveTypeRow from '@/components/leave-type/LeaveTypeRow.vue'
import LeaveTypeModal from '@/components/leave-type/LeaveTypeModal.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import { leaveService } from '@/services/leaveService'
import type { LeaveType, LeaveTypePayload } from '@/types/leave'

const leaveTypes = ref<LeaveType[]>([])
const loading = ref(true)
const errMsg = ref('')

const modalOpen = ref(false)
const editingType = ref<LeaveType | null>(null)
const saving = ref(false)
const formError = ref('')

type PendingAction = { type: 'delete' | 'deactivate'; leaveType: LeaveType }
const pendingAction = ref<PendingAction | null>(null)
const confirmOpen = ref(false)
const confirmLoading = ref(false)

const confirmTitle = computed(() =>
  pendingAction.value?.type === 'delete' ? 'Delete leave type?' : 'Deactivate leave type?',
)
const confirmMessage = computed(() => {
  const name = pendingAction.value?.leaveType.name ?? ''
  return pendingAction.value?.type === 'delete'
    ? `Are you sure you want to delete '${name}'? This cannot be undone.`
    : `Are you sure you want to deactivate '${name}'? Students and trainers won't be able to select it until it's reactivated.`
})
const confirmLabel = computed(() =>
  pendingAction.value?.type === 'delete' ? 'Delete' : 'Deactivate',
)

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
  if (!form.max_days_per_year || form.max_days_per_year <= 0) {
    formError.value = 'Max days per year must be greater than 0.'
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

function confirmRemove(lt: LeaveType) {
  pendingAction.value = { type: 'delete', leaveType: lt }
  confirmOpen.value = true
}

function confirmToggle(lt: LeaveType) {
  if (!lt.is_active) {
    toggleActive(lt)
    return
  }
  pendingAction.value = { type: 'deactivate', leaveType: lt }
  confirmOpen.value = true
}

function cancelConfirm() {
  confirmOpen.value = false
  pendingAction.value = null
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

async function handleConfirmed() {
  const action = pendingAction.value
  if (!action?.leaveType.id) return

  confirmLoading.value = true
  try {
    if (action.type === 'delete') {
      await leaveService.deleteLeaveType(action.leaveType.id)
      leaveTypes.value = leaveTypes.value.filter((item) => item.id !== action.leaveType.id)
    } else {
      const updated = await leaveService.updateLeaveType(action.leaveType.id, { is_active: false })
      Object.assign(action.leaveType, updated)
    }
    confirmOpen.value = false
    pendingAction.value = null
  } catch (err) {
    const fallback = action.type === 'delete' ? 'Failed to delete leave type.' : 'Failed to deactivate leave type.'
    errMsg.value = extractError(err, fallback)
    confirmOpen.value = false
  } finally {
    confirmLoading.value = false
  }
}

fetchLeaveTypes()
</script>
