<template>
  <div class="mb-6 border-b border-dotted border-slate-300 pb-6">
    <div class="mb-3 flex items-center gap-4">
      <div
        class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-slate-100 bg-slate-700 text-[22px] font-bold text-white shadow-md"
      >
        <img
          v-if="selectedAvatarUrl"
          :src="selectedAvatarUrl"
          alt="Avatar preview"
          class="h-full w-full object-cover"
        />
        <span v-else>{{ initials }}</span>
      </div>
      <p class="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">
        Choose an avatar below
      </p>
    </div>

    <div v-if="loading" class="text-[13px] text-slate-400">Loading avatars…</div>
    <div v-else class="flex flex-wrap gap-2.5">
      <button
        v-for="avatar in avatars"
        :key="avatar.id"
        type="button"
        class="h-12 w-12 overflow-hidden rounded-full border-2 transition"
        :class="
          avatar.id === selectedId
            ? 'border-cyan-500 ring-2 ring-cyan-100'
            : 'border-transparent hover:border-slate-200'
        "
        @click="selectAvatar(avatar.id)"
      >
        <img :src="avatar.url" :alt="avatar.filename" class="h-full w-full object-cover" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { DefaultAvatar } from '../../types/user';

export default defineComponent({
  name: 'AvatarPicker',
  props: {
    avatars: { type: Array as () => DefaultAvatar[], required: true },
    selectedId: { type: Number as () => number | null, required: false, default: null },
    selectedAvatarUrl: { type: String as () => string | null, required: false, default: null },
    initials: { type: String, required: true },
    loading: { type: Boolean, required: true },
  },
  emits: ['update:selectedId'],
  methods: {
    selectAvatar(id: number) {
      this.$emit('update:selectedId', id);
    },
  },
});
</script>
