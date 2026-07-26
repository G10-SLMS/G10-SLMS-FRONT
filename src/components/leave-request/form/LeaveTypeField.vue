<template>
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
        :value="leaveTypeId"
        required
        :disabled="disabled || loading"
        class="w-full appearance-none rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-800 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10 disabled:bg-gray-50 disabled:text-gray-500"
        @change="onChange"
      >
        <option value="" disabled>
          {{ loading ? 'Loading leave types…' : 'Select leave type' }}
        </option>
        <option v-for="type in activeLeaveTypes" :key="type.id" :value="type.id">
          {{ type.name }}
        </option>
        <option value="other">Other (specify)</option>
      </select>
    </div>
  </div>

  <div v-if="leaveTypeId === 'other'" class="mb-4">
    <label class="mb-1.5 block text-xs font-medium text-gray-700" for="m-custom-type">
      Specify Leave Type <span class="text-red-600">*</span>
    </label>
    <input
      id="m-custom-type"
      :value="customType"
      type="text"
      placeholder="e.g. Bereavement Leave"
      :disabled="disabled"
      class="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10 disabled:bg-gray-50 disabled:text-gray-500"
      @input="emit('update:customType', ($event.target as HTMLInputElement).value.trim())"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FileText } from 'lucide-vue-next';
import type { LeaveType } from '@/types/leave';

const props = defineProps<{
  leaveTypeId: number | string;
  customType: string;
  leaveTypes: LeaveType[];
  loading: boolean;
  disabled: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:leaveTypeId', value: number | string): void;
  (e: 'update:customType', value: string): void;
}>();

const activeLeaveTypes = computed(() => props.leaveTypes.filter((t) => t.is_active));

function onChange(event: Event) {
  const raw = (event.target as HTMLSelectElement).value;
  const value = raw === 'other' || raw === '' ? raw : Number(raw);
  emit('update:leaveTypeId', value);
}
</script>
