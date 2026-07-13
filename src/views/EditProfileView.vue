<template>
  <div class="profile-page">
    <header class="page-header">
      <RouterLink to="/profile" class="back-link">
        <ArrowLeft :size="16" />
        Back to Profile
      </RouterLink>
      <h1>Edit Profile</h1>
    </header>

    <div class="profile-grid">
      <section class="card">
        <h3 class="card-title">Basic Information</h3>
        <p class="card-subtitle">Update your name, email, and photo.</p>

        <div class="avatar-edit">
          <div class="avatar-lg">
            <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar preview" />
            <span v-else>{{ initials }}</span>
          </div>
          <div class="avatar-actions">
            <label class="btn-secondary file-label">
              <Upload :size="16" />
              Change Photo
              <input type="file" accept="image/*" class="sr-only" @change="onAvatarChange" />
            </label>
            <button
              v-if="avatarPreview"
              type="button"
              class="btn-text danger"
              @click="removeAvatar"
            >
              Remove
            </button>
          </div>
        </div>

        <form class="form" @submit.prevent="submitProfile">
          <div class="field">
            <label for="name">Full Name</label>
            <input id="name" v-model="form.name" type="text" required />
          </div>

          <div class="field">
            <label for="email">Email Address</label>
            <input id="email" v-model="form.email" type="email" required :disabled="isOAuthUser" />
            <span v-if="isOAuthUser" class="field-hint">
              Email is managed by your {{ user?.provider }} account.
            </span>
          </div>

          <div class="field">
            <label for="gender">Gender</label>
            <select id="gender" v-model="form.gender">
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <p v-if="profileError" class="form-error">{{ profileError }}</p>
          <p v-if="profileSuccess" class="form-success">Profile updated successfully.</p>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="savingProfile">
              {{ savingProfile ? 'Saving…' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </section>

      <section id="security" class="card">
        <h3 class="card-title">
          <Lock :size="16" />
          Change Password
        </h3>
        <p v-if="isOAuthUser" class="card-subtitle">
          Your account signs in via {{ user?.provider }}, so there's no password to change here.
        </p>
        <template v-else>
          <p class="card-subtitle">Choose a strong password you don't use elsewhere.</p>

          <form class="form" @submit.prevent="submitPassword">
            <div class="field">
              <label for="current-password">Current Password</label>
              <input id="current-password" v-model="passwordForm.current" type="password" required />
            </div>
            <div class="field">
              <label for="new-password">New Password</label>
              <input id="new-password" v-model="passwordForm.next" type="password" required minlength="8" />
            </div>
            <div class="field">
              <label for="confirm-password">Confirm New Password</label>
              <input id="confirm-password" v-model="passwordForm.confirm" type="password" required minlength="8" />
            </div>

            <p v-if="passwordError" class="form-error">{{ passwordError }}</p>
            <p v-if="passwordSuccess" class="form-success">Password updated successfully.</p>

            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="savingPassword">
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
    auth.setUser(updatedUser); // ⚠️ confirm this matches your store's actual method name
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

<style scoped>
.profile-page {
  padding: 24px 32px;
  max-width: 900px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin-top: 8px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-decoration: none;
}
.back-link:hover {
  color: #2563eb;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px 24px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2px;
}

.card-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 16px;
}

.avatar-edit {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.avatar-lg {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  overflow: hidden;
  flex-shrink: 0;
}
.avatar-lg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

.file-label {
  cursor: pointer;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.field input,
.field select {
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #0f172a;
  background: #fff;
}
.field input:focus,
.field select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}
.field input:disabled {
  background: #f8fafc;
  color: #94a3b8;
}

.field-hint {
  font-size: 12px;
  color: #94a3b8;
}

.form-error {
  font-size: 13px;
  color: #dc2626;
}

.form-success {
  font-size: 13px;
  color: #15803d;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary,
.btn-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f5f9;
  color: #334155;
}
.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-text {
  background: none;
  padding: 8px 4px;
}
.btn-text.danger {
  color: #dc2626;
}
.btn-text.danger:hover {
  color: #b91c1c;
}

@media (min-width: 720px) {
  .profile-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
