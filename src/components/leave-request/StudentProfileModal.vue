<template>
  <Teleport to="body">
    <div
      v-if="student"
      class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4"
      @click.self="$emit('close')"
    >
      <div class="w-full max-w-[380px] rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
        <div class="mb-4 flex items-center gap-3">
          <img
            v-if="student.avatar?.url"
            :src="student.avatar.url"
            :alt="student.name"
            class="h-14 w-14 shrink-0 rounded-full object-cover"
          />
          <span
            v-else
            :class="['flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white', getAvatarColor(student.name)]"
          >
            {{ getInitials(student.name) }}
          </span>
          <div class="min-w-0">
            <p class="m-0 truncate text-base font-bold text-slate-900">{{ student.name }}</p>
            <p v-if="student.email" class="m-0 truncate text-[13px] text-slate-500">{{ student.email }}</p>
          </div>
        </div>

        <dl class="mb-5 divide-y divide-slate-100 rounded-lg border border-slate-100">
          <div class="flex items-center justify-between px-3.5 py-2.5">
            <dt class="text-xs font-medium text-slate-500">Full Name</dt>
            <dd class="m-0 text-[13px] font-medium text-slate-900">{{ student.name }}</dd>
          </div>
          <div class="flex items-center justify-between px-3.5 py-2.5">
            <dt class="text-xs font-medium text-slate-500">Email</dt>
            <dd class="m-0 truncate text-[13px] font-medium text-slate-900">{{ student.email || '—' }}</dd>
          </div>
          <div class="flex items-center justify-between px-3.5 py-2.5">
            <dt class="text-xs font-medium text-slate-500">Phone</dt>
            <dd class="m-0 truncate text-[13px] font-medium text-slate-900">{{ student.phone || '—' }}</dd>
          </div>
          <div class="flex items-center justify-between px-3.5 py-2.5">
            <dt class="text-xs font-medium text-slate-500">Student ID</dt>
            <dd class="m-0 truncate text-[13px] font-medium text-slate-900">{{ formatStudentId(student.student_id) || '—' }}</dd>
          </div>
          <div class="flex items-center justify-between px-3.5 py-2.5">
            <dt class="text-xs font-medium text-slate-500">Class</dt>
            <dd class="m-0 truncate text-[13px] font-medium text-slate-900">{{ student.class_name || '—' }}</dd>
          </div>
          <div class="flex items-center justify-between px-3.5 py-2.5">
            <dt class="text-xs font-medium text-slate-500">Generation</dt>
            <dd class="m-0 truncate text-[13px] font-medium text-slate-900">{{ student.generation || '—' }}</dd>
          </div>
          <div class="flex items-center justify-between px-3.5 py-2.5">
            <dt class="text-xs font-medium text-slate-500">Province</dt>
            <dd class="m-0 truncate text-[13px] font-medium text-slate-900">{{ student.province || '—' }}</dd>
          </div>
        </dl>

        <div class="flex justify-end gap-2.5">
          <button
            class="rounded-lg border-none bg-slate-100 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-200"
            @click="$emit('close')"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { getInitials, getAvatarColor } from '@/utils/initials'
import { formatStudentId } from '@/utils/formatters'
import type { LeaveRequestUser } from '@/types/leave'

defineProps<{
  student: LeaveRequestUser | null
}>()

defineEmits<{
  close: []
}>()
</script>
