import type { MembershipTier, Role } from '@warkop-yareh/types';

export interface ApiEnvelope<T> {
  success: true;
  data: T;
  message: string;
  timestamp: string;
}

export interface PaginatedApiEnvelope<T> extends ApiEnvelope<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  branchId: string | null;
  phone?: string | null;
  avatar?: string | null;
  membershipTier?: MembershipTier;
  loyaltyPoints?: number;
  joinedAt?: string;
}

export interface BranchDto {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  province: string;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  isMainBranch: boolean;
  capacity: number;
  features: string[];
  weekdayHours: string;
  weekendHours: string;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface CustomizationOptionDto {
  label: string;
  price: number;
}

export interface ProductCustomizationDto {
  id: string;
  name: string;
  options: unknown;
}

export interface CatalogProductDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  basePrice: number;
  priceOverride: number | null;
  originalPrice: number | null;
  image: string | null;
  categoryId: string;
  category: CategoryDto;
  tags: string[];
  isPopular: boolean;
  isNew: boolean;
  rating: number;
  reviewCount: number;
  preparationTime: number;
  calories: number | null;
  ingredients: string[];
  customizations: ProductCustomizationDto[];
}

export interface FullCatalogDto {
  categories: CategoryDto[];
  products: CatalogProductDto[];
}

export type ApiOrderType =
  | 'DINE_IN'
  | 'TAKE_AWAY'
  | 'DRIVE_THRU'
  | 'DELIVERY';
export type ApiOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'COMPLETED'
  | 'CANCELLED';
export type ApiPaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';
export type ApiPaymentMethod =
  | 'CASH'
  | 'QRIS'
  | 'DEBIT'
  | 'CREDIT_CARD'
  | 'E_WALLET';

export interface OrderItemDto {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizations: Record<string, string> | null;
  notes: string | null;
  snapshotName: string;
  snapshotPrice: number;
  product?: CatalogProductDto;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  userId: string | null;
  branchId: string | null;
  tableId: string | null;
  type: ApiOrderType;
  status: ApiOrderStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentStatus: ApiPaymentStatus;
  notes: string | null;
  customerName: string | null;
  customerPhone: string | null;
  loyaltyPointsEarned: number;
  loyaltyPointsUsed: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDto[];
  payment?: {
    id: string;
    method: ApiPaymentMethod;
    status: ApiPaymentStatus;
    amount: number;
    redirectUrl: string | null;
  } | null;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
}

export interface SnapPaymentDto {
  token: string;
  redirectUrl: string | null;
  orderId: string;
  orderNumber: string;
  grossAmount: number;
}

