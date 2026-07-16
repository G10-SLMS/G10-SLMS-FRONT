<template>
  <div
    class="flex items-baseline justify-between gap-3 border-b border-dotted border-slate-300 pb-1.5"
  >
    <dt
      class="flex items-center gap-1.5 whitespace-nowrap font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400"
    >
      <component :is="icon" :size="14" />
      {{ label }}
    </dt>
    <dd :class="['text-right text-[13.5px] font-semibold text-slate-900', valueClass]">
      {{ value }}
    </dd>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  label: string;
  icon: Component;
  value: string | number;
  valueClass?: string;
}>();
</script>
