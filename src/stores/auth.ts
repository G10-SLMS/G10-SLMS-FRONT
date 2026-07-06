import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export interface User {
  id: number
  name: string
  email: string
  role: 'student' | 'trainer' | 'admin'
  avatar: string | null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role ?? null)
  const userName = computed(() => user.value?.name ?? '')
  const userAvatar = computed(() => user.value?.avatar ?? null)

  async function login(email: string, password: string) {
    const { data } = await api.post('/login', { email, password })
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
  }

  async function register(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) {
    const { data } = await api.post('/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    })
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      const { data } = await api.get('/user')
      user.value = data
    } catch {
      logout()
    }
  }

  async function updateProfile(formData: FormData) {
    const { data } = await api.put('/profile', formData)
    user.value = data.user
  }

  async function logout() {
    try {
      await api.post('/logout')
    } catch {
      // ignore logout errors
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('token')
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    userRole,
    userName,
    userAvatar,
    login,
    register,
    fetchUser,
    updateProfile,
    logout,
  }
})