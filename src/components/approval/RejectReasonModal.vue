<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 p-5"
        @click.self="handleClose"
      >
        <div class="w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div class="flex items-start gap-3.5 p-6 pb-0">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <XCircle :size="22" />
            </div>
            <div class="flex-1">
              <h3 class="m-0 text-lg font-bold text-slate-900">Reject Leave Request</h3>
              <p class="m-0 mt-0.5 text-[13px] text-slate-500">
                Please explain why this request is being rejected.
              </p>
            </div>
            <button
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
              @click="handleClose"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="p-6">
            <label class="mb-1.5 block text-[13px] font-semibold text-slate-700">
              Reason for rejection <span class="text-red-500">*</span>
            </label>
            <textarea
              ref="textareaEl"
              v-model="reason"
              rows="3"
              maxlength="500"
              placeholder="e.g. Missing supporting documentation for this leave request."
              class="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
              :class="{ 'border-red-400 ring-2 ring-red-100': showError }"
              @keydown.enter.meta="submit"
            />
            <p v-if="showError" class="mt-1.5 text-xs font-medium text-red-600">
              Please enter at least 5 characters.
            </p>
            <p v-else class="mt-1.5 text-xs text-slate-400">{{ reason.length }}/500 characters</p>
          </div>

          <div class="flex justify-end gap-2.5 px-6 pb-6">
            <button
              class="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              @click="handleClose"
            >
              Cancel
            </button>
            <button
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:enabled:bg-red-700 disabled:opacity-60"
              :disabled="submitting"
              @click="submit"
            >
              <span v-if="submitting" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
              <template v-else>
                <XCircle :size="16" /> Confirm Rejection
              </template>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, XCircle } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  submitting?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [reason: string]
}>()

const reason = ref('')
const showError = ref(false)
const textareaEl = ref<HTMLTextAreaElement | null>(null)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      reason.value = ''
      showError.value = false
      requestAnimationFrame(() => textareaEl.value?.focus())
    }
  },
)

function handleClose() {
  if (props.submitting) return
  emit('close')
}

function submit() {
  const trimmed = reason.value.trim()
  if (trimmed.length < 5) {
    showError.value = true
    return
  }
  showError.value = false
  emit('confirm', trimmed)
}
</script>
