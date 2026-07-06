import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ id: number; email: string; name: string } | null>(null)
  const token = ref<string | null>(null)

  function setUser(userData: { id: number; email: string; name: string } | null) {
    user.value = userData
  }

  function setToken(newToken: string | null) {
    token.value = newToken
  }

  function logout() {
    user.value = null
    token.value = null
  }

  return { user, token, setUser, setToken, logout }
})