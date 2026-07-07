import { defineStore } from 'pinia'
import api from '@/services/api'

export type UserRole = 'student' | 'trainer' | 'admin'

export interface AuthUser {
  id: string
  fullName: string
  email: string
  role: UserRole
}

interface LoginPayload {
  email: string
  password: string
  remember?: boolean
}

interface RegisterPayload {
  fullName: string
  email: string
  role: UserRole
  password: string
  password_confirmation: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  loading: boolean
  error: string | null
}

const TOKEN_KEY = 'eduleave_token'
const USER_KEY = 'eduleave_user'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'),
    token: localStorage.getItem(TOKEN_KEY),
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    isStudent: (state) => state.user?.role === 'student',
    isTrainer: (state) => state.user?.role === 'trainer',
  },

  actions: {
    async login(payload: LoginPayload): Promise<boolean> {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.post('/auth/login', payload)
        this.setSession(data.token, data.user, payload.remember)
        return true
      } catch (err: any) {
        this.error = err.response?.data?.message ?? 'Unable to sign in. Please check your credentials.'
        return false
      } finally {
        this.loading = false
      }
    },

    async register(payload: RegisterPayload): Promise<boolean> {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.post('/auth/register', payload)
        this.setSession(data.token, data.user, true)
        return true
      } catch (err: any) {
        this.error = err.response?.data?.message ?? 'Unable to create your account. Please try again.'
        return false
      } finally {
        this.loading = false
      }
    },

    socialLogin(provider: 'google' | 'office365' | 'github') {
      // Redirect to the backend-driven OAuth flow for the chosen provider.
      window.location.href = `${api.defaults.baseURL}/auth/${provider}`
    },

    setSession(token: string, user: AuthUser, persist = true) {
      this.token = token
      this.user = user
      if (persist) {
        localStorage.setItem(TOKEN_KEY, token)
        localStorage.setItem(USER_KEY, JSON.stringify(user))
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },
  },
})