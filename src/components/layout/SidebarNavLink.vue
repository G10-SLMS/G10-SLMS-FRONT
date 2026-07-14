<template>
  <RouterLink
    :to="to"
    class="relative mx-2 flex w-[calc(100%-16px)] items-center gap-2.5 rounded-md px-5 py-2.5 text-left font-inherit text-slate-500 no-underline transition-colors hover:bg-slate-100 hover:text-slate-900 [&.router-link-active]:bg-blue-50 [&.router-link-active]:text-blue-600 [&.router-link-active_.nav-icon]:text-blue-600 [@media(min-width:769px)_and_(max-width:1024px)]:!justify-center [@media(min-width:769px)_and_(max-width:1024px)]:!px-3"
    :class="collapsed ? 'justify-center px-3 max-md:!justify-start max-md:!px-5' : ''"
    @click="$emit('click')"
    @mouseenter="(e: MouseEvent) => $emit('hover', e, label)"
    @mouseleave="$emit('unhover')"
  >
    <component :is="icon" class="nav-icon shrink-0" :size="18" :stroke-width="2" />
    <span
      class="whitespace-nowrap text-sm font-medium [@media(min-width:769px)_and_(max-width:1024px)]:!hidden"
      :class="collapsed ? 'hidden max-md:!inline' : ''"
    >{{ label }}</span>
  </RouterLink>
</template>

<script setup lang="ts">
defineProps<{
  to: string
  label: string
  icon: unknown
  collapsed?: boolean
}>()

defineEmits<{
  click: []
  hover: [event: MouseEvent, label: string]
  unhover: []
}>()
</script>
