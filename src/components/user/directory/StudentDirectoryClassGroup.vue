<template>
  <div class="overflow-hidden rounded-lg border border-slate-100 bg-slate-50/60">
    <button
      type="button"
      class="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-slate-100"
      :aria-expanded="expanded"
      @click="emit('toggle')"
    >
      <ChevronRight
        class="shrink-0 text-slate-400 transition-transform duration-200"
        :class="{ 'rotate-90': expanded }"
        :size="15"
        :stroke-width="2"
      />
      <BookOpen :size="15" :stroke-width="1.8" class="shrink-0 text-slate-400" />
      <span class="flex-1 truncate text-[13px] font-semibold text-slate-700">
        {{ classGroup.class_name ?? 'Unassigned' }}
      </span>
      <span class="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
        {{ classGroup.student_count }} {{ classGroup.student_count === 1 ? 'student' : 'students' }}
      </span>
    </button>

    <div
      class="grid overflow-hidden transition-[grid-template-rows] duration-200 ease-in-out"
      :style="{ gridTemplateRows: expanded ? '1fr' : '0fr' }"
    >
      <div class="min-h-0">
        <div class="grid grid-cols-1 gap-2 border-t border-slate-100 p-2.5 sm:grid-cols-2 xl:grid-cols-3">
          <button
            v-for="student in classGroup.students"
            :key="student.id"
            type="button"
            class="flex items-center gap-2.5 rounded-md border border-slate-100 bg-white p-2 text-left transition-colors hover:border-slate-200 hover:bg-slate-50"
            @click="emit('select', student)"
          >
            <img
              v-if="student.avatar_url"
              :src="student.avatar_url"
              :alt="student.name"
              class="h-8 w-8 shrink-0 rounded-full object-cover"
            />
            <span
              v-else
              :class="['flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white', getAvatarColor(student.name)]"
            >
              {{ getInitials(student.name) }}
            </span>
            <div class="min-w-0">
              <p class="m-0 truncate text-[13px] font-medium text-slate-900">{{ student.name }}</p>
              <p class="m-0 truncate text-[11px] text-slate-500">
                {{ formatStudentId(student.student_id) || student.email }}
              </p>
            </div>
          </button>

          <p v-if="classGroup.students.length === 0" class="col-span-full px-1 py-2 text-[13px] text-slate-400">
            No students in this class.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, BookOpen } from 'lucide-vue-next'
import { getInitials, getAvatarColor } from '@/utils/initials'
import { formatStudentId } from '@/utils/formatters'
import type { DirectoryClassGroup, DirectoryStudent } from '@/types/user'

defineProps<{
  classGroup: DirectoryClassGroup
  expanded: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'select', student: DirectoryStudent): void
}>()
</script>
