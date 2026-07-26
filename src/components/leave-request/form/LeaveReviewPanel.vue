<template>
  <div
    v-if="reviewer"
    class="mb-4 flex items-start gap-3 rounded-lg border px-4 py-3.5"
    :class="reviewTheme.box"
  >
    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" :class="reviewTheme.icon">
      <CheckCircle2 v-if="statusLower === 'approved'" :size="18" />
      <XCircle v-else-if="statusLower === 'rejected'" :size="18" />
      <UserCheck v-else :size="18" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="m-0 text-xs font-medium uppercase tracking-wide" :class="reviewTheme.text">
        {{ reviewLabel }}
      </p>
      <p class="m-0 mt-0.5 text-sm font-semibold text-gray-900">{{ reviewer.name }}</p>
      <p v-if="reviewedAt" class="m-0 mt-0.5 text-xs text-gray-500">
        {{ formatReviewedAt(reviewedAt) }}
      </p>
      <p v-if="reviewNote" class="m-0 mt-1.5 text-xs text-gray-600">
        "{{ reviewNote }}"
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CheckCircle2, XCircle, UserCheck } from 'lucide-vue-next';

const props = defineProps<{
  reviewer: { id: number; name: string } | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  originalStatus: string;
}>();

const statusLower = computed(() => (props.originalStatus ?? '').toLowerCase());

const reviewLabel = computed(() => {
  if (statusLower.value === 'approved') return 'Approved by';
  if (statusLower.value === 'rejected') return 'Rejected by';
  return 'Reviewed by';
});

const reviewTheme = computed(() => {
  if (statusLower.value === 'approved') {
    return { box: 'bg-green-50 border-green-100', icon: 'bg-green-100 text-green-600', text: 'text-green-800' };
  }
  if (statusLower.value === 'rejected') {
    return { box: 'bg-red-50 border-red-100', icon: 'bg-red-100 text-red-600', text: 'text-red-800' };
  }
  return { box: 'bg-gray-50 border-gray-100', icon: 'bg-gray-100 text-gray-600', text: 'text-gray-800' };
});

function formatReviewedAt(value: string) {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
</script>
