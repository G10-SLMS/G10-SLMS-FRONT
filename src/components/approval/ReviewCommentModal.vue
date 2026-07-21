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
        @keydown.escape="handleClose"
      >
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          leave-active-class="transition-all duration-150 ease-in"
          enter-from-class="scale-95 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-95 opacity-0"
        >
          <div
            v-if="open"
            class="w-full max-w-[460px] overflow-hidden rounded-2xl bg-white shadow-2xl"
            role="dialog"
            @keydown.escape="handleClose"
            aria-modal="true"
            :aria-label="title"
          >
            <!-- Header -->
            <div class="flex items-start gap-3.5 p-6 pb-0">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                :class="mode === 'approve' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'"
              >
                <component :is="iconComponent" :size="22" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="m-0 text-lg font-bold text-slate-900">{{ title }}</h3>
                <p class="m-0 mt-0.5 text-[13px] text-slate-500">
                  {{ mode === 'approve' ? 'This action will approve the leave request.' : 'This action cannot be undone.' }}
                </p>
              </div>
              <button
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                :disabled="submitting"
                @click="handleClose"
                aria-label="Close"
              >
                <X :size="18" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-6">
              <p v-if="studentName" class="mb-4 text-sm text-slate-600">
                {{ mode === 'approve' ? 'Approving' : 'Rejecting' }} request from
                <strong class="text-slate-900">{{ studentName }}</strong>
              </p>

              <label class="mb-1.5 block text-[13px] font-semibold text-slate-700" for="review-note">
                {{ mode === 'approve' ? 'Note (optional)' : 'Reason for rejection' }}
                <span v-if="mode === 'reject'" class="text-red-500">*</span>
              </label>

              <textarea
                id="review-note"
                ref="textareaRef"
                v-model="note"
                :placeholder="placeholder"
                :maxlength="maxLength"
                rows="4"
                :class="[
                  'w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400',
                  textareaClasses,
                ]"
                @keydown.meta.enter="handleSubmit"
                @keydown.ctrl.enter="handleSubmit"
                @input="touched = true"
              ></textarea>

              <!-- Footer row -->
              <div class="mt-2 flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <p v-if="showError" class="m-0 text-xs font-medium text-red-600">
                    {{ errorMessage }}
                  </p>
                  <p v-else class="m-0 text-xs text-slate-400">
                    {{ mode === 'approve' ? 'Optional — visible to the student.' : 'Required — visible to the student.' }}
                    <span class="hidden sm:inline">Press <kbd class="rounded border border-slate-200 bg-slate-50 px-1 py-0.5 font-mono text-[10px] text-slate-500">⌘Enter</kbd> to submit.</span>
                  </p>
                </div>
                <span
                  class="shrink-0 text-xs"
                  :class="note.length >= maxLength ? 'font-semibold text-red-500' : 'text-slate-400'"
                >
                  {{ note.length }}/{{ maxLength }}
                </span>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-2.5 px-6 pb-6">
              <button
                class="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="submitting"
                @click="handleClose"
              >
                Cancel
              </button>
              <button
                :class="[
                  'inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60',
                  mode === 'approve' ? 'bg-emerald-600 hover:enabled:bg-emerald-700' : 'bg-red-600 hover:enabled:bg-red-700',
                ]"
                :disabled="!canSubmit || submitting"
                @click="handleSubmit"
              >
                <span v-if="submitting" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white shrink-0"></span>
                <component v-else :is="iconComponent" :size="16" class="shrink-0" />
                {{ submitting ? 'Submitting...' : submitLabel }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { X, CheckCircle2, XCircle } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    open: boolean
    mode: 'approve' | 'reject'
    studentName?: string
    submitting?: boolean
    minLength?: number
    maxLength?: number
  }>(),
  {
    submitting: false,
    minLength: 5,
    maxLength: 500,
  }
)

const emit = defineEmits<{
  close: []
  confirm: [note: string]
}>()

const note = ref('')
const touched = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// --------------- Computed ---------------

const iconComponent = computed(() => (props.mode === 'approve' ? CheckCircle2 : XCircle))

const title = computed(() =>
  props.mode === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'
)

const submitLabel = computed(() =>
  props.mode === 'approve' ? 'Approve Request' : 'Reject Request'
)

const placeholder = computed(() =>
  props.mode === 'approve'
    ? 'Add a note for the student (optional)...'
    : 'Explain why this request is being rejected...'
)

const isValid = computed(() => {
  if (props.mode === 'approve') return true
  return note.value.trim().length >= props.minLength
})

const showError = computed(() => touched.value && !isValid.value)

const errorMessage = computed(() => {
  if (props.mode !== 'reject') return ''
  if (note.value.trim().length === 0) return 'Please provide a reason for rejecting this request.'
  if (note.value.trim().length < props.minLength) {
    return `Reason must be at least ${props.minLength} characters (${note.value.trim().length}/${props.minLength}).`
  }
  return ''
})

const canSubmit = computed(() => isValid.value)

const textareaClasses = computed(() => {
  if (!showError.value) {
    if (props.mode === 'approve') {
      return 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
    }
    return 'border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-100'
  }
  return 'border-red-400 ring-2 ring-red-100'
})

// --------------- Lifecycle ---------------

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      note.value = ''
      touched.value = false
      await nextTick()
      textareaRef.value?.focus()
    }
  }
)

// --------------- Handlers ---------------

function handleClose() {
  if (props.submitting) return
  emit('close')
}

function handleSubmit() {
  touched.value = true
  if (!canSubmit.value) return
  emit('confirm', note.value.trim())
}
</script>

<style scoped>
/* All styling is handled via Tailwind utility classes above */
</style>
