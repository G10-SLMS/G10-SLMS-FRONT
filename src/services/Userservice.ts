import api from './api'
import type {
  ManagedUser,
  RawUser,
  UserPayload,
  UserListMeta,
  UserRoleCounts,
  UserListParams,
  ImportUsersResult,
} from '@/types/user'

function formatJoined(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function toManagedUser(raw: RawUser): ManagedUser {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    joined: formatJoined(raw.created_at),
    avatar_id: raw.avatar_id,
    avatar_url: raw.avatar_url,
  }
}

export const userService = {
  async getUsers(params: UserListParams = {}): Promise<{ data: ManagedUser[]; meta: UserListMeta; counts: UserRoleCounts }> {
    const { data } = await api.get<{ users: RawUser[]; meta?: UserListMeta; counts?: UserRoleCounts }>('/users', {
      params: {
        search: params.search || undefined,
        role: params.role || undefined,
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
      },
    })

    const mapped = data.users.map(toManagedUser)

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

  async importUsers(file: File): Promise<ImportUsersResult> {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await api.post<ImportUsersResult>('/users/import', formData)
    return data
  },

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
