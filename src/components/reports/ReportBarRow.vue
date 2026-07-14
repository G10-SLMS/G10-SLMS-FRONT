<template>
  <div class="grid grid-cols-[110px_1fr_32px] items-center gap-2.5">
    <span class="text-[13px] text-gray-700">{{ label }}</span>
    <div class="h-2.5 overflow-hidden rounded-full bg-gray-100">
      <div class="h-full rounded-full bg-cyan-400" :style="{ width: widthPercent }"></div>
    </div>
    <span class="text-right text-[13px] text-gray-500">{{ count }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  count: number
  widthPercent: string
}>()
</script>
