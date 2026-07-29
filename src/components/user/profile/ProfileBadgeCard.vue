<template>
  <div
    class="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#10182b] via-[#1c2743] to-[#232f4d] shadow-[0_18px_40px_-18px_rgba(15,23,42,0.45)]"
  >
    <div
      class="absolute left-1/2 top-[18px] z-10 h-2.5 w-9 -translate-x-1/2 rounded-full bg-black/35 shadow-[inset_0_2px_3px_rgba(0,0,0,0.5)]"
      aria-hidden="true"
    />

    <div class="relative z-10 flex flex-col items-center px-8 pb-7 pt-12 text-center">
      <div
        class="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white/90 bg-slate-700 text-2xl font-bold text-white shadow-lg"
      >
        <img v-if="avatarUrl" :src="avatarUrl" :alt="name" class="h-full w-full object-cover" />
        <span v-else>{{ initials }}</span>
      </div>

      <h2 class="mt-4 text-xl font-bold tracking-tight text-white">{{ name }}</h2>

      <span
        class="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
        :class="roleBadgeClass"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-current" />
        {{ roleLabel }}
      </span>

      <p class="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
        Member ID · {{ memberId }}
      </p>
    </div>

    <div class="flex justify-between px-5" aria-hidden="true">
      <span
        v-for="n in 26"
        :key="n"
        class="-mt-[3px] block h-1.5 w-1.5 rounded-full bg-slate-50 ring-1 ring-slate-900/5"
      />
    </div>

    <dl class="relative z-10 grid grid-cols-1 gap-x-8 gap-y-4 bg-white px-8 py-7 sm:grid-cols-2">
      <ProfileFieldRow
        v-for="field in fields"
        :key="field.key"
        :label="field.label"
        :icon="field.icon"
        :value="field.value"
        :valueClass="field.valueClass"
      />
    </dl>

    <div
      class="relative z-10 flex h-[22px] items-end gap-[2px] bg-white px-8 pb-3.5 opacity-90"
      aria-hidden="true"
    >
      <span
        v-for="(height, index) in barHeights"
        :key="index"
        class="block w-[2px]"
        :class="[height, roleBarClass]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import ProfileFieldRow from './ProfileFieldRow.vue';

export type ProfileField = {
  key: string;
  label: string;
  icon: Component;
  value: string | number;
  valueClass?: string;
};

const props = defineProps<{
  avatarUrl: string | null;
  initials: string;
  name: string;
  roleLabel: string;
  roleBadgeClass: string;
  memberId: string;
  fields: ProfileField[];
  roleBarClass: string;
  barHeights: string[];
}>();
</script>
