<template>
  <div class="mx-auto max-w-[900px] px-8 py-10">
    <header class="mb-8">
      <RouterLink
        to="/profile"
        class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 no-underline hover:text-cyan-600"
      >
        <ArrowLeft :size="16" />
        Back to Profile
      </RouterLink>
      <p class="mb-0.5 mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
        Institutional Record
      </p>
      <h1 class="text-[26px] font-bold tracking-tight text-slate-900">Edit Profile</h1>
    </header>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <ProfileSectionCard>
        <template #icon>
          <span
            class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <span class="text-[0.7rem]">I</span>
          </span>
        </template>
        <template #title>Basic Information</template>
        <template #description>Update your name, email, and avatar.</template>

        <AvatarPicker
          :avatars="defaultAvatars"
          :selected-id="form.avatar_id"
          :selected-avatar-url="selectedAvatarUrl"
          :initials="initials"
          :loading="loadingAvatars"
          @update:selectedId="(value) => (form.avatar_id = value)"
        />

        <form class="flex flex-col gap-4" @submit.prevent="submitProfile">
          <ProfileFormField id="name" label="Full Name">
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
            />
          </ProfileFormField>

          <ProfileFormField id="email" label="Email Address">
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
            />
          </ProfileFormField>

          <ProfileFormField id="phone" label="Phone">
            <input
              id="phone"
              v-model="form.phone"
              type="text"
              class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
            />
          </ProfileFormField>

          <template v-if="isStudent">
            <ProfileFormField id="gender" label="Gender">
              <select
                id="gender"
                v-model="form.gender"
                class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </ProfileFormField>

            <ProfileFormField id="id_card" label="ID Card Number">
              <input
                id="id_card"
                v-model="form.id_card"
                type="text"
                class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
              />
            </ProfileFormField>

            <ProfileFormField id="class" label="Class">
              <input
                id="class"
                v-model="form.class"
                type="text"
                class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
              />
            </ProfileFormField>

            <ProfileFormField id="generation" label="Generation">
              <input
                id="generation"
                v-model="form.generation"
                type="text"
                class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
              />
            </ProfileFormField>

            <ProfileFormField id="province" label="Province">
              <input
                id="province"
                v-model="form.province"
                type="text"
                class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
              />
            </ProfileFormField>
          </template>

          <p v-if="profileError" class="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
            {{ profileError }}
          </p>
          <p
            v-if="profileSuccess"
            class="rounded-lg bg-green-50 px-3 py-2 text-[13px] text-green-700"
          >
            Profile updated successfully.
          </p>

          <div class="flex justify-end pt-2">
            <button
              type="submit"
              class="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:enabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="savingProfile"
            >
              {{ savingProfile ? 'Saving…' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </ProfileSectionCard>

      <ProfileSectionCard>
        <template #title>Change Password</template>
        <template #description>Choose a strong password you don't use elsewhere.</template>

        <form class="flex flex-col gap-4" @submit.prevent="submitPassword">
          <ProfileFormField id="new-password" label="New Password">
            <input
              id="new-password"
              v-model="passwordForm.next"
              type="password"
              required
              minlength="8"
              class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
            />
          </ProfileFormField>

          <ProfileFormField id="confirm-password" label="Confirm New Password">
            <input
              id="confirm-password"
              v-model="passwordForm.confirm"
              type="password"
              required
              minlength="8"
              class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
            />
          </ProfileFormField>

          <p v-if="passwordError" class="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
            {{ passwordError }}
          </p>
          <p
            v-if="passwordSuccess"
            class="rounded-lg bg-green-50 px-3 py-2 text-[13px] text-green-700"
          >
            Password updated successfully.
          </p>

          <div class="flex justify-end pt-2">
            <button
              type="submit"
              class="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:enabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="savingPassword"
            >
              {{ savingPassword ? 'Updating…' : 'Update Password' }}
            </button>
          </div>
        </form>
      </ProfileSectionCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { ArrowLeft, Lock } from 'lucide-vue-next';
import { authService } from '../services/authService';
import type { AxiosError } from 'axios';
import type { DefaultAvatar, Gender } from '../types/user';
import ProfileSectionCard from '../components/user/ProfileSectionCard.vue';
import AvatarPicker from '../components/user/AvatarPicker.vue';
import ProfileFormField from '../components/user/ProfileFormField.vue';
const auth = useAuthStore();
const user = computed(() => auth.user);
const isStudent = computed(() => user.value?.role === 'student');

const initials = computed(() =>
  (user.value?.name ?? '')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase(),
);

const defaultAvatars = ref<DefaultAvatar[]>([]);
const loadingAvatars = ref(true);
const selectedAvatarUrl = computed(
  () => defaultAvatars.value.find((a) => a.id === form.avatar_id)?.url ?? null,
);

const form = reactive({
  name: user.value?.name ?? '',
  email: user.value?.email ?? '',
  phone: user.value?.phone ?? '',
  gender: (user.value?.gender ?? '') as Gender | '',
  id_card: user.value?.id_card ?? '',
  class: user.value?.class ?? '',
  generation: user.value?.generation ?? '',
  province: user.value?.province ?? '',
  avatar_id: user.value?.avatar_id ?? null,
});

function extractError(err: unknown, fallback: string): string {
  const axiosErr = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
  const errors = axiosErr.response?.data?.errors;
  if (errors) {
    const first = Object.values(errors)[0]?.[0];
    if (first) return first;
  }
  return axiosErr.response?.data?.message ?? fallback;
}

const savingProfile = ref(false);
const profileError = ref('');
const profileSuccess = ref(false);

async function submitProfile() {
  savingProfile.value = true;
  profileError.value = '';
  profileSuccess.value = false;
  try {
    await auth.updateProfile({
      name: form.name,
      email: form.email,
      phone: form.phone,
      avatar_id: form.avatar_id,
      ...(isStudent.value
        ? {
            gender: form.gender || undefined,
            id_card: form.id_card,
            class: form.class,
            generation: form.generation,
            province: form.province,
          }
        : {}),
    });
    profileSuccess.value = true;
  } catch (err) {
    profileError.value = extractError(err, 'Could not update profile.');
  } finally {
    savingProfile.value = false;
  }
}

const passwordForm = reactive({ next: '', confirm: '' });
const savingPassword = ref(false);
const passwordError = ref('');
const passwordSuccess = ref(false);

async function submitPassword() {
  passwordError.value = '';
  passwordSuccess.value = false;

  if (passwordForm.next !== passwordForm.confirm) {
    passwordError.value = 'New password and confirmation do not match.';
    return;
  }

  savingPassword.value = true;
  try {
    await auth.updateProfile({
      password: passwordForm.next,
      password_confirmation: passwordForm.confirm,
    });
    passwordSuccess.value = true;
    passwordForm.next = '';
    passwordForm.confirm = '';
  } catch (err) {
    passwordError.value = extractError(err, 'Could not update password.');
  } finally {
    savingPassword.value = false;
  }
}

onMounted(async () => {
  try {
    const { data } = await authService.getDefaultAvatars();
    defaultAvatars.value = data.avatars;
  } catch {
    defaultAvatars.value = [];
  } finally {
    loadingAvatars.value = false;
  }

  if (window.location.hash === '#security') {
    document.getElementById('security')?.scrollIntoView({ behavior: 'smooth' });
  }
});
</script>
