// ── Core User ───────────────────────────────────────────
export type UserRole = 'admin' | 'educator' | 'student'

// Matches the `gender` enum defined on the users table migration.
export type Gender = 'male' | 'female'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  educator_id: number | null
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

// ── Auth Payloads & Responses ───────────────────────────
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
  educator_id?: number | null
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

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

// ── Profile ──────────────────────────────────────────────
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

// ── User Management (admin CRUD) ────────────────────────
export interface ManagedUser {
  id: number
  name: string
  email: string
  role: UserRole
  joined: string
  avatar_id: number | null
  avatar_url: string | null
}

export interface RawUser {
  id: number
  name: string
  email: string
  role: UserRole
  created_at: string
  avatar_id: number | null
  avatar_url: string | null
}

export interface UserPayload {
  name: string
  email: string
  role: UserRole
}

export interface UserListMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface UserRoleCounts {
  total: number
  student: number
  educator: number
  admin: number
}

export interface UserListParams {
  search?: string
  role?: UserRole | ''
  page?: number
  per_page?: number
}

// ── Import Users from Excel ─────────────────────────────
export interface ImportSuccessRow {
  row: number
  id: number
  name: string
  email: string
  role: UserRole
}

export interface ImportFailedRow {
  row: number
  email: string | null
  errors: string[]
}

export interface ImportSkippedRow {
  row: number
  email: string | null
  reason: string
}

export interface ImportSummary {
  total_rows: number
  successful: number
  failed: number
  skipped: number
}

export interface ImportUsersResult {
  message: string
  summary: ImportSummary
  results: {
    successful: ImportSuccessRow[]
    failed: ImportFailedRow[]
    skipped: ImportSkippedRow[]
  }
}
