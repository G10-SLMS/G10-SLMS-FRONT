<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
    <button
      type="button"
      class="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50"
      :aria-expanded="expanded"
      @click="emit('toggle')"
    >
      <ChevronDown
        class="shrink-0 text-slate-400 transition-transform duration-200"
        :class="{ '-rotate-90': !expanded }"
        :size="18"
        :stroke-width="2"
      />
      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Layers :size="16" :stroke-width="1.8" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="m-0 truncate text-sm font-bold text-slate-900">
          {{ generationGroup.generation ?? 'Unassigned Generation' }}
        </p>
        <p class="m-0 text-[12px] text-slate-500">
          {{ generationGroup.classes.length }} {{ generationGroup.classes.length === 1 ? 'class' : 'classes' }}
        </p>
      </div>
      <span class="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
        {{ generationGroup.student_count }} {{ generationGroup.student_count === 1 ? 'student' : 'students' }}
      </span>
    </button>

    <div
      class="grid overflow-hidden transition-[grid-template-rows] duration-200 ease-in-out"
      :style="{ gridTemplateRows: expanded ? '1fr' : '0fr' }"
    >
      <div class="min-h-0">
        <div class="flex flex-col gap-2 border-t border-slate-100 p-3">
          <StudentDirectoryClassGroup
            v-for="classGroup in generationGroup.classes"
            :key="classGroup.class_name ?? '__unassigned__'"
            :class-group="classGroup"
            :expanded="isClassExpanded(classGroup.class_name)"
            @toggle="emit('toggle-class', classGroup.class_name)"
            @select="(student) => emit('select', student)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, Layers } from 'lucide-vue-next'
import StudentDirectoryClassGroup from '@/components/user/StudentDirectoryClassGroup.vue'
import type { DirectoryGenerationGroup, DirectoryStudent } from '@/types/user'

const props = defineProps<{
  generationGroup: DirectoryGenerationGroup
  expanded: boolean
  isClassExpandedFn: (generation: string | null, className: string | null) => boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'toggle-class', className: string | null): void
  (e: 'select', student: DirectoryStudent): void
}>()

function isClassExpanded(className: string | null): boolean {
  return props.isClassExpandedFn(props.generationGroup.generation, className)
}
</script>
