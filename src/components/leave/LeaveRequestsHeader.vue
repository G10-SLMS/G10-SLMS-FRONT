<template>
  <div class="header-row">
    <h1>Leave Requests</h1>
    <button v-if="showNewButton" class="new-btn" @click="$emit('new')">
      <Plus :size="16" />
      New Request
    </button>
  </div>
</template>

<script setup>
import { Plus } from 'lucide-vue-next'

defineProps({
  showNewButton: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['new'])
</script>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.new-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f97316;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.new-btn:hover {
  background: #ea580c;
}
</style>
