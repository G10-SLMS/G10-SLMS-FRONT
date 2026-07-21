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
    try {
      await authService.logout()
    } catch {
      // Server unreachable or token already expired — safe to ignore.
    }
  }
  function socialLogin(provider: 'google' | 'office365' | 'github'): void {
    if (provider === 'office365') {
      error.value = `${provider} sign-in isn't connected yet.`
      return
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
    const redirectUri = `${window.location.origin}/auth/${provider}/callback`
    const url = new URL(`${apiBaseUrl}/auth/${provider}/redirect`)
    url.searchParams.set('redirect_uri', redirectUri)
    window.location.href = url.toString()
  }

  async function exchangeSocialCode(provider: 'google' | 'github', code: string, state: string): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const redirectUri = `${window.location.origin}/auth/${provider}/callback`
      const { data } =
        provider === 'google'
          ? await authService.googleLogin(code, redirectUri, state)
          : await authService.githubLogin(code, redirectUri, state)
      setSession(data.user, data.token)
      return true
    } catch (err) {
      error.value = extractErrorMessage(err, `${provider} sign-in failed.`)
      return false
    } finally {
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
      clearSession()
      throw err
    }
  }

  async function updateProfile(payload: UpdateProfilePayload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await authService.updateProfile(payload)
      user.value = data.user
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      return data.user
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
    socialLogin,
    exchangeSocialCode,
    fetchCurrentUser,
    updateProfile,
    clearSession,

  }
})
