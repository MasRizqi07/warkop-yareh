import { api } from '@/lib/api';
import type {
  ApiEnvelope,
  ApiOrderStatus,
  ApiOrderType,
  ApiPaymentMethod,
  OrderDto,
  PaginatedApiEnvelope,
  SnapPaymentDto,
} from '@/features/api/contracts';

export interface CreateOrderRequest {
  expectedTotal?: number;
  voucherCode?: string;
  loyaltyPointsUsed?: number;
  branchId: string;
  items: Array<{
    productId: string;
    quantity: number;
    customizations?: Record<string, string>;
    notes?: string;
  }>;
  type: ApiOrderType;
  tableId?: string;
  notes?: string;
}

export interface OrderQuote {
  subtotal: number;
  tax: number;
  serviceFee: number;
  voucherDiscount: number;
  pointsDiscount: number;
  discount: number;
  loyaltyPointsUsed: number;
  maxRedeemablePoints: number;
  total: number;
}

export async function quoteOrder(
  request: CreateOrderRequest
): Promise<OrderQuote> {
  return (await api.post<ApiEnvelope<OrderQuote>>('/orders/quote', request))
    .data.data;
}

export type GuestOrderQuoteRequest = Omit<
  CreateOrderRequest,
  'expectedTotal' | 'voucherCode' | 'loyaltyPointsUsed'
>;

export async function quoteGuestOrder(
  request: GuestOrderQuoteRequest
): Promise<OrderQuote> {
  return (
    await api.post<ApiEnvelope<OrderQuote>>('/orders/quote/guest', request)
  ).data.data;
}

export async function createOrder(
  request: CreateOrderRequest,
  idempotencyKey: string
): Promise<OrderDto> {
  const response = await api.post<ApiEnvelope<OrderDto>>('/orders', request, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return response.data.data;
}

export async function initializePayment(
  orderId: string,
  paymentMethod: ApiPaymentMethod
): Promise<SnapPaymentDto> {
  const response = await api.post<ApiEnvelope<SnapPaymentDto>>(
    '/payments/midtrans/snap',
    { orderId, paymentMethod }
  );
  return response.data.data;
}

export async function getOrder(orderId: string): Promise<OrderDto> {
  const response = await api.get<ApiEnvelope<OrderDto>>(`/orders/${orderId}`);
  return response.data.data;
}

export async function getMyOrders(): Promise<OrderDto[]> {
  const response = await api.get<PaginatedApiEnvelope<OrderDto>>('/orders', {
    params: { page: 1, limit: 50 },
  });
  return response.data.data;
}

export async function updateOrderStatus(
  orderId: string,
  status: ApiOrderStatus
): Promise<OrderDto> {
  const response = await api.patch<ApiEnvelope<OrderDto>>(
    `/orders/${orderId}/status`,
    { status }
  );
  return response.data.data;
}
