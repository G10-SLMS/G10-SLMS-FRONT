<template>
  <li class="flex flex-col gap-3 p-4">
    <div class="flex items-start justify-between gap-3">
      <div class="flex min-w-0 items-center gap-2.5">
        <span
          class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cyan-400 text-xs font-semibold text-white"
        >
          <img
            v-if="request.studentAvatarUrl"
            :src="request.studentAvatarUrl"
            :alt="request.student"
            class="h-full w-full object-cover"
          />
          <template v-else>{{ getInitials(request.student) }}</template>
        </span>
        <div class="min-w-0">
          <p class="m-0 truncate font-semibold text-slate-900">{{ request.student }}</p>
          <p v-if="request.studentId != null" class="m-0 text-xs text-slate-500">
            Student ID: {{ formatStudentId(request.studentId) }}
          </p>
        </div>
      </div>

      <LeaveStatusBadge :status="request.status" class="shrink-0" />
    </div>

    <p class="m-0 text-[13px] font-semibold text-slate-900">{{ request.type }}</p>

    <div class="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[13px]">
      <div>
        <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Start</span>
        <p class="m-0 text-slate-600">{{ request.startDate }}</p>
      </div>
      <div>
        <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">End</span>
        <p class="m-0 text-slate-600">{{ request.endDate }}</p>
      </div>
    </div>

    <div v-if="request.reason">
      <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Reason</span>
      <p class="m-0 text-[13px] text-slate-600">{{ request.reason }}</p>
    </div>

    <div class="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
      <button
        class="flex items-center gap-1 whitespace-nowrap rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
        @click="$emit('view')"
      >
        <Eye :size="15" />
        View
      </button>

      <template v-if="canDecide">
        <button
          v-for="action in actions"
          :key="action.decision"
          :class="[actionButtonBaseClasses, action.classes]"
          :disabled="request.processing"
          @click="$emit('decide', action.decision)"
        >
          <component :is="action.icon" :size="15" />
          {{ action.label }}
        </button>
      </template>
    </div>
  </li>
</template>

<script setup lang="ts">
import { Check, X, Eye } from 'lucide-vue-next';
import { computed } from 'vue';
import LeaveStatusBadge from '@/components/leave-common/LeaveStatusBadge.vue';
import { getInitials } from '@/utils/initials';
import { formatStudentId } from '@/utils/formatters';
import type { LeaveRequest } from '@/types/leave';

const props = defineProps<{
  request: LeaveRequest;
  showActions?: boolean;
}>();

defineEmits<{
  decide: [decision: 'Approved' | 'Rejected'];
  view: [];
}>();

const canDecide = computed(() => !!props.showActions && props.request.status === 'Pending');

const actionButtonBaseClasses =
  'flex items-center gap-1 whitespace-nowrap rounded-md border border-transparent px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';

const actions = [
  {
    decision: 'Approved' as const,
    label: 'Approve',
    icon: Check,
    classes: 'bg-green-100 text-green-700 enabled:hover:bg-green-200',
  },
  {
    decision: 'Rejected' as const,
    label: 'Reject',
    icon: X,
    classes: 'bg-red-100 text-red-700 enabled:hover:bg-red-200',
  },
];
</script>
