<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const errorMessage = ref('')

onMounted(async () => {
  const token = route.query.token as string | undefined

  if (!token) {
    errorMessage.value = 'No token received from the sign-in provider.'
    return
  }

  try {
    // Store the token, then fetch the real user record it belongs to.
    auth.setToken(token)
    await auth.fetchCurrentUser()
    router.push('/')
  } catch {
    errorMessage.value = 'Could not complete sign-in. Please try again.'
  }
})
</script>

<template>
  <div class="oauth-callback">
    <p v-if="!errorMessage">Signing you in…</p>
    <div v-else class="oauth-callback__error">
      <p>{{ errorMessage }}</p>
      <router-link to="/login">Back to sign in</router-link>
    </div>
  </div>
</template>

<style scoped>
.oauth-callback {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: system-ui, sans-serif;
  color: #374151;
}

.oauth-callback__error {
  text-align: center;
}

.oauth-callback__error a {
  color: #2563eb;
  font-weight: 600;
}
</style>