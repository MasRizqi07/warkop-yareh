import { apiFetch, type AdminUser } from './api';

interface Envelope<T> {
  data: T;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface BranchRecord {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string | null;
  phone?: string | null;
  email?: string | null;
  isMainBranch: boolean;
  capacity: number;
  features: string[];
  weekdayHours: string;
  weekendHours: string;
}

export interface BranchProductRecord {
  id: string;
  branchId: string;
  productId: string;
  isAvailable: boolean;
  priceOverride: number | null;
  stockQuantity: string | number | null;
  stockCapacity: string | number | null;
  stockThreshold: string | number | null;
  stockUnit: string | null;
  supplier: string | null;
  leadTimeHours: number | null;
  burnRatePerDay: string | number | null;
  inventoryUpdatedAt: string | null;
  branch: BranchRecord;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    category: { id: string; name: string; slug: string };
  };
}

export interface CustomerInsight {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsAppMarketingOptInAt: string | null;
  membershipTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  loyaltyPoints: number;
  createdAt: string;
  totalSpend: number;
  orderCount: number;
  lastVisit: string | null;
  cohort: 'vip' | 'regular' | 'at-risk' | 'new';
  lastCampaign: {
    id: string;
    status: MarketingCampaignStatus;
    createdAt: string;
  } | null;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
}

export interface CategoryPerformance {
  category: string;
  unitsSold: number;
  revenue: number;
}

export type MarketingCampaignStatus =
  'DRAFT' | 'DISPATCHING' | 'SENT' | 'FAILED';

export interface MarketingCampaign {
  id: string;
  name: string;
  objective: string;
  audience: string;
  targetUserId: string | null;
  branchId: string | null;
  discountPercent: number;
  expiresInHours: number;
  message: string;
  includeHeaderMedia: boolean;
  status: MarketingCampaignStatus;
  recipientCount: number;
  dispatchedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string; email: string };
  targetUser: { id: string; name: string; phone: string | null } | null;
  _count: { deliveries: number };
}

export interface CampaignInput {
  name: string;
  objective: string;
  audience: string;
  targetUserId?: string;
  branchId?: string;
  discountPercent: number;
  expiresInHours: number;
  message: string;
  includeHeaderMedia: boolean;
}

export async function getBranches(): Promise<BranchRecord[]> {
  return (await apiFetch<Envelope<BranchRecord[]>>('/branches')).data;
}

export async function getAdminProfile(): Promise<AdminUser> {
  return (await apiFetch<Envelope<AdminUser>>('/auth/me')).data;
}

export async function getRevenueAnalytics(
  branchId?: string
): Promise<RevenueAnalytics> {
  const query = branchId ? `?branchId=${encodeURIComponent(branchId)}` : '';
  return (
    await apiFetch<Envelope<RevenueAnalytics>>(`/analytics/revenue${query}`)
  ).data;
}

export async function getCategoryPerformance(
  branchId?: string
): Promise<CategoryPerformance[]> {
  const query = branchId ? `?branchId=${encodeURIComponent(branchId)}` : '';
  return (
    await apiFetch<Envelope<CategoryPerformance[]>>(
      `/analytics/categories${query}`
    )
  ).data;
}

export async function updateBranch(
  branchId: string,
  data: Partial<
    Pick<
      BranchRecord,
      | 'name'
      | 'address'
      | 'city'
      | 'province'
      | 'postalCode'
      | 'phone'
      | 'email'
      | 'capacity'
      | 'features'
      | 'weekdayHours'
      | 'weekendHours'
    >
  >
): Promise<BranchRecord> {
  return (
    await apiFetch<Envelope<BranchRecord>>(`/branches/${branchId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  ).data;
}

export async function getBranchProducts(
  branchId?: string
): Promise<BranchProductRecord[]> {
  const query = branchId ? `?branchId=${encodeURIComponent(branchId)}` : '';
  return (
    await apiFetch<Envelope<BranchProductRecord[]>>(
      `/catalog/branch_products${query}`
    )
  ).data;
}

export async function updateBranchProduct(
  branchId: string,
  productId: string,
  data: Partial<
    Pick<
      BranchProductRecord,
      | 'isAvailable'
      | 'priceOverride'
      | 'stockQuantity'
      | 'stockCapacity'
      | 'stockThreshold'
      | 'stockUnit'
      | 'supplier'
      | 'leadTimeHours'
      | 'burnRatePerDay'
    >
  >
): Promise<BranchProductRecord> {
  return (
    await apiFetch<Envelope<BranchProductRecord>>(
      `/branches/${branchId}/products/${productId}`,
      { method: 'PATCH', body: JSON.stringify(data) }
    )
  ).data;
}

export async function getCustomerInsights(params?: {
  branchId?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<CustomerInsight>> {
  const query = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 100),
  });
  if (params?.branchId) query.set('branchId', params.branchId);
  if (params?.search) query.set('search', params.search);
  return apiFetch<Paginated<CustomerInsight>>(
    `/analytics/customers?${query.toString()}`
  );
}

export async function getCampaigns(params?: {
  branchId?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<MarketingCampaign>> {
  const query = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 20),
  });
  if (params?.branchId) query.set('branchId', params.branchId);
  return apiFetch<Paginated<MarketingCampaign>>(
    `/marketing/campaigns?${query.toString()}`
  );
}

export async function createCampaign(
  input: CampaignInput
): Promise<MarketingCampaign> {
  return (
    await apiFetch<Envelope<MarketingCampaign>>('/marketing/campaigns', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  ).data;
}

export async function updateCampaign(
  campaignId: string,
  input: CampaignInput
): Promise<MarketingCampaign> {
  return (
    await apiFetch<Envelope<MarketingCampaign>>(
      `/marketing/campaigns/${campaignId}`,
      { method: 'PATCH', body: JSON.stringify(input) }
    )
  ).data;
}

export async function testCampaign(
  campaignId: string,
  phone: string
): Promise<{ providerMessageId: string }> {
  return (
    await apiFetch<Envelope<{ providerMessageId: string }>>(
      `/marketing/campaigns/${campaignId}/test`,
      { method: 'POST', body: JSON.stringify({ phone }) }
    )
  ).data;
}

export async function dispatchCampaign(
  campaignId: string
): Promise<MarketingCampaign> {
  return (
    await apiFetch<Envelope<MarketingCampaign>>(
      `/marketing/campaigns/${campaignId}/dispatch`,
      { method: 'POST' }
    )
  ).data;
}

export async function getMarketingProviderStatus(): Promise<{
  configured: boolean;
}> {
  return (
    await apiFetch<Envelope<{ configured: boolean }>>(
      '/marketing/provider-status'
    )
  ).data;
}
