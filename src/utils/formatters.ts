export function formatStudentId(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  return String(value).padStart(3, '0');
}
