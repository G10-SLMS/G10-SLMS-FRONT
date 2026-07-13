
import apiClient from '@/api/axios';
import type { User } from '@/types/user';

export interface UpdatePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

/**
 * Update the authenticated user's profile (name, email, gender, avatar).
 * Sent as FormData to support optional avatar file upload.
 */
export async function updateProfile(payload: FormData): Promise<User> {
  // Laravel doesn't parse multipart on PUT/PATCH via some setups,
  // so we POST with a method override.
  payload.append('_method', 'PATCH');
  const { data } = await apiClient.post<{ user: User }>('/user/profile', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.user;
}

/**
 * Update the authenticated user's password.
 */
export async function updatePassword(payload: UpdatePasswordPayload): Promise<void> {
  await apiClient.put('/user/password', payload);
}
