<template>
  <div class="mb-4">
    <label class="mb-1.5 block text-xs font-medium text-gray-700" for="m-reason">
      Reason <span class="text-red-600">*</span>
    </label>
    <textarea
      id="m-reason"
      :value="modelValue"
      rows="4"
      placeholder="Briefly explain the reason for your leave"
      required
      :disabled="disabled"
      maxlength="500"
      class="w-full resize-y rounded-md border border-gray-300 px-3 py-2.5 font-sans text-sm text-gray-800 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10 disabled:bg-gray-50 disabled:text-gray-500"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value.trim())"
    />
    <span v-if="!viewMode" class="mt-1 block text-right text-[11px] text-gray-400">
      {{ modelValue.length }}/500
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
  disabled: boolean;
  viewMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>
