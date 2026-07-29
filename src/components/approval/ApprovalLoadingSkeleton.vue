<template>
  <tr v-for="n in rows" :key="n" class="animate-pulse border-b border-slate-100 last:border-none">
    <td class="px-4 py-3.5 align-middle">
      <div class="flex items-center gap-2.5">
        <div class="h-[30px] w-[30px] shrink-0 rounded-full bg-slate-200"></div>
        <div class="h-4 w-24 rounded bg-slate-200"></div>
      </div>
    </td>
    <td class="px-4 py-3.5 align-middle"><div class="h-4 w-20 rounded bg-slate-200"></div></td>
    <td class="px-4 py-3.5 align-middle"><div class="h-4 w-20 rounded bg-slate-200"></div></td>
    <td class="px-4 py-3.5 align-middle"><div class="h-4 w-20 rounded bg-slate-200"></div></td>
    <td class="px-4 py-3.5 align-middle"><div class="h-4 w-32 rounded bg-slate-200"></div></td>
    <td class="px-4 py-3.5 align-middle"><div class="h-5 w-16 rounded-full bg-slate-200"></div></td>
    <td class="px-4 py-3.5 align-middle">
      <div class="flex gap-2">
        <div class="h-7 w-16 rounded-md bg-slate-200"></div>
        <div class="h-7 w-20 rounded-md bg-slate-200"></div>
        <div class="h-7 w-16 rounded-md bg-slate-200"></div>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 4 })
</script>
