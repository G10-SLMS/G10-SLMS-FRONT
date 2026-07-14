<template>
  <nav class="mb-8 flex border-b border-gray-200">
    <RouterLink
      to="/login"
      class="flex-1 border-b-[2px] pb-3.5 text-center text-base font-semibold no-underline transition-colors duration-200"
      :class="active === 'login' ? 'border-[#f5a623] text-[#f5a623]' : 'border-transparent text-[#0a1628]/50 hover:text-[#0a1628]'"
    >Sign In</RouterLink>
    <RouterLink
      to="/register"
      class="flex-1 border-b-[2px] pb-3.5 text-center text-base font-semibold no-underline transition-colors duration-200"
      :class="active === 'register' ? 'border-[#f5a623] text-[#f5a623]' : 'border-transparent text-[#0a1628]/50 hover:text-[#0a1628]'"
    >Create Account</RouterLink>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  active: 'login' | 'register'
}>()
</script>
