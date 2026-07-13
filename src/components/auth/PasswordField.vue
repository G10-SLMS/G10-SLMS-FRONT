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
  <div class="form-row">
    <div class="form-label-line">
      <label class="form-label" :for="id">{{ label }}</label>
      <slot name="label-extra" />
    </div>

    <div class="input-wrap">
      <span class="input-icon">
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
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        type="button"
        class="toggle-visibility"
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
