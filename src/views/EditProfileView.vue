<template>
  <div class="max-w-[900px] px-8 py-6">
    <header class="mb-6">
      <RouterLink to="/profile" class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 no-underline hover:text-cyan-600">
        <ArrowLeft :size="16" />
        Back to Profile
      </RouterLink>
      <h1 class="mt-2 text-[22px] font-bold text-slate-900">Edit Profile</h1>
    </header>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <section class="rounded-xl border border-slate-200 bg-white p-5 px-6">
        <h3 class="mb-0.5 text-[15px] font-bold text-slate-900">Basic Information</h3>
        <p class="mb-4 text-[13px] text-slate-400">Update your name, email, and photo.</p>

        <div class="mb-5 flex items-center gap-4 border-b border-slate-100 pb-5">
          <div class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cyan-400 text-[22px] font-bold text-white">
            <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar preview" class="h-full w-full object-cover" />
            <span v-else>{{ initials }}</span>
          </div>
          <div class="flex items-center gap-3">
            <label class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              <Upload :size="16" />
              Change Photo
              <input type="file" accept="image/*" class="sr-only" @change="onAvatarChange" />
            </label>
            <button
              v-if="avatarPreview"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border-none bg-transparent px-1 py-2 text-sm font-semibold text-red-600 cursor-pointer hover:text-red-700"
              @click="removeAvatar"
            >
              Remove
            </button>
          </div>
        </div>

        <form class="flex flex-col gap-4" @submit.prevent="submitProfile">
          <div class="flex flex-col gap-1.5">
            <label for="name" class="text-[13px] font-semibold text-slate-700">Full Name</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.12)] focus:outline-none"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="email" class="text-[13px] font-semibold text-slate-700">Email Address</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              :disabled="isOAuthUser"
              class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.12)] focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
            />
            <span v-if="isOAuthUser" class="text-xs text-slate-400">
              Email is managed by your {{ user?.provider }} account.
            </span>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="gender" class="text-[13px] font-semibold text-slate-700">Gender</label>
            <select
              id="gender"
              v-model="form.gender"
              class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.12)] focus:outline-none"
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <p v-if="profileError" class="text-[13px] text-red-600">{{ profileError }}</p>
          <p v-if="profileSuccess" class="text-[13px] text-green-700">Profile updated successfully.</p>

          <div class="flex justify-end">
            <button
              type="submit"
              class="inline-flex items-center gap-1.5 rounded-lg border-none bg-cyan-500 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:enabled:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="savingProfile"
            >
              {{ savingProfile ? 'Saving…' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </section>

      <section id="security" class="rounded-xl border border-slate-200 bg-white p-5 px-6">
        <h3 class="mb-0.5 flex items-center gap-1.5 text-[15px] font-bold text-slate-900">
          <Lock :size="16" />
          Change Password
        </h3>
        <p v-if="isOAuthUser" class="mb-4 text-[13px] text-slate-400">
          Your account signs in via {{ user?.provider }}, so there's no password to change here.
        </p>
        <template v-else>
          <p class="mb-4 text-[13px] text-slate-400">Choose a strong password you don't use elsewhere.</p>

          <form class="flex flex-col gap-4" @submit.prevent="submitPassword">
            <div class="flex flex-col gap-1.5">
              <label for="current-password" class="text-[13px] font-semibold text-slate-700">Current Password</label>
              <input
                id="current-password"
                v-model="passwordForm.current"
                type="password"
                required
                class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.12)] focus:outline-none"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="new-password" class="text-[13px] font-semibold text-slate-700">New Password</label>
              <input
                id="new-password"
                v-model="passwordForm.next"
                type="password"
                required
                minlength="8"
                class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.12)] focus:outline-none"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="confirm-password" class="text-[13px] font-semibold text-slate-700">Confirm New Password</label>
              <input
                id="confirm-password"
                v-model="passwordForm.confirm"
                type="password"
                required
                minlength="8"
                class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.12)] focus:outline-none"
              />
            </div>

            <p v-if="passwordError" class="text-[13px] text-red-600">{{ passwordError }}</p>
            <p v-if="passwordSuccess" class="text-[13px] text-green-700">Password updated successfully.</p>

            <div class="flex justify-end">
              <button
                type="submit"
                class="inline-flex items-center gap-1.5 rounded-lg border-none bg-cyan-500 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:enabled:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="savingPassword"
              >
                {{ savingPassword ? 'Updating…' : 'Update Password' }}
              </button>
            </div>
          </form>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { ArrowLeft, Upload, Lock } from 'lucide-vue-next';
import { authService } from '@/services/authService';

const auth = useAuthStore();
const user = computed(() => auth.user);
const isOAuthUser = computed(() => !!user.value?.provider);

const initials = computed(() =>
  (user.value?.name ?? '')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase(),
);

const form = reactive({
  name: user.value?.name ?? '',
  email: user.value?.email ?? '',
  gender: user.value?.gender ?? '',
});

const avatarFile = ref<File | null>(null);
const avatarPreview = ref<string | null>(user.value?.avatar ?? null);

function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  avatarFile.value = file;
  avatarPreview.value = URL.createObjectURL(file);
}

function removeAvatar() {
  avatarFile.value = null;
  avatarPreview.value = null;
}

const savingProfile = ref(false);
const profileError = ref('');
const profileSuccess = ref(false);

async function submitProfile() {
  savingProfile.value = true;
  profileError.value = '';
  profileSuccess.value = false;
  try {
    const payload = new FormData();
    payload.append('name', form.name);
    if (!isOAuthUser.value) payload.append('email', form.email);
    if (form.gender) payload.append('gender', form.gender);
    if (avatarFile.value) payload.append('avatar', avatarFile.value);

    const { data: updatedUser } = await authService.updateProfile(payload);
    auth.setUser(updatedUser); 
    profileSuccess.value = true;
  } catch (err: any) {
    profileError.value = err?.response?.data?.message ?? 'Could not update profile.';
  } finally {
    savingProfile.value = false;
  }
}

const passwordForm = reactive({ current: '', next: '', confirm: '' });
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
    await authService.changePassword({
      current_password: passwordForm.current,
      password: passwordForm.next,
      password_confirmation: passwordForm.confirm,
    });
    passwordSuccess.value = true;
    passwordForm.current = '';
    passwordForm.next = '';
    passwordForm.confirm = '';
  } catch (err: any) {
    passwordError.value = err?.response?.data?.message ?? 'Could not update password.';
  } finally {
    savingPassword.value = false;
  }
}

onMounted(() => {
  if (window.location.hash === '#security') {
    document.getElementById('security')?.scrollIntoView({ behavior: 'smooth' });
  }
});
</script>
