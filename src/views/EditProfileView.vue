<template>
  <div class="w-full px-8 py-10">
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

    <div class="flex flex-col gap-6">
      <ProfileSectionCard>
        <template #icon>
          <span
            class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white"
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
          :preferred-gender="form.gender"
          @update:selectedId="(value) => (form.avatar_id = value)"
        />

        <form class="flex flex-col gap-5" @submit.prevent="submitProfile">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ProfileFormField id="name" label="Full Name">
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                placeholder="Enter your full name"
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
                placeholder="e.g. 012 345 678"
                class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
              />
            </ProfileFormField>

            <ProfileFormField v-if="isStudent" id="gender" label="Gender">
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
          </div>

          <template v-if="isStudent">
            <div class="border-t border-dotted border-slate-200 pt-5">
              <p class="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">
                Student Record
              </p>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ProfileFormField id="id_card" label="ID Card Number">
                  <input
                    id="id_card"
                    v-model="form.id_card"
                    type="text"
                    placeholder="e.g. 012345678"
                    class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                  />
                </ProfileFormField>

                <ProfileFormField id="class" label="Class">
                  <div class="flex gap-2">
                    <select
                      id="class"
                      v-model="classPrefix"
                      class="w-24 shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                    >
                      <option value="WEB">WEB</option>
                      <option value="SNA">SNA</option>
                    </select>
                    <input
                      v-model="classSuffix"
                      type="text"
                      placeholder="e.g. 1"
                      class="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                    />
                  </div>
                </ProfileFormField>

                <ProfileFormField id="generation" label="Generation">
                  <input
                    id="generation"
                    v-model="form.generation"
                    type="text"
                    placeholder="e.g. 2026"
                    class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                  />
                </ProfileFormField>

                <ProfileFormField id="province" label="Province">
                  <select
                    id="province"
                    v-model="form.province"
                    class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                  >
                    <option value="">Select province</option>
                    <option v-for="p in CAMBODIA_PROVINCES" :key="p" :value="p">{{ p }}</option>
                  </select>
                </ProfileFormField>
              </div>
            </div>
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

      <section
        class="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-5"
      >
        <div>
          <h3 class="text-[15px] font-bold text-slate-900">Change Password</h3>
          <p class="text-[13px] text-slate-400">
            Choose a strong password you don't use elsewhere.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          @click="openPasswordModal"
        >
          <Lock :size="15" />
          Change Password
        </button>
      </section>
    </div>

    <ChangePasswordModal
      :open="showPasswordModal"
      v-model:next="passwordForm.next"
      v-model:confirm="passwordForm.confirm"
      :error="passwordError"
      :success="passwordSuccess"
      :saving="savingPassword"
      @close="closePasswordModal"
      @submit="submitPassword(() => (showPasswordModal = false))"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { ArrowLeft, Lock } from 'lucide-vue-next';
import { useDefaultAvatars } from '../composables/useDefaultAvatars';
import { useChangePassword } from '../composables/useChangePassword';
import { extractErrorMessage } from '../utils/errors';
import type { Gender } from '../types/user';
import ProfileSectionCard from '../components/user/ProfileSectionCard.vue';
import AvatarPicker from '../components/user/AvatarPicker.vue';
import ProfileFormField from '../components/user/ProfileFormField.vue';
import ChangePasswordModal from '../components/user/ChangePasswordModal.vue';

const CAMBODIA_PROVINCES = [
  'Banteay Meanchey',
  'Battambang',
  'Kampong Cham',
  'Kampong Chhnang',
  'Kampong Speu',
  'Kampong Thom',
  'Kampot',
  'Kandal',
  'Kep',
  'Koh Kong',
  'Kratié',
  'Mondulkiri',
  'Oddar Meanchey',
  'Pailin',
  'Phnom Penh',
  'Preah Sihanouk',
  'Preah Vihear',
  'Prey Veng',
  'Pursat',
  'Ratanakiri',
  'Siem Reap',
  'Stung Treng',
  'Svay Rieng',
  'Takéo',
  'Tboung Khmum',
];

const auth = useAuthStore();
const router = useRouter();
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

const { avatars: defaultAvatars, loading: loadingAvatars, urlFor } = useDefaultAvatars();
const selectedAvatarUrl = computed(() => urlFor(form.avatar_id));

const form = reactive({
  name: user.value?.name ?? '',
  email: user.value?.email ?? '',
  phone: user.value?.phone ?? '',
  gender: (user.value?.gender ?? '') as Gender | '',
  id_card: user.value?.id_card != null ? String(user.value.id_card) : '',
  class: user.value?.class ?? '',
  generation: user.value?.generation ?? '',
  province: user.value?.province ?? '',
  avatar_id: user.value?.avatar_id ?? null,
});

const savingProfile = ref(false);
const profileError = ref('');
const profileSuccess = ref(false);

const CLASS_PREFIXES = ['WEB', 'SNA'];

function splitClass(value: string) {
  const match = CLASS_PREFIXES.find((prefix) => value.toUpperCase().startsWith(prefix));
  if (match) {
    return { prefix: match, suffix: value.slice(match.length) };
  }
  return { prefix: CLASS_PREFIXES[0], suffix: value };
}

const initialClassParts = splitClass(form.class);
const classPrefix = ref(initialClassParts.prefix);
const classSuffix = ref(initialClassParts.suffix);

watch([classPrefix, classSuffix], ([prefix, suffix]) => {
  form.class = `${prefix}${suffix}`;
});

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
    setTimeout(() => {
      router.push('/profile');
    }, 900);
  } catch (err) {
    profileError.value = extractErrorMessage(err, 'Could not update profile.');
  } finally {
    savingProfile.value = false;
  }
}

const showPasswordModal = ref(false);
const {
  form: passwordForm,
  saving: savingPassword,
  error: passwordError,
  success: passwordSuccess,
  submit: submitPassword,
  reset: resetPasswordForm,
} = useChangePassword({ autoCloseMs: 1200 });

function openPasswordModal() {
  resetPasswordForm();
  showPasswordModal.value = true;
}

function closePasswordModal() {
  showPasswordModal.value = false;
  resetPasswordForm();
}

onMounted(() => {
  if (window.location.hash === '#security') {
    openPasswordModal();
  }
});
</script>
