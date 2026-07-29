<template>
  <div class="mb-5 flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
    <img
      v-if="user.avatar?.url"
      :src="user.avatar.url"
      :alt="user.name"
      class="h-10 w-10 shrink-0 rounded-full object-cover"
    />
    <span
      v-else
      :class="[
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white',
        getAvatarColor(user.name),
      ]"
    >
      {{ getInitials(user.name) }}
    </span>
    <div class="min-w-0 flex-1">
      <p class="m-0 truncate text-sm font-semibold text-gray-900">
        {{ user.name }}
      </p>
      <p v-if="user.email" class="m-0 truncate text-xs text-gray-500">
        {{ user.email }}
      </p>
    </div>
    <button
      type="button"
      class="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
      @click="emit('view-profile')"
    >
      View Profile
    </button>
  </div>
</template>

<script setup lang="ts">
import type { LeaveRequestUser } from '@/types/leave';
import { getInitials, getAvatarColor } from '@/utils/initials';

defineProps<{
  user: LeaveRequestUser;
}>();

const emit = defineEmits<{
  (e: 'view-profile'): void;
}>();
</script>
