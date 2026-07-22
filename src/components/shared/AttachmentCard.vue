<template>
  <div class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
      :class="isImage ? 'bg-purple-50 text-purple-500' : 'bg-indigo-50 text-indigo-500'"
    >
      <component :is="isImage ? ImageIcon : FileText" :size="20" />
    </div>

    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium text-gray-800">{{ displayName }}</p>
      <p class="mt-0.5 text-xs text-gray-400">
        {{ ext.toUpperCase() }}
        <span v-if="sizeLabel"> &middot; {{ sizeLabel }}</span>
      </p>
    </div>

    <a
      v-if="url"
      :href="url"
      target="_blank"
      rel="noopener noreferrer"
      class="flex shrink-0 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
    >
      <Eye :size="14" />
      <span v-if="showViewLabel">View</span>
    </a>

    <button
      v-if="removable"
      type="button"
      class="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Remove file"
      :disabled="disabled"
      @click="emit('remove')"
    >
      <X :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FileText, Image as ImageIcon, Eye, X } from 'lucide-vue-next';
import { formatFileSize } from '@/utils/formatters';

const props = withDefaults(
  defineProps<{
    url?: string | null;
    name?: string | null;
    size?: number | null;
    removable?: boolean;
    disabled?: boolean;
    showViewLabel?: boolean;
  }>(),
  {
    url: null,
    name: null,
    size: null,
    removable: false,
    disabled: false,
    showViewLabel: true,
  },
);

const emit = defineEmits<{
  (e: 'remove'): void;
}>();

const displayName = computed(() => {
  if (props.name) return props.name;
  if (!props.url) return 'Attached file';
  try {
    return decodeURIComponent(props.url.split('/').pop() || 'Attached file');
  } catch {
    return 'Attached file';
  }
});

const ext = computed(() => displayName.value.split('.').pop()?.toLowerCase() ?? '');
const isImage = computed(() => ['png', 'jpg', 'jpeg', 'webp'].includes(ext.value));
const sizeLabel = computed(() => (props.size ? formatFileSize(props.size) : null));
</script>
