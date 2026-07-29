import { ref, reactive, computed, onMounted } from 'vue'
import { userService } from '@/services/userService'
import { extractErrorMessage } from '@/utils/errors'
import type { DirectoryGenerationGroup } from '@/types/user'

// Stable keys for collapse/expand tracking — generation/class names can repeat or be null.
function generationKey(generation: string | null): string {
  return generation ?? '__unassigned__'
}

function classKey(generation: string | null, className: string | null): string {
  return `${generationKey(generation)}::${className ?? '__unassigned__'}`
}

export function useStudentDirectory() {
  // ── List State ───────────────────────────────────────
  const generations = ref<DirectoryGenerationGroup[]>([])
  const totalStudents = ref(0)
  const loading = ref(true)
  const errorMsg = ref('')
  const search = ref('')

  // ── Expand / Collapse State ──────────────────────────
  // Collapsed sets — everything is expanded by default, so we only track what's hidden.
  const collapsedGenerations = reactive(new Set<string>())
  const collapsedClasses = reactive(new Set<string>())

  function isGenerationExpanded(generation: string | null): boolean {
    return !collapsedGenerations.has(generationKey(generation))
  }

  function toggleGeneration(generation: string | null): void {
    const key = generationKey(generation)
    if (collapsedGenerations.has(key)) collapsedGenerations.delete(key)
    else collapsedGenerations.add(key)
  }

  function isClassExpanded(generation: string | null, className: string | null): boolean {
    return !collapsedClasses.has(classKey(generation, className))
  }

  function toggleClass(generation: string | null, className: string | null): void {
    const key = classKey(generation, className)
    if (collapsedClasses.has(key)) collapsedClasses.delete(key)
    else collapsedClasses.add(key)
  }

  function expandAll(): void {
    collapsedGenerations.clear()
    collapsedClasses.clear()
  }

  function collapseAll(): void {
    for (const group of generations.value) {
      collapsedGenerations.add(generationKey(group.generation))
      for (const cls of group.classes) {
        collapsedClasses.add(classKey(group.generation, cls.class_name))
      }
    }
  }

  // While searching, auto-expand everything so matches are always visible.
  function expandForSearch(): void {
    collapsedGenerations.clear()
    collapsedClasses.clear()
  }

  // ── Search & Fetch ───────────────────────────────────
  let searchTimeout: ReturnType<typeof setTimeout> | undefined

  function onSearchDebounced(): void {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => fetchDirectory(), 350)
  }

  async function fetchDirectory(): Promise<void> {
    loading.value = true
    errorMsg.value = ''

    try {
      const result = await userService.getStudentDirectory(search.value.trim() || undefined)
      generations.value = result.generations
      totalStudents.value = result.total_students
      if (search.value.trim()) expandForSearch()
    } catch (err) {
      errorMsg.value = extractErrorMessage(err, 'Failed to load the student directory.')
      generations.value = []
      totalStudents.value = 0
    } finally {
      loading.value = false
    }
  }

  const totalClasses = computed(() =>
    generations.value.reduce((sum, g) => sum + g.classes.length, 0),
  )

  const isEmpty = computed(() => !loading.value && generations.value.length === 0)

  onMounted(() => fetchDirectory())

  return {
    generations,
    totalStudents,
    totalClasses,
    loading,
    errorMsg,
    search,
    isEmpty,
    onSearchDebounced,
    fetchDirectory,
    isGenerationExpanded,
    toggleGeneration,
    isClassExpanded,
    toggleClass,
    expandAll,
    collapseAll,
  }
}
