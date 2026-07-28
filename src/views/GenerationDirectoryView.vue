<template>
  <div class="max-w-full">
    <RouterLink
      to="/student-directory"
      class="mb-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 no-underline hover:text-blue-600"
    >
      <ArrowLeft :size="16" />
      Back to Student Directory
    </RouterLink>

    <div
      v-if="store.errorMsg"
      class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ store.errorMsg }}
    </div>

    <div
      v-if="store.loading && !store.loaded"
      class="h-8 w-64 animate-pulse rounded bg-slate-100"
    />

    <template v-else-if="generationGroup">
      <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex items-center gap-3">
          <span
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"
          >
            <Layers :size="20" :stroke-width="1.8" />
          </span>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ generationGroup.generation ?? 'Unassigned Generation' }}
            </h1>
            <p class="mt-1 text-[13px] text-gray-500">
              {{ generationGroup.classes.length }}
              {{ generationGroup.classes.length === 1 ? 'class' : 'classes' }} ·
              {{ generationGroup.student_count }}
              {{ generationGroup.student_count === 1 ? 'student' : 'students' }}
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-[10px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 class="m-0 text-base">Classes</h2>
          <select
            v-model="selectedClass"
            class="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2 text-[13px] text-gray-700 outline-none focus:border-blue-600"
          >
            <option value="">All Classes</option>
            <option v-for="cls in classOptions" :key="cls" :value="cls">{{ cls }}</option>
          </select>
        </div>

        <div
          v-if="filteredClasses.length === 0"
          class="flex flex-col items-center justify-center gap-2 py-14 text-center"
        >
          <Users :size="28" :stroke-width="1.5" class="text-gray-300" />
          <p class="m-0 text-sm font-medium text-gray-600">No students found</p>
          <p class="m-0 text-[13px] text-gray-400">
            {{ selectedClass ? 'Try a different filter.' : 'This generation has no classes yet.' }}
          </p>
        </div>

        <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <DirectoryClassCard
            v-for="cls in filteredClasses"
            :key="cls.class_name ?? '__unassigned__'"
            :class-group="cls"
            :generation="generationGroup.generation"
          />
        </div>
      </div>
    </template>

    <div v-else class="flex flex-col items-center justify-center gap-2 py-20 text-center">
      <Layers :size="28" :stroke-width="1.5" class="text-gray-300" />
      <p class="m-0 text-sm font-medium text-gray-600">Generation not found</p>
      <RouterLink
        to="/student-directory"
        class="text-[13px] font-semibold text-blue-600 no-underline hover:underline"
      >
        Back to Student Directory
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft, Layers, Users } from 'lucide-vue-next';
import DirectoryClassCard from '@/components/user/DirectoryClassCard.vue';
import { useStudentDirectoryStore } from '@/stores/studentDirectory';
import { fromSlug } from '@/utils/slug';

const route = useRoute();
const store = useStudentDirectoryStore();
const selectedClass = ref('');

const generationParam = computed(() => fromSlug(route.params.generation as string));
const generationGroup = computed(() => store.findGeneration(generationParam.value));

// Distinct class names within this generation, for the filter dropdown.
const classOptions = computed(() => {
  if (!generationGroup.value) return [];
  const names = new Set<string>();
  for (const cls of generationGroup.value.classes) {
    if (cls.class_name !== null && cls.class_name !== undefined && cls.class_name !== '') {
      names.add(String(cls.class_name));
    }
  }
  return [...names].sort();
});

const filteredClasses = computed(() => {
  if (!generationGroup.value) return [];
  if (!selectedClass.value) return generationGroup.value.classes;
  return generationGroup.value.classes.filter(
    (cls) => cls.class_name !== null && String(cls.class_name) === selectedClass.value,
  );
});

onMounted(() => store.fetchDirectory(true));
</script>
