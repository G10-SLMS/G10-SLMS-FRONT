import { computed } from 'vue';
import type { LeaveDurationType } from '@/types/leave';
import { LEAVE_MIN_HOURLY_DURATION, LEAVE_MAX_HOURLY_DURATION } from '@/types/leave';

export interface LeaveDurationFormFields {
  durationType: LeaveDurationType;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export const todayStr = new Date().toISOString().slice(0, 10);

// ── Internal Helpers ─────────────────────────────────────
function parseTimeToMinutes(value: string): number | null {
  if (!value) return null;
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function totalDaysBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const startDate = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');
  const diff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff + 1, 0);
}

export function formatTimeLabel(value: string): string {
  const minutes = parseTimeToMinutes(value);
  if (minutes == null) return '—';
  const hour24 = Math.floor(minutes / 60);
  const min = minutes % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(min).padStart(2, '0')} ${period}`;
}

export function useLeaveDuration(form: LeaveDurationFormFields) {
  // ── Duration Type / Date Change Handlers ─────────────
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

  function onStartDateChange() {
    if (form.durationType === 'hourly') {
      // Hourly leave is always same-day.
      form.endDate = form.startDate;
      return;
    }
    if (form.endDate && form.endDate < form.startDate) form.endDate = '';
  }

  // ── Validation & Summary ──────────────────────────────
  const dateRangeError = computed(() => {
    if (!form.startDate || !form.endDate) return '';
    return form.endDate < form.startDate ? 'End date cannot be before start date.' : '';
  });

  const hourlyDurationHours = computed<number | null>(() => {
    if (form.durationType !== 'hourly') return null;
    const startMinutes = parseTimeToMinutes(form.startTime);
    const endMinutes = parseTimeToMinutes(form.endTime);
    if (startMinutes == null || endMinutes == null) return null;
    const diff = endMinutes - startMinutes;
    if (diff <= 0) return null;
    return Math.round((diff / 60) * 60) / 60;
  });

  const timeRangeError = computed(() => {
    if (form.durationType !== 'hourly') return '';
    if (!form.startTime || !form.endTime) return '';

    const startMinutes = parseTimeToMinutes(form.startTime);
    const endMinutes = parseTimeToMinutes(form.endTime);
    if (startMinutes == null || endMinutes == null || endMinutes <= startMinutes) {
      return 'End time must be after start time.';
    }

    const diffMinutes = endMinutes - startMinutes;
    const minMinutes = LEAVE_MIN_HOURLY_DURATION * 60;
    const maxMinutes = LEAVE_MAX_HOURLY_DURATION * 60;

    if (diffMinutes < minMinutes) {
      return `Leave duration must be at least ${minMinutes} minutes.`;
    }

    if (diffMinutes > maxMinutes) {
      return `Duration must be between ${LEAVE_MIN_HOURLY_DURATION} and ${LEAVE_MAX_HOURLY_DURATION} hours.`;
    }

    return '';
  });

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

  return {
    todayStr,
    setDurationType,
    onStartDateChange,
    dateRangeError,
    timeRangeError,
    durationSummary,
    durationMissing,
    formatTimeLabel,
  };
}
