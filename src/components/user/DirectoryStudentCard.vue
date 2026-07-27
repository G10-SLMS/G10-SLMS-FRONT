<template>
  <button
    type="button"
    class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
    @click="emit('select', student)"
  >
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
      <p class="m-0 truncate text-sm font-bold text-slate-900">{{ student.name }}</p>
      <p class="m-0 truncate text-[12px] text-slate-500">
        {{ formatStudentId(student.student_id) || student.email }}
      </p>
    </div>
    <ChevronRight :size="16" :stroke-width="2" class="shrink-0 text-slate-300" />
  </button>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { getInitials, getAvatarColor } from '@/utils/initials'
import { formatStudentId } from '@/utils/formatters'
import type { DirectoryStudent } from '@/types/user'

defineProps<{
  student: DirectoryStudent
}>()

const emit = defineEmits<{
  (e: 'select', student: DirectoryStudent): void
}>()
</script>
