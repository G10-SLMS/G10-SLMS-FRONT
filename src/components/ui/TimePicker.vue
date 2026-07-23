<template>
  <div ref="root" class="relative" @keydown.esc="handleEsc">
    <button
      :id="id"
      type="button"
      :disabled="disabled"
      :aria-expanded="open"
      aria-haspopup="listbox"
      class="flex w-full items-center rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-9 text-left text-sm text-gray-800 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
      @click="toggle"
    >
      <span :class="modelValue ? 'text-gray-800' : 'text-gray-400'">{{ displayLabel }}</span>
    </button>

    <span class="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-gray-400">
      <Clock :size="18" />
    </span>
    <span
      class="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 text-gray-400 transition-transform"
      :class="{ 'rotate-180': open }"
    >
      <ChevronDown :size="16" />
    </span>

    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <ul
        v-if="open"
        role="listbox"
        class="absolute z-30 mt-1.5 max-h-52 w-full min-w-[9.5rem] origin-top overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
      >
        <li v-for="opt in options" :key="opt.value">
          <button
            type="button"
            role="option"
            :aria-selected="opt.value === modelValue"
            :data-selected="opt.value === modelValue"
            :class="[
              'block w-full px-3.5 py-2 text-left text-sm transition-colors',
              opt.value === modelValue
                ? 'bg-cyan-600 font-medium text-white'
                : 'text-gray-700 hover:bg-cyan-50',
            ]"
            @click="select(opt.value)"
          >
            {{ opt.label }}
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { Clock, ChevronDown } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    id?: string;
    disabled?: boolean;
    stepMinutes?: number;
    /** If provided, options are generated starting at this time (e.g. Start Time)
     *  and each option's label shows elapsed duration since this time, like
     *  "8:45 AM (15 mins)". */
    baseTime?: string;
    /** How far forward from baseTime to generate options, in minutes. */
    durationRangeMinutes?: number;
  }>(),
  { stepMinutes: 30, durationRangeMinutes: 12 * 60 },
);

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);

function toMinutes(value: string): number | null {
  const [hStr, mStr] = value.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function formatClock(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0 mins';
  if (minutes < 60) return `${minutes} mins`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hourLabel = `${h} hr${h > 1 ? 's' : ''}`;
  return m === 0 ? hourLabel : `${hourLabel} ${m} mins`;
}

function formatLabel(value: string): string {
  const mins = toMinutes(value);
  if (mins === null) return '';
  return formatClock(mins);
}

const displayLabel = computed(() => (props.modelValue ? formatLabel(props.modelValue) : 'Select time'));

const options = computed(() => {
  const list: { value: string; label: string }[] = [];
  const baseMinutes = props.baseTime ? toMinutes(props.baseTime) : null;

  if (baseMinutes !== null) {
    // Duration-relative list: base time forward in stepMinutes increments.
    for (let offset = 0; offset <= props.durationRangeMinutes; offset += props.stepMinutes) {
      const total = baseMinutes + offset;
      const h = Math.floor(total / 60) % 24;
      const m = total % 60;
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      list.push({ value, label: `${formatClock(total)} (${formatDuration(offset)})` });
    }
    return list;
  }

  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += props.stepMinutes) {
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      list.push({ value, label: formatLabel(value) });
    }
  }
  return list;
});

function toggle() {
  if (props.disabled) return;
  open.value = !open.value;
}

function close() {
  open.value = false;
}

function handleEsc(e: KeyboardEvent) {
  if (!open.value) return;
  e.stopPropagation();
  e.preventDefault();
  close();
}

function select(value: string) {
  emit('update:modelValue', value);
  open.value = false;
}

function handleClickOutside(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside));
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside));

watch(open, async (isOpen) => {
  if (!isOpen) return;
  await nextTick();
  const selected = root.value?.querySelector('[data-selected="true"]') as HTMLElement | null;
  selected?.scrollIntoView({ block: 'center' });
});
</script>
