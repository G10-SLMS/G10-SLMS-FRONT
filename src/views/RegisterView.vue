<template>
  <div class="auth-page">
    <!-- Left promotional panel -->
    <aside class="auth-panel-left">
      <div class="auth-brand">
        <span class="auth-brand-icon">🎓</span>
        <span class="auth-brand-name">EduLeave</span>
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
        <p>Trusted by 5,000+ students and faculty</p>
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
                placeholder="student@university.edu"
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
          <button type="button" class="btn-social" @click="socialLogin('google')">
            <span>🔵</span> Google
          </button>
          <button type="button" class="btn-social" @click="socialLogin('office365')">
            <span>🟦</span> Office 365
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

function socialLogin(provider: 'google' | 'office365') {
  auth.socialLogin(provider)
}

async function handleSubmit() {
  if (passwordMismatch.value) return

  const success = await auth.register({
    fullName: form.fullName,
    email: form.email,
    role: form.role,
    password: form.password,
  })

  if (success) {
    router.push('/dashboard')
  }
}
</script>

<style>
@import '@/assets/styles/main.css';
</style>