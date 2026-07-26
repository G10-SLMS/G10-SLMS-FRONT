<template>
  <div class="mb-4 flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5">
    <span class="text-sm font-medium text-gray-700">All day</span>
    <button
      v-if="!viewMode"
      type="button"
      role="switch"
      :aria-checked="modelValue === 'full_day'"
      :disabled="disabled"
      :class="[
        'relative inline-flex h-5.5 w-10 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed',
        modelValue === 'full_day' ? 'bg-cyan-600' : 'bg-gray-300',
      ]"
      @click="emit('update:modelValue', modelValue === 'full_day' ? 'hourly' : 'full_day')"
    >
      <span
        :class="[
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          modelValue === 'full_day' ? 'translate-x-5' : 'translate-x-1',
        ]"
      />
    </button>
    <span v-else class="text-sm text-gray-600">{{ modelValue === 'full_day' ? 'Yes' : 'No' }}</span>
  </div>
</template>

<script setup lang="ts">
import type { LeaveDurationType } from '@/types/leave';

defineProps<{
  modelValue: LeaveDurationType;
  viewMode: boolean;
  disabled: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: LeaveDurationType): void;
}>();
</script>
