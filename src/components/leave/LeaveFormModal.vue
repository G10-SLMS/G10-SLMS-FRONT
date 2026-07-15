<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modal.isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-white/50 p-5"
        @mousedown.self="handleOverlayClick"
      >
        <div
          class="flex max-h-[90vh] w-full max-w-[560px] flex-col rounded-xl bg-white shadow-xl"
          role="dialog"
          aria-modal="true"
          :aria-label="isEditMode ? 'Edit Leave Request' : 'New Leave Request'"
        >
          <!-- Header -->
          <div class="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4.5">
            <h2 class="m-0 text-base font-semibold text-gray-900">
              {{ isEditMode ? 'Edit Leave Request' : 'New Leave Request' }}
            </h2>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="Close"
              @click="handleClose"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-6 py-5">
            <div v-if="loadError" class="mb-4 rounded-md bg-red-100 px-3.5 py-2.5 text-xs text-red-700" role="alert">
              {{ loadError }}
            </div>

            <div v-else-if="isEditMode && !editableLoaded" class="flex flex-col items-center justify-center gap-2.5 px-5 py-8 text-center text-gray-500">
              Loading request…
            </div>

            <div v-else-if="isEditMode && !canEdit" class="flex flex-col items-center justify-center gap-2.5 px-5 py-8 text-center text-gray-500 [&_svg]:text-amber-500">
              <Lock :size="32" :stroke-width="1.5" />
              <p>This request can no longer be edited because its status is <strong>{{ originalStatus }}</strong>.</p>
              <button
                type="button"
                class="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                @click="handleClose"
              >
                Close
              </button>
            </div>

            <form v-else id="leave-form" @submit.prevent="handleSubmit" novalidate>
              <div v-if="submitError" class="mb-4 rounded-md bg-red-100 px-3.5 py-2.5 text-xs text-red-700" role="alert">
                {{ submitError }}
              </div>

              <!-- Leave Type -->
              <div class="mb-4">
                <label class="mb-1.5 block text-xs font-medium text-gray-700" for="m-type">
                  Leave Type <span class="text-red-600">*</span>
                </label>
                <div class="relative flex items-center">
                  <span class="absolute left-3 flex text-gray-400 pointer-events-none"><FileText :size="18" /></span>
                  <select
                    id="m-type"
                    v-model="form.type"
                    required
                    :disabled="submitting"
                    class="w-full appearance-none rounded-md border border-gray-300 bg-white py-2.5浏览 pl-10 pr-10 text-sm text-gray-800 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10"
                  >
                    <option value="" disabled>Select leave type</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Personal Leave">Personal Leave</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                    <option value="Academic Leave">Academic Leave</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <!-- Date Range -->
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="mb-4">
                  <label class="mb-1.5 block text-xs font-medium text-gray-700" for="m-startDate">
                    Start Date <span class="text-red-600">*</span>
                  </label>
                  <div class="relative flex items-center">
                    <span class="absolute left-3 flex text-gray-400 pointer-events-none"><Calendar :size="18" /></span>
                    <input
                      id="m-startDate"
                      v-model="form.startDate"
                      type="date"
                      :min="todayStr"
                      required
                      :disabled="submitting"
                      class="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10"
                      @change="onStartDateChange"
                    />
                  </div>
                </div>

                <div class="mb-4">
                  <label class="mb-1.5 block text-xs font-medium text-gray-700" for="m-endDate">
                    End Date <span class="text-red-600">*</span>
                  </label>
                  <div class="relative flex items-center">
                    <span class="absolute left-3 flex text-gray-400 pointer-events-none"><Calendar :size="18" /></span>
                    <input
                      id="m-endDate"
                      v-model="form.endDate"
                      type="date"
                      :min="form.startDate || todayStr"
                      required
                      :disabled="submitting"
                      class="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10"
                    />
                  </div>
                </div>
              </div>
              <p v-if="dateRangeError" class="-mt-2 mb-4 text-xs text-red-700">{{ dateRangeError }}</p>

              <!-- Reason -->
              <div class="mb-4">
                <label class="mb-1.5 block text-xs font-medium text-gray-700" for="m-reason">
                  Reason <span class="text-red-600">*</span>
                </label>
                <textarea
                  id="m-reason"
                  v-model.trim="form.reason"
                  rows="4"
                  placeholder="Briefly explain the reason for your leave"
                  required
                  :disabled="submitting"
                  maxlength="500"
                  class="w-full resize-y rounded-md border border-gray-300 px-3 py-2.5 font-sans text-sm text-gray-800 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10"
                />
                <span class="mt-1 block text-right text-[11px] text-gray-400">{{ form.reason.length }}/500</span>
              </div>

              <!-- Attachment -->
              <div class="mb-4">
                <label class="mb-1.5 block text-xs font-medium text-gray-700" for="m-attachment">Supporting Document (optional)</label>
                <div class="flex items-center gap-2">
                  <label
                    for="m-attachment"
                    class="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-dashed border-gray-300 px-3.5 py-2.5 text-xs text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Paperclip :size="16" />
                    <span class="truncate">{{ form.attachment ? form.attachment.name : 'Choose file' }}</span>
                  </label>
                  <input
                    id="m-attachment"
                    type="file"
                    class="absolute h-px w-px overflow-hidden opacity-0"
                    accept=".pdf,.jpg,.jpeg,.png"
                    :disabled="submitting"
                    @change="onFileChange"
                  />
                  <button
                    v-if="form.attachment"
                    type="button"
                    class="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md bg-red-100 text-red-700 transition-colors hover:bg-red-200"
                    :disabled="submitting"
                    @click="removeFile"
                  >
                    <X :size="14" />
                  </button>
                </div>
                <span class="mt-1.5 block text-xs text-gray-400">PDF, JPG, or PNG — max 5MB</span>
              </div>
            </form>
          </div>

          <!-- Footer -->
          <div
            v-if="!loadError && !(isEditMode && !editableLoaded) && !(isEditMode && !canEdit)"
            class="flex shrink-0 justify-end gap-2.5 border-t border-gray-100 px-6 py-4"
          >
            <button
              type="button"
              class="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors enabled:hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="submitting"
              @click="handleClose"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="leave-form"
              class="rounded-md bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors enabled:hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!canSubmit"
            >
              {{ submitting ? (isEditMode ? 'Saving…' : 'Submitting…') : (isEditMode ? 'Save Changes' : 'Submit Request') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLeaveFormModalStore } from '@/stores/leaveFormModal'
import { FileText, Calendar, Paperclip, X, Lock } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'submitted'): void
}>()

const auth = useAuthStore()
const modal = useLeaveFormModalStore()

const isEditMode = computed(() => modal.editingId !== null)
const submitting = ref(false)
const submitError = ref('')
const loadError = ref('')
const editableLoaded = ref(false)
const canEdit = ref(true)
const originalStatus = ref('')

const todayStr = new Date().toISOString().slice(0, 10)

const form = reactive({
  type: '',
  startDate: '',
  endDate: '',
  reason: '',
  attachment: null as File | null,
})

function resetForm() {
  form.type = ''
  form.startDate = ''
  form.endDate = ''
  form.reason = ''
  form.attachment = null
  submitError.value = ''
  loadError.value = ''
  editableLoaded.value = false
  canEdit.value = true
  originalStatus.value = ''
}

const dateRangeError = computed(() => {
  if (!form.startDate || !form.endDate) return ''
  return form.endDate < form.startDate ? 'End date cannot be before start date.' : ''
})

const canSubmit = computed(() =>
  !submitting.value &&
  form.type.length > 0 &&
  form.startDate.length > 0 &&
  form.endDate.length > 0 &&
  form.reason.trim().length > 0 &&
  !dateRangeError.value
)

function onStartDateChange() {
  if (form.endDate && form.endDate < form.startDate) form.endDate = ''
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    submitError.value = 'File is too large. Maximum size is 5MB.'
    target.value = ''
    return
  }
  submitError.value = ''
  form.attachment = file
}

function removeFile() {
  form.attachment = null
}

function handleClose() {
  if (submitting.value) return
  modal.close()
}

function handleOverlayClick() {
  handleClose()
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && modal.isOpen) handleClose()
}

onMounted(() => window.addEventListener('keydown', handleEscape))
onUnmounted(() => window.removeEventListener('keydown', handleEscape))

watch(
  () => modal.isOpen,
  async (open) => {
    if (!open) return
    resetForm()
    if (!isEditMode.value) return

    try {
      const data = await fakeFetchRequest(String(modal.editingId))

      if (data.studentId !== auth.user?.id) {
        loadError.value = 'You do not have permission to edit this request.'
        return
      }

      originalStatus.value = data.status
      canEdit.value = data.status === 'Pending'
      form.type = data.type
      form.startDate = data.startDate
      form.endDate = data.endDate
      form.reason = data.reason
    } catch {
      loadError.value = 'Failed to load this leave request.'
    } finally {
      editableLoaded.value = true
    }
  }
)

async function fakeFetchRequest(id: string) {
  await new Promise((r) => setTimeout(r, 300))
  return {
    id,
    studentId: auth.user?.id,
    type: 'Sick Leave',
    startDate: '2026-07-08',
    endDate: '2026-07-09',
    reason: 'Fever and flu symptoms.',
    status: 'Pending',
  }
}

async function handleSubmit() {
  if (!canSubmit.value) return

  submitting.value = true
  submitError.value = ''

  try {
    const payload = new FormData()
    payload.append('type', form.type)
    payload.append('startDate', form.startDate)
    payload.append('endDate', form.endDate)
    payload.append('reason', form.reason)
    if (form.attachment) payload.append('attachment', form.attachment)

    if (isEditMode.value) {
      await new Promise((r) => setTimeout(r, 500))
    } else {
      await new Promise((r) => setTimeout(r, 500))
    }

    emit('submitted')
    modal.close()
  } catch {
    submitError.value = 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>
