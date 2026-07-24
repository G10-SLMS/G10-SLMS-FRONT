<template>
  <div class="flex flex-col gap-3 px-4 py-4">
    <div class="flex items-start gap-2.5">
      <span class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cyan-400 text-xs font-semibold text-white">
        <img v-if="avatarSrc" :src="avatarSrc" alt="" class="h-full w-full object-cover" />
        <template v-else>{{ initials }}</template>
      </span>
      <div class="min-w-0 flex-1">
        <p class="m-0 truncate font-medium text-gray-900">{{ user.name }}</p>
        <p class="m-0 truncate text-xs text-gray-500">{{ user.email }}</p>
      </div>
      <span
        class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize"
        :class="{
          'bg-blue-600/20 text-[#0a1628]': user.role === 'admin',
          'bg-green-100 text-green-700': user.role === 'educator',
          'bg-amber-100 text-amber-700': user.role === 'student',
        }"
      >{{ roleLabel }}</span>
    </div>

    <div class="pl-[46px] text-xs text-gray-500">
      <span class="block font-mono text-[10px] uppercase tracking-[0.08em] text-gray-400">Joined</span>
      <span class="mt-0.5 block text-sm font-medium text-gray-700">{{ user.joined }}</span>
    </div>

    <div class="flex gap-2 pl-[46px]">
      <button
        class="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border-none bg-gray-100 text-xs font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
        @click="emit('edit')"
      >
        <Pencil :size="14" :stroke-width="1.8" /> Edit
      </button>
      <button
        class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-none bg-gray-100 text-gray-700 cursor-pointer hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Remove user"
        :disabled="deleting"
        @click="emit('remove')"
      >
        <Trash2 :size="14" :stroke-width="1.8" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import type { ManagedUser } from '@/types/user'

const props = defineProps<{
  user: ManagedUser
  avatarSrc?: string | null
  deleting?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'remove'): void
}>()

const initials = computed(() =>
  props.user.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
)
const roleLabel = computed(() => props.user.role.charAt(0).toUpperCase() + props.user.role.slice(1))
</script>
