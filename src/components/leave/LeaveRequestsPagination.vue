<template>
  <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
    <div class="text-[13px] text-slate-500">
      Showing <strong class="font-bold text-slate-900">{{ from }}</strong>–<strong class="font-bold text-slate-900">{{ to }}</strong> of
      <strong class="font-bold text-slate-900">{{ total }}</strong> requests
    </div>

    <div class="flex items-center gap-1">
      <button
        class="flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-[13px] font-semibold text-slate-600 transition hover:enabled:border-slate-300 hover:enabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
        :disabled="page <= 1"
        title="Previous"
        @click="fetchRequests(page - 1)"
      >
        <ChevronLeft :size="16" />
      </button>

      <template v-for="p in visiblePages" :key="p">
        <span v-if="p === -1" class="px-1.5 text-[13px] font-semibold text-slate-400">...</span>
        <button
          v-else
          class="flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-[13px] font-semibold transition"
          :class="
            p === page
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100'
          "
          @click="fetchRequests(p)"
        >
          {{ p }}
        </button>
      </template>

      <button
        class="flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-[13px] font-semibold text-slate-600 transition hover:enabled:border-slate-300 hover:enabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
        :disabled="page >= totalPages"
        title="Next"
        @click="fetchRequests(page + 1)"
      >
        <ChevronRight :size="16" />
      </button>
    </div>

    <select
      class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none focus:border-blue-500"
      :value="perPage"
      @change="$emit('update:perPage', Number(($event.target as HTMLSelectElement).value)); fetchRequests(1)"
    >
      <option :value="5">5 / page</option>
      <option :value="10">10 / page</option>
      <option :value="20">20 / page</option>
      <option :value="50">50 / page</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

defineProps<{
  page: number
  totalPages: number
  total: number
  from: number
  to: number
  perPage: number
  visiblePages: number[]
  fetchRequests: (p?: number) => Promise<void>
}>()

defineEmits<{
  'update:perPage': [value: number]
}>()
</script>
