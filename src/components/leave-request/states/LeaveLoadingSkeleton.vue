<template>
  <div class="animate-pulse p-6">
    <div
      v-for="n in rows"
      :key="n"
      class="grid grid-cols-[50px_1fr_1.4fr_1.4fr_50px_1fr_90px_110px] items-center gap-3 border-b border-slate-100 py-4 last:border-none"
    >
      <div class="h-4 w-10 rounded bg-slate-200"></div>
      <div class="h-4 w-20 rounded bg-slate-200"></div>
      <div class="h-4 w-24 rounded bg-slate-200"></div>
      <div class="h-4 w-24 rounded bg-slate-200"></div>
      <div class="h-4 w-8 rounded bg-slate-200"></div>
      <div class="h-4 w-24 rounded bg-slate-200"></div>
      <div class="h-4 w-16 rounded-full bg-slate-200"></div>
      <div class="h-4 w-20 rounded bg-slate-200"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 4 })
</script>
