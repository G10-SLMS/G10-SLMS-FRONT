<template>
  <div
    class="vuecal-custom-event absolute rounded-md text-[10px] font-medium cursor-pointer transition hover:opacity-80 overflow-hidden"
    :class="variant === 'full-day' ? 'z-[5] flex flex-col' : 'z-10'"
    :style="combinedStyle"
    @click="$emit('click', event)"
  >
    <div v-if="variant === 'full-day'" class="p-1.5 flex flex-col h-full justify-start">
      <div class="font-semibold truncate leading-tight">{{ event.student }} · {{ event.type }}</div>
      <div class="text-[9px] font-medium uppercase tracking-wide opacity-75 truncate leading-tight">{{ event.status }}</div>
    </div>
    <template v-else>
      <div class="font-semibold truncate leading-tight">{{ event.student }} · {{ event.type }}</div>
      <div class="flex items-center gap-1 opacity-75 truncate leading-tight">
        <span class="inline-block h-[6px] w-[6px] shrink-0 rounded-full" :style="{ background: dotColor }"></span>
        {{ formatTimeLabel(event.startTime) }} - {{ formatTimeLabel(event.endTime) }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarEvent } from '@/types/leave'
import { formatTimeLabel } from '@/utils/calendarDate'
import { studentChipStyle } from '@/utils/studentColor'

defineOptions({ name: 'CalendarEventChip' })

const props = defineProps<{
  event: CalendarEvent
  variant: 'timed' | 'full-day'
  style: Record<string, string>
  dotColor?: string
}>()

defineEmits<{
  click: [event: CalendarEvent]
}>()

const combinedStyle = computed(() => ({
  ...props.style,
  ...studentChipStyle(props.event.studentId),
}))
</script>

<style scoped>
.vuecal-custom-event {
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

@media (max-width: 640px) {
  .vuecal-custom-event {
    font-size: 10px;
    padding: 3px 6px;
  }
}
</style>
