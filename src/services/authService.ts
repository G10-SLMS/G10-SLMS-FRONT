import type { AxiosResponse } from 'axios'
import api from './api'
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
  User,
} from '@/types/user'

/**
 * Auth API calls — matches AuthController routes.
 */

export const authService = {
  register(payload: RegisterPayload): Promise<AxiosResponse<AuthResponse>> {
    return api.post('/register', payload)
  },

  login(payload: LoginPayload): Promise<AxiosResponse<AuthResponse>> {
    return api.post('/login', payload)
  },

  logout(): Promise<AxiosResponse<{ message: string }>> {
    return api.post('/logout')
  },

  forgotPassword(email: string): Promise<AxiosResponse<{ message: string }>> {
    return api.post('/forgot-password', { email })
  },

  resetPassword(payload: ResetPasswordPayload): Promise<AxiosResponse<{ message: string }>> {
    return api.post('/reset-password', payload)
  },

  getCurrentUser(): Promise<AxiosResponse<User>> {
    return api.get('/user')
  },

  getProfile(): Promise<AxiosResponse<User>> {
    return api.get('/profile')
  },

  updateProfile(payload: UpdateProfilePayload | FormData): Promise<AxiosResponse<User>> {
    // PHP can't parse multipart bodies on a real PUT request, so when an
    // avatar file is included, send FormData via POST with Laravel's
    // _method spoofing instead of a plain PUT. Do NOT set Content-Type
    // manually here — axios needs to generate the multipart boundary
    // itself, or the server won't be able to parse the body at all.
    if (payload instanceof FormData) {
      payload.append('_method', 'PUT')
      return api.post('/profile', payload)
    }

    return api.put('/profile', payload)
  },
}
