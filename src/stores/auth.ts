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

  // ── Role helpers ──────────────────────────────────────────────────────
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isTrainer = computed(() => user.value?.role === 'trainer')
  const isStudent = computed(() => user.value?.role === 'student')

  // ── Login ─────────────────────────────────────────────────────────────
  async function login(email: string, password: string) {
    try {
      const { data } = await api.post('/login', { email, password })
      token.value = data.token
      user.value = data.user
      localStorage.setItem('token', data.token)
    } catch (error) {
      // Ensure clean state even on partial failure
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      throw error
    }
  }

  // ── Register ──────────────────────────────────────────────────────────
  async function register(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) {
    try {
      const { data } = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      token.value = data.token
      user.value = data.user
      localStorage.setItem('token', data.token)
    } catch (error) {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      throw error
    }
  }

  // ── Fetch current user ────────────────────────────────────────────────
  async function fetchUser() {
    if (!token.value) return
    try {
      const { data } = await api.get('/user')
      user.value = data
    } catch (error: any) {
      console.error('Failed to fetch user:', error)
      // Only logout on actual 401, not network blips or other errors
      if (error.response?.status === 401) {
        await logout()
      }
    }
  }

  // ── Update profile ────────────────────────────────────────────────────
  async function updateProfile(formData: FormData) {
    try {
      const { data } = await api.post('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      user.value = data.user
    } catch (error) {
      throw error
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────
  async function logout() {
    try {
      await api.post('/logout')
    } catch {
      // ignore logout errors – we clear local state regardless
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
    isAdmin,
    isTrainer,
    isStudent,
    login,
    register,
    fetchUser,
    updateProfile,
    logout,
  }
})