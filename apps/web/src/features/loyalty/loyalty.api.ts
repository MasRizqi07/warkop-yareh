import { api } from '@/lib/api';
import type { ApiEnvelope, PaginatedApiEnvelope } from '@/features/api/contracts';

export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
export interface LoyaltyStatus { id: string; name: string; loyaltyPoints: number; membershipTier: LoyaltyTier; }
export interface Reward { id: string; name: string; description: string; pointsCost: number; image: string | null; tier: LoyaltyTier; expiresAt: string | null; }
export interface LoyaltyTransaction { id: string; points: number; type: string; description: string; createdAt: string; }

export async function getLoyaltyStatus() {
  return (await api.get<ApiEnvelope<LoyaltyStatus>>('/loyalty/me')).data.data;
}
export async function getRewards() {
  return (await api.get<ApiEnvelope<Reward[]>>('/loyalty/rewards')).data.data;
}
export async function getLoyaltyTransactions(page = 1) {
  return (await api.get<PaginatedApiEnvelope<LoyaltyTransaction>>('/loyalty/transactions', { params: { page, limit: 20 } })).data;
}
export async function redeemReward(id: string) {
  return (await api.post<ApiEnvelope<{ user: LoyaltyStatus; transaction: LoyaltyTransaction; reward: Reward }>>(`/loyalty/rewards/${encodeURIComponent(id)}/redeem`)).data.data;
}
