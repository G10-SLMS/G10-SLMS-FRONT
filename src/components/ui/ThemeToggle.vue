<template>
  <button
    type="button"
    class="relative flex items-center justify-center rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
    :title="tooltipLabel"
    @click="theme.toggle()"
  >
    <!-- Sun icon (light mode) -->
    <Sun
      v-if="theme.mode === 'light'"
      :size="18"
      :stroke-width="1.8"
    />
    <!-- Moon icon (dark mode) -->
    <Moon
      v-else
      :size="18"
      :stroke-width="1.8"
    />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'

const theme = useThemeStore()

const tooltipLabel = computed(() =>
  theme.mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode',
)
</script>
