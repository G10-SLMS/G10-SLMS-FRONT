<template>
  <RouterLink
    :to="`/student-directory/${toSlug(generation)}/${toSlug(classGroup.class_name)}`"
    class="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 no-underline shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md"
  >
    <div class="flex items-start justify-between">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
        <BookOpen :size="18" :stroke-width="1.8" />
      </span>
      <ChevronRight
        :size="18"
        :stroke-width="2"
        class="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-500"
      />
    </div>

    <div class="min-w-0">
      <p class="m-0 truncate text-base font-bold text-slate-900">
        {{ classGroup.class_name ?? 'Unassigned Class' }}
      </p>
      <p class="m-0 mt-0.5 truncate text-[13px] text-slate-500">
        {{ classGroup.student_count }} {{ classGroup.student_count === 1 ? 'student' : 'students' }}
      </p>
    </div>

    <div class="mt-auto flex -space-x-2 border-t border-slate-100 pt-3">
      <template v-for="student in (classGroup.students ?? []).slice(0, 5)" :key="student.id">
        <img
          v-if="student.avatar_url"
          :src="student.avatar_url"
          :alt="student.name"
          class="h-7 w-7 shrink-0 rounded-full border-2 border-white object-cover"
        />
        <span
          v-else
          :class="['flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-white', getAvatarColor(student.name)]"
        >
          {{ getInitials(student.name) }}
        </span>
      </template>
      <span
        v-if="(classGroup.students?.length ?? 0) > 5"
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-semibold text-slate-500"
      >
        +{{ (classGroup.students?.length ?? 0) - 5 }}
      </span>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { BookOpen, ChevronRight } from 'lucide-vue-next'
import { toSlug } from '@/utils/slug'
import { getInitials, getAvatarColor } from '@/utils/initials'
import type { DirectoryClassGroup } from '@/types/user'

defineProps<{
  classGroup: DirectoryClassGroup
  generation: string | null
}>()
</script>
