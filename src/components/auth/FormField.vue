<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string
    label: string
    modelValue: string
    type?: string
    placeholder?: string
    autocomplete?: string
    required?: boolean
  }>(),
  { type: 'text' }
)
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="mb-[1.1rem]">
    <label class="mb-1.5 block text-[0.72rem] font-bold uppercase tracking-wide text-gray-700" :for="id">{{ label }}</label>
    <div class="relative flex items-center">
      <span class="pointer-events-none absolute left-3.5 flex items-center text-gray-400">
        <slot name="icon" />
      </span>
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :required="required"
        class="w-full appearance-none rounded-[10px] border border-gray-300 bg-[#fbfbfc] py-3 pl-10 pr-3.5 text-[0.92rem] text-gray-900 transition-colors focus:border-[#f5a623] focus:bg-white focus:shadow-[0_0_0_3px_rgba(245,166,35,0.12)] focus:outline-none"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <slot name="hint" />
  </div>
</template>
