<script setup lang="ts">
defineProps<{
  id: string
  label: string
  modelValue: string
  required?: boolean
}>()

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
      <select
        :id="id"
        :value="modelValue"
        :required="required"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <slot />
      </select>
    </div>
  </div>
</template>
