<template>
  <div class="auth-page">
    <!-- Left promotional panel -->
    <aside class="auth-panel-left">
      <div class="auth-brand">
      <img :src="logoUrl" alt="SLMS logo" class="auth-brand-logo" />
  
    </div>

      <div class="auth-hero">
        <h1>Join your institution's leave portal.</h1>
        <p>
          Create your account to submit leave requests, track attendance, and
          stay in sync with your institution.
        </p>
      </div>

      <div class="auth-trust">
        <div class="auth-trust-avatars">
          <span></span><span></span><span></span>
        </div>
        <p>Trusted by 1,000+ students and faculty</p>
      </div>
    </aside>

    <!-- Right form panel -->
    <main class="auth-panel-right">
      <div class="auth-card">
        <nav class="auth-tabs">
          <RouterLink to="/login" class="auth-tab">Sign In</RouterLink>
          <RouterLink to="/register" class="auth-tab active">Create Account</RouterLink>
        </nav>

        <div class="auth-heading">
          <h2>Create your account</h2>
          <p>Set up access to your institutional dashboard</p>
        </div>

        <div v-if="auth.error" class="form-error-banner">{{ auth.error }}</div>

        <form @submit.prevent="handleSubmit" novalidate>
          <div class="form-row">
            <label class="form-label" for="fullName">Full Name</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M4.5 20c1.4-3.7 4.4-6 7.5-6s6.1 2.3 7.5 6" />
                </svg>
              </span>
              <input
                id="fullName"
                v-model="form.fullName"
                type="text"
                placeholder="Jane Doe"
                autocomplete="name"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label" for="regEmail">Institutional Email</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
                  <path d="M3 6l9 7 9-7" />
                </svg>
              </span>
              <input
                id="regEmail"
                v-model="form.email"
                type="email"
                placeholder="student@passerellesnumeriques.org"
                autocomplete="email"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <label class="form-label" for="role">Account Type</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z" />
                  <path d="M6.5 10.5V15c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-4.5" />
                </svg>
              </span>
              <select id="role" v-model="form.role" required>
                <option value="student">Student</option>
                <option value="trainer">Trainer</option>
              </select>
            </div>
          </div>

          <div class="form-row-split">
            <div class="form-row">
              <label class="form-label" for="regPassword">Password</label>
              <div class="input-wrap">
                <span class="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="4" y="10.5" width="16" height="10" rx="2" />
                    <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
                  </svg>
                </span>
                <input
                  id="regPassword"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  minlength="8"
                  required
                />
                <button
                  type="button"
                  class="toggle-visibility"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="form-row">
              <label class="form-label" for="confirmPassword">Confirm</label>
              <div class="input-wrap">
                <span class="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="4" y="10.5" width="16" height="10" rx="2" />
                    <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
                  </svg>
                </span>
                <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  minlength="8"
                  required
                />
                <button
                  type="button"
                  class="toggle-visibility"
                  :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>
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

        <div class="divider">OR CONTINUE WITH</div>

        <div class="social-row">
          <button type="button" class="btn-social btn-google" @click="socialLogin('google')">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google
          </button>
          <button type="button" class="btn-social btn-github" @click="socialLogin('github')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#374151"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </button>
        </div>

        <p class="auth-footer">
          Already have an account?
          <RouterLink to="/login">Sign in instead</RouterLink>
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logoUrl from '@/assets/image/logo.png'

const router = useRouter()
const auth = useAuthStore()

const showPassword = ref(false)
const showConfirmPassword = ref(false)

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

function socialLogin(provider: 'google' | 'office365' | 'github') {
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

<style>
@import '@/assets/styles/main.css';
</style>