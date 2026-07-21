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
    trainer: '@passerellesnumeriques.org',
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
  // Note: the backend's /login endpoint only accepts email + password —
  // there's no "remember me" or role parameter on AuthController::login.
  const success = await auth.login({
    email: form.email,
    password: form.password,
  })
  if (success) router.push('/')
}
</script>

<template>
  <div class="flex min-h-screen bg-white">
    <AuthPanelLeft
      :logo-url="logoUrl"
      title="Manage your academic life with ease."
      description="The professional centralized portal for leave requests, attendance management, and institutional transparency."
    />

    <main class="flex flex-1 basis-[55%] items-center justify-center bg-white px-8 py-10">
      <div class="w-full max-w-[420px]">
        <AuthTabs active="login" />

        <div class="mb-7">
          <h2 class="mb-1.5 text-2xl font-extrabold text-gray-900">Welcome back</h2>
          <p class="text-[0.92rem] text-gray-500">Access your institutional dashboard</p>
        </div>

        <div v-if="auth.error" class="mb-[1.1rem] rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[0.85rem] text-red-700">{{ auth.error }}</div>

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
              <p class="mt-2 flex flex-wrap items-center gap-2 text-[0.78rem] text-[#4b4e54]">
                Quick links:
                <button type="button" class="cursor-pointer whitespace-nowrap rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-3 py-1 text-[0.8rem] font-semibold leading-snug text-[#e09510] transition-colors hover:border-[#f5a623]/50 hover:bg-[#f5a623]/20 active:scale-[0.98]" @click="fillDemo('student')">Student Account</button>
                <span class="font-medium text-gray-300">|</span>
                <button type="button" class="cursor-pointer whitespace-nowrap rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-3 py-1 text-[0.8rem] font-semibold leading-snug text-[#e09510] transition-colors hover:border-[#f5a623]/50 hover:bg-[#f5a623]/20 active:scale-[0.98]" @click="fillDemo('fellow')">Fellow Account</button>
                <span class="font-medium text-gray-300">|</span>
                <button type="button" class="cursor-pointer whitespace-nowrap rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-3 py-1 text-[0.8rem] font-semibold leading-snug text-[#e09510] transition-colors hover:border-[#f5a623]/50 hover:bg-[#f5a623]/20 active:scale-[0.98]" @click="fillDemo('trainer')">Trainer Account</button>
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
              <button type="button" class="cursor-pointer whitespace-nowrap rounded-md border-none bg-transparent px-1 py-0.5 text-[0.82rem] font-semibold leading-normal text-[#f5a623] transition-colors hover:text-[#e09510] active:text-[#e09510]" @click="handleForgotPassword">Forgot Password?</button>
            </template>
          </PasswordField>

          <div class="mb-6 flex items-center gap-2.5">
            <input id="remember" v-model="form.remember" type="checkbox" class="h-4 w-4 accent-[#f5a623]" />
            <label for="remember" class="text-[0.88rem] text-gray-700">Keep me logged in for 30 days</label>
          </div>

          <button
            type="submit"
            class="w-full cursor-pointer rounded-[10px] border-none bg-[#f5a623] py-3.5 text-[0.96rem] font-bold text-white transition-all hover:bg-[#e09510] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="auth.loading"
          >
            {{ auth.loading ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>

        <SocialAuthButtons @login="socialLogin" />

        <p class="mt-7 text-center text-[0.85rem] text-gray-400">
          Having trouble signing in?<br />
          <a href="mailto:admin@university.edu" class="inline-flex items-center gap-1.5 font-medium text-[#f5a623] hover:underline">
            <Phone :size="16" :stroke-width="1.8" />
            Contact Administration
          </a>
        </p>
      </div>
    </main>
  </div>
</template>
