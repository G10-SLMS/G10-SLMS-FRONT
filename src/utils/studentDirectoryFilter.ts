import type { DirectoryClassGroup, DirectoryGenerationGroup, DirectoryStudent } from '@/types/user';

function toSearchable(value: unknown): string {
  return value === null || value === undefined ? '' : String(value).toLowerCase();
}

function matchesQuery(student: DirectoryStudent, query: string): boolean {
  return (
    toSearchable(student.name).includes(query) ||
    toSearchable(student.email).includes(query) ||
    toSearchable(student.student_id).includes(query)
  );
}

// Checks whether a class name matches the search query.
function classNameMatches(className: string | null, query: string): boolean {
  return toSearchable(className).includes(query);
}

// Checks whether a generation name matches the search query.
function generationMatches(generation: string | null, query: string): boolean {
  return toSearchable(generation).includes(query);
}

export function filterClasses(
  classes: DirectoryClassGroup[],
  query: string,
): DirectoryClassGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return classes;

  return classes
    .map((cls) => {
      // If the class name matches the query, keep ALL students (don't filter them out)
      if (classNameMatches(cls.class_name, q)) {
        return cls;
      }
      return {
        ...cls,
        students: (cls.students ?? []).filter((student) => matchesQuery(student, q)),
      };
    })
    .filter((cls) => cls.students.length > 0 || classNameMatches(cls.class_name, q));
}

export function filterGenerations(
  generations: DirectoryGenerationGroup[],
  query: string,
): DirectoryGenerationGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return generations;

  return generations.filter((gen) => generationMatches(gen.generation, q));
}
