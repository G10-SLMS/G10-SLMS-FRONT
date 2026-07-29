<template>
  <div class="w-full">
    <div v-if="showLegend && datasets.length" class="mb-3 flex flex-wrap gap-x-4 gap-y-1.5">
      <span
        v-for="item in legendItems"
        :key="item.label"
        class="flex items-center gap-1.5 text-xs text-gray-500"
      >
        <span class="h-2 w-2 shrink-0 rounded-full" :style="{ backgroundColor: item.color }"></span>
        {{ item.label }}
      </span>
    </div>

    <div class="relative w-full" :style="{ height: `${height}px` }">
      <canvas ref="canvasRef" class="h-full w-full"></canvas>

      <div
        v-if="tooltip"
        class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
        :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
      >
        <p class="m-0 font-medium">{{ tooltip.label }}</p>
        <p class="m-0 text-gray-300">{{ tooltip.datasetLabel }}: {{ tooltip.value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { ChartRenderer, type ChartType, type ChartDataset, type ChartHoverInfo } from './Chart'

const props = withDefaults(
  defineProps<{
    type: ChartType
    labels: string[]
    datasets: ChartDataset[]
    height?: number
    showLegend?: boolean
  }>(),
  {
    height: 220,
    showLegend: true,
  },
)

const DEFAULT_PALETTE = ['#2563eb', '#f59e0b', '#16a34a', '#dc2626', '#06b6d4', '#8b5cf6']

const canvasRef = ref<HTMLCanvasElement | null>(null)
let renderer: ChartRenderer | null = null

interface TooltipState {
  x: number
  y: number
  label: string
  value: number
  datasetLabel: string
}

const tooltip = ref<TooltipState | null>(null)

const legendItems = computed(() => {
  if (props.type === 'donut') {
    return props.labels.map((label, i) => ({
      label,
      color: DEFAULT_PALETTE[i % DEFAULT_PALETTE.length],
    }))
  }
  return props.datasets.map((dataset, i) => ({
    label: dataset.label,
    color: dataset.color || DEFAULT_PALETTE[i % DEFAULT_PALETTE.length],
  }))
})

function handleHover(info: ChartHoverInfo | null) {
  if (!info) {
    tooltip.value = null
    return
  }

  tooltip.value = {
    x: info.x,
    y: info.y,
    label: info.label,
    value: info.value,
    datasetLabel: props.type === 'donut' ? info.label : props.datasets[info.datasetIndex]?.label || '',
  }
}

function currentConfig() {
  return { type: props.type, labels: props.labels, datasets: props.datasets }
}

onMounted(() => {
  if (!canvasRef.value) return
  renderer = new ChartRenderer(canvasRef.value, currentConfig(), handleHover)
})

watch(
  () => [props.type, props.labels, props.datasets],
  () => {
    renderer?.update(currentConfig())
  },
  { deep: true },
)

onBeforeUnmount(() => {
  renderer?.destroy()
  renderer = null
})
</script>
