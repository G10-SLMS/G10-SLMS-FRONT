<template>
  <div class="flex flex-col gap-1.5">
    <label
      :for="id"
      class="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400"
      >{{ label }}</label
    >
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ProfileFormField',
  props: {
    id: { type: String, required: true },
    label: { type: String, required: true },
  },
});
</script>
