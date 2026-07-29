<template>
  <tr v-for="n in rows" :key="n" aria-hidden="true" class="animate-pulse border-b border-slate-100 last:border-none">
    <td v-for="c in columns" :key="c" class="px-2 py-3.5">
      <div
        class="h-4 rounded bg-slate-200"
        :style="{ width: widthFor(c) }"
      ></div>
    </td>
  </tr>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ rows?: number; columns?: number }>(), {
  rows: 5,
  columns: 5,
})

function widthFor(column: number): string {
  const widths = ['85%', '65%', '50%', '40%', '30%']
  return widths[(column - 1) % widths.length]
}
</script>
