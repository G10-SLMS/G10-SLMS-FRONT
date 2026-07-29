import { computed, ref, type Ref } from 'vue';
import { isAxiosError } from 'axios';
import { leaveService } from '@/services/leaveService';
import { extractErrorMessage } from '@/utils/errors';
import type { LeaveRequestPayload } from '@/types/leave';
import type { LeaveFormFields } from '@/composables/leave/useLeaveRequestForm';

interface UseLeaveRequestSubmitOptions {
  form: LeaveFormFields;
  isEditMode: () => boolean;
  editingId: () => number | null;
  dateRangeError: Ref<string>;
  durationMissing: Ref<boolean>;
  attachmentMissing: Ref<boolean>;
  removeExistingAttachment: Ref<boolean>;
  onSubmitted: () => void;
}

export function useLeaveRequestSubmit(options: UseLeaveRequestSubmitOptions) {
  const { form } = options;

  // ── State ────────────────────────────────────────────
  const submitting = ref(false);
  const submitError = ref('');

  function resetSubmitError() {
    submitError.value = '';
  }

  // ── Validation ───────────────────────────────────────
  const canSubmit = computed(
    () =>
      !submitting.value &&
      form.leaveTypeId !== '' &&
      (form.leaveTypeId !== 'other' || form.customType.length > 0) &&
      form.startDate.length > 0 &&
      form.endDate.length > 0 &&
      form.reason.trim().length > 0 &&
      !options.dateRangeError.value &&
      !options.durationMissing.value &&
      !options.attachmentMissing.value,
  );

  // ── Submit ───────────────────────────────────────────
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
          : options.removeExistingAttachment.value
            ? { supporting_document: null }
            : {}),
      };

      if (options.isEditMode()) {
        await leaveService.updateLeaveRequest(Number(options.editingId()), payload);
      } else {
        await leaveService.createLeaveRequest(payload);
      }

      options.onSubmitted();
    } catch (err) {
      if (!isAxiosError(err)) {
        submitError.value =
          'Something went wrong while processing the response. Please refresh and check if your request went through before submitting again.';
        // eslint-disable-next-line no-console
        console.error('Non-axios error in handleSubmit — likely a response-parsing bug, not a network issue:', err);
      } else {
        submitError.value = extractErrorMessage(err, 'Request failed. Please check your inputs and try again.', {
          networkMessage: 'Could not reach the server. Check your connection and try again.',
          serverErrorMessage: 'Server error. Please try again, and contact support if it persists',
        });
      }
    } finally {
      submitting.value = false;
    }
  }

  return {
    submitting,
    submitError,
    canSubmit,
    handleSubmit,
    resetSubmitError,
  };
}
