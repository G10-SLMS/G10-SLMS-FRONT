<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 p-4"
        @click.self="handleCancel"
        @keydown.escape="handleCancel"
      >
        <Transition
          enter-active-class="transition-all duration-150 ease-out"
          leave-active-class="transition-all duration-100 ease-in"
          enter-from-class="scale-95 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-95 opacity-0"
        >
          <div
            v-if="open"
            class="w-full max-w-[380px] rounded-xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Log out"
          >
            <div class="mb-4 flex items-center gap-3">
              <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fdf0dc] text-[#f5a623]">
                <TriangleAlert :size="20" :stroke-width="2" />
              </span>
              <h2 class="text-base font-semibold text-slate-900">Log out</h2>
            </div>

            <p class="mb-5 text-sm text-slate-500">Are you sure you want to log out?</p>

            <div class="flex justify-end gap-2.5">
              <button
                type="button"
                class="rounded-md bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="loading"
                @click="handleCancel"
              >
                Cancel
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-md bg-[#f5a623] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:enabled:bg-[#e09510] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="loading"
                @click="handleConfirm"
              >
                <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white shrink-0"></span>
                {{ loading ? 'Logging out…' : 'Log out' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { TriangleAlert } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    open: boolean
    loading?: boolean
  }>(),
  {
    loading: false,
  }
)

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

function handleCancel() {
  emit('cancel')
}

function handleConfirm() {
  emit('confirm')
}
</script>
