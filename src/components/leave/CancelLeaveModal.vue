<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="cancelTarget"
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 p-5"
        @click.self="emitClose"
      >
        <div class="w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div class="flex items-start gap-3.5 p-6 pb-0">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <AlertTriangle :size="22" />
            </div>
            <div class="flex-1">
              <h3 class="m-0 text-lg font-bold text-slate-900">Cancel Leave Request</h3>
              <p class="m-0 mt-0.5 text-[13px] text-slate-500">
                This will change the status to <strong class="font-semibold">Cancelled</strong>
              </p>
            </div>
            <button
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
              @click="emitClose"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="p-6">
            <div class="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div class="flex items-center justify-between py-1.5 text-[13px]">
                <span class="text-slate-500">Leave Type</span>
                <strong class="font-bold text-slate-900">{{ cancelTarget.leave_type_name }}</strong>
              </div>
              <div class="flex items-center justify-between border-t border-slate-100 py-1.5 text-[13px]">
                <span class="text-slate-500">Date Range</span>
                <strong class="font-bold text-slate-900">
                  {{ formatDate(cancelTarget.start_date) }} — {{ formatDate(cancelTarget.end_date) }}
                </strong>
              </div>
              <div class="flex items-center justify-between border-t border-slate-100 py-1.5 text-[13px]">
                <span class="text-slate-500">Total Days</span>
                <strong class="font-bold text-slate-900">
                  {{ cancelTarget.total_days }} day{{ cancelTarget.total_days !== 1 ? 's' : '' }}
                </strong>
              </div>
            </div>
            <p class="m-0 text-xs leading-relaxed text-slate-400">
              This action cannot be undone. The request will remain in the system with a "Cancelled" status.
            </p>
          </div>

          <div class="flex justify-end gap-2.5 px-6 pb-6">
            <button
              class="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              @click="emitClose"
            >
              Keep Request
            </button>
            <button
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:enabled:bg-red-700 disabled:opacity-60"
              :disabled="cancelling"
              @click="doCancel"
            >
              <span v-if="cancelling" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
              <template v-else>
                <XCircle :size="16" /> Yes, Cancel Request
              </template>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LeaveRequestListItem } from '@/types/leave'
import { AlertTriangle, X, XCircle } from 'lucide-vue-next'

const props = defineProps<{
  cancelTarget: LeaveRequestListItem | null
  cancelling: boolean
  formatDate: (s: string) => string
  doCancel: () => Promise<void>
  emitClose: () => void
}>()

// Destructuring props directly (e.g. `const { cancelTarget } = props`) breaks
// reactivity outside of the compiler-supported reactive-props-destructure
// pattern, so the modal would stop updating after the first render. A
// computed keeps this reactive while still reading fresh values from props.
const cancelTarget = computed(() => props.cancelTarget)
</script>
