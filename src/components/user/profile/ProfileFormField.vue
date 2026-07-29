<template>
  <div class="flex flex-col gap-1.5" :class="{ 'profile-field-invalid': !!error }">
    <label
      :for="id"
      class="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400"
      >{{ label }}</label
    >
    <slot />
    <p v-if="error" class="text-[12px] text-red-600">{{ error }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ProfileFormField',
  props: {
    id: { type: String, required: true },
    label: { type: String, required: true },
    error: { type: String, default: '' },
  },
});
</script>

<style scoped>
.profile-field-invalid :deep(input),
.profile-field-invalid :deep(select),
.profile-field-invalid :deep(textarea) {
  border-color: rgb(220 38 38) !important;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
}
</style>
