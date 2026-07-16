<template>
  <nav class="mb-8 flex border-b border-gray-200">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.id"
      :to="tab.path"
      class="flex-1 border-b-2 pb-3.5 text-center text-base font-semibold transition-colors duration-200"
      :class="
        active === tab.id
          ? 'border-[#f5a623] text-[#f5a623]'
          : 'border-transparent text-slate-400 hover:text-slate-800'
      "
    >
      {{ tab.label }}
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  active: 'login' | 'register'
}>()

const tabs = [
  { id: 'login', path: '/login', label: 'Sign In' },
  { id: 'register', path: '/register', label: 'Create Account' }
] as const
</script>
