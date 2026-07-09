import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import type { AxiosInstance } from 'axios'

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// let isLoggingOut = false

api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogoutRequest = error.config?.url?.includes('/logout')

    if (error.response?.status === 401 && !isLogoutRequest) {
      const authStore = useAuthStore()
      authStore.clearSession() // clears local state only — does NOT call the API again
    }

    return Promise.reject(error)
  }
)

export default api
