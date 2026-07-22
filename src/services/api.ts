import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import type { AxiosInstance } from 'axios'

const FALLBACK_DEV_BASE_URL = 'http://localhost:8000/api'
const configuredBaseURL = import.meta.env.VITE_API_BASE_URL

if (!configuredBaseURL) {

  console.warn(
    '[api] VITE_API_BASE_URL is not set — falling back to ' +
      FALLBACK_DEV_BASE_URL +
      '. This is only correct for local development. If you are seeing this ' +
      'in a deployed environment, set VITE_API_BASE_URL in your build/hosting config.',
  )
}

const api: AxiosInstance = axios.create({
  baseURL: configuredBaseURL || FALLBACK_DEV_BASE_URL,
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

    if (!error.response && !configuredBaseURL) {
      // eslint-disable-next-line no-console
      console.error(
        '[api] Request failed with no response, and VITE_API_BASE_URL was never set. ' +
          'This is almost certainly the cause — the app is trying to reach ' +
          FALLBACK_DEV_BASE_URL +
          ' instead of your real backend.',
      )
    }

    return Promise.reject(error)
  },
)

export default api
