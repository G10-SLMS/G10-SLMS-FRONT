import type { DirectoryGenerationGroup, DirectoryClassGroup, DirectoryStudent } from '@/types/user'

function matchesQuery(student: DirectoryStudent, query: string): boolean {
  return (
    student.name.toLowerCase().includes(query) ||
    student.email.toLowerCase().includes(query) ||
    (student.student_id ?? '').toLowerCase().includes(query)
  )
}

// Filters students within each class, dropping classes left with no matches.
export function filterClasses(classes: DirectoryClassGroup[], query: string): DirectoryClassGroup[] {
  const q = query.trim().toLowerCase()
  if (!q) return classes

  return classes
    .map((cls) => ({
      ...cls,
      students: (cls.students ?? []).filter((student) => matchesQuery(student, q)),
    }))
    .filter((cls) => cls.students.length > 0)
}

// Filters classes (and their students) within each generation, dropping empty generations.
export function filterGenerations(
  generations: DirectoryGenerationGroup[],
  query: string,
): DirectoryGenerationGroup[] {
  const q = query.trim().toLowerCase()
  if (!q) return generations

  return generations
    .map((gen) => ({
      ...gen,
      classes: filterClasses(gen.classes, q),
    }))
    .filter((gen) => gen.classes.length > 0)
}
