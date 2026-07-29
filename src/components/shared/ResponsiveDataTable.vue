<template>
  <TableRowSkeleton v-if="loading" :rows="skeletonRows" :columns="skeletonColumns" />

  <template v-else>
    <p v-if="!rows.length" class="px-5 pb-5 text-[13px] text-gray-400">
      {{ emptyMessage }}
    </p>

    <template v-else>
      <!-- Mobile card list -->
      <ul class="divide-y divide-gray-100 px-5 pb-5 sm:hidden">
        <li v-for="(row, index) in rows" :key="getKey(row, index)" class="py-3 first:pt-0 last:pb-0">
          <slot name="mobile-card" :row="row" :index="index" />
        </li>
      </ul>

      <!-- Desktop / tablet table -->
      <div class="hidden w-full overflow-x-auto px-5 pb-5 sm:block">
        <table class="w-full border-collapse text-sm md:min-w-0" :style="{ minWidth }">
          <thead>
            <tr>
              <th
                v-for="(column, index) in columns"
                :key="index"
                class="border-b border-gray-200 px-2 py-3 text-[13px] font-medium text-gray-500"
                :class="column.align === 'right' ? 'text-right' : 'text-left'"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in rows"
              :key="getKey(row, index)"
              class="border-b border-gray-100 last:border-none"
            >
              <slot name="desktop-row" :row="row" :index="index" />
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </template>
</template>

<script setup lang="ts">
import TableRowSkeleton from '@/components/shared/TableRowSkeleton.vue'

export interface ResponsiveDataTableColumn {
  label: string
  align?: 'left' | 'right'
}

type RowRecord = any

const props = withDefaults(
  defineProps<{
    rows: RowRecord[]
    columns: ResponsiveDataTableColumn[]
    loading?: boolean
    emptyMessage?: string
    rowKey?: string | ((row: RowRecord, index: number) => string | number)
    skeletonRows?: number
    minWidth?: string
  }>(),
  {
    loading: false,
    emptyMessage: 'No data available.',
    rowKey: undefined,
    skeletonRows: 5,
    minWidth: '420px',
  },
)

const skeletonColumns = props.columns.length

function getKey(row: RowRecord, index: number): string | number {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row, index)
  }
  if (props.rowKey) {
    return row[props.rowKey] as string | number
  }
  return index
}
</script>
