import { api } from '@/lib/api';
import type { ApiEnvelope, SessionUser } from '@/features/api/contracts';

export interface Profile extends SessionUser {
  createdAt: string;
  updatedAt: string;
}
export async function getProfile(id: string): Promise<Profile> {
  return (
    await api.get<ApiEnvelope<Profile>>(`/users/${encodeURIComponent(id)}`)
  ).data.data;
}
export async function updateProfile(
  id: string,
  data: { name: string; phone?: string; whatsAppMarketingOptIn?: boolean }
) {
  return (
    await api.patch<ApiEnvelope<Profile>>(
      `/users/${encodeURIComponent(id)}`,
      data
    )
  ).data.data;
}
