<template>
  <div>
    <button
      type="button"
      class="relative mx-2 flex w-[calc(100%-16px)] items-center gap-2.5 rounded-md px-5 py-2.5 text-left text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
      :class="{ 'text-cyan-500': isActive }"
      :aria-expanded="expanded"
      @click="toggle"
      @mouseenter="emit('hover', $event, label)"
      @mouseleave="emit('unhover')"
    >
      <component :is="icon" class="nav-icon shrink-0" :class="{ 'text-cyan-500': isActive }" :size="18" :stroke-width="2" />
      <span class="flex-1 whitespace-nowrap text-sm font-medium">{{ label }}</span>
      <ChevronDown
        class="shrink-0 text-slate-400 transition-transform duration-200"
        :class="{ 'rotate-180': expanded }"
        :size="16"
        :stroke-width="2"
      />
    </button>

    <div
      class="grid overflow-hidden transition-[grid-template-rows] duration-200 ease-in-out"
      :style="{ gridTemplateRows: expanded ? '1fr' : '0fr' }"
    >
      <div class="min-h-0">
        <div class="flex flex-col gap-0.5 pb-0.5 pt-0.5">
          <RouterLink
            v-for="child in children"
            :key="child.to"
            :to="child.to"
            class="relative mx-2 flex items-center gap-2.5 rounded-md py-2 pl-[26px] pr-3 text-left text-[13px] text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 [&.router-link-active]:bg-cyan-400/10 [&.router-link-active]:font-semibold [&.router-link-active]:text-cyan-500 [&.router-link-active_.nav-icon]:text-cyan-500"
            @click="emit('click')"
          >
            <component :is="child.icon" class="nav-icon shrink-0" :size="15" :stroke-width="2" />
            <span class="whitespace-nowrap font-medium">{{ child.label }}</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronDown } from 'lucide-vue-next'
import type { Component } from 'vue'

interface ChildItem {
  to: string
  label: string
  icon: Component | string | unknown
}

const props = defineProps<{
  label: string
  icon: Component | string | unknown
  children: ChildItem[]
}>()

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'hover', event: MouseEvent, label: string): void
  (e: 'unhover'): void
}>()

const route = useRoute()

// Group is "active" if the current route matches one of its children.
const isActive = computed(() => props.children.some((child) => route.path.startsWith(child.to)))

// Auto-expand when a child route is active; user can still toggle manually afterward.
const expanded = ref(isActive.value)

watch(isActive, (active) => {
  if (active) expanded.value = true
})

function toggle() {
  expanded.value = !expanded.value
}
</script>
