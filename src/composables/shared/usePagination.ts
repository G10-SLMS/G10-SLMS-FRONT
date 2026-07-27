import { computed, type Ref } from 'vue'

export function usePagination(
  page: Ref<number>,
  lastPage: Ref<number>,
  perPage: Ref<number>,
  total: Ref<number>,
) {
  const from = computed(() => (total.value === 0 ? 0 : (page.value - 1) * perPage.value + 1))
  const to = computed(() => Math.min(page.value * perPage.value, total.value))

  // Builds a compact page list like [1, -1, 4, 5, 6, -1, 20], where -1 renders as "…".
  const visiblePages = computed(() => {
    const current = page.value
    const last = lastPage.value
    const delta = 2

    const range: number[] = []
    for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++) {
      range.push(i)
    }

    const pages: number[] = [1]
    if (range[0] > 2) pages.push(-1)
    pages.push(...range)
    if (range[range.length - 1] < last - 1) pages.push(-1)
    if (last > 1) pages.push(last)
    return pages
  })

  return { from, to, visiblePages }
}
