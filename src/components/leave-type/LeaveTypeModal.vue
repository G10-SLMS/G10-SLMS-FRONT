<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-white/45 p-4"
      @click.self="emit('cancel')"
    >
      <div class="w-full max-w-[420px] rounded-xl bg-white p-6 shadow-xl">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">
          {{ isEditing ? 'Edit Leave Type' : 'Add Leave Type' }}
        </h2>

        <p v-if="error" class="mb-3.5 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{{ error }}</p>

        <label class="mb-3.5 flex flex-col gap-1.5 text-xs text-gray-700">
          <span>Name <span class="text-red-500">*</span></span>
          <input
            v-model="form.name"
            type="text"
            placeholder="e.g. Sick Leave"
            required
            class="rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10"
          />
        </label>

        <label class="mb-3.5 flex flex-col gap-1.5 text-xs text-gray-700">
          <span>Code <span class="text-red-500">*</span></span>
          <input
            v-model="form.code"
            type="text"
            placeholder="e.g. SICK"
            required
            class="rounded-md border border-gray-200 px-3 py-2.5 text-sm uppercase text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10"
          />
        </label>

        <label class="mb-3.5 flex flex-col gap-1.5 text-xs text-gray-700">
          <span>Description (optional)</span>
          <textarea
            v-model="form.description"
            rows="2"
            class="resize-none rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10"
          />
        </label>

        <label class="mb-3.5 flex flex-col gap-1.5 text-xs text-gray-700">
          <span>Max Days / Year <span class="text-red-500">*</span></span>
          <input
            v-model.number="form.max_days_per_year"
            type="number"
            min="0"
            required
            class="rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10"
          />
        </label>

        <label class="mb-3.5 flex flex-row items-center gap-2 text-xs text-gray-700">
          <input
            v-model="form.requires_attachment"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
          />
          <span>Requires supporting attachment</span>
        </label>

        <label class="mb-3.5 flex flex-row items-center gap-2 text-xs text-gray-700">
          <input
            v-model="form.is_active"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
          />
          <span>Active</span>
        </label>

        <div class="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            class="rounded-md bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            @click="emit('cancel')"
          >
            Cancel
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:enabled:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="saving"
            @click="emit('save')"
          >
            {{ saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Leave Type' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { LeaveTypePayload } from '@/types/leave'

defineProps<{
  open: boolean
  isEditing: boolean
  form: LeaveTypePayload
  saving?: boolean
  error?: string
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'save'): void
}>()
</script>
