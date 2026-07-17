export type UserRole = 'admin' | 'trainer' | 'student'

// Matches the `gender` enum defined on the users table migration.
export type Gender = 'male' | 'female'
export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  trainer_id: number | null
  avatar_id: number | null
  email_verified_at: string | null

  // Applies to all roles
  phone: string | null

  // Student-only fields
  gender: Gender | null
  student_id: string | null
  class_name: string | null
  generation: string | null
  province: string | null

  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  role?: UserRole
  trainer_id?: number | null
  student_id?: string | null
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ResetPasswordPayload {
  token: string
  email: string
  password: string
  password_confirmation: string
}

export interface UpdateProfilePayload {
  name?: string
  email?: string
  password?: string
  password_confirmation?: string
  avatar_id?: number | null
  phone?: string
  student_id?: string
  class_name?: string
  generation?: string
  province?: string
  gender?: Gender
}

export interface DefaultAvatar {
  id: number
  filename: string
  url: string
  gender: Gender | null
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
  new_password_confirmation: string
}
