import api from './api'
import type { ManagedUser, RawUser, UserPayload, UserListMeta, UserRoleCounts, UserListParams } from '@/types/user'

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
      trainer: mapped.filter((u) => u.role === 'trainer').length,
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
}
