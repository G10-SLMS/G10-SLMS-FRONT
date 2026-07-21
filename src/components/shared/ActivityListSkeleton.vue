<template>
  <div class="flex flex-col divide-y divide-gray-100">
    <div
      v-for="n in rows"
      :key="n"
      class="flex animate-pulse items-center gap-3 py-3 first:pt-0 last:pb-0"
    >
      <div class="h-9 w-9 shrink-0 rounded-full bg-slate-200"></div>
      <div class="min-w-0 flex-1">
        <div class="mb-2 h-3.5 w-3/5 rounded bg-slate-200"></div>
        <div class="h-3 w-1/4 rounded bg-slate-200"></div>
      </div>
      <div class="h-5 w-16 shrink-0 rounded-full bg-slate-200"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 4 })
</script>
