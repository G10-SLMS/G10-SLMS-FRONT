<template>
  <div class="max-w-full">
    <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Student Directory</h1>
        <p class="mt-1 text-[13px] text-gray-500">Browse students by generation and class</p>
      </div>
    </div>

    <div class="mb-5 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
      <template v-if="loading">
        <StatCardSkeleton v-for="n in 3" :key="n" />
      </template>
      <template v-else>
        <StatCard
          :icon="GraduationCap"
          label="Total Students"
          :value="store.totalStudents"
          color="blue"
        />
        <StatCard
          :icon="Layers"
          label="Generations"
          :value="store.generations.length"
          color="green"
        />
        <StatCard :icon="BookOpen" label="Classes" :value="store.totalClasses" color="amber" />
      </template>
    </div>

    <div
      v-if="store.errorMsg"
      class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ store.errorMsg }}
    </div>

    <div class="rounded-[10px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="m-0 text-base">Generations</h2>
        <div class="flex flex-wrap items-center gap-2">
          <select
            v-model="selectedGeneration"
            class="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2 text-[13px] text-gray-700 outline-none focus:border-blue-600"
          >
            <option value="">All Generations</option>
            <option v-for="gen in generationOptions" :key="gen" :value="gen">{{ gen }}</option>
          </select>
          <div
            class="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2 text-gray-500"
          >
            <Search :size="15" :stroke-width="1.8" />
            <input
              v-model="search"
              type="text"
              placeholder="Search by generation"
              class="w-[220px] border-none bg-transparent text-[13px] text-gray-900 outline-none max-sm:w-[160px]"
            />
          </div>
        </div>
      </div>

      <div
        v-if="loading"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div
          v-for="n in 4"
          :key="n"
          class="h-[150px] animate-pulse rounded-xl border border-slate-100 bg-slate-50"
          aria-hidden="true"
        />
      </div>

      <div
        v-else-if="filteredGenerations.length === 0"
        class="flex flex-col items-center justify-center gap-2 py-14 text-center"
      >
        <Users :size="28" :stroke-width="1.5" class="text-gray-300" />
        <p class="m-0 text-sm font-medium text-gray-600">No students found</p>
        <p class="m-0 text-[13px] text-gray-400">
          {{ search || selectedGeneration ? 'Try a different search term or filter.' : 'Students will appear here once added.' }}
        </p>
      </div>

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <DirectoryGenerationCard
          v-for="group in filteredGenerations"
          :key="group.generation ?? '__unassigned__'"
          :group="group"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { GraduationCap, Layers, BookOpen, Search, Users } from 'lucide-vue-next';
import StatCard from '@/components/ui/StatCard.vue';
import StatCardSkeleton from '@/components/shared/StatCardSkeleton.vue';
import DirectoryGenerationCard from '@/components/user/DirectoryGenerationCard.vue';
import { useStudentDirectoryStore } from '@/stores/studentDirectory';
import { filterGenerations } from '@/utils/studentDirectoryFilter';

const store = useStudentDirectoryStore();
const search = ref('');
const selectedGeneration = ref('');

const loading = computed(() => store.loading && !store.loaded);

// Distinct generation names, newest first, for the filter dropdown.
const generationOptions = computed(() =>
  store.generations
    .map((g) => g.generation)
    .filter((g): g is string => g !== null && g !== undefined && g !== '')
    .map((g) => String(g))
    .filter((g, index, arr) => arr.indexOf(g) === index)
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true })),
);

const filteredGenerations = computed(() => {
  const searched = filterGenerations(store.generations, search.value);
  if (!selectedGeneration.value) return searched;
  return searched.filter(
    (group) => group.generation !== null && String(group.generation) === selectedGeneration.value,
  );
});

onMounted(() => store.fetchDirectory());
</script>
