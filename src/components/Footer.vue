<template>
  <footer class="footer">
    <p>&copy; {{ year }} Student Leave Management System</p>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const year = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  text-align: center;
  padding: 12px;
  font-size: 13px;
  color: #6b7280;
  border-top: 1px solid #e5e7eb;
  background: white;
}
</style>