<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logoUrl from '@/assets/image/logo.png'

import AuthPanelLeft from '@/components/auth/AuthPanelLeft.vue'
import FormField from '@/components/auth/FormField.vue'
import { Mail, MailCheck, ArrowLeft } from 'lucide-vue-next'

const auth = useAuthStore()

const form = reactive({
  email: '',
})

const submitted = ref(false)
const localError = ref<string | null>(null)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(): boolean {
  localError.value = null

  if (!form.email.trim()) {
    localError.value = 'Please enter your email address.'
    return false
  }

  if (!EMAIL_PATTERN.test(form.email.trim())) {
    localError.value = 'Please enter a valid email address.'
    return false
  }

  return true
}

async function handleSubmit() {
  if (!validate()) return

  try {
    await auth.forgotPassword(form.email.trim())
    // Always show the same success state, whether or not the email exists —
    // the backend deliberately doesn't reveal account existence.
    submitted.value = true
  } catch {
    // auth.error already carries a user-facing message.
  }
}

function tryAnotherEmail() {
  submitted.value = false
  localError.value = null
}
</script>

<template>
  <div class="flex min-h-screen bg-white dark:bg-surface-darker">
    <AuthPanelLeft
      :logo-url="logoUrl"
      title="Forgot your password? We've got you covered."
      description="Enter your institutional email and we'll send you a secure link to reset your password."
    />

    <main class="flex flex-1 basis-[55%] items-center justify-center bg-white px-8 py-10 dark:bg-surface-darker">
      <div class="w-full max-w-[420px]">
        <RouterLink
          to="/login"
          class="mb-6 inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-slate-400 transition-colors hover:text-slate-800"
        >
          <ArrowLeft :size="16" :stroke-width="2" />
          Back to Sign In
        </RouterLink>

        <!-- Success state -->
        <template v-if="submitted">
          <div class="mb-7 text-center">
            <div class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#f5a623]/10">
              <MailCheck :size="26" :stroke-width="1.8" class="text-[#f5a623]" />
            </div>
            <h2 class="mb-2 text-2xl font-extrabold text-gray-900">Check your inbox</h2>
            <p class="text-[0.92rem] leading-relaxed text-gray-500">
              If an account exists for <span class="font-semibold text-gray-700">{{ form.email }}</span>,
              we've sent a password reset link to it. The link expires in 60 minutes.
            </p>
          </div>

          <button
            type="button"
            class="w-full cursor-pointer rounded-[10px] border border-gray-300 bg-white py-3.5 text-[0.96rem] font-bold text-gray-700 transition-all hover:bg-gray-50 active:translate-y-px"
            @click="tryAnotherEmail"
          >
            Use a different email
          </button>

          <p class="mt-6 text-center text-[0.85rem] text-gray-400">
            Didn't get an email? Check your spam folder, or try again in a few minutes.
          </p>
        </template>

        <!-- Request form -->
        <template v-else>
          <div class="mb-7">
            <h2 class="mb-1.5 text-2xl font-extrabold text-gray-900">Reset your password</h2>
            <p class="text-[0.92rem] text-gray-500">
              Enter the email associated with your account and we'll send a reset link.
            </p>
          </div>

          <div
            v-if="localError || auth.error"
            class="mb-[1.1rem] rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[0.85rem] text-red-700"
          >
            {{ localError || auth.error }}
          </div>

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
            </FormField>

            <button
              type="submit"
              class="mt-2 w-full cursor-pointer rounded-[10px] border-none bg-[#f5a623] py-3.5 text-[0.96rem] font-bold text-white transition-all hover:bg-[#e09510] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="auth.loading"
            >
              {{ auth.loading ? 'Sending link…' : 'Send Reset Link' }}
            </button>
          </form>

          <p class="mt-7 text-center text-[0.85rem] text-gray-400">
            Remembered your password?
            <RouterLink to="/login" class="font-medium text-[#f5a623] hover:underline">Sign in</RouterLink>
          </p>
        </template>
      </div>
    </main>
  </div>
</template>
