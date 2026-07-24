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

              <!-- All Day toggle (Google Calendar style) -->
              <div class="mb-4 flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5">
                <span class="text-sm font-medium text-gray-700">All day</span>
                <button
                  v-if="!isViewMode"
                  type="button"
                  role="switch"
                  :aria-checked="form.durationType === 'full_day'"
                  :disabled="submitting"
                  :class="[
                    'relative inline-flex h-5.5 w-10 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed',
                    form.durationType === 'full_day' ? 'bg-cyan-600' : 'bg-gray-300',
                  ]"
                  @click="setDurationType(form.durationType === 'full_day' ? 'hourly' : 'full_day')"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                      form.durationType === 'full_day' ? 'translate-x-5' : 'translate-x-1',
                    ]"
                  />
                </button>
                <span v-else class="text-sm text-gray-600">{{ form.durationType === 'full_day' ? 'Yes' : 'No' }}</span>
              </div>

              <!-- Date Range -->
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="mb-4">
                  <label class="mb-1.5 block text-xs font-medium text-gray-700" for="m-startDate">
                    {{ form.durationType === 'hourly' ? 'Date' : 'Start Date' }} <span class="text-red-600">*</span>
                  </label>
                  <div class="relative flex items-center">
                    <span class="pointer-events-none absolute left-3 flex text-gray-400"
                      ><Calendar :size="18"
                    /></span>
                    <input
                      id="m-startDate"
                      v-model="form.startDate"
                      type="date"
                      :min="isViewMode || isEditMode ? undefined : todayStr"
                      required
                      :disabled="isViewMode || submitting"
                      class="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10 disabled:bg-gray-50 disabled:text-gray-500"
                      @change="onStartDateChange"
                    />
                  </div>
                </div>

                <div v-if="form.durationType !== 'hourly'" class="mb-4">
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
                      :min="form.startDate || (isViewMode || isEditMode ? undefined : todayStr)"
                      required
                      :disabled="isViewMode || submitting"
                      class="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <template v-else>
                  <div class="mb-4">
                    <label class="mb-1.5 block text-xs font-medium text-gray-700" for="m-startTime">
                      Start Time <span class="text-red-600">*</span>
                    </label>
                    <div class="relative flex items-center">
                      <TimePicker
                        v-if="!isViewMode"
                        id="m-startTime"
                        v-model="form.startTime"
                        :step-minutes="15"
                        :disabled="submitting"
                      />
                      <div v-else class="flex w-full items-center py-2.5 pl-10 pr-3 text-sm text-gray-800">
                        <span class="pointer-events-none absolute left-3 flex text-gray-400"
                          ><Clock :size="18"
                        /></span>
                        {{ formatTimeLabel(form.startTime) }}
                      </div>
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="mb-1.5 block text-xs font-medium text-gray-700" for="m-endTime">
                      End Time <span class="text-red-600">*</span>
                    </label>
                    <div class="relative flex items-center">
                      <TimePicker
                        v-if="!isViewMode"
                        id="m-endTime"
                        v-model="form.endTime"
                        :step-minutes="15"
                        :base-time="form.startTime"
                        :duration-range-minutes="8 * 60"
                        :disabled="submitting"
                      />
                      <div v-else class="flex w-full items-center py-2.5 pl-10 pr-3 text-sm text-gray-800">
                        <span class="pointer-events-none absolute left-3 flex text-gray-400"
                          ><Clock :size="18"
                        /></span>
                        {{ formatTimeLabel(form.endTime) }}
                      </div>
                    </div>
                  </div>
                </template>
              </div>
              <p v-if="dateRangeError || timeRangeError" class="-mt-2 mb-2 text-xs text-red-700">
                {{ dateRangeError || timeRangeError }}
              </p>

              <!-- Duration summary -->
              <div class="mb-4 flex items-center gap-1.5">
                <span class="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700">
                  <Clock :size="12" />
                  {{ durationSummary }}
                </span>
              </div>

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

              <!-- Reviewed by (view mode only) -->
              <div
                v-if="isViewMode && reviewer"
                class="mb-4 flex items-start gap-3 rounded-lg border px-4 py-3.5"
                :class="reviewTheme.box"
              >
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" :class="reviewTheme.icon">
                  <CheckCircle2 v-if="originalStatus.toLowerCase() === 'approved'" :size="18" />
                  <XCircle v-else-if="originalStatus.toLowerCase() === 'rejected'" :size="18" />
                  <UserCheck v-else :size="18" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="m-0 text-xs font-medium uppercase tracking-wide" :class="reviewTheme.text">
                    {{ reviewLabel }}
                  </p>
                  <p class="m-0 mt-0.5 text-sm font-semibold text-gray-900">{{ reviewer.name }}</p>
                  <p v-if="reviewedAt" class="m-0 mt-0.5 text-xs text-gray-500">
                    {{ formatReviewedAt(reviewedAt) }}
                  </p>
                  <p v-if="reviewNote" class="m-0 mt-1.5 text-xs text-gray-600">
                    "{{ reviewNote }}"
                  </p>
                </div>
              </div>

              <!-- Attachment (view mode) -->
              <div v-if="isViewMode && existingAttachmentUrl" class="mb-4">
                <label class="mb-1.5 block text-xs font-medium text-gray-700">
                  Supporting Document
                </label>

                <AttachmentCard
                  :url="existingAttachmentUrl"
                  :name="existingAttachmentName"
                  :size="existingAttachmentSize"
                />
              </div>

              <!-- Attachment (create/edit mode) -->
              <div v-if="!isViewMode" class="mb-4">
                <label class="mb-1.5 block text-xs font-medium text-gray-700">
                  Supporting Document
                  <span v-if="attachmentRequired" class="text-red-600">*</span>
                  <span v-else class="text-gray-400">(optional)</span>
                </label>

                <!-- Existing file on an edit, shown until replaced/removed -->
                <AttachmentCard
                  v-if="hasExistingAttachment && !removeExistingAttachment && !form.attachment"
                  class="mb-2"
                  :url="existingAttachmentUrl"
                  :name="existingAttachmentName"
                  :size="existingAttachmentSize"
                  removable
                  :show-view-label="false"
                  :disabled="submitting"
                  @remove="removeExistingAttachment = true"
                />
                <p v-else-if="removeExistingAttachment" class="mb-2 text-xs text-gray-500">
                  Existing file will be removed on save.
                  <button
                    type="button"
                    class="text-cyan-700 hover:underline"
                    @click="removeExistingAttachment = false"
                  >
                    Undo
                  </button>
                </p>

                <FileUpload
                  v-model="attachmentFiles"
                  :multiple="false"
                  :max-size-m-b="5"
                  :accept="['pdf', 'docx', 'png', 'jpg']"
                  :disabled="submitting"
                  :mock-upload="false"
                />
                <p v-if="attachmentRequired" class="mt-1.5 text-xs text-gray-500">
                  This leave type requires a supporting document before it can be submitted.
                </p>
              </div>
            </form>

            <!-- Comments (view mode only) -->
            <div v-if="isViewMode && editableLoaded && !loadError" class="mt-5">
              <CommentSection
                :comments="comments"
                :loading="commentsLoading"
                :current-user-id="auth.user?.id ?? 0"
                @add-comment="handleAddComment"
                @reply-comment="handleReplyComment"
                @edit-comment="handleEditComment"
                @delete-comment="handleDeleteComment"
              />
            </div>
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
import { commentService } from '@/services/commentService';
import type { LeaveType, LeaveRequestPayload, LeaveRequestUser, LeaveDurationType } from '@/types/leave';
import { LEAVE_MIN_HOURLY_DURATION, LEAVE_MAX_HOURLY_DURATION, LEAVE_HOURLY_DURATION_STEP } from '@/types/leave';
import type { Comment } from '@/types/comment';
import type { AxiosError } from 'axios';
import { FileText, Calendar, Clock, X, Lock, CheckCircle2, XCircle, UserCheck } from 'lucide-vue-next';
import { getInitials, getAvatarColor } from '@/utils/initials';
import StudentProfileModal from '@/components/leave-request/StudentProfileModal.vue';
import FileUpload from '@/components/ui/FileUpload.vue';
import AttachmentCard from '@/components/shared/AttachmentCard.vue';
import CommentSection from '@/components/ui/CommentSection.vue';
import TimePicker from '@/components/ui/TimePicker.vue';

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
const reviewer = ref<{ id: number; name: string } | null>(null);
const reviewedAt = ref<string | null>(null);
const reviewNote = ref<string | null>(null);
const showProfile = ref(false);
const existingAttachmentUrl = ref<string | null>(null);
const existingAttachmentName = ref<string | null>(null);
const existingAttachmentSize = ref<number | null>(null);
const hasExistingAttachment = ref(false);
const removeExistingAttachment = ref(false);

const comments = ref<Comment[]>([]);
const commentsLoading = ref(false);

const leaveTypes = ref<LeaveType[]>([]);
const typesLoading = ref(false);
const activeLeaveTypes = computed(() => leaveTypes.value.filter((t) => t.is_active));
const selectedLeaveType = computed(() =>
  leaveTypes.value.find((t) => t.id === Number(form.leaveTypeId)),
);
const attachmentRequired = computed(() => selectedLeaveType.value?.requires_attachment === true);
const hasAttachment = computed(
  () => Boolean(form.attachment) || (hasExistingAttachment.value && !removeExistingAttachment.value),
);
const attachmentMissing = computed(() => attachmentRequired.value && !hasAttachment.value);

const reviewLabel = computed(() => {
  const status = (originalStatus.value ?? '').toLowerCase();
  if (status === 'approved') return 'Approved by';
  if (status === 'rejected') return 'Rejected by';
  return 'Reviewed by';
});

const reviewTheme = computed(() => {
  const status = (originalStatus.value ?? '').toLowerCase();
  if (status === 'approved') {
    return { box: 'bg-green-50 border-green-100', icon: 'bg-green-100 text-green-600', text: 'text-green-800' };
  }
  if (status === 'rejected') {
    return { box: 'bg-red-50 border-red-100', icon: 'bg-red-100 text-red-600', text: 'text-red-800' };
  }
  return { box: 'bg-gray-50 border-gray-100', icon: 'bg-gray-100 text-gray-600', text: 'text-gray-800' };
});

function formatReviewedAt(value: string) {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const todayStr = new Date().toISOString().slice(0, 10);

const form = reactive({
  leaveTypeId: '' as number | string,
  customType: '',
  startDate: '',
  endDate: '',
  reason: '',
  durationType: 'full_day' as LeaveDurationType,
  startTime: '' as string,
  endTime: '' as string,
  attachment: null as File | null,
});

const hourlyMin = LEAVE_MIN_HOURLY_DURATION;
const hourlyMax = LEAVE_MAX_HOURLY_DURATION;
const hourlyStep = LEAVE_HOURLY_DURATION_STEP;

function setDurationType(type: LeaveDurationType) {
  form.durationType = type;
  if (type === 'hourly') {
    // Hourly leave is always a single day; keep end date in sync with start date.
    form.endDate = form.startDate;
    if (!form.startTime) form.startTime = '09:00';
    if (!form.endTime) form.endTime = '10:00';
  } else {
    form.startTime = '';
    form.endTime = '';
  }
}

let loadToken = 0;

function resetForm() {
  form.leaveTypeId = '';
  form.customType = '';
  form.startDate = '';
  form.endDate = '';
  form.reason = '';
  form.durationType = 'full_day';
  form.startTime = '';
  form.endTime = '';
  form.attachment = null;
  submitError.value = '';
  loadError.value = '';
  editableLoaded.value = false;
  canEdit.value = true;
  originalStatus.value = '';
  requestUser.value = null;
  reviewer.value = null;
  reviewedAt.value = null;
  reviewNote.value = null;
  showProfile.value = false;
  existingAttachmentUrl.value = null;
  existingAttachmentName.value = null;
  existingAttachmentSize.value = null;
  hasExistingAttachment.value = false;
  removeExistingAttachment.value = false;
  comments.value = [];
  commentsLoading.value = false;
}

const dateRangeError = computed(() => {
  if (!form.startDate || !form.endDate) return '';
  return form.endDate < form.startDate ? 'End date cannot be before start date.' : '';
});

function parseTimeToMinutes(value: string): number | null {
  if (!value) return null;
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

const hourlyDurationHours = computed<number | null>(() => {
  if (form.durationType !== 'hourly') return null;
  const startMinutes = parseTimeToMinutes(form.startTime);
  const endMinutes = parseTimeToMinutes(form.endTime);
  if (startMinutes == null || endMinutes == null) return null;
  const diff = endMinutes - startMinutes;
  if (diff <= 0) return null;
  return Math.round((diff / 60) * 10) / 10;
});

const timeRangeError = computed(() => {
  if (form.durationType !== 'hourly') return '';
  if (!form.startTime || !form.endTime) return '';

  const startMinutes = parseTimeToMinutes(form.startTime);
  const endMinutes = parseTimeToMinutes(form.endTime);
  if (startMinutes == null || endMinutes == null || endMinutes <= startMinutes) {
    return 'End time must be after start time.';
  }

  const hours = hourlyDurationHours.value;
  if (hours == null) return 'End time must be after start time.';

  if (hours < hourlyMin || hours > hourlyMax) {
    return `Duration must be between ${hourlyMin} and ${hourlyMax} hours.`;
  }

  const steps = hours / hourlyStep;
  if (Math.abs(steps - Math.round(steps)) > 0.0001) {
    return `Duration must be in increments of ${hourlyStep} hours (30 minutes).`;
  }

  return '';
});

function formatTimeLabel(value: string): string {
  const minutes = parseTimeToMinutes(value);
  if (minutes == null) return '—';
  const hour24 = Math.floor(minutes / 60);
  const min = minutes % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(min).padStart(2, '0')} ${period}`;
}

function totalDaysBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const startDate = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');
  const diff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff + 1, 0);
}

const durationSummary = computed(() => {
  if (form.durationType === 'hourly') {
    const hours = hourlyDurationHours.value;
    if (hours == null) return 'Select a valid time range';

    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    const parts: string[] = [];
    if (wholeHours > 0) parts.push(`${wholeHours} hr${wholeHours === 1 ? '' : 's'}`);
    if (minutes > 0) parts.push(`${minutes} min`);
    return parts.length ? parts.join(' ') : '0 min';
  }

  if (!form.startDate || !form.endDate) return 'Select dates';
  const days = totalDaysBetween(form.startDate, form.endDate);
  return `${days} ${days === 1 ? 'day' : 'days'}`;
});

const durationMissing = computed(
  () =>
    form.durationType === 'hourly' &&
    (!form.startTime || !form.endTime || timeRangeError.value !== ''),
);

const canSubmit = computed(
  () =>
    !submitting.value &&
    form.leaveTypeId !== '' &&
    (form.leaveTypeId !== 'other' || form.customType.length > 0) &&
    form.startDate.length > 0 &&
    form.endDate.length > 0 &&
    form.reason.trim().length > 0 &&
    !dateRangeError.value &&
    !durationMissing.value &&
    !attachmentMissing.value,
);

function onStartDateChange() {
  if (form.durationType === 'hourly') {
    // Hourly leave is always same-day.
    form.endDate = form.startDate;
    return;
  }
  if (form.endDate && form.endDate < form.startDate) form.endDate = '';
}

const attachmentFiles = computed<File[]>({
  get: () => (form.attachment ? [form.attachment] : []),
  set: (files) => {
    form.attachment = files[0] ?? null;
    // Picking a new file supersedes any pending "remove" intent.
    if (form.attachment) removeExistingAttachment.value = false;
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

async function loadRequest() {
  const token = ++loadToken;
  resetForm();
  ensureLeaveTypes();

  if (!needsLoad.value) {
    editableLoaded.value = true;
    return;
  }

  try {
    const data = await leaveService.getLeaveRequest(Number(modal.editingId));
    // A newer load started while this one was in flight — discard this result.
    if (token !== loadToken) return;

    if (isEditMode.value && data.user_id !== auth.user?.id) {
      loadError.value = 'You do not have permission to edit this request.';
      return;
    }

    originalStatus.value = data.status;
    canEdit.value = data.status === 'pending';
    requestUser.value = data.user;
    reviewer.value = data.reviewer ?? null;
    reviewedAt.value = data.reviewed_at ?? null;
    reviewNote.value = data.review_note ?? null;

    if (data.leave_type_id == null && data.custom_leave_type) {
      form.leaveTypeId = 'other';
      form.customType = data.custom_leave_type;
    } else {
      form.leaveTypeId = data.leave_type_id;
    }

    form.startDate = data.start_date;
    form.endDate = data.end_date;
    form.reason = data.reason;
    form.durationType = data.duration_type ?? 'full_day';
    form.startTime = data.start_time ?? '';
    form.endTime = data.end_time ?? '';
    existingAttachmentUrl.value = data.supporting_document;
    existingAttachmentName.value = data.supporting_document_name ?? null;
    existingAttachmentSize.value = data.supporting_document_size ?? null;
    hasExistingAttachment.value = Boolean(data.supporting_document);

    if (isViewMode.value) {
      loadComments();
    }
  } catch {
    if (token !== loadToken) return;
    loadError.value = 'Failed to load this leave request.';
  } finally {
    if (token === loadToken) editableLoaded.value = true;
  }
}

watch(
  () => [modal.isOpen, modal.editingId],
  ([open]) => {
    if (!open) return;
    loadRequest();
  },
);

async function loadComments() {
  const leaveRequestId = Number(modal.editingId);
  if (!Number.isFinite(leaveRequestId)) return;

  commentsLoading.value = true;
  try {
    comments.value = await commentService.getComments(leaveRequestId);
  } catch {
    // Comments are supplementary — a failed load shouldn't block viewing the request.
    comments.value = [];
  } finally {
    commentsLoading.value = false;
  }
}

async function handleAddComment(body: string) {
  const leaveRequestId = Number(modal.editingId);
  if (!Number.isFinite(leaveRequestId)) return;

  try {
    const created = await commentService.addComment({ leave_request_id: leaveRequestId, body });
    comments.value = [created, ...comments.value];
  } catch {
    // Silently ignore — the composer keeps the typed text so the user can retry.
  }
}

async function handleReplyComment(parentId: number, body: string) {
  const leaveRequestId = Number(modal.editingId);
  if (!Number.isFinite(leaveRequestId)) return;

  try {
    const created = await commentService.addComment({ leave_request_id: leaveRequestId, body, parent_id: parentId });
    comments.value = comments.value.map((comment) =>
      comment.id === parentId
        ? { ...comment, replies: [...comment.replies, created] }
        : comment,
    );
  } catch {
    // No-op — user can retry the reply.
  }
}

async function handleEditComment(id: number, body: string) {
  try {
    const updated = await commentService.updateComment(id, body);
    comments.value = comments.value.map((comment) => {
      if (comment.id === id) return updated;
      if (comment.replies.some((reply) => reply.id === id)) {
        return {
          ...comment,
          replies: comment.replies.map((reply) => (reply.id === id ? updated : reply)),
        };
      }
      return comment;
    });
  } catch {
    // No-op — user can retry the edit.
  }
}

async function handleDeleteComment(id: number) {
  try {
    await commentService.deleteComment(id);
    comments.value = comments.value
      .filter((comment) => comment.id !== id)
      .map((comment) => ({
        ...comment,
        replies: comment.replies.filter((reply) => reply.id !== id),
      }));
  } catch {
    // No-op — the comment stays visible so the user can retry.
  }
}

async function handleSubmit() {
  if (!canSubmit.value) return;

  submitting.value = true;
  submitError.value = '';

  try {
    const payload: LeaveRequestPayload = {
      leave_type_id: form.leaveTypeId === 'other' ? null : Number(form.leaveTypeId),
      custom_leave_type: form.leaveTypeId === 'other' ? form.customType : null,
      start_date: form.startDate,
      end_date: form.durationType === 'hourly' ? form.startDate : form.endDate,
      reason: form.reason,
      duration_type: form.durationType,
      start_time: form.durationType === 'hourly' ? form.startTime : null,
      end_time: form.durationType === 'hourly' ? form.endTime : null,
      ...(form.attachment
        ? { supporting_document: form.attachment }
        : removeExistingAttachment.value
          ? { supporting_document: null }
          : {}),
    };

    if (isEditMode.value) {
      await leaveService.updateLeaveRequest(Number(modal.editingId), payload);
    } else {
      await leaveService.createLeaveRequest(payload);
    }

    modal.notifySubmitted();
    modal.close();
  } catch (err) {
    const isAxiosStyleError =
      typeof err === 'object' && err !== null && 'isAxiosError' in err && (err as AxiosError).isAxiosError;

    if (!isAxiosStyleError) {
      submitError.value = 'Something went wrong while processing the response. Please refresh and check if your request went through before submitting again.';
      // eslint-disable-next-line no-console
      console.error('Non-axios error in handleSubmit — likely a response-parsing bug, not a network issue:', err);
    } else {
      const axiosErr = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;

      if (!axiosErr.response) {
        // Genuinely no response: network failure, timeout, or CORS issue.
        submitError.value = 'Could not reach the server. Check your connection and try again.';
      } else {
        const fieldErrors = axiosErr.response.data?.errors;
        const firstFieldError = fieldErrors ? Object.values(fieldErrors)[0]?.[0] : undefined;
        const status = axiosErr.response.status;

        submitError.value =
          firstFieldError ||
          axiosErr.response.data?.message ||
          (status >= 500
            ? `Server error (${status}). Please try again, and contact support if it persists.`
            : `Request failed (${status}). Please check your inputs and try again.`);
      }
    }
  } finally {
    submitting.value = false;
  }
}
</script>
