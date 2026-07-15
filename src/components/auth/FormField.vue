<template>
  <div class="mb-4">
    <label :for="id" class="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-700">
      {{ label }}
    </label>

    <div class="relative flex items-center">
      <span class="pointer-events-none absolute left-3.5 flex items-center text-gray-400">
        <slot name="icon" />
      </span>

      <input
        :id="id"
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :required="required"
        class="w-full appearance-none rounded-xl border border-gray-300 bg-[#fbfbfc] py-3 pl-10 pr-3.5 text-[0.92rem] text-gray-900 transition-colors focus:border-[#f5a623] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#f5a623]/10"
      />
    </div>

    <slot name="hint" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
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

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>
