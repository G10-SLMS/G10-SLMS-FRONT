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
  is_active: boolean
  avatar_id: number | null
  avatar_url: string | null
  gender: Gender | null
  student_id: string | null
  class_name: string | null
  generation: string | null
}

export interface RawUser {
  id: number
  name: string
  email: string
  role: UserRole
  created_at: string
  is_active: boolean
  avatar_id: number | null
  avatar_url: string | null
  gender: Gender | null
  student_id: string | null
  class_name: string | null
  generation: string | null
}

export interface UserPayload {
  name: string
  email: string
  role: UserRole
  gender?: Gender | null
  student_id?: string | null
  class_name?: string | null
  generation?: string | null
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
  generation?: string
  class_name?: string
  page?: number
  per_page?: number
}

// ── Scope-based Enable / Disable (by generation / class) ─
export interface ScopeStatusPayload {
  generation: string
  class_name?: string | null
  is_active: boolean
}

export interface ScopeStatusResult {
  message: string
  updatedCount: number
}

// ── Student Directory (grouped by generation & class) ───
export interface DirectoryStudent {
  id: number
  name: string
  email: string
  avatar_id: number | null
  avatar_url: string | null
  phone: string | null
  gender: Gender | null
  student_id: string | null
  class_name: string | null
  generation: string | null
  province: string | null
  is_active: boolean
}

export interface DirectoryClassGroup {
  class_name: string | null
  student_count: number
  students: DirectoryStudent[]
}

export interface DirectoryGenerationGroup {
  generation: string | null
  student_count: number
  classes: DirectoryClassGroup[]
}

export interface StudentDirectoryResponse {
  generations: DirectoryGenerationGroup[]
  total_students: number
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
