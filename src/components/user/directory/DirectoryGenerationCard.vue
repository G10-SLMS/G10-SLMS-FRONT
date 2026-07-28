<template>
  <RouterLink
    :to="`/student-directory/${toSlug(group.generation)}`"
    class="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 no-underline shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
  >
    <div class="flex items-start justify-between">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Layers :size="18" :stroke-width="1.8" />
      </span>
      <ChevronRight
        :size="18"
        :stroke-width="2"
        class="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500"
      />
    </div>

    <div class="min-w-0">
      <p class="m-0 truncate text-base font-bold text-slate-900">
        {{ group.generation ?? 'Unassigned Generation' }}
      </p>
      <p class="m-0 mt-0.5 text-[13px] text-slate-500">
        {{ group.classes.length }} {{ group.classes.length === 1 ? 'class' : 'classes' }}
      </p>
    </div>

    <div class="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
      <span class="text-[12px] text-slate-400">Students</span>
      <span class="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
        {{ group.student_count }}
      </span>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { Layers, ChevronRight } from 'lucide-vue-next'
import { toSlug } from '@/utils/slug'
import type { DirectoryGenerationGroup } from '@/types/user'

defineProps<{
  group: DirectoryGenerationGroup
}>()
</script>
