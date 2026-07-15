<template>
  <Transition
    enter-active-class="transition-all duration-200 ease-out"
    leave-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0 -translate-y-1.5"
    leave-to-class="opacity-0 -translate-y-1.5"
  >
    <div
      v-if="message"
      class="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700"
    >
      <AlertCircle :size="16" class="shrink-0" />
      <span class="flex-1">{{ message }}</span>
      <button class="rounded p-0.5 opacity-70 transition hover:opacity-100" @click="$emit('close')">
        <X :size="14" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { AlertCircle, X } from 'lucide-vue-next'

defineProps<{
  message: string
}>()

defineEmits<{
  close: []
}>()
</script>
