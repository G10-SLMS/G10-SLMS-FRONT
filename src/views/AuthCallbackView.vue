<template>
  <div class="callback-page">
    <div class="callback-card">
      <template v-if="status === 'loading'">
        <span class="callback-icon icon-blue spin">
          <Loader2 :size="28" :stroke-width="1.8" />
        </span>
        <h1 class="callback-title">Signing you in…</h1>
        <p class="callback-subtext">Please wait while we finish connecting your account.</p>
      </template>

      <template v-else-if="status === 'error'">
        <span class="callback-icon icon-red">
          <AlertCircle :size="28" :stroke-width="1.8" />
        </span>
        <h1 class="callback-title">Sign-in failed</h1>
        <p class="callback-error">{{ errorMessage }}</p>
        <RouterLink to="/login" class="retry-btn">
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

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  padding: 16px;
}

.callback-card {
  background: white;
  padding: 40px;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  text-align: center;
  max-width: 360px;
  width: 100%;
}

.callback-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  margin-bottom: 16px;
}

.icon-blue {
  background: #dbeafe;
  color: #1d4ed8;
}

.icon-red {
  background: #fee2e2;
  color: #dc2626;
}

.spin svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.callback-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 6px;
  color: #111827;
}

.callback-subtext {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.callback-error {
  font-size: 14px;
  color: #dc2626;
  margin: 0 0 20px;
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  text-decoration: none;
}

.retry-btn:hover {
  background: #1d4ed8;
}
</style>
