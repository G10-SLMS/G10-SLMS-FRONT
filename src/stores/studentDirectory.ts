import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { userService } from '@/services/Userservice'
import { extractErrorMessage } from '@/utils/errors'
import type { DirectoryGenerationGroup, DirectoryClassGroup } from '@/types/user'

export const useStudentDirectoryStore = defineStore('studentDirectory', () => {
  // ── State ────────────────────────────────────────────
  const generations = ref<DirectoryGenerationGroup[]>([])
  const totalStudents = ref(0)
  const loading = ref(false)
  const loaded = ref(false)
  const errorMsg = ref('')

  const totalClasses = computed(() =>
    generations.value.reduce((sum, group) => sum + group.classes.length, 0),
  )

  // ── Fetch (cached — pass force to bypass) ────────────
  async function fetchDirectory(force = false): Promise<void> {
    if (loaded.value && !force) return

    loading.value = true
    errorMsg.value = ''

    try {
      const result = await userService.getStudentDirectory()
      generations.value = result.generations
      totalStudents.value = result.total_students
      loaded.value = true
    } catch (err) {
      errorMsg.value = extractErrorMessage(err, 'Failed to load the student directory.')
      generations.value = []
      totalStudents.value = 0
    } finally {
      loading.value = false
    }
  }

  // ── Lookups for drill-down pages ──────────────────────
  // Compares loosely on purpose: the route param is always a decoded string,
  // but the API may send generation/class_name back as a number in some cases —
  // strict `===` would silently miss a real match in that case.
  function matchesKey(value: string | number | null, target: string | null): boolean {
    if (target === null || value === null || value === undefined) return value === target
    return String(value) === target
  }

  function findGeneration(generation: string | null): DirectoryGenerationGroup | undefined {
    return generations.value.find((g) => matchesKey(g.generation, generation))
  }

  function findClass(generation: string | null, className: string | null): DirectoryClassGroup | undefined {
    return findGeneration(generation)?.classes.find((c) => matchesKey(c.class_name, className))
  }

  return {
    generations,
    totalStudents,
    totalClasses,
    loading,
    loaded,
    errorMsg,
    fetchDirectory,
    findGeneration,
    findClass,
  }
})
