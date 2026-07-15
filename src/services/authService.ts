import type { AxiosResponse } from 'axios'
import api from './api'
import type {
  AuthResponse,
  DefaultAvatar,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
  User,
} from '@/types/user'

export const authService = {
  register(payload: RegisterPayload): Promise<AxiosResponse<AuthResponse>> {
    return api.post('/register', payload)
  },

  login(payload: LoginPayload): Promise<AxiosResponse<AuthResponse>> {
    return api.post('/login', payload)
  },

  googleLogin(code: string, redirectUri: string, state: string): Promise<AxiosResponse<AuthResponse>> {
    return api.post('/auth/google', { code, redirect_uri: redirectUri, state })
  },

  githubLogin(code: string, redirectUri: string, state: string): Promise<AxiosResponse<AuthResponse>> {
    return api.post('/auth/github', { code, redirect_uri: redirectUri, state })
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
  
  updateProfile(
    payload: UpdateProfilePayload,
  ): Promise<AxiosResponse<{ message: string; user: User }>> {
    return api.put('/profile', payload)
  },

  getDefaultAvatars(): Promise<AxiosResponse<{ avatars: DefaultAvatar[]; count: number }>> {
    return api.get('/default-avatars')
  },
}
