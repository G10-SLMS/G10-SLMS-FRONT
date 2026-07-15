
import apiClient from '@/api/axios';
import type { User } from '@/types/user';

export interface UpdatePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export async function updateProfile(payload: FormData): Promise<User> {
  payload.append('_method', 'PATCH');
  const { data } = await apiClient.post<{ user: User }>('/user/profile', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.user;
}

export async function updatePassword(payload: UpdatePasswordPayload): Promise<void> {
  await apiClient.put('/user/password', payload);
}
