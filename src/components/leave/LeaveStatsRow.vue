<template>
  <div class="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
    <div
      v-for="s in stats"
      :key="s.label"
      class="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
    >
      <div
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12"
        :style="{ background: s.bg, color: s.fg }"
      >
        <component :is="s.icon" :size="20" />
      </div>
      <div class="flex flex-col gap-0.5">
        <span class="text-xl font-extrabold leading-none text-slate-900 sm:text-2xl">{{ s.count }}</span>
        <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">{{ s.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

type Stat = {
  icon: Component
  count: number
  label: string
  bg: string
  fg: string
}

defineProps<{ stats: Stat[] }>()
</script>
