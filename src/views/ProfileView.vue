<template>
  <div class="mx-auto max-w-[880px] px-6 py-10">
    <header class="mb-8 flex items-center justify-between">
      <div>
        <p class="mb-0.5 font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
          Institutional Record
        </p>
        <h1 class="text-[26px] font-bold tracking-tight text-slate-900">My Profile</h1>
      </div>
      <RouterLink
        to="/profile/edit"
        class="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-slate-700"
      >
        <Pencil :size="15" />
        Edit Profile
      </RouterLink>
    </header>

    <!-- Signature element: an institutional ID badge -->
    <div class="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#10182b] via-[#1c2743] to-[#232f4d] shadow-[0_18px_40px_-18px_rgba(15,23,42,0.45)]">
      <!-- lanyard hole -->
      <div
        class="absolute left-1/2 top-[18px] z-10 h-2.5 w-9 -translate-x-1/2 rounded-full bg-black/35 shadow-[inset_0_2px_3px_rgba(0,0,0,0.5)]"
        aria-hidden="true"
      />

      <div class="relative z-10 flex flex-col items-center px-8 pb-7 pt-12 text-center">
        <div class="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white/90 bg-slate-700 text-2xl font-bold text-white shadow-lg">
          <img v-if="avatarUrl" :src="avatarUrl" :alt="user?.name" class="h-full w-full object-cover" />
          <span v-else>{{ initials }}</span>
        </div>

        <h2 class="mt-4 text-xl font-bold tracking-tight text-white">{{ user?.name }}</h2>

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

      <!-- perforation divider -->
      <div class="flex justify-between px-5" aria-hidden="true">
        <span
          v-for="n in 26"
          :key="n"
          class="-mt-[3px] block h-1.5 w-1.5 rounded-full bg-slate-50 ring-1 ring-slate-900/5"
        />
      </div>

      <!-- badge data fields -->
      <dl class="relative z-10 grid grid-cols-1 gap-x-8 gap-y-4 bg-white px-8 py-7 sm:grid-cols-2">
        <div class="flex items-baseline justify-between gap-3 border-b border-dotted border-slate-300 pb-1.5">
          <dt class="flex items-center gap-1.5 whitespace-nowrap font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            <Mail :size="14" />Email
          </dt>
          <dd class="text-right text-[13.5px] font-semibold text-slate-900">{{ user?.email }}</dd>
        </div>
        <div v-if="user?.phone" class="flex items-baseline justify-between gap-3 border-b border-dotted border-slate-300 pb-1.5">
          <dt class="flex items-center gap-1.5 whitespace-nowrap font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            <Phone :size="14" />Phone
          </dt>
          <dd class="text-right text-[13.5px] font-semibold text-slate-900">{{ user.phone }}</dd>
        </div>
        <div v-if="user?.gender" class="flex items-baseline justify-between gap-3 border-b border-dotted border-slate-300 pb-1.5">
          <dt class="flex items-center gap-1.5 whitespace-nowrap font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            <User :size="14" />Gender
          </dt>
          <dd class="text-right text-[13.5px] font-semibold capitalize text-slate-900">{{ user.gender }}</dd>
        </div>
        <div v-if="user?.class" class="flex items-baseline justify-between gap-3 border-b border-dotted border-slate-300 pb-1.5">
          <dt class="flex items-center gap-1.5 whitespace-nowrap font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            <GraduationCap :size="14" />Class
          </dt>
          <dd class="text-right text-[13.5px] font-semibold text-slate-900">{{ user.class }}</dd>
        </div>
        <div v-if="user?.generation" class="flex items-baseline justify-between gap-3 border-b border-dotted border-slate-300 pb-1.5">
          <dt class="flex items-center gap-1.5 whitespace-nowrap font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            <GraduationCap :size="14" />Generation
          </dt>
          <dd class="text-right text-[13.5px] font-semibold text-slate-900">{{ user.generation }}</dd>
        </div>
        <div v-if="user?.province" class="flex items-baseline justify-between gap-3 border-b border-dotted border-slate-300 pb-1.5">
          <dt class="flex items-center gap-1.5 whitespace-nowrap font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            <MapPin :size="14" />Province
          </dt>
          <dd class="text-right text-[13.5px] font-semibold text-slate-900">{{ user.province }}</dd>
        </div>
      </dl>

      <!-- barcode texture -->
      <div class="relative z-10 flex h-[22px] items-end gap-[2px] bg-white px-8 pb-3.5 opacity-90" aria-hidden="true">
        <span
          v-for="(h, n) in barHeights"
          :key="n"
          class="block w-[2px]"
          :class="[h, roleBarClass]"
        />
      </div>
    </div>

    <section class="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-5">
      <div>
        <h3 class="text-[15px] font-bold text-slate-900">Security</h3>
        <p class="text-[13px] text-slate-400">Manage your password and account security.</p>
      </div>
      <RouterLink
        to="/profile/edit#security"
        class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 no-underline transition hover:border-slate-300 hover:bg-slate-50"
      >
        <Lock :size="15" />
        Change Password
      </RouterLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { authService } from '@/services/authService';
import { Pencil, Mail, Phone, User, Shield, Lock, GraduationCap, MapPin } from 'lucide-vue-next';
import type { DefaultAvatar } from '@/types/user';

const auth = useAuthStore();
const user = computed(() => auth.user);

const defaultAvatars = ref<DefaultAvatar[]>([]);
const avatarUrl = computed(
  () => defaultAvatars.value.find((a) => a.id === user.value?.avatar_id)?.url ?? null,
);

onMounted(async () => {
  try {
    const { data } = await authService.getDefaultAvatars();
    defaultAvatars.value = data.avatars;
  } catch {
    defaultAvatars.value = [];
  }
});

const initials = computed(() =>
  (user.value?.name ?? '')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase(),
);

const memberId = computed(() => (user.value ? String(user.value.id).padStart(5, '0') : '—'));

const roleLabel = computed(() => {
  const r = user.value?.role;
  if (r === 'admin') return 'Admin';
  if (r === 'trainer') return 'Trainer';
  return 'Student';
});

const roleBadgeClass = computed(() => {
  const r = user.value?.role ?? 'student';
  if (r === 'admin') return 'bg-red-500/15 text-red-300';
  if (r === 'trainer') return 'bg-amber-500/15 text-amber-300';
  return 'bg-cyan-400/15 text-cyan-300';
});

const roleBarClass = computed(() => {
  const r = user.value?.role ?? 'student';
  if (r === 'admin') return 'bg-red-400';
  if (r === 'trainer') return 'bg-amber-400';
  return 'bg-cyan-400';
});

// Cycles three heights across 18 bars to read as a barcode.
const barHeights = Array.from({ length: 18 }, (_, i) => ['h-[60%]', 'h-[80%]', 'h-full'][i % 3]);
</script>
