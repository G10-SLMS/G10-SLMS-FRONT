<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logoUrl from '@/assets/image/logo.png'

import AuthPanelLeft from '@/components/auth/AuthPanelLeft.vue'
import AuthTabs from '@/components/auth/AuthTabs.vue'
import FormField from '@/components/auth/FormField.vue'
import PasswordField from '@/components/auth/PasswordField.vue'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons.vue'
import { Mail, Phone } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const selectedRole = ref<'student' | 'trainer' | null>(null)

const form = reactive({
  email: '',
  password: '',
  remember: false,
})

function fillDemo(kind: 'student' | 'fellow' | 'trainer') {
  selectedRole.value = kind === 'trainer' ? 'trainer' : 'student'

  const demoEmails: Record<typeof kind, string> = {
    student: '@student.passerellesnumeriques.org',
    fellow: '@fellow.passerellesnumeriques.org',
    trainer: '@trainer.passerellesnumeriques.org',
  }

  form.email = demoEmails[kind]
  form.password = kind === 'trainer' ? 'password' : 'password123'
}

function socialLogin(provider: 'google' | 'github') {
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/${provider}/redirect`
}

function handleForgotPassword() {
  router.push('/forgot-password')
}

async function handleSubmit() {
  const success = await auth.login({
    email: form.email,
    password: form.password,
    remember: form.remember,
    role: selectedRole.value ?? undefined,
  })

  if (success) {
    router.push('/')
  }
}
</script>

<template>
  <div class="auth-page">
    <AuthPanelLeft
      :logo-url="logoUrl"
      title="Manage your academic life with ease."
      description="The professional centralized portal for leave requests, attendance management, and institutional transparency."
    />

    <main class="auth-panel-right">
      <div class="auth-card">
        <AuthTabs active="login" />

        <div class="auth-heading">
          <h2>Welcome back</h2>
          <p>Access your institutional dashboard</p>
        </div>

        <div v-if="auth.error" class="form-error-banner">{{ auth.error }}</div>

        <form @submit.prevent="handleSubmit" novalidate>
          <FormField
            id="email"
            label="Institutional Email"
            type="email"
            v-model="form.email"
            placeholder="student@passerellesnumeriques.org"
            autocomplete="username"
            required
          >
            <template #icon><Mail :size="18" :stroke-width="1.8" /></template>
            <template #hint>
              <p class="form-hint">
                Quick links:
                <button type="button" class="role-link" @click="fillDemo('student')">Student Account</button>
                <span class="form-hint-divider">|</span>
                <button type="button" class="role-link" @click="fillDemo('fellow')">Fellow Account</button>
                <span class="form-hint-divider">|</span>
                <button type="button" class="role-link" @click="fillDemo('trainer')">Trainer Account</button>
              </p>
            </template>
          </FormField>

          <PasswordField
            id="password"
            label="Password"
            v-model="form.password"
            autocomplete="current-password"
            required
          >
            <template #label-extra>
              <button type="button" class="forgot-link" @click="handleForgotPassword">Forgot Password?</button>
            </template>
          </PasswordField>

          <div class="form-checkbox-row">
            <input id="remember" v-model="form.remember" type="checkbox" />
            <label for="remember">Keep me logged in for 30 days</label>
          </div>

          <button type="submit" class="btn-primary" :disabled="auth.loading">
            {{ auth.loading ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>

        <SocialAuthButtons @login="socialLogin" />

        <p class="auth-footer">
          Having trouble signing in?
          <br />
          <a href="mailto:admin@university.edu" class="contact-link">
            <Phone :size="16" :stroke-width="1.8" />
            Contact Administration
          </a>
        </p>
      </div>
    </main>
  </div>
</template>

<style>
@import '@/assets/styles/main.css';
</style>
