<template>
  <div class="auth-page">
    <!-- Left promotional panel -->
    <aside class="auth-panel-left">
      <div class="auth-brand">
        <span class="auth-brand-icon">🎓</span>
        <span class="auth-brand-name">EduLeave</span>
      </div>

      <div class="auth-hero">
        <h1>Manage your academic life with ease.</h1>
        <p>
          The professional centralized portal for leave requests, attendance
          management, and institutional transparency.
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
          <RouterLink to="/login" class="auth-tab active">Sign In</RouterLink>
          <RouterLink to="/register" class="auth-tab">Create Account</RouterLink>
        </nav>

        <div class="auth-heading">
          <h2>Welcome back</h2>
          <p>Access your institutional dashboard</p>
        </div>

        <div v-if="auth.error" class="form-error-banner">{{ auth.error }}</div>

        <form @submit.prevent="handleSubmit" novalidate>
          <div class="form-row">
            <label class="form-label" for="email">Institutional Email</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
                  <path d="M3 6l9 7 9-7" />
                </svg>
              </span>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="student@university.edu"
                autocomplete="username"
                required
              />
            </div>
              <p class="form-hint">
                Quick links:
                <button type="button" class="role-link" @click="fillDemo('student')">Student Account</button>
                <span class="form-hint-divider">|</span>
                <button type="button" class="role-link" @click="fillDemo('trainer')">Trainer Account</button>
              </p>
          </div>

          <div class="form-row">
          <div class="form-label-line">
            <label class="form-label" for="password">Password</label>
            <button type="button" class="forgot-link" @click="handleForgotPassword">Forgot Password?</button>
          </div>
            <div class="input-wrap">
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="4" y="10.5" width="16" height="10" rx="2" />
                  <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
                </svg>
              </span>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
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

          <div class="form-checkbox-row">
            <input id="remember" v-model="form.remember" type="checkbox" />
            <label for="remember">Keep me logged in for 30 days</label>
          </div>

          <button type="submit" class="btn-primary" :disabled="auth.loading">
            {{ auth.loading ? 'Signing in…' : 'Sign In' }}
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
          Having trouble signing in?
          <br />
          <a href="mailto:admin@university.edu">📞 Contact Administration</a>
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const showPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
  remember: false,
})

function fillDemo(role: 'student' | 'trainer') {
  form.email = role === 'student' ? 'student@university.edu' : 'trainer@university.edu'
  form.password = 'demo-password'
}

function socialLogin(provider: 'google' | 'office365' | 'github') {
  auth.socialLogin(provider)
}

function handleForgotPassword() {
  router.push('/forgot-password')
}

async function handleSubmit() {
  const success = await auth.login({
    email: form.email,
    password: form.password,
    remember: form.remember,
  })

  if (success) {
    router.push('/')
  }
}
</script>

<style>
@import '@/assets/styles/main.css';
</style>