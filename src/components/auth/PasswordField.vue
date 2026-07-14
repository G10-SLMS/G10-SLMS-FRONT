<script setup lang="ts">
import { ref } from 'vue'
import { Lock, Eye, EyeOff } from 'lucide-vue-next'

defineProps<{
  id: string
  label: string
  modelValue: string
  placeholder?: string
  autocomplete?: string
  required?: boolean
  minlength?: number
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const visible = ref(false)
</script>

<template>
  <div class="mb-[1.1rem]">
    <div class="mb-1.5 flex items-baseline justify-between">
      <label class="text-[0.72rem] font-bold uppercase tracking-wide text-gray-700" :for="id">{{ label }}</label>
      <slot name="label-extra" />
    </div>

    <div class="relative flex items-center">
      <span class="pointer-events-none absolute left-3.5 flex items-center text-gray-400">
        <Lock :size="18" :stroke-width="1.8" />
      </span>
      <input
        :id="id"
        :type="visible ? 'text' : 'password'"
        :value="modelValue"
        :placeholder="placeholder || '••••••••'"
        :autocomplete="autocomplete"
        :minlength="minlength"
        :required="required"
        class="w-full appearance-none rounded-[10px] border border-gray-300 bg-[#fbfbfc] py-3 pl-10 pr-3.5 text-[0.92rem] text-gray-900 transition-colors focus:border-blue-600 focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] focus:outline-none"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        type="button"
        class="absolute right-3.5 flex items-center border-none bg-transparent p-0 text-gray-400 cursor-pointer"
        :aria-label="visible ? 'Hide password' : 'Show password'"
        @click="visible = !visible"
      >
        <EyeOff v-if="visible" :size="18" :stroke-width="1.8" />
        <Eye v-else :size="18" :stroke-width="1.8" />
      </button>
    </div>

    <slot name="error" />
  </div>
</template>
