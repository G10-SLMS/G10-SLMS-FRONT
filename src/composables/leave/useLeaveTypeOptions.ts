import { computed, ref } from 'vue';
import { leaveService } from '@/services/leaveService';
import type { LeaveType } from '@/types/leave';

export function useLeaveTypeOptions(selectedLeaveTypeId: () => number | string) {
  const leaveTypes = ref<LeaveType[]>([]);
  const typesLoading = ref(false);

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

  const selectedLeaveType = computed(() =>
    leaveTypes.value.find((t) => t.id === Number(selectedLeaveTypeId())),
  );

  const attachmentRequired = computed(() => selectedLeaveType.value?.requires_attachment === true);

  return {
    leaveTypes,
    typesLoading,
    ensureLeaveTypes,
    selectedLeaveType,
    attachmentRequired,
  };
}
