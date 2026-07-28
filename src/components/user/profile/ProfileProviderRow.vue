<template>
  <div class="flex items-center justify-between border-b border-slate-100 py-2.5 last:border-none">
    <div class="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
      <svg viewBox="0 0 24 24" class="h-5 w-5"><slot name="icon" /></svg>
      <span>{{ name }}</span>
    </div>
    <span
      class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
      :class="linked ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'"
    >
      {{ linked ? 'Connected' : 'Not connected' }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  linked: boolean
}>()
</script>
