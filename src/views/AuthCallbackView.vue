<template>
  <div class="callback-page">
    <div class="callback-card">
      <p v-if="status === 'loading'">Signing you in…</p>
      <p v-else-if="status === 'error'" class="callback-error">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
}

.callback-card {
  background: white;
  padding: 32px 40px;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.callback-error {
  color: #dc2626;
}
</style>
