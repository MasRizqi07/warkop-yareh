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

export async function createOrder(
  request: CreateOrderRequest,
  idempotencyKey: string,
): Promise<OrderDto> {
  const response = await api.post<ApiEnvelope<OrderDto>>('/orders', request, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return response.data.data;
}

export async function initializePayment(
  orderId: string,
  paymentMethod: ApiPaymentMethod,
): Promise<SnapPaymentDto> {
  const response = await api.post<ApiEnvelope<SnapPaymentDto>>(
    '/payments/midtrans/snap',
    { orderId, paymentMethod },
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
  status: ApiOrderStatus,
): Promise<OrderDto> {
  const response = await api.patch<ApiEnvelope<OrderDto>>(
    `/orders/${orderId}/status`,
    { status },
  );
  return response.data.data;
}

