<template>
  <div class="mb-4">
    <div class="mb-1.5 flex items-baseline justify-between">
      <label :for="id" class="text-xs font-bold uppercase tracking-wide text-gray-700">
        {{ label }}
      </label>
      <slot name="label-extra" />
    </div>

    <div class="relative flex items-center">
      <span class="pointer-events-none absolute left-3.5 flex items-center text-gray-400">
        <Lock :size="18" :stroke-width="1.8" />
      </span>

      <input
        :id="id"
        v-model="inputValue"
        :type="visible ? 'text' : 'password'"
        :placeholder="placeholder || '••••••••'"
        :autocomplete="autocomplete"
        :minlength="minlength"
        :required="required"
        class="w-full appearance-none rounded-xl border border-gray-300 bg-[#fbfbfc] py-3 pl-10 pr-10 text-[0.92rem] text-gray-900 transition-colors focus:border-[#f5a623] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#f5a623]/10"
      />

      <button
        type="button"
        class="absolute right-3.5 flex items-center text-gray-400 transition-colors hover:text-gray-600"
        :aria-label="visible ? 'Hide password' : 'Show password'"
        @click="visible = !visible"
      >
        <component :is="visible ? EyeOff : Eye" :size="18" :stroke-width="1.8" />
      </button>
    </div>

    <slot name="error" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Lock, Eye, EyeOff } from 'lucide-vue-next'

const props = defineProps<{
  id: string
  label: string
  modelValue: string
  placeholder?: string
  autocomplete?: string
  required?: boolean
  minlength?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const visible = ref(false)

// Two-way binding through the v-model prop/emit pair, so the input can use v-model locally.
const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>
