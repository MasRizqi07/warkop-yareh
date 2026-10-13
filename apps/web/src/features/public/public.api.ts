import { api } from '@/lib/api';
import type { ApiEnvelope } from '@/features/api/contracts';

export interface VerifiedReview {
  id: string;
  rating: number;
  comment: string;
  helpful: number;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null };
  product: { id: string; name: string } | null;
}

export interface PublicTable {
  id: string;
  branchId: string;
  number: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'MAINTENANCE';
}

export async function listVerifiedReviews(branchId?: string): Promise<VerifiedReview[]> {
  return (await api.get<ApiEnvelope<VerifiedReview[]>>('/content/reviews', { params: { branchId, limit: 20 } })).data.data;
}

export async function getPublicTable(id: string): Promise<PublicTable> {
  return (await api.get<ApiEnvelope<PublicTable>>(`/tables/public/${encodeURIComponent(id)}`)).data.data;
}

export async function resolveTableQr(code: string): Promise<PublicTable> {
  return (await api.get<ApiEnvelope<PublicTable>>(`/tables/qr/${encodeURIComponent(code)}`)).data.data;
}

export async function createWaiterCall(id: string, type: 'CALL_WAITER' | 'REQUEST_BILL' | 'NEED_ASSISTANCE'): Promise<void> {
  await api.post(`/tables/${id}/call`, { type });
}
