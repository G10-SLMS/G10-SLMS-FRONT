<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-white/45 p-4"
      @click.self="emit('cancel')"
    >
      <div class="w-full max-w-[380px] rounded-xl bg-white p-6 shadow-xl">
        <div class="mb-4 flex items-center gap-3">
          <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <TriangleAlert :size="20" :stroke-width="2" />
          </span>
          <h2 class="text-base font-semibold text-slate-900">{{ title }}</h2>
        </div>

        <p class="mb-5 text-sm text-slate-500">{{ message }}</p>

        <div class="flex justify-end gap-2.5">
          <button
            type="button"
            class="rounded-md bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
            @click="emit('cancel')"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:enabled:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="loading"
            @click="emit('confirm')"
          >
            {{ loading ? 'Deleting…' : confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { TriangleAlert } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    open: boolean
    title?: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    loading?: boolean
  }>(),
  {
    title: 'Are you sure?',
    message: 'This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    loading: false,
  },
)

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>
