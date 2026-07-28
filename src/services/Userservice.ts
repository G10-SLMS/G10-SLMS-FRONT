import api from './api'
import type {
  ManagedUser,
  RawUser,
  UserPayload,
  UserListMeta,
  UserRoleCounts,
  UserListParams,
  ImportUsersResult,
  StudentDirectoryResponse,
  ScopeStatusPayload,
  ScopeStatusResult,
} from '@/types/user'

// ── Internal Helpers ─────────────────────────────────────
function formatJoined(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Maps the raw API user shape into what the User Management table renders.
function toManagedUser(raw: RawUser): ManagedUser {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    joined: formatJoined(raw.created_at),
    is_active: raw.is_active ?? true,
    avatar_id: raw.avatar_id,
    avatar_url: raw.avatar_url,
    gender: raw.gender ?? null,
    student_id: raw.student_id ?? null,
    class_name: raw.class_name ?? null,
    generation: raw.generation ?? null,
  }
}

export const userService = {
  // ── List (admin table) ──────────────────────────────
  async getUsers(params: UserListParams = {}): Promise<{ data: ManagedUser[]; meta: UserListMeta; counts: UserRoleCounts }> {
    const { data } = await api.get<{ users: RawUser[]; meta?: UserListMeta; counts?: UserRoleCounts }>('/users', {
      params: {
        search: params.search || undefined,
        role: params.role || undefined,
        generation: params.generation || undefined,
        class_name: params.class_name || undefined,
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
      },
    })

    const mapped = data.users.map(toManagedUser)

    // Older backend responses may not include meta/counts — derive them client-side as a fallback.
    const meta: UserListMeta = data.meta ?? {
      current_page: params.page ?? 1,
      last_page: 1,
      per_page: params.per_page ?? 10,
      total: mapped.length,
    }
    const counts: UserRoleCounts = data.counts ?? {
      total: mapped.length,
      student: mapped.filter((u) => u.role === 'student').length,
      educator: mapped.filter((u) => u.role === 'educator').length,
      admin: mapped.filter((u) => u.role === 'admin').length,
    }

    return { data: mapped, meta, counts }
  },

  // ── Create / Update / Delete ─────────────────────────
  async createUser(payload: UserPayload): Promise<{ user: ManagedUser; defaultPassword: string }> {
    const { data } = await api.post<{ user: RawUser; default_password: string }>('/users', payload)
    return { user: toManagedUser(data.user), defaultPassword: data.default_password }
  },

  async updateUser(id: number, payload: UserPayload): Promise<ManagedUser> {
    const { data } = await api.put<{ user: RawUser }>(`/users/${id}`, payload)
    return toManagedUser(data.user)
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`)
  },

  async toggleUserStatus(id: number): Promise<ManagedUser> {
    const { data } = await api.patch<{ user: RawUser }>(`/users/${id}/status`)
    return toManagedUser(data.user)
  },

  async bulkDeleteUsers(ids: number[]): Promise<{ deletedCount: number; skippedSelf: boolean }> {
    const { data } = await api.post<{ deleted_count: number; skipped_self: boolean }>('/users/bulk-delete', { ids })
    return { deletedCount: data.deleted_count, skippedSelf: data.skipped_self }
  },

  async bulkToggleStatus(
    ids: number[],
    isActive: boolean,
  ): Promise<{ users: ManagedUser[]; updatedCount: number; skippedSelf: boolean }> {
    const { data } = await api.patch<{ users: RawUser[]; updated_count: number; skipped_self: boolean }>(
      '/users/bulk-status',
      { ids, is_active: isActive },
    )
    return {
      users: data.users.map(toManagedUser),
      updatedCount: data.updated_count,
      skippedSelf: data.skipped_self,
    }
  },

  async toggleStatusByScope(payload: ScopeStatusPayload): Promise<ScopeStatusResult> {
    const { data } = await api.patch<{ message: string; updated_count: number }>('/users/scope-status', {
      generation: payload.generation,
      class_name: payload.class_name ?? undefined,
      is_active: payload.is_active,
    })
    return { message: data.message, updatedCount: data.updated_count }
  },

  // ── Student Directory (grouped by generation & class) ──
  async getStudentDirectory(search?: string): Promise<StudentDirectoryResponse> {
    const { data } = await api.get<StudentDirectoryResponse>('/students/directory', {
      params: { search: search || undefined },
    })
    return data
  },

  // ── Excel Import ─────────────────────────────────────
  async importUsers(file: File): Promise<ImportUsersResult> {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await api.post<ImportUsersResult>('/users/import', formData)
    return data
  },

  // Downloads the blob response as a file by creating and clicking a throwaway <a> tag.
  async downloadImportTemplate(): Promise<void> {
    const response = await api.get('/users/import/template', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = 'user-import-template.xlsx'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
