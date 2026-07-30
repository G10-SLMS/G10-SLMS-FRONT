<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logoUrl from '@/assets/image/logo.png'

import AuthPanelLeft from '@/components/auth/AuthPanelLeft.vue'
import AuthTabs from '@/components/auth/AuthTabs.vue'
import FormField from '@/components/auth/FormField.vue'
import PasswordField from '@/components/auth/PasswordField.vue'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons.vue'
import { Mail, User } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  fullName: '',
  email: '',
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
    password: form.password,
    password_confirmation: form.confirmPassword,
  })

  if (success) {
    router.push('/dashboard')
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-white">
    <AuthPanelLeft
      :logo-url="logoUrl"
      title="Join your institution's leave portal."
      description="Create your account to submit leave requests, track attendance, and stay in sync with your institution."
    />

    <main class="flex flex-1 basis-[55%] items-center justify-center px-8 py-10">
      <div class="w-full max-w-[420px]">
        <AuthTabs active="register" />

        <div class="mb-7">
          <h2 class="mb-1.5 text-2xl font-extrabold text-gray-900">Create your account</h2>
          <p class="text-[0.92rem] text-gray-500">Set up access to your institutional dashboard</p>
        </div>

        <div v-if="auth.error" class="mb-[1.1rem] rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[0.85rem] text-red-700">{{ auth.error }}</div>

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

          <div class="flex gap-4">
            <PasswordField
              id="regPassword"
              label="Password"
              v-model="form.password"
              autocomplete="new-password"
              :minlength="8"
              required
              class="flex-1"
            />

            <PasswordField
              id="confirmPassword"
              label="Confirm"
              v-model="form.confirmPassword"
              autocomplete="new-password"
              :minlength="8"
              required
              class="flex-1"
            />
          </div>
          <p v-if="passwordMismatch" class="mt-1.5 text-[0.78rem] text-red-600">Passwords do not match.</p>

          <div class="mb-6 flex items-center gap-2.5">
            <input id="terms" v-model="form.acceptTerms" type="checkbox" required class="h-4 w-4 accent-[#f5a623]" />
            <label for="terms" class="text-[0.88rem] text-gray-700">
              I agree to the
              <a href="#" class="font-semibold text-[#56637c] transition-colors hover:text-[#e09510] hover:underline">Terms of Service</a> and
              <a href="#" class="font-semibold text-[#56637c] transition-colors hover:text-[#e09510] hover:underline">Privacy Policy</a>
            </label>
          </div>

          <button
            type="submit"
            class="w-full cursor-pointer rounded-[10px] border-none bg-[#f5a623] py-3.5 text-[0.96rem] font-bold text-white transition-transform hover:brightness-105 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="auth.loading || passwordMismatch"
          >
            {{ auth.loading ? 'Creating account…' : 'Create Account' }}
          </button>
        </form>

        <SocialAuthButtons @login="socialLogin" />

        <p class="mt-7 text-center text-[0.85rem] text-gray-400">
          Already have an account?
          <RouterLink to="/login" class="font-medium text-[#f5a623] hover:underline">Sign in instead</RouterLink>
        </p>
      </div>
    </main>
  </div>
</template>
