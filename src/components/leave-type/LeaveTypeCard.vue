<template>
  <div class="flex flex-col gap-3 px-4 py-4">
    <div class="flex items-start gap-2">
      <span class="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
        <FileText :size="15" :stroke-width="2" />
      </span>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-semibold text-slate-900">{{ leaveType.name }}</span>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">{{ leaveType.code }}</span>
        </div>
        <p v-if="leaveType.description" class="mt-1 text-xs text-slate-400">{{ leaveType.description }}</p>
      </div>
      <span
        class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
        :class="leaveType.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-current" />
        {{ leaveType.is_active ? 'Active' : 'Inactive' }}
      </span>
    </div>

    <div class="flex gap-4 pl-10 text-xs text-slate-500">
      <div>
        <span class="block font-mono text-[10px] uppercase tracking-[0.08em] text-slate-400">Max days / year</span>
        <span class="mt-0.5 block text-sm font-medium text-slate-700">{{ leaveType.max_days_per_year }} days</span>
      </div>
      <div>
        <span class="block font-mono text-[10px] uppercase tracking-[0.08em] text-slate-400">Requires attachment</span>
        <span class="mt-0.5 block text-sm font-medium text-slate-700">{{ leaveType.requires_attachment ? 'Yes' : 'No' }}</span>
      </div>
    </div>

    <div class="flex gap-2 pl-10">
      <button
        type="button"
        class="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
        @click="emit('edit')"
      >
        <Pencil :size="14" :stroke-width="2" /> Edit
      </button>
      <button
        type="button"
        class="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
        @click="emit('toggle')"
      >
        <Power :size="14" :stroke-width="2" /> {{ leaveType.is_active ? 'Deactivate' : 'Activate' }}
      </button>
      <button
        v-if="canDelete"
        type="button"
        class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
        aria-label="Remove leave type"
        @click="emit('remove')"
      >
        <Trash2 :size="14" :stroke-width="2" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText, Pencil, Power, Trash2 } from 'lucide-vue-next'
import type { LeaveType } from '@/types/leave'

withDefaults(
  defineProps<{
    leaveType: LeaveType
    canDelete?: boolean
  }>(),
  { canDelete: false },
)

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'toggle'): void
  (e: 'remove'): void
}>()
</script>
