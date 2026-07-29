<template>
  <footer class="border-t border-gray-200 bg-white p-3 text-center text-[13px] text-gray-500 dark:border-gray-700 dark:bg-surface-darker">
    <p>&copy; {{ year }} Student Leave Management System</p>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const year = computed(() => new Date().getFullYear())
</script>
