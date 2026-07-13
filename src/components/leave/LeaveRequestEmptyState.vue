<template>
  <div class="empty-state">
    <Inbox :size="36" :stroke-width="1.5" />
    <p>No leave requests yet.</p>
  </div>
</template>

<script setup>
import { Inbox } from 'lucide-vue-next'
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px 20px;
  color: #9ca3af;
  text-align: center;
}
</style>
