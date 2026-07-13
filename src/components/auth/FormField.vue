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
  {
    type: 'text',
  }
)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="form-row">
    <label class="form-label" :for="id">{{ label }}</label>
    <div class="input-wrap">
      <span class="input-icon">
        <slot name="icon" />
      </span>
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :required="required"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <slot name="hint" />
  </div>
</template>
