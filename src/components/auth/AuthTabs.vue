<script setup lang="ts">
defineProps<{
  active: 'login' | 'register'
}>()
</script>

<template>
  <nav class="auth-tabs">
    <RouterLink to="/login" class="auth-tab" :class="{ active: active === 'login' }">Sign In</RouterLink>
    <RouterLink to="/register" class="auth-tab" :class="{ active: active === 'register' }">Create Account</RouterLink>
  </nav>
</template>
