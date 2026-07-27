<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logoUrl from '@/assets/image/logo.png'

import AuthPanelLeft from '@/components/auth/AuthPanelLeft.vue'
import PasswordField from '@/components/auth/PasswordField.vue'
import { CheckCircle2, XCircle } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

// Token + email arrive as query params from the link in the reset email,
// e.g. /reset-password?token=xxx&email=xxx
const token = ref((route.query.token as string) || '')
const email = ref((route.query.email as string) || '')
const linkValid = ref(true)

onMounted(() => {
  // Missing token/email means the link is malformed — nothing to submit against.
  linkValid.value = Boolean(token.value && email.value)
})

const form = reactive({
  password: '',
  confirmPassword: '',
})

const submitted = ref(false)

const passwordMismatch = computed(
  () => form.confirmPassword.length > 0 && form.password !== form.confirmPassword,
)
const passwordTooShort = computed(
  () => form.password.length > 0 && form.password.length < 8,
)

async function handleSubmit() {
  if (passwordMismatch.value || passwordTooShort.value) return

  try {
    await auth.resetPassword({
      email: email.value,
      token: token.value,
      password: form.password,
      password_confirmation: form.confirmPassword,
    })
    submitted.value = true
  } catch {
    // An expired/invalid token surfaces via auth.error and the 401/422 response;
    // treat it the same as a broken link so the person can request a new one.
    if ((auth.error || '').toLowerCase().includes('token') || (auth.error || '').toLowerCase().includes('invalid')) {
      linkValid.value = false
    }
  }
}

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-white dark:bg-surface-darker">
    <AuthPanelLeft
      :logo-url="logoUrl"
      title="Choose a new password."
      description="Set a strong password to keep your academic account secure."
    />

    <main class="flex flex-1 basis-[55%] items-center justify-center bg-white px-8 py-10 dark:bg-surface-darker">
      <div class="w-full max-w-[420px]">
        <!-- Invalid / expired / missing token -->
        <template v-if="!linkValid">
          <div class="mb-7 text-center">
            <div class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <XCircle :size="26" :stroke-width="1.8" class="text-red-500" />
            </div>
            <h2 class="mb-2 text-2xl font-extrabold text-gray-900">This link is invalid or expired</h2>
            <p class="text-[0.92rem] leading-relaxed text-gray-500">
              Password reset links expire after 60 minutes and can only be used once. Request a new
              one to continue.
            </p>
          </div>

          <RouterLink
            to="/forgot-password"
            class="block w-full cursor-pointer rounded-[10px] border-none bg-[#f5a623] py-3.5 text-center text-[0.96rem] font-bold text-white transition-all hover:bg-[#e09510] active:translate-y-px"
          >
            Request a New Link
          </RouterLink>

          <p class="mt-7 text-center text-[0.85rem] text-gray-400">
            <RouterLink to="/login" class="font-medium text-[#f5a623] hover:underline">Back to Sign In</RouterLink>
          </p>
        </template>

        <!-- Success state -->
        <template v-else-if="submitted">
          <div class="mb-7 text-center">
            <div class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 :size="26" :stroke-width="1.8" class="text-green-600" />
            </div>
            <h2 class="mb-2 text-2xl font-extrabold text-gray-900">Password reset successfully</h2>
            <p class="text-[0.92rem] leading-relaxed text-gray-500">
              You've been signed out of all devices for security. Sign in with your new password to
              continue.
            </p>
          </div>

          <button
            type="button"
            class="w-full cursor-pointer rounded-[10px] border-none bg-[#f5a623] py-3.5 text-[0.96rem] font-bold text-white transition-all hover:bg-[#e09510] active:translate-y-px"
            @click="goToLogin"
          >
            Continue to Sign In
          </button>
        </template>

        <!-- Reset form -->
        <template v-else>
          <div class="mb-7">
            <h2 class="mb-1.5 text-2xl font-extrabold text-gray-900">Set a new password</h2>
            <p class="text-[0.92rem] text-gray-500">
              Resetting password for <span class="font-semibold text-gray-700">{{ email }}</span>
            </p>
          </div>

          <div
            v-if="auth.error"
            class="mb-[1.1rem] rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[0.85rem] text-red-700"
          >
            {{ auth.error }}
          </div>

          <form @submit.prevent="handleSubmit" novalidate>
            <PasswordField
              id="password"
              label="New Password"
              v-model="form.password"
              autocomplete="new-password"
              :minlength="8"
              required
            >
              <template #error>
                <p v-if="passwordTooShort" class="mt-1.5 text-[0.78rem] text-red-600">
                  Password must be at least 8 characters.
                </p>
              </template>
            </PasswordField>

            <PasswordField
              id="confirmPassword"
              label="Confirm New Password"
              v-model="form.confirmPassword"
              autocomplete="new-password"
              :minlength="8"
              required
            >
              <template #error>
                <p v-if="passwordMismatch" class="mt-1.5 text-[0.78rem] text-red-600">
                  Passwords do not match.
                </p>
              </template>
            </PasswordField>

            <button
              type="submit"
              class="mt-2 w-full cursor-pointer rounded-[10px] border-none bg-[#f5a623] py-3.5 text-[0.96rem] font-bold text-white transition-all hover:bg-[#e09510] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="auth.loading || passwordMismatch || passwordTooShort"
            >
              {{ auth.loading ? 'Resetting…' : 'Reset Password' }}
            </button>
          </form>

          <p class="mt-7 text-center text-[0.85rem] text-gray-400">
            <RouterLink to="/login" class="font-medium text-[#f5a623] hover:underline">Back to Sign In</RouterLink>
          </p>
        </template>
      </div>
    </main>
  </div>
</template>
