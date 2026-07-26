<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div class="mb-4">
      <label class="mb-1.5 block text-xs font-medium text-gray-700" for="m-startDate">
        {{ durationType === 'hourly' ? 'Date' : 'Start Date' }} <span class="text-red-600">*</span>
      </label>
      <div class="relative flex items-center">
        <span class="pointer-events-none absolute left-3 flex text-gray-400"
          ><Calendar :size="18"
        /></span>
        <input
          id="m-startDate"
          :value="startDate"
          type="date"
          :min="viewMode || editMode ? undefined : todayStr"
          required
          :disabled="viewMode || disabled"
          class="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10 disabled:bg-gray-50 disabled:text-gray-500"
          @change="onStartDateInput"
        />
      </div>
    </div>

    <div v-if="durationType !== 'hourly'" class="mb-4">
      <label class="mb-1.5 block text-xs font-medium text-gray-700" for="m-endDate">
        End Date <span class="text-red-600">*</span>
      </label>
      <div class="relative flex items-center">
        <span class="pointer-events-none absolute left-3 flex text-gray-400"
          ><Calendar :size="18"
        /></span>
        <input
          id="m-endDate"
          :value="endDate"
          type="date"
          :min="startDate || (viewMode || editMode ? undefined : todayStr)"
          required
          :disabled="viewMode || disabled"
          class="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10 disabled:bg-gray-50 disabled:text-gray-500"
          @change="emit('update:endDate', ($event.target as HTMLInputElement).value)"
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
            v-if="!viewMode"
            id="m-startTime"
            :model-value="startTime"
            :step-minutes="15"
            :disabled="disabled"
            @update:model-value="emit('update:startTime', $event)"
          />
          <div v-else class="flex w-full items-center py-2.5 pl-10 pr-3 text-sm text-gray-800">
            <span class="pointer-events-none absolute left-3 flex text-gray-400"
              ><Clock :size="18"
            /></span>
            {{ formatTimeLabel(startTime) }}
          </div>
        </div>
      </div>

      <div class="mb-4">
        <label class="mb-1.5 block text-xs font-medium text-gray-700" for="m-endTime">
          End Time <span class="text-red-600">*</span>
        </label>
        <div class="relative flex items-center">
          <TimePicker
            v-if="!viewMode"
            id="m-endTime"
            :model-value="endTime"
            :step-minutes="15"
            :base-time="startTime"
            :duration-range-minutes="8 * 60"
            :disabled="disabled"
            @update:model-value="emit('update:endTime', $event)"
          />
          <div v-else class="flex w-full items-center py-2.5 pl-10 pr-3 text-sm text-gray-800">
            <span class="pointer-events-none absolute left-3 flex text-gray-400"
              ><Clock :size="18"
            /></span>
            {{ formatTimeLabel(endTime) }}
          </div>
        </div>
      </div>
    </template>
  </div>

  <p v-if="dateRangeError || timeRangeError" class="-mt-2 mb-2 text-xs text-red-700">
    {{ dateRangeError || timeRangeError }}
  </p>

  <div class="mb-4 flex items-center gap-1.5">
    <span class="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700">
      <Clock :size="12" />
      {{ durationSummary }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { Calendar, Clock } from 'lucide-vue-next';
import TimePicker from '@/components/ui/TimePicker.vue';
import { formatTimeLabel } from '@/composables/leave/useLeaveDuration';
import type { LeaveDurationType } from '@/types/leave';

const props = defineProps<{
  durationType: LeaveDurationType;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  viewMode: boolean;
  editMode: boolean;
  disabled: boolean;
  todayStr: string;
  dateRangeError: string;
  timeRangeError: string;
  durationSummary: string;
}>();

const emit = defineEmits<{
  (e: 'update:startDate', value: string): void;
  (e: 'update:endDate', value: string): void;
  (e: 'update:startTime', value: string): void;
  (e: 'update:endTime', value: string): void;
  (e: 'start-date-change'): void;
}>();

function onStartDateInput(event: Event) {
  emit('update:startDate', (event.target as HTMLInputElement).value);
  emit('start-date-change');
}
</script>
