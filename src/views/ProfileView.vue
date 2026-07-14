<template>
  <div class="max-w-[900px] px-8 py-6">
    <header class="mb-6 flex items-center justify-between">
      <h1 class="text-[22px] font-bold text-slate-900">My Profile</h1>
      <RouterLink
        to="/profile/edit"
        class="inline-flex items-center gap-1.5 rounded-lg border-none bg-cyan-500 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-cyan-600"
      >
        <Pencil :size="16" />
        Edit Profile
      </RouterLink>
    </header>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <section class="rounded-xl border border-slate-200 bg-white p-5 px-6 md:col-span-2">
        <div class="mb-5 flex items-center gap-4 border-b border-slate-100 pb-5">
          <div
            class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cyan-400 text-[22px] font-bold text-white"
          >
            <img
              v-if="user?.avatar"
              :src="user.avatar"
              :alt="user?.name"
              class="h-full w-full object-cover"
            />
            <span v-else>{{ initials }}</span>
          </div>
          <div>
            <h2 class="mb-1 text-lg font-bold text-slate-900">{{ user?.name }}</h2>
            <span
              class="inline-block rounded-full px-2 py-[3px] text-[11px] font-bold uppercase tracking-wide"
              :class="roleBadgeClass"
              >{{ roleLabel }}</span
            >
          </div>
        </div>

        <dl class="flex flex-col gap-3">
          <div class="flex items-center justify-between text-sm">
            <dt class="flex items-center gap-2 font-medium text-slate-400">
              <Mail :size="16" /> Email
            </dt>
            <dd class="font-semibold text-slate-900">{{ user?.email }}</dd>
          </div>
          <div class="flex items-center justify-between text-sm" v-if="user?.gender">
            <dt class="flex items-center gap-2 font-medium text-slate-400">
              <User :size="16" /> Gender
            </dt>
            <dd class="capitalize font-semibold text-slate-900">{{ user.gender }}</dd>
          </div>
          <div class="flex items-center justify-between text-sm">
            <dt class="flex items-center gap-2 font-medium text-slate-400">
              <Shield :size="16" /> Role
            </dt>
            <dd class="capitalize font-semibold text-slate-900">{{ user?.role }}</dd>
          </div>
        </dl>
      </section>

      <section class="rounded-xl border border-slate-200 bg-white p-5 px-6">
        <h3 class="mb-0.5 text-[15px] font-bold text-slate-900">Connected Accounts</h3>
        <p class="mb-4 text-[13px] text-slate-400">Sign-in methods linked to your account.</p>

        <ProfileProviderRow name="Google" :linked="providerLinked('google')">
          <template #icon>
            <path
              fill="#EA4335"
              d="M12 11v2.4h6.7c-.3 1.6-2.1 4.6-6.7 4.6-4 0-7.3-3.3-7.3-7.4S8 3.2 12 3.2c2.3 0 3.8.9 4.7 1.8l3.2-3.1C17.9 0.2 15.2-.7 12-.7 5.6-.7.5 4.4.5 10.8s5.1 11.5 11.5 11.5c6.6 0 11-4.6 11-11.1 0-.7-.1-1.3-.2-1.9H12z"
            />
          </template>
        </ProfileProviderRow>

        <ProfileProviderRow name="GitHub" :linked="providerLinked('github')">
          <template #icon>
            <path
              fill="#181717"
              d="M12 .3a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.7-1.4-1.7-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.3-3.2-.1-.3-.6-1.6.1-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 016 0c2.3-1.6 3.3-1.2 3.3-1.2.7 1.6.2 2.9.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .3z"
            />
          </template>
        </ProfileProviderRow>
      </section>

      <section class="rounded-xl border border-slate-200 bg-white p-5 px-6">
        <h3 class="mb-0.5 text-[15px] font-bold text-slate-900">Security</h3>
        <p class="mb-4 text-[13px] text-slate-400">Manage your password and account security.</p>
        <RouterLink
          to="/profile/edit#security"
          class="inline-flex items-center gap-1.5 rounded-lg border-none bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 no-underline hover:bg-slate-200"
        >
          <Lock :size="16" />
          Change Password
        </RouterLink>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { Pencil, Mail, User, Shield, Lock } from 'lucide-vue-next';
import ProfileProviderRow from '@/components/user/ProfileProviderRow.vue';

const auth = useAuthStore();
const user = computed(() => auth.user);

const initials = computed(() =>
  (user.value?.name ?? '')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase(),
);

const roleLabel = computed(() => {
  const r = user.value?.role;
  if (r === 'admin') return 'Admin';
  if (r === 'trainer') return 'Trainer';
  return 'Student';
});

const roleBadgeClass = computed(() => {
  const r = user.value?.role ?? 'student';
  if (r === 'admin') return 'bg-red-100 text-red-700';
  if (r === 'trainer') return 'bg-amber-100 text-amber-700';
  return 'bg-cyan-400 text-white';
});

function providerLinked(name: 'google' | 'github') {
  return user.value?.provider === name;
}
</script>
