<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100 p-4">
    <div class="w-full max-w-[360px] rounded-2xl bg-white p-10 text-center shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <template v-if="status === 'loading'">
        <span class="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700 [&_svg]:animate-spin">
          <Loader2 :size="28" :stroke-width="1.8" />
        </span>
        <h1 class="mb-1.5 text-lg font-semibold text-gray-900">Signing you in…</h1>
        <p class="m-0 text-sm text-gray-500">Please wait while we finish connecting your account.</p>
      </template>

      <template v-else-if="status === 'error'">
        <span class="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle :size="28" :stroke-width="1.8" />
        </span>
        <h1 class="mb-1.5 text-lg font-semibold text-gray-900">Sign-in failed</h1>
        <p class="mb-5 text-sm text-red-600">{{ errorMessage }}</p>
        <RouterLink to="/login" class="inline-flex items-center gap-1.5 rounded-md border-none bg-blue-600 px-4 py-2.5 text-sm text-white no-underline hover:bg-blue-700">
          <ArrowLeft :size="16" :stroke-width="1.8" />
          Back to Sign In
        </RouterLink>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const status = ref<'loading' | 'error'>('loading')
const errorMessage = ref('')

onMounted(async () => {
  const provider = route.meta.provider // 'google' | 'github', set per-route
  const code = route.query.code as string | undefined
  const state = route.query.state as string | undefined
  const oauthError = route.query.error as string | undefined

  if (!provider) {
    status.value = 'error'
    errorMessage.value = 'Unknown sign-in provider.'
    return
  }

  if (oauthError) {
    status.value = 'error'
    errorMessage.value = `${provider} sign-in was cancelled.`
    return
  }

  if (!code) {
    status.value = 'error'
    errorMessage.value = `Missing authorization code from ${provider}.`
    return
  }

  if (!state) {
    status.value = 'error'
    errorMessage.value = `Missing state parameter from ${provider}. Sign-in aborted for your safety.`
    return
  }

  const success = await auth.exchangeSocialCode(provider, code, state)

  if (success) {
    router.replace('/dashboard')
  } else {
    status.value = 'error'
    errorMessage.value = auth.error ?? `${provider} sign-in failed.`
  }
})
</script>

