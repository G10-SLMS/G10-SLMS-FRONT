<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modal.isOpen"
        class="modal-overlay"
        @mousedown.self="handleOverlayClick"
      >
        <div
          class="modal-panel"
          role="dialog"
          aria-modal="true"
          :aria-label="isEditMode ? 'Edit Leave Request' : 'New Leave Request'"
        >
          <div class="modal-header">
            <h2>{{ isEditMode ? 'Edit Leave Request' : 'New Leave Request' }}</h2>
            <button class="modal-close" aria-label="Close" @click="handleClose">
              <X :size="18" />
            </button>
          </div>

          <div class="modal-body">
            <div v-if="loadError" class="form-error-banner" role="alert">{{ loadError }}</div>

            <div v-else-if="isEditMode && !editableLoaded" class="loading-state">
              Loading request…
            </div>

            <div v-else-if="isEditMode && !canEdit" class="locked-state">
              <Lock :size="32" :stroke-width="1.5" />
              <p>This request can no longer be edited because its status is <strong>{{ originalStatus }}</strong>.</p>
              <button class="btn-secondary" @click="handleClose">Close</button>
            </div>

            <form v-else id="leave-form" @submit.prevent="handleSubmit" novalidate>
              <div v-if="submitError" class="form-error-banner" role="alert">{{ submitError }}</div>

              <div class="form-row">
                <label class="form-label" for="type">Leave Type</label>
                <div class="input-wrap">
                  <span class="input-icon"><FileText :size="18" /></span>
                  <select id="type" v-model="form.type" required :disabled="submitting">
                    <option value="" disabled>Select leave type</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Personal Leave">Personal Leave</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                    <option value="Academic Leave">Academic Leave</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div class="form-row-split">
                <div class="form-row">
                  <label class="form-label" for="startDate">Start Date</label>
                  <div class="input-wrap">
                    <span class="input-icon"><Calendar :size="18" /></span>
                    <input
                      id="startDate"
                      v-model="form.startDate"
                      type="date"
                      :min="todayStr"
                      required
                      :disabled="submitting"
                      @change="onStartDateChange"
                    />
                  </div>
                </div>

                <div class="form-row">
                  <label class="form-label" for="endDate">End Date</label>
                  <div class="input-wrap">
                    <span class="input-icon"><Calendar :size="18" /></span>
                    <input
                      id="endDate"
                      v-model="form.endDate"
                      type="date"
                      :min="form.startDate || todayStr"
                      required
                      :disabled="submitting"
                    />
                  </div>
                </div>
              </div>
              <p v-if="dateRangeError" class="field-error">{{ dateRangeError }}</p>

              <div class="form-row">
                <label class="form-label" for="reason">Reason</label>
                <textarea
                  id="reason"
                  v-model.trim="form.reason"
                  rows="4"
                  placeholder="Briefly explain the reason for your leave"
                  required
                  :disabled="submitting"
                  maxlength="500"
                ></textarea>
                <span class="char-count">{{ form.reason.length }}/500</span>
              </div>

              <div class="form-row">
                <label class="form-label" for="attachment">Supporting Document (optional)</label>
                <div class="file-input-wrap">
                  <label for="attachment" class="file-input-label">
                    <Paperclip :size="16" />
                    {{ form.attachment ? form.attachment.name : 'Choose file' }}
                  </label>
                  <input
                    id="attachment"
                    type="file"
                    class="file-input-hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    :disabled="submitting"
                    @change="onFileChange"
                  />
                  <button
                    v-if="form.attachment"
                    type="button"
                    class="file-remove-btn"
                    :disabled="submitting"
                    @click="removeFile"
                  >
                    <X :size="14" />
                  </button>
                </div>
                <span class="field-hint">PDF, JPG, or PNG — max 5MB</span>
              </div>
            </form>
          </div>

          <div v-if="!loadError && !(isEditMode && !editableLoaded) && !(isEditMode && !canEdit)" class="modal-footer">
            <button type="button" class="btn-secondary" :disabled="submitting" @click="handleClose">
              Cancel
            </button>
            <button type="submit" form="leave-form" class="btn-primary" :disabled="!canSubmit">
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

const emit = defineEmits<{ submitted: [] }>()

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
  if (form.endDate && form.endDate < form.startDate) {
    form.endDate = ''
  }
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

// Load data (or reset) whenever the modal opens
watch(
  () => modal.isOpen,
  async (open) => {
    if (!open) return
    resetForm()

    if (!isEditMode.value) return

    try {
      // TODO: replace with real fetch, e.g. GET /api/leave-requests/:id
      // const { data } = await api.get(`/leave-requests/${modal.editingId}`)
      const data = await fakeFetchRequest(String(modal.editingId))

      // Ownership + status guard — mirrors the server-side check that
      // must also exist on the actual PATCH endpoint. This is a UX
      // guard only; the API must independently reject edits from
      // non-owners or non-pending requests regardless of what the
      // client sends.
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

// Placeholder loader — remove once wired to the real API
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
      // TODO: await api.patch(`/leave-requests/${modal.editingId}`, payload)
      await new Promise((r) => setTimeout(r, 500))
    } else {
      // TODO: await api.post('/leave-requests', payload)
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

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 100;
}

.modal-panel {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid #f3f4f6;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 20px 22px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 22px;
  border-top: 1px solid #f3f4f6;
  flex-shrink: 0;
}

.form-error-banner {
  background: #fee2e2;
  color: #b91c1c;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 16px;
}

.loading-state,
.locked-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 30px 20px;
  color: #6b7280;
  text-align: center;
}

.locked-state svg {
  color: #f59e0b;
}

.form-row {
  margin-bottom: 18px;
}

.form-row-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #9ca3af;
  display: flex;
}

.input-wrap select,
.input-wrap input {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  background: white;
}

.input-wrap select:focus,
.input-wrap input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  resize: vertical;
  font-family: inherit;
}

textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.char-count {
  display: block;
  text-align: right;
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

.field-error {
  color: #b91c1c;
  font-size: 12px;
  margin-top: -12px;
  margin-bottom: 16px;
}

.field-hint {
  display: block;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 6px;
}

.file-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-input-label {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  flex: 1;
}

.file-input-label:hover {
  background: #f9fafb;
}

.file-input-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  overflow: hidden;
}

.file-remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: none;
  background: #fee2e2;
  color: #b91c1c;
  cursor: pointer;
  flex-shrink: 0;
}

.file-remove-btn:hover {
  background: #fecaca;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-secondary:hover:not(:disabled) {
  background: #f3f4f6;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.15s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .form-row-split {
    grid-template-columns: 1fr;
  }
}
</style>
