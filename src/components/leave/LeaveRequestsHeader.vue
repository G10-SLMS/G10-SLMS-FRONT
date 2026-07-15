<template>
  <div class="mb-5 flex items-center justify-between">
    <h1 class="text-xl font-bold text-gray-900">Leave Requests</h1>
    <button
      v-if="showNewButton"
      type="button"
      class="flex items-center gap-1.5 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
      @click="emit('new')"
    >
      <Plus :size="16" />
      New Request
    </button>
  </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    showNewButton?: boolean
  }>(),
  {
    showNewButton: false,
  }
)

const emit = defineEmits<{
  (e: 'new'): void
}>()

</script>
