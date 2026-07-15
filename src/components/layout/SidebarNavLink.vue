<template>
  <RouterLink
    :to="to"
    class="relative mx-2 flex w-[calc(100%-16px)] items-center gap-2.5 rounded-md px-5 py-2.5 text-left text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 [&.router-link-active]:bg-cyan-400/10 [&.router-link-active]:text-cyan-500 [&.router-link-active_.nav-icon]:text-cyan-500"
    :class="{ 'justify-center px-3 max-md:justify-start max-md:px-5': collapsed }"
    @click="emit('click')"
    @mouseenter="emit('hover', $event, label)"
    @mouseleave="emit('unhover')"
  >
    <component :is="icon" class="nav-icon shrink-0" :size="18" :stroke-width="2" />
    <span
      class="whitespace-nowrap text-sm font-medium"
      :class="{ 'hidden max-md:inline': collapsed }"
    >
      {{ label }}
    </span>
  </RouterLink>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  to: string
  label: string
  icon: Component | string | unknown
  collapsed?: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'hover', event: MouseEvent, label: string): void
  (e: 'unhover'): void
}>()
</script>
