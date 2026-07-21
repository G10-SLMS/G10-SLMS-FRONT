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
      >
        <div
          class="flex max-h-[90vh] w-full max-w-[560px] flex-col rounded-xl bg-white shadow-xl"
          role="dialog"
          aria-modal="true"
          :aria-label="modalTitle"
        >
          <!-- Header -->
          <div
            class="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4.5"
          >
            <h2 class="m-0 text-base font-semibold text-gray-900">{{ modalTitle }}</h2>
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
            <div
              v-if="loadError"
              class="mb-4 rounded-md bg-red-100 px-3.5 py-2.5 text-xs text-red-700"
              role="alert"
            >
              {{ loadError }}
            </div>

            <div
              v-else-if="needsLoad && !editableLoaded"
              class="flex flex-col items-center justify-center gap-2.5 px-5 py-8 text-center text-gray-500"
            >
              Loading request…
            </div>

            <div
              v-else-if="isEditMode && editableLoaded && !canEdit"
              class="flex flex-col items-center justify-center gap-2.5 px-5 py-8 text-center text-gray-500 [&_svg]:text-amber-500"
            >
              <Lock :size="32" :stroke-width="1.5" />
              <p>
                This request can no longer be edited because its status is
                <strong>{{ originalStatus }}</strong
                >.
              </p>
              <button
                type="button"
                class="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                @click="handleClose"
              >
                Close
              </button>
            </div>

            <form v-else id="leave-form" @submit.prevent="handleSubmit" novalidate>
              <div
                v-if="submitError"
                class="mb-4 rounded-md bg-red-100 px-3.5 py-2.5 text-xs text-red-700"
                role="alert"
              >
                {{ submitError }}
              </div>

              <div
                v-if="isViewMode && requestUser"
                class="mb-5 flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <img
                  v-if="requestUser.avatar?.url"
                  :src="requestUser.avatar.url"
                  :alt="requestUser.name"
                  class="h-10 w-10 shrink-0 rounded-full object-cover"
                />
                <span
                  v-else
                  :class="[
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white',
                    getAvatarColor(requestUser.name),
                  ]"
                >
                  {{ getInitials(requestUser.name) }}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="m-0 truncate text-sm font-semibold text-gray-900">
                    {{ requestUser.name }}
                  </p>
                  <p v-if="requestUser.email" class="m-0 truncate text-xs text-gray-500">
                    {{ requestUser.email }}
                  </p>
                </div>
                <button
                  type="button"
                  class="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
                  @click="showProfile = true"
                >
                  View Profile
                </button>
              </div>

              <!-- Leave Type -->
              <div class="mb-4">
                <label class="mb-1.5 block text-xs font-medium text-gray-700" for="m-type">
                  Leave Type <span class="text-red-600">*</span>
                </label>
                <div class="relative flex items-center">
                  <span class="pointer-events-none absolute left-3 flex text-gray-400"
                    ><FileText :size="18"
                  /></span>
                  <select
                    id="m-type"
                    v-model="form.leaveTypeId"
                    required
                    :disabled="isViewMode || submitting || typesLoading"
                    class="w-full appearance-none rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-800 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10 disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="" disabled>
                      {{ typesLoading ? 'Loading leave types…' : 'Select leave type' }}
                    </option>
                    <option v-for="type in activeLeaveTypes" :key="type.id" :value="type.id">
                      {{ type.name }}
                    </option>
                    <option value="other">Other (specify)</option>
                  </select>
                </div>
              </div>

              <div v-if="form.leaveTypeId === 'other'" class="mb-4">
                <label class="mb-1.5 block text-xs font-medium text-gray-700" for="m-custom-type">
                  Specify Leave Type <span class="text-red-600">*</span>
                </label>
                <input
                  id="m-custom-type"
                  v-model.trim="form.customType"
                  type="text"
                  placeholder="e.g. Bereavement Leave"
                  :disabled="isViewMode || submitting"
                  class="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <!-- Date Range -->
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="mb-4">
                  <label class="mb-1.5 block text-xs font-medium text-gray-700" for="m-startDate">
                    Start Date <span class="text-red-600">*</span>
                  </label>
                  <div class="relative flex items-center">
                    <span class="pointer-events-none absolute left-3 flex text-gray-400"
                      ><Calendar :size="18"
                    /></span>
                    <input
                      id="m-startDate"
                      v-model="form.startDate"
                      type="date"
                      :min="todayStr"
                      required
                      :disabled="isViewMode || submitting"
                      class="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10 disabled:bg-gray-50 disabled:text-gray-500"
                      @change="onStartDateChange"
                    />
                  </div>
                </div>

                <div class="mb-4">
                  <label class="mb-1.5 block text-xs font-medium text-gray-700" for="m-endDate">
                    End Date <span class="text-red-600">*</span>
                  </label>
                  <div class="relative flex items-center">
                    <span class="pointer-events-none absolute left-3 flex text-gray-400"
                      ><Calendar :size="18"
                    /></span>
                    <input
                      id="m-endDate"
                      v-model="form.endDate"
                      type="date"
                      :min="form.startDate || todayStr"
                      required
                      :disabled="isViewMode || submitting"
                      class="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>
              <p v-if="dateRangeError" class="-mt-2 mb-4 text-xs text-red-700">
                {{ dateRangeError }}
              </p>

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
                  :disabled="isViewMode || submitting"
                  maxlength="500"
                  class="w-full resize-y rounded-md border border-gray-300 px-3 py-2.5 font-sans text-sm text-gray-800 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10 disabled:bg-gray-50 disabled:text-gray-500"
                />
                <span v-if="!isViewMode" class="mt-1 block text-right text-[11px] text-gray-400"
                  >{{ form.reason.length }}/500</span
                >
              </div>

              <!-- Attachment (view mode) -->
              <div v-if="isViewMode && existingAttachmentUrl" class="mb-4">
                <label class="mb-1.5 block text-xs font-medium text-gray-700">
                  Supporting Document
                </label>

                <a
                  :href="existingAttachmentUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs text-cyan-700 transition-colors hover:bg-gray-100"
                >
                  <Paperclip :size="16" />
                  <span class="truncate">View attached file</span>
                </a>
              </div>

              <!-- Attachment -->
              <div v-if="!isViewMode" class="mb-4">
                <label class="mb-1.5 block text-xs font-medium text-gray-700"
                  >Supporting Document (optional)</label
                >
                <FileUpload
                  v-model="attachmentFiles"
                  :multiple="false"
                  :max-size-m-b="5"
                  :accept="['pdf', 'docx', 'png', 'jpg']"
                  :disabled="submitting"
                />
              </div>
            </form>
          </div>

          <!-- Footer -->
          <div
            v-if="!loadError && editableLoaded && !(isEditMode && !canEdit) && !isViewMode"
            class="flex shrink-0 justify-end gap-2.5 border-t border-gray-100 px-6 py-4"
          >
            <button
              type="button"
              class="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              :disabled="submitting"
              @click="handleClose"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="leave-form"
              class="rounded-md bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-cyan-300"
              :disabled="!canSubmit"
            >
              {{ submitting ? 'Submitting…' : isEditMode ? 'Save Changes' : 'Submit Request' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <StudentProfileModal :student="showProfile ? requestUser : null" @close="showProfile = false" />
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useLeaveFormModalStore } from '@/stores/leaveFormModal';
import { leaveService } from '@/services/leaveService';
import type { LeaveType, LeaveRequestPayload, LeaveRequestUser } from '@/types/leave';
import type { AxiosError } from 'axios';
import { FileText, Calendar, Paperclip, X, Lock } from 'lucide-vue-next';
import { getInitials, getAvatarColor } from '@/utils/initials';
import StudentProfileModal from '@/components/leave-request/StudentProfileModal.vue';
import FileUpload from '@/components/ui/FileUpload.vue';

const auth = useAuthStore();
const modal = useLeaveFormModalStore();

const isEditMode = computed(() => modal.mode === 'edit');
const isViewMode = computed(() => modal.mode === 'view');
const needsLoad = computed(() => isEditMode.value || isViewMode.value);

const modalTitle = computed(() => {
  if (isViewMode.value) return 'Leave Request Details';
  return isEditMode.value ? 'Edit Leave Request' : 'New Leave Request';
});

const submitting = ref(false);
const submitError = ref('');
const loadError = ref('');
const editableLoaded = ref(false);
const canEdit = ref(true);
const originalStatus = ref('');
const requestUser = ref<LeaveRequestUser | null>(null);
const showProfile = ref(false);
const existingAttachmentUrl = ref<string | null>(null);

const leaveTypes = ref<LeaveType[]>([]);
const typesLoading = ref(false);
const activeLeaveTypes = computed(() => leaveTypes.value.filter((t) => t.is_active));

const todayStr = new Date().toISOString().slice(0, 10);

const form = reactive({
  leaveTypeId: '' as number | string,
  customType: '',
  startDate: '',
  endDate: '',
  reason: '',
  attachment: null as File | null,
});

function resetForm() {
  form.leaveTypeId = '';
  form.customType = '';
  form.startDate = '';
  form.endDate = '';
  form.reason = '';
  form.attachment = null;
  submitError.value = '';
  loadError.value = '';
  editableLoaded.value = false;
  canEdit.value = true;
  originalStatus.value = '';
  requestUser.value = null;
  showProfile.value = false;
  existingAttachmentUrl.value = null;
}

const dateRangeError = computed(() => {
  if (!form.startDate || !form.endDate) return '';
  return form.endDate < form.startDate ? 'End date cannot be before start date.' : '';
});

const canSubmit = computed(
  () =>
    !submitting.value &&
    form.leaveTypeId !== '' &&
    (form.leaveTypeId !== 'other' || form.customType.length > 0) &&
    form.startDate.length > 0 &&
    form.endDate.length > 0 &&
    form.reason.trim().length > 0 &&
    !dateRangeError.value,
);

function onStartDateChange() {
  if (form.endDate && form.endDate < form.startDate) form.endDate = '';
}

const attachmentFiles = computed<File[]>({
  get: () => (form.attachment ? [form.attachment] : []),
  set: (files) => {
    form.attachment = files[0] ?? null;
  },
});

function handleClose() {
  if (submitting.value) return;
  modal.close();
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && modal.isOpen) handleClose();
}

onMounted(() => window.addEventListener('keydown', handleEscape));
onUnmounted(() => window.removeEventListener('keydown', handleEscape));

async function ensureLeaveTypes() {
  if (leaveTypes.value.length > 0 || typesLoading.value) return;
  typesLoading.value = true;
  try {
    leaveTypes.value = await leaveService.getLeaveTypes();
  } catch {
    // Leave types are non-critical for viewing; the "Other" option still works.
  } finally {
    typesLoading.value = false;
  }
}

watch(
  () => modal.isOpen,
  async (open) => {
    if (!open) return;
    resetForm();
    ensureLeaveTypes();

    if (!needsLoad.value) {
      editableLoaded.value = true;
      return;
    }

    try {
      const data = await leaveService.getLeaveRequest(Number(modal.editingId));

      if (isEditMode.value && data.user_id !== auth.user?.id) {
        loadError.value = 'You do not have permission to edit this request.';
        return;
      }

      originalStatus.value = data.status;
      canEdit.value = data.status === 'pending';
      requestUser.value = data.user;
      form.leaveTypeId = data.leave_type_id;
      form.startDate = data.start_date;
      form.endDate = data.end_date;
      form.reason = data.reason;
      existingAttachmentUrl.value = data.supporting_document;
    } catch {
      loadError.value = 'Failed to load this leave request.';
    } finally {
      editableLoaded.value = true;
    }
  },
);

async function handleSubmit() {
  if (!canSubmit.value) return;

  submitting.value = true;
  submitError.value = '';

  try {
    const payload: LeaveRequestPayload = {
      leave_type_id: form.leaveTypeId === 'other' ? null : Number(form.leaveTypeId),
      custom_leave_type: form.leaveTypeId === 'other' ? form.customType : null,
      start_date: form.startDate,
      end_date: form.endDate,
      reason: form.reason,
      supporting_document: form.attachment,
    };

    if (isEditMode.value) {
      await leaveService.updateLeaveRequest(Number(modal.editingId), payload);
    } else {
      await leaveService.createLeaveRequest(payload);
    }

    modal.notifySubmitted();
    modal.close();
  } catch (err) {
    submitError.value =
      (err as AxiosError<{ message?: string }>).response?.data?.message ||
      'Something went wrong. Please try again.';
  } finally {
    submitting.value = false;
  }
}
</script>
