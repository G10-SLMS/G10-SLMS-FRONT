<template>
  <div class="lr-stats">
    <div class="lr-stat-card" v-for="s in stats" :key="s.label">
      <div class="lr-stat-icon" :style="{ background: s.bg, color: s.fg }">
        <component :is="s.icon" :size="20" />
      </div>
      <div class="lr-stat-info">
        <span class="lr-stat-val">{{ s.count }}</span>
        <span class="lr-stat-lbl">{{ s.label }}</span>
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

