<template>
  <div class="mb-5 flex items-center justify-between">
    <h1>Leave Requests</h1>
    <button
      v-if="showNewButton"
      class="flex items-center gap-1.5 rounded-md border-none bg-[#f5a623] px-4 py-2.5 text-sm font-semibold text-white cursor-pointer hover:bg-[#e09510]"
      @click="$emit('new')"
    >
      <Plus :size="16" />
      New Request
    </button>
  </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

defineProps({
  showNewButton: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['new'])
</script>
