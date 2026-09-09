import type {
  OrderFeedback,
  OrderStatus,
  OrderType,
  PaymentStatus,
  Prisma,
} from '@warkop-yareh/database';
import type { OrderQuote } from '../checkout-pricing';

export interface ProductCustomizationDefinition {
  name: string;
  options: unknown;
}

export interface PricedProduct {
  id: string;
  name: string;
  unitPrice: number;
  customizations: ProductCustomizationDefinition[];
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizations: Record<string, string> | null;
  notes: string | null;
  snapshotName: string;
  snapshotPrice: number;
  snapshotTax: number;
}

export interface CreateOrderData {
  expectedTotal?: number;
  orderNumber: string;
  userId?: string;
  branchId: string;
  tableId?: string;
  type: OrderType;
  subtotal: number;
  tax: number;
  serviceFee: number;
  total: number;
  voucherCode?: string;
  loyaltyPointsUsed?: number;
  notes?: string;
  idempotencyKeyHash?: string;
  requestFingerprint?: string;
}

export type OrderDetails = Prisma.OrderGetPayload<{
  include: {
    items: { include: { product: true } };
    payment: true;
    feedback: true;
    user: { select: { id: true; name: true; email: true; phone: true } };
  };
}>;

export type OrderListItem = Prisma.OrderGetPayload<{
  include: {
    items: true;
    payment: true;
    user: { select: { id: true; name: true; email: true; phone: true } };
  };
}>;

export class DuplicateIdempotencyKeyError extends Error {
  constructor() {
    super('Order idempotency key already exists');
    this.name = 'DuplicateIdempotencyKeyError';
  }
}

export interface IOrderingRepository {
  quoteOrder(data: CreateOrderData): Promise<OrderQuote>;
  getAvailableProductsByIds(
    branchId: string,
    ids: string[],
  ): Promise<PricedProduct[]>;
  getActiveTableForBranch(
    tableId: string,
    branchId: string,
  ): Promise<{ id: string } | null>;
  findByIdempotencyKeyHash(hash: string): Promise<OrderDetails | null>;
  createOrder(
    data: CreateOrderData,
    orderItems: OrderItemInput[],
    outboxPayload: Prisma.InputJsonObject,
  ): Promise<OrderDetails>;
  getOrder(id: string): Promise<OrderDetails | null>;
  listOrders(params: {
    userId?: string;
    branchId?: string;
    status?: OrderStatus;
    page: number;
    limit: number;
  }): Promise<{ data: OrderListItem[]; total: number }>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<OrderDetails>;
  updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
  ): Promise<OrderDetails>;
  syncPaymentState(
    id: string,
    paymentStatus: PaymentStatus,
    orderStatus?: OrderStatus,
  ): Promise<OrderDetails>;
  createFeedback(
    id: string,
    data: {
      productRating: number;
      serviceRating: number;
      atmosphereRating: number;
      comment?: string;
    },
  ): Promise<OrderFeedback>;
}
