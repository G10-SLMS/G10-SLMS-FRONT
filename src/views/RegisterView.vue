<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logoUrl from '@/assets/image/logo.png'

import AuthPanelLeft from '@/components/auth/AuthPanelLeft.vue'
import AuthTabs from '@/components/auth/AuthTabs.vue'
import FormField from '@/components/auth/FormField.vue'
import SelectField from '@/components/auth/SelectField.vue'
import PasswordField from '@/components/auth/PasswordField.vue'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons.vue'
import { Mail, User, GraduationCap } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  fullName: '',
  email: '',
  role: 'student' as 'student' | 'trainer',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
})

const passwordMismatch = computed(
  () => form.confirmPassword.length > 0 && form.password !== form.confirmPassword
)

function socialLogin(provider: 'google' | 'github') {
  auth.socialLogin(provider)
}

async function handleSubmit() {
  if (passwordMismatch.value) return

  const success = await auth.register({
    name: form.fullName,
    email: form.email,
    role: form.role,
    password: form.password,
    password_confirmation: form.confirmPassword,
  })

  if (success) {
    router.push('/dashboard')
  }
}
</script>

<template>
  <div class="auth-page">
    <AuthPanelLeft
      :logo-url="logoUrl"
      title="Join your institution's leave portal."
      description="Create your account to submit leave requests, track attendance, and stay in sync with your institution."
    />

    <main class="auth-panel-right">
      <div class="auth-card">
        <AuthTabs active="register" />

        <div class="auth-heading">
          <h2>Create your account</h2>
          <p>Set up access to your institutional dashboard</p>
        </div>

        <div v-if="auth.error" class="form-error-banner">{{ auth.error }}</div>

        <form @submit.prevent="handleSubmit" novalidate>
          <FormField
            id="fullName"
            label="Full Name"
            v-model="form.fullName"
            placeholder="Jane Doe"
            autocomplete="name"
            required
          >
            <template #icon><User :size="18" :stroke-width="1.8" /></template>
          </FormField>

          <FormField
            id="regEmail"
            label="Institutional Email"
            type="email"
            v-model="form.email"
            placeholder="student@passerellesnumeriques.org"
            autocomplete="email"
            required
          >
            <template #icon><Mail :size="18" :stroke-width="1.8" /></template>
          </FormField>

          <SelectField id="role" label="Account Type" v-model="form.role" required>
            <template #icon><GraduationCap :size="18" :stroke-width="1.8" /></template>
            <option value="student">Student</option>
            <option value="trainer">Trainer</option>
          </SelectField>

          <div class="form-row-split">
            <PasswordField
              id="regPassword"
              label="Password"
              v-model="form.password"
              autocomplete="new-password"
              :minlength="8"
              required
            />

            <PasswordField
              id="confirmPassword"
              label="Confirm"
              v-model="form.confirmPassword"
              autocomplete="new-password"
              :minlength="8"
              required
            />
          </div>
          <p v-if="passwordMismatch" class="field-error">Passwords do not match.</p>

          <div class="form-checkbox-row">
            <input id="terms" v-model="form.acceptTerms" type="checkbox" required />
            <label for="terms">
              I agree to the
              <a href="#" class="form-link">Terms of Service</a> and
              <a href="#" class="form-link">Privacy Policy</a>
            </label>
          </div>

          <button type="submit" class="btn-primary" :disabled="auth.loading || passwordMismatch">
            {{ auth.loading ? 'Creating account…' : 'Create Account' }}
          </button>
        </form>

        <SocialAuthButtons @login="socialLogin" />

        <p class="auth-footer">
          Already have an account?
          <RouterLink to="/login">Sign in instead</RouterLink>
        </p>
      </div>
    </main>
  </div>
</template>

<style>
@import '@/assets/styles/main.css';
</style>
