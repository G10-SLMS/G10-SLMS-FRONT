<template>
  <div
    class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
    :class="{ 'opacity-60': !student.is_active }"
  >
    <button type="button" class="flex min-w-0 flex-1 items-center gap-3 text-left" @click="emit('select', student)">
      <img
        v-if="student.avatar_url"
        :src="student.avatar_url"
        :alt="student.name"
        class="h-11 w-11 shrink-0 rounded-full object-cover"
      />
      <span
        v-else
        :class="['flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white', getAvatarColor(student.name)]"
      >
        {{ getInitials(student.name) }}
      </span>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5">
          <p class="m-0 truncate text-sm font-bold text-slate-900">{{ student.name }}</p>
          <span
            v-if="!student.is_active"
            class="shrink-0 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600"
          >
            Disabled
          </span>
        </div>
        <p class="m-0 truncate text-[12px] text-slate-500">
          {{ formatStudentId(student.student_id) || student.email }}
        </p>
      </div>
    </button>

    <button
      v-if="canToggleStatus"
      type="button"
      :disabled="toggling"
      class="shrink-0 rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      :class="student.is_active ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'"
      :title="student.is_active ? 'Disable student' : 'Enable student'"
      @click.stop="emit('toggle-status', student)"
    >
      <component :is="student.is_active ? CircleCheck : Ban" :size="16" :stroke-width="1.8" />
    </button>

    <ChevronRight :size="16" :stroke-width="2" class="shrink-0 text-slate-300" @click="emit('select', student)" />
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, Ban, CircleCheck } from 'lucide-vue-next'
import { getInitials, getAvatarColor } from '@/utils/initials'
import { formatStudentId } from '@/utils/formatters'
import type { DirectoryStudent } from '@/types/user'

withDefaults(
  defineProps<{
    student: DirectoryStudent
    canToggleStatus?: boolean
    toggling?: boolean
  }>(),
  {
    canToggleStatus: false,
    toggling: false,
  },
)

const emit = defineEmits<{
  (e: 'select', student: DirectoryStudent): void
  (e: 'toggle-status', student: DirectoryStudent): void
}>()
</script>
