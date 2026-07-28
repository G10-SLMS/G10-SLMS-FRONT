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

            <LeaveFormStatusMessage v-else-if="needsLoad && !editableLoaded" variant="loading" />

            <LeaveFormStatusMessage
              v-else-if="isEditMode && editableLoaded && !canEdit"
              variant="locked"
              :original-status="originalStatus"
              @close="handleClose"
            />

            <form v-else id="leave-form" @submit.prevent="handleSubmit" novalidate>
              <div
                v-if="submitError"
                class="mb-4 rounded-md bg-red-100 px-3.5 py-2.5 text-xs text-red-700"
                role="alert"
              >
                {{ submitError }}
              </div>

              <LeaveRequesterCard
                v-if="isViewMode && requestUser"
                :user="requestUser"
                @view-profile="showProfile = true"
              />

              <LeaveTypeField
                v-model:leave-type-id="form.leaveTypeId"
                v-model:custom-type="form.customType"
                :leave-types="leaveTypes"
                :loading="typesLoading"
                :disabled="isViewMode || submitting"
              />

              <DurationToggleField
                :model-value="form.durationType"
                :view-mode="isViewMode"
                :disabled="submitting"
                @update:model-value="setDurationType"
              />

              <LeaveDateTimeFields
                v-model:start-date="form.startDate"
                v-model:end-date="form.endDate"
                v-model:start-time="form.startTime"
                v-model:end-time="form.endTime"
                :duration-type="form.durationType"
                :view-mode="isViewMode"
                :edit-mode="isEditMode"
                :disabled="submitting"
                :today-str="todayStr"
                :date-range-error="dateRangeError"
                :time-range-error="timeRangeError"
                :duration-summary="durationSummary"
                @start-date-change="onStartDateChange"
              />

              <LeaveReasonField
                v-model="form.reason"
                :view-mode="isViewMode"
                :disabled="isViewMode || submitting"
              />

              <LeaveReviewPanel
                v-if="isViewMode"
                :reviewer="reviewer"
                :reviewed-at="reviewedAt"
                :review-note="reviewNote"
                :original-status="originalStatus"
              />

              <LeaveAttachmentField
                :view-mode="isViewMode"
                :has-existing-attachment="hasExistingAttachment"
                :remove-existing-attachment="removeExistingAttachment"
                :existing-attachment-url="existingAttachmentUrl"
                :existing-attachment-name="existingAttachmentName"
                :existing-attachment-size="existingAttachmentSize"
                :required="attachmentRequired"
                :disabled="submitting"
                :model-value="form.attachment"
                @update:model-value="onAttachmentChange"
                @remove-existing="removeExistingAttachment = true"
                @undo-remove="removeExistingAttachment = false"
              />
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
import { computed, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useLeaveFormModalStore } from '@/stores/leaveFormModal';
import { X } from 'lucide-vue-next';
import StudentProfileModal from '@/components/leave-request/modal/StudentProfileModal.vue';
import CommentSection from '@/components/ui/CommentSection.vue';
import LeaveRequesterCard from '@/components/leave-request/form/LeaveRequesterCard.vue';
import LeaveTypeField from '@/components/leave-request/form/LeaveTypeField.vue';
import DurationToggleField from '@/components/leave-request/form/DurationToggleField.vue';
import LeaveDateTimeFields from '@/components/leave-request/form/LeaveDateTimeFields.vue';
import LeaveReviewPanel from '@/components/leave-request/form/LeaveReviewPanel.vue';
import LeaveAttachmentField from '@/components/leave-request/form/LeaveAttachmentField.vue';
import LeaveReasonField from '@/components/leave-request/form/LeaveReasonField.vue';
import LeaveFormStatusMessage from '@/components/leave-request/form/LeaveFormStatusMessage.vue';
import { useLeaveDuration } from '@/composables/leave/useLeaveDuration';
import { useLeaveComments } from '@/composables/leave/useLeaveComments';
import { useEscapeKey } from '@/composables/shared/useEscapeKey';
import { useLeaveTypeOptions } from '@/composables/leave/useLeaveTypeOptions';
import { useExistingAttachment } from '@/composables/leave/useExistingAttachment';
import { useLeaveRequestForm } from '@/composables/leave/useLeaveRequestForm';
import { useLeaveRequestSubmit } from '@/composables/leave/useLeaveRequestSubmit';

const auth = useAuthStore();
const modal = useLeaveFormModalStore();

const isEditMode = computed(() => modal.mode === 'edit');
const isViewMode = computed(() => modal.mode === 'view');
const needsLoad = computed(() => isEditMode.value || isViewMode.value);

const modalTitle = computed(() => {
  if (isViewMode.value) return 'Leave Request Details';
  return isEditMode.value ? 'Edit Leave Request' : 'New Leave Request';
});

const showProfile = ref(false);

const leaveRequestId = computed(() => {
  const id = Number(modal.editingId);
  return Number.isFinite(id) ? id : null;
});

const {
  comments,
  commentsLoading,
  reset: resetComments,
  loadComments,
  handleAddComment,
  handleReplyComment,
  handleEditComment,
  handleDeleteComment,
} = useLeaveComments(() => leaveRequestId.value);

// `form` is created inside useLeaveRequestForm below; these composables close
// over it by reference and are only evaluated lazily (after setup runs), so
// declaring them first is safe and keeps the dependency wiring explicit.
const attachment = useExistingAttachment(() => Boolean(form.attachment));
const { leaveTypes, typesLoading, ensureLeaveTypes, attachmentRequired } = useLeaveTypeOptions(
  () => form.leaveTypeId,
);

const {
  form,
  loadError,
  editableLoaded,
  canEdit,
  originalStatus,
  requestUser,
  reviewer,
  reviewedAt,
  reviewNote,
  loadRequest,
} = useLeaveRequestForm({
  editingId: () => Number(modal.editingId),
  needsLoad: () => needsLoad.value,
  isEditMode: () => isEditMode.value,
  isViewMode: () => isViewMode.value,
  currentUserId: () => auth.user?.id,
  attachment,
  ensureLeaveTypes,
  onLoadedForView: () => loadComments(),
  onReset: () => {
    resetSubmitError();
    showProfile.value = false;
    resetComments();
  },
});

const {
  todayStr,
  setDurationType,
  onStartDateChange,
  dateRangeError,
  timeRangeError,
  durationSummary,
  durationMissing,
} = useLeaveDuration(form);

const attachmentMissing = computed(() => attachmentRequired.value && !attachment.hasAttachment.value);

const {
  submitting,
  submitError,
  canSubmit,
  handleSubmit,
  resetSubmitError,
} = useLeaveRequestSubmit({
  form,
  isEditMode: () => isEditMode.value,
  editingId: () => Number(modal.editingId),
  dateRangeError,
  durationMissing,
  attachmentMissing,
  removeExistingAttachment: attachment.removeExistingAttachment,
  onSubmitted: () => {
    modal.notifySubmitted();
    modal.close();
  },
});

const {
  existingAttachmentUrl,
  existingAttachmentName,
  existingAttachmentSize,
  hasExistingAttachment,
  removeExistingAttachment,
} = attachment;

function onAttachmentChange(file: File | null) {
  form.attachment = file;
  // Picking a new file supersedes any pending "remove" intent.
  if (form.attachment) attachment.onNewAttachmentPicked();
}

function handleClose() {
  if (submitting.value) return;
  modal.close();
}

useEscapeKey(() => modal.isOpen, handleClose);

watch(
  () => [modal.isOpen, modal.editingId],
  ([open]) => {
    if (!open) return;
    loadRequest();
  },
);
</script>
