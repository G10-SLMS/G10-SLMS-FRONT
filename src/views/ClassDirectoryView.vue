<template>
  <div class="max-w-full">
    <RouterLink
      :to="`/student-directory/${toSlug(generationParam)}`"
      class="mb-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 no-underline hover:text-amber-600"
    >
      <ArrowLeft :size="16" />
      Back to {{ generationParam ?? 'Unassigned Generation' }}
    </RouterLink>

    <div v-if="store.errorMsg" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ store.errorMsg }}
    </div>

    <div v-if="store.loading && !store.loaded" class="h-8 w-64 animate-pulse rounded bg-slate-100" />

    <template v-else-if="classGroup">
      <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex items-center gap-3">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <BookOpen :size="20" :stroke-width="1.8" />
          </span>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ classGroup.class_name ?? 'Unassigned Class' }}
            </h1>
            <p class="mt-1 text-[13px] text-gray-500">
              {{ generationParam ?? 'Unassigned Generation' }} ·
              {{ classGroup.student_count }} {{ classGroup.student_count === 1 ? 'student' : 'students' }}
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-[10px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 class="m-0 text-base">Students</h2>
          <div class="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2 text-gray-500">
            <Search :size="15" :stroke-width="1.8" />
            <input
              v-model="search"
              type="text"
              placeholder="Search by name, email, or student ID"
              class="w-[220px] border-none bg-transparent text-[13px] text-gray-900 outline-none max-sm:w-[160px]"
            />
          </div>
        </div>

        <div v-if="filteredStudents.length === 0" class="flex flex-col items-center justify-center gap-2 py-14 text-center">
          <Users :size="28" :stroke-width="1.5" class="text-gray-300" />
          <p class="m-0 text-sm font-medium text-gray-600">No students found</p>
          <p class="m-0 text-[13px] text-gray-400">
            {{ search ? 'Try a different search term.' : 'This class has no students yet.' }}
          </p>
        </div>

        <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <DirectoryStudentCard
            v-for="student in filteredStudents"
            :key="student.id"
            :student="student"
            @select="selectedStudent = $event"
          />
        </div>
      </div>
    </template>

    <div v-else class="flex flex-col items-center justify-center gap-2 py-20 text-center">
      <BookOpen :size="28" :stroke-width="1.5" class="text-gray-300" />
      <p class="m-0 text-sm font-medium text-gray-600">Class not found</p>
      <RouterLink :to="`/student-directory/${toSlug(generationParam)}`" class="text-[13px] font-semibold text-blue-600 no-underline hover:underline">
        Back to {{ generationParam ?? 'Unassigned Generation' }}
      </RouterLink>
    </div>

    <StudentProfileModal :student="mappedSelectedStudent" @close="selectedStudent = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, BookOpen, Search, Users } from 'lucide-vue-next'
import DirectoryStudentCard from '@/components/user/DirectoryStudentCard.vue'
import StudentProfileModal from '@/components/leave-request/StudentProfileModal.vue'
import { useStudentDirectoryStore } from '@/stores/studentDirectory'
import { fromSlug, toSlug } from '@/utils/slug'
import { filterClasses } from '@/utils/studentDirectoryFilter'
import type { DirectoryStudent } from '@/types/user'
import type { LeaveRequestUser } from '@/types/leave'

const route = useRoute()
const store = useStudentDirectoryStore()
const search = ref('')
const selectedStudent = ref<DirectoryStudent | null>(null)

const generationParam = computed(() => fromSlug(route.params.generation as string))
const classParam = computed(() => fromSlug(route.params.className as string))
const classGroup = computed(() => store.findClass(generationParam.value, classParam.value))

const filteredStudents = computed(() => {
  if (!classGroup.value) return []
  const students = classGroup.value.students ?? []
  if (!search.value.trim()) return students
  const [filtered] = filterClasses([{ ...classGroup.value, students }], search.value)
  return filtered ? filtered.students : []
})

// StudentProfileModal expects LeaveRequestUser's shape (nested avatar, numeric student_id);
// the directory API returns a flatter shape, so we adapt it here for display purposes only.
const mappedSelectedStudent = computed<LeaveRequestUser | null>(() => {
  const student = selectedStudent.value
  if (!student) return null
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    phone: student.phone,
    gender: student.gender,
    student_id: student.student_id as unknown as number | null,
    class_name: student.class_name,
    generation: student.generation,
    province: student.province,
    avatar_id: student.avatar_id,
    avatar: student.avatar_url ? { id: student.avatar_id ?? 0, url: student.avatar_url } : null,
  }
})

// Same reasoning as GenerationDirectoryView: force-refresh so a stale cache
// can't hide a class/student that was just added.
onMounted(() => store.fetchDirectory(true))
</script>
