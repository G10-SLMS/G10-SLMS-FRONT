<script setup lang="ts">
defineProps<{
  active: 'login' | 'register'
}>()
</script>

<template>
  <nav class="mb-8 flex border-b border-gray-200">
    <RouterLink
      to="/login"
      class="flex-1 border-b-[1.5px] pb-3.5 text-center text-base font-semibold no-underline transition-colors duration-200"
      :class="active === 'login' ? 'border-blue-600 text-blue-600' : 'border-transparent text-[#34373b] hover:text-gray-600'"
    >Sign In</RouterLink>
    <RouterLink
      to="/register"
      class="flex-1 border-b-[1.5px] pb-3.5 text-center text-base font-semibold no-underline transition-colors duration-200"
      :class="active === 'register' ? 'border-blue-600 text-blue-600' : 'border-transparent text-[#34373b] hover:text-gray-600'"
    >Create Account</RouterLink>
  </nav>
</template>
