import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export interface User {
  id: number
  name: string
  email: string
  role: 'student' | 'trainer' | 'admin'
  avatar?: string | null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token') || null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role ?? null)
  const userName = computed(() => user.value?.name ?? '')
  const userAvatar = computed(() => user.value?.avatar ?? null)

  const isAdmin = computed(() => user.value?.role === 'admin')
  const isTrainer = computed(() => user.value?.role === 'trainer')
  const isStudent = computed(() => user.value?.role === 'student')

  // Set token and configure API
  const setAuth = (newToken: string, userData: User) => {
    token.value = newToken
    user.value = userData
    localStorage.setItem('token', newToken)
    
    // Set default Authorization header
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }

  // Initialize / Restore session
  async function initialize() {
    if (!token.value) return
    await fetchUser()
  }

  // Login
  async function login(email: string, password: string) {
    isLoading.value = true
    try {
      const { data } = await api.post('/login', { email, password })
      setAuth(data.token, data.user)
      return data
    } catch (error: any) {
      clearAuth()
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Register
  async function register(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) {
    isLoading.value = true
    try {
      const { data } = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      setAuth(data.token, data.user)
      return data
    } catch (error: any) {
      clearAuth()
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Fetch current user
  async function fetchUser() {
    if (!token.value) return false

    try {
      const { data } = await api.get('/user')
      user.value = data
      return true
    } catch (error: any) {
      if (error.response?.status === 401) {
        clearAuth()
      }
      console.error('Failed to fetch user:', error)
      return false
    }
  }

  // Update Profile
  async function updateProfile(formData: FormData) {
    try {
      const { data } = await api.post('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      user.value = data.user
      return data
    } catch (error) {
      throw error
    }
  }

  // Logout
  async function logout() {
    try {
      await api.post('/logout')
    } catch {
      // Ignore backend errors
    } finally {
      clearAuth()
    }
  }

  // Auto initialize when store is created (important!)
  initialize()

  return {
    user,
    token,
    isLoading,
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
    initialize,        // expose for manual calls if needed
  }
})