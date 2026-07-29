<template>
  <div
    v-if="variant === 'loading'"
    class="flex flex-col items-center justify-center gap-2.5 px-5 py-8 text-center text-gray-500"
  >
    Loading request…
  </div>

  <div
    v-else
    class="flex flex-col items-center justify-center gap-2.5 px-5 py-8 text-center text-gray-500 [&_svg]:text-amber-500"
  >
    <Lock :size="32" :stroke-width="1.5" />
    <p>
      This request can no longer be edited because its status is
      <strong>{{ originalStatus }}</strong
      >.
    </p>
    <button
      type="button"
      class="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
      @click="emit('close')"
    >
      Close
    </button>
  </div>
</template>

<script setup lang="ts">
import { Lock } from 'lucide-vue-next';

defineProps<{
  variant: 'loading' | 'locked';
  originalStatus?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>
