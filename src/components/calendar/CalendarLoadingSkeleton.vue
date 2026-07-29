<template>
  <div class="flex h-full flex-col gap-4 p-6">
    <div class="flex items-center gap-2">
      <div class="h-4 w-4 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
      <p class="text-sm text-gray-500 font-medium">Loading leave requests...</p>
    </div>
    <div class="flex-1 animate-pulse flex-col gap-3">
      <div v-for="n in 6" :key="n" class="h-12 w-full rounded-lg bg-slate-100"></div>
      <div v-if="view === 'Week'" class="grid grid-cols-7 gap-3">
        <div v-for="n in 14" :key="n" class="h-12 rounded-lg bg-slate-100"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CalendarLoadingSkeleton' })

defineProps<{
  view: 'Day' | 'Week' | 'Month'
}>()
</script>
