import { reactive, ref } from 'vue';
import { leaveService } from '@/services/leaveService';
import type { LeaveDurationType, LeaveRequestUser } from '@/types/leave';
import type { useExistingAttachment } from '@/composables/leave/useExistingAttachment';

export interface LeaveFormFields {
  leaveTypeId: number | string;
  customType: string;
  startDate: string;
  endDate: string;
  reason: string;
  durationType: LeaveDurationType;
  startTime: string;
  endTime: string;
  attachment: File | null;
}

function createEmptyForm(): LeaveFormFields {
  return {
    leaveTypeId: '',
    customType: '',
    startDate: '',
    endDate: '',
    reason: '',
    durationType: 'full_day',
    startTime: '',
    endTime: '',
    attachment: null,
  };
}

interface UseLeaveRequestFormOptions {
  editingId: () => number | null;
  needsLoad: () => boolean;
  isEditMode: () => boolean;
  isViewMode: () => boolean;
  currentUserId: () => number | undefined;
  attachment: ReturnType<typeof useExistingAttachment>;
  ensureLeaveTypes: () => void;
  onLoadedForView: () => void;
  /** Called whenever the form is reset (e.g. so the submit composable can clear its own error state). */
  onReset?: () => void;
}

export function useLeaveRequestForm(options: UseLeaveRequestFormOptions) {
  const form = reactive<LeaveFormFields>(createEmptyForm());

  const loadError = ref('');
  const editableLoaded = ref(false);
  const canEdit = ref(true);
  const originalStatus = ref('');
  const requestUser = ref<LeaveRequestUser | null>(null);
  const reviewer = ref<{ id: number; name: string } | null>(null);
  const reviewedAt = ref<string | null>(null);
  const reviewNote = ref<string | null>(null);

  let loadToken = 0;

  function resetForm() {
    Object.assign(form, createEmptyForm());
    loadError.value = '';
    editableLoaded.value = false;
    canEdit.value = true;
    originalStatus.value = '';
    requestUser.value = null;
    reviewer.value = null;
    reviewedAt.value = null;
    reviewNote.value = null;
    options.attachment.reset();
    options.onReset?.();
  }

  async function loadRequest() {
    const token = ++loadToken;
    resetForm();
    options.ensureLeaveTypes();

    if (!options.needsLoad()) {
      editableLoaded.value = true;
      return;
    }

    try {
      const data = await leaveService.getLeaveRequest(Number(options.editingId()));
      // A newer load started while this one was in flight — discard this result.
      if (token !== loadToken) return;

      if (options.isEditMode() && data.user_id !== options.currentUserId()) {
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
      options.attachment.setFromLoadedRequest(data);

      if (options.isViewMode()) {
        options.onLoadedForView();
      }
    } catch {
      if (token !== loadToken) return;
      loadError.value = 'Failed to load this leave request.';
    } finally {
      if (token === loadToken) editableLoaded.value = true;
    }
  }

  return {
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
  };
}
