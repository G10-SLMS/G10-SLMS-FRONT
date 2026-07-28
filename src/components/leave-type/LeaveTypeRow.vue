<template>
  <tr class="border-b border-slate-100 last:border-none hover:bg-slate-50/60">
    <td class="px-2 py-4 text-left text-sm">
      <div class="flex items-center gap-2 font-semibold text-slate-900">
        <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
          <FileText :size="14" :stroke-width="2" />
        </span>
        {{ leaveType.name }}
        <span class="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">{{ leaveType.code }}</span>
      </div>
      <div v-if="leaveType.description" class="mt-1 pl-9 text-xs text-slate-400">{{ leaveType.description }}</div>
    </td>
    <td class="px-2 py-4 text-left text-sm text-slate-700">{{ leaveType.max_days_per_year }} days</td>
    <td class="px-2 py-4 text-left text-sm text-slate-700">{{ leaveType.requires_attachment ? 'Yes' : 'No' }}</td>
    <td class="px-2 py-4 text-left text-sm">
      <span
        class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
        :class="leaveType.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-current" />
        {{ leaveType.is_active ? 'Active' : 'Inactive' }}
      </span>
    </td>
    <td class="px-2 py-4 text-left text-sm">
      <div class="flex gap-1.5">
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
          aria-label="Edit leave type"
          @click="emit('edit')"
        >
          <Pencil :size="14" :stroke-width="2" />
        </button>
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
          :class="leaveType.is_active ? 'text-green-600' : 'text-red-600'"
          aria-label="Toggle status"
          @click="emit('toggle')"
        >
          <Power :size="14" :stroke-width="2" />
        </button>
        <button
          v-if="canDelete"
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-red-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          aria-label="Remove leave type"
          @click="emit('remove')"
        >
          <Trash2 :size="14" :stroke-width="2" />
        </button>
      </div>
    </td>
  </tr>
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
