<template>
  <div class="flex flex-col items-center justify-center gap-4 px-5 py-20">
    <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
      <AlertCircle :size="24" class="text-red-500" />
    </div>
    <p class="text-sm text-gray-600 font-medium">{{ message }}</p>
    <button
      class="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-600 active:scale-[0.98]"
      @click="$emit('retry')"
    >
      Try again
    </button>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'

defineOptions({ name: 'CalendarErrorState' })

defineProps<{
  message: string
}>()

defineEmits<{
  retry: []
}>()
</script>
