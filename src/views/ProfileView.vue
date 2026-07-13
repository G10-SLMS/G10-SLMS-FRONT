<template>
  <div class="profile-page">
    <header class="page-header">
      <h1>My Profile</h1>
      <RouterLink to="/profile/edit" class="btn-primary">
        <Pencil :size="16" />
        Edit Profile
      </RouterLink>
    </header>

    <div class="profile-grid">
      <section class="card profile-card">
        <div class="avatar-block">
          <div class="avatar-lg">
            <img v-if="user?.avatar" :src="user.avatar" :alt="user?.name" />
            <span v-else>{{ initials }}</span>
          </div>
          <div>
            <h2 class="profile-name">{{ user?.name }}</h2>
            <span class="role-badge" :class="roleBadgeClass">{{ roleLabel }}</span>
          </div>
        </div>

        <dl class="info-list">
          <div class="info-row">
            <dt><Mail :size="16" /> Email</dt>
            <dd>{{ user?.email }}</dd>
          </div>
          <div class="info-row" v-if="user?.gender">
            <dt><User :size="16" /> Gender</dt>
            <dd class="capitalize">{{ user.gender }}</dd>
          </div>
          <div class="info-row">
            <dt><Shield :size="16" /> Role</dt>
            <dd class="capitalize">{{ user?.role }}</dd>
          </div>
        </dl>
      </section>

      <section class="card">
        <h3 class="card-title">Connected Accounts</h3>
        <p class="card-subtitle">Sign-in methods linked to your account.</p>

        <div class="provider-row">
          <div class="provider-info">
            <svg viewBox="0 0 24 24" class="provider-icon"><path fill="#EA4335" d="M12 11v2.4h6.7c-.3 1.6-2.1 4.6-6.7 4.6-4 0-7.3-3.3-7.3-7.4S8 3.2 12 3.2c2.3 0 3.8.9 4.7 1.8l3.2-3.1C17.9 0.2 15.2-.7 12-.7 5.6-.7.5 4.4.5 10.8s5.1 11.5 11.5 11.5c6.6 0 11-4.6 11-11.1 0-.7-.1-1.3-.2-1.9H12z"/></svg>
            <span>Google</span>
          </div>
          <span class="status-pill" :class="{ linked: providerLinked('google') }">
            {{ providerLinked('google') ? 'Connected' : 'Not connected' }}
          </span>
        </div>

        <div class="provider-row">
          <div class="provider-info">
            <svg viewBox="0 0 24 24" class="provider-icon"><path fill="#181717" d="M12 .3a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.7-1.4-1.7-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.3-3.2-.1-.3-.6-1.6.1-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 016 0c2.3-1.6 3.3-1.2 3.3-1.2.7 1.6.2 2.9.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .3z"/></svg>
            <span>GitHub</span>
          </div>
          <span class="status-pill" :class="{ linked: providerLinked('github') }">
            {{ providerLinked('github') ? 'Connected' : 'Not connected' }}
          </span>
        </div>
      </section>

      <section class="card">
        <h3 class="card-title">Security</h3>
        <p class="card-subtitle">Manage your password and account security.</p>
        <RouterLink to="/profile/edit#security" class="btn-secondary">
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

const roleBadgeClass = computed(() => `role-${user.value?.role ?? 'student'}`);

function providerLinked(name: 'google' | 'github') {
  return user.value?.provider === name;
}
</script>

<style scoped>
.profile-page {
  padding: 24px 32px;
  max-width: 900px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
}
.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: #f1f5f9;
  color: #334155;
}
.btn-secondary:hover {
  background: #e2e8f0;
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

.avatar-block {
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

.profile-name {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.role-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 3px 8px;
  border-radius: 999px;
}
.role-admin { background: #fee2e2; color: #b91c1c; }
.role-trainer { background: #fef3c7; color: #b45309; }
.role-student { background: #eff6ff; color: #2563eb; }

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}

.info-row dt {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-weight: 500;
}

.info-row dd {
  color: #0f172a;
  font-weight: 600;
}

.capitalize {
  text-transform: capitalize;
}

.provider-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
}
.provider-row:last-child {
  border-bottom: none;
}

.provider-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.provider-icon {
  width: 20px;
  height: 20px;
}

.status-pill {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #94a3b8;
}
.status-pill.linked {
  background: #dcfce7;
  color: #15803d;
}

@media (min-width: 720px) {
  .profile-grid {
    grid-template-columns: 1fr 1fr;
  }
  .profile-card {
    grid-column: 1 / -1;
  }
}
</style>
