import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authService } from '@/services/authService'
import type {
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from '@/types/user'
import type { AxiosError } from 'axios'

function getStoredUser(): User | null {
  const raw = localStorage.getItem('auth_user')
  return raw ? (JSON.parse(raw) as User) : null
}

function extractErrorMessage(err: unknown, fallback: string): string {
  const axiosErr = err as AxiosError<{ message?: string }>
  return axiosErr.response?.data?.message ?? fallback
}

export const useAuthStore = defineStore('auth', () => {
  // --- state ---
  const user = ref<User | null>(getStoredUser())
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // --- getters ---
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isTrainer = computed(() => user.value?.role === 'trainer')
  const isStudent = computed(() => user.value?.role === 'student')

  // --- internal helper ---
  function setSession(userData: User, authToken: string): void {
    user.value = userData
    token.value = authToken
    localStorage.setItem('auth_user', JSON.stringify(userData))
    localStorage.setItem('auth_token', authToken)
  }

  function clearSession(): void {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
  }

  // --- actions ---
  async function register(payload: RegisterPayload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await authService.register(payload)
      setSession(data.user, data.token)
      return data
    } catch (err) {
      error.value = extractErrorMessage(err, 'Registration failed.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await authService.login(payload)
      setSession(data.user, data.token)
      return data
    } catch (err) {
      error.value = extractErrorMessage(err, 'Invalid credentials.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    loading.value = true
    try {
      await authService.logout()
    } catch {
      // Even if the request fails (e.g. token already expired),
      // clear local state so the user isn't stuck "logged in".
    } finally {
      clearSession()
      loading.value = false
    }
  }

  async function fetchCurrentUser(): Promise<User | null> {
    if (!token.value) return null

    try {
      const { data } = await authService.getCurrentUser()
      user.value = data
      localStorage.setItem('auth_user', JSON.stringify(data))
      return data
    } catch (err) {
      // Token invalid/expired — the axios 401 interceptor will redirect,
      // but clear local state here too in case that interceptor is skipped.
      clearSession()
      throw err
    }
  }

  async function updateProfile(payload: UpdateProfilePayload | FormData) {
    loading.value = true
    error.value = null
    try {
      const { data } = await authService.updateProfile(payload)
      user.value = data
      localStorage.setItem('auth_user', JSON.stringify(data))
      return data
    } catch (err) {
      error.value = extractErrorMessage(err, 'Update failed.')
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isTrainer,
    isStudent,
    register,
    login,
    logout,
    fetchCurrentUser,
    updateProfile,
  }
})
