<template>
  <tr class="border-b border-gray-100 last:border-none">
    <td class="px-4 py-3.5 align-middle text-left">
      <div class="flex items-center gap-2.5 font-medium">
        <span
          class="flex h-[30px] w-[30px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-cyan-400 text-xs font-semibold text-white"
        >
          <img
            v-if="request.studentAvatarUrl"
            :src="request.studentAvatarUrl"
            :alt="request.student"
            class="h-full w-full object-cover"
          />
          <template v-else>{{ getInitials(request.student) }}</template>
        </span>
        {{ request.student }}
      </div>
    </td>

    <td class="px-4 py-3.5 align-middle text-left text-slate-600">
      {{ formatStudentId(request.studentId) || '—' }}
    </td>

    <td class="px-4 py-3.5 align-middle text-left">{{ request.type }}</td>
    <td class="px-4 py-3.5 align-middle text-left">{{ request.startDate }}</td>
    <td class="px-4 py-3.5 align-middle text-left">{{ request.endDate }}</td>

    <td
      class="max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-3.5 align-middle text-left text-gray-500"
    >
      {{ request.reason }}
    </td>

    <td class="px-4 py-3.5 align-middle text-left">
      <LeaveStatusBadge :status="request.status" />
    </td>

    <td class="px-4 py-3.5 align-middle text-left">
      <div class="flex gap-2">
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
    </td>
  </tr>
</template>

<script setup lang="ts">
import { Check, X, Eye, UserSearch } from 'lucide-vue-next';
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
  decide: [decision: 'Approved' | 'Rejected' | 'Under Review'];
  view: [];
}>();

const canDecide = computed(
  () => !!props.showActions && ['Pending', 'Under Review'].includes(props.request.status),
);

const actionButtonBaseClasses =
  'flex items-center gap-1 whitespace-nowrap rounded-md border border-transparent px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';

const actions = computed(() => {
  const list = [];

  if (props.request.status === 'Pending') {
    list.push({
      decision: 'Under Review' as const,
      label: 'Mark Under Review',
      icon: UserSearch,
      classes: 'bg-cyan-100 text-cyan-700 enabled:hover:bg-cyan-200',
    });
  }

  list.push(
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
  );

  return list;
});
</script>
