import { createHash, randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import {
  OrderStatus,
  OrderType,
  PaymentStatus,
  Prisma,
} from '@warkop-yareh/database';
import type {
  DuplicateIdempotencyKeyError,
  IOrderingRepository,
  OrderDetails,
  OrderItemInput,
  ProductCustomizationDefinition,
} from '../../domain/repositories/ordering.repository.interface';
import { EventsGateway } from '../../../websockets/events.gateway';
import { Order } from '../../domain/entities/order.entity';
import { MidtransService } from '../../../../infrastructure/payment/midtrans.service';

export interface CreateOrderInput {
  userId: string;
  branchId: string;
  items: Array<{
    productId: string;
    quantity: number;
    customizations?: Record<string, string>;
    notes?: string;
  }>;
  type?: OrderType;
  tableId?: string;
  notes?: string;
  idempotencyKey: string;
}

@Injectable()
export class OrderingService {
  private readonly logger = new Logger(OrderingService.name);

  constructor(
    @Inject('IOrderingRepository')
    private readonly orderingRepo: IOrderingRepository,
    private readonly eventsGateway: EventsGateway,
    @Inject(forwardRef(() => MidtransService))
    private readonly midtransService: MidtransService,
  ) {}

  async createOrder(data: CreateOrderInput) {
    const idempotencyKey = data.idempotencyKey.trim();
    if (idempotencyKey.length < 8 || idempotencyKey.length > 128) {
      throw new BadRequestException(
        'Idempotency-Key must contain between 8 and 128 characters',
      );
    }

    const type = data.type ?? OrderType.DINE_IN;
    if (type !== OrderType.DINE_IN && data.tableId) {
      throw new BadRequestException(
        'tableId can only be used with DINE_IN orders',
      );
    }

    if (data.tableId) {
      const table = await this.orderingRepo.getActiveTableForBranch(
        data.tableId,
        data.branchId,
      );
      if (!table) {
        throw new BadRequestException(
          'The selected table is not active at this branch',
        );
      }
    }

    const normalizedItems = data.items.map((item) => ({
      ...item,
      notes: item.notes?.trim() || undefined,
      customizations: this.normalizeCustomizations(item.customizations),
    }));
    const requestFingerprint = this.sha256(
      this.stableStringify({
        userId: data.userId,
        branchId: data.branchId,
        type,
        tableId: data.tableId,
        notes: data.notes?.trim() || undefined,
        items: normalizedItems,
      }),
    );
    const idempotencyKeyHash = this.sha256(
      `${data.userId}\u0000${idempotencyKey}`,
    );

    const existing =
      await this.orderingRepo.findByIdempotencyKeyHash(idempotencyKeyHash);
    if (existing) {
      return this.replayIdempotentOrder(existing, requestFingerprint);
    }

    const productIds = [...new Set(normalizedItems.map((item) => item.productId))];
    const products = await this.orderingRepo.getAvailableProductsByIds(
      data.branchId,
      productIds,
    );
    const productMap = new Map(products.map((product) => [product.id, product]));
    const missingProductIds = productIds.filter((id) => !productMap.has(id));
    if (missingProductIds.length > 0) {
      throw new BadRequestException({
        code: 'PRODUCT_UNAVAILABLE',
        message: 'One or more products are unavailable at this branch',
        details: { productIds: missingProductIds },
      });
    }

    const orderItems: OrderItemInput[] = normalizedItems.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BadRequestException('Product is unavailable');
      }

      const customizationPrice = this.validateAndPriceCustomizations(
        item.customizations,
        product.customizations,
      );
      const unitPrice = product.unitPrice + customizationPrice;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
        customizations: item.customizations ?? null,
        notes: item.notes ?? null,
        snapshotName: product.name,
        snapshotPrice: unitPrice,
        snapshotTax: 0,
      };
    });

    const subtotal = new Order(OrderStatus.PENDING, orderItems).calculateTotal();
    const tax = Math.round(subtotal * 0.11);
    const total = subtotal + tax;
    const orderNumber = this.createOrderNumber();
    const orderData = {
      orderNumber,
      userId: data.userId,
      branchId: data.branchId,
      ...(data.tableId ? { tableId: data.tableId } : {}),
      type,
      subtotal,
      tax,
      total,
      ...(data.notes?.trim() ? { notes: data.notes.trim() } : {}),
      idempotencyKeyHash,
      requestFingerprint,
    };

    try {
      const order = await this.orderingRepo.createOrder(
        orderData,
        orderItems,
        {
          userId: data.userId,
          branchId: data.branchId,
          total,
          itemCount: normalizedItems.length,
          type,
        },
      );
      this.eventsGateway.broadcastOrderCreated(order);
      return order;
    } catch (error) {
      if (this.isDuplicateIdempotencyError(error)) {
        const racedOrder =
          await this.orderingRepo.findByIdempotencyKeyHash(idempotencyKeyHash);
        if (racedOrder) {
          return this.replayIdempotentOrder(racedOrder, requestFingerprint);
        }
      }
      throw error;
    }
  }

  async getOrder(id: string) {
    return this.orderingRepo.getOrder(id);
  }

  async listOrders(params: {
    userId?: string;
    branchId?: string;
    status?: OrderStatus;
    page: number;
    limit: number;
  }) {
    return this.orderingRepo.listOrders(params);
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    const existingOrder = await this.orderingRepo.getOrder(id);
    if (!existingOrder) {
      throw new NotFoundException('Order not found');
    }

    const orderEntity = new Order(existingOrder.status, existingOrder.items);
    if (!orderEntity.canTransitionTo(status)) {
      throw new BadRequestException(
        `Invalid status transition from ${existingOrder.status} to ${status}`,
      );
    }

    const order = await this.orderingRepo.updateOrderStatus(id, status);
    this.eventsGateway.broadcastOrderUpdated(order);
    return order;
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    const order = await this.orderingRepo.updatePaymentStatus(
      id,
      paymentStatus,
    );
    this.eventsGateway.broadcastPaymentUpdated(order);
    return order;
  }

  async getPaymentStatusFromMidtrans(orderNumber: string) {
    try {
      const status = await this.midtransService.getTransactionStatus(orderNumber);
      return status.transactionStatus;
    } catch (error) {
      this.logger.warn(
        `Could not refresh Midtrans status for ${orderNumber}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return 'PAYMENT_PENDING';
    }
  }

  async createFeedback(
    id: string,
    data: {
      productRating: number;
      serviceRating: number;
      atmosphereRating: number;
      comment?: string;
    },
  ) {
    try {
      return await this.orderingRepo.createFeedback(id, {
        ...data,
        ...(data.comment?.trim() ? { comment: data.comment.trim() } : {}),
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Feedback has already been submitted');
      }
      throw error;
    }
  }

  private replayIdempotentOrder(
    order: OrderDetails,
    requestFingerprint: string,
  ): OrderDetails {
    if (order.requestFingerprint !== requestFingerprint) {
      throw new ConflictException(
        'Idempotency key conflict: request payload does not match',
      );
    }
    return order;
  }

  private normalizeCustomizations(
    customizations?: Record<string, string>,
  ): Record<string, string> | undefined {
    if (!customizations) return undefined;
    const entries = Object.entries(customizations);
    if (entries.length > 20) {
      throw new BadRequestException('Too many product customizations');
    }

    const normalized: Record<string, string> = {};
    for (const [rawKey, rawValue] of entries) {
      const key = rawKey.trim();
      const value = typeof rawValue === 'string' ? rawValue.trim() : '';
      if (!key || key.length > 80 || !value || value.length > 200) {
        throw new BadRequestException('Invalid product customization');
      }
      normalized[key] = value;
    }
    return normalized;
  }

  private validateAndPriceCustomizations(
    selections: Record<string, string> | undefined,
    definitions: ProductCustomizationDefinition[],
  ): number {
    if (!selections) return 0;
    if (definitions.length === 0) return 0;

    const definitionMap = new Map(
      definitions.map((definition) => [
        this.normalizeCustomizationName(definition.name),
        definition,
      ]),
    );
    let additionalPrice = 0;

    for (const [name, selectedLabel] of Object.entries(selections)) {
      const definition = definitionMap.get(
        this.normalizeCustomizationName(name),
      );
      if (!definition || !Array.isArray(definition.options)) {
        throw new BadRequestException(`Unsupported customization: ${name}`);
      }

      const option = definition.options.find(
        (candidate): candidate is { label: string; price?: number } =>
          typeof candidate === 'object' &&
          candidate !== null &&
          'label' in candidate &&
          (candidate as { label?: unknown }).label === selectedLabel,
      );
      if (!option) {
        throw new BadRequestException(
          `Invalid option for customization: ${name}`,
        );
      }
      if (
        option.price !== undefined &&
        (!Number.isSafeInteger(option.price) || option.price < 0)
      ) {
        throw new BadRequestException(
          `Invalid price configuration for customization: ${name}`,
        );
      }
      additionalPrice += option.price ?? 0;
    }

    return additionalPrice;
  }

  private normalizeCustomizationName(value: string): string {
    return value.toLocaleLowerCase('en-US').replace(/[^a-z0-9]/g, '');
  }

  private createOrderNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const entropy = randomBytes(8).toString('hex').toUpperCase();
    return `WY-${date}-${entropy}`;
  }

  private sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private stableStringify(value: unknown): string {
    const normalize = (input: unknown): unknown => {
      if (Array.isArray(input)) return input.map(normalize);
      if (input && typeof input === 'object') {
        return Object.fromEntries(
          Object.entries(input)
            .filter(([, item]) => item !== undefined)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([key, item]) => [key, normalize(item)]),
        );
      }
      return input;
    };
    return JSON.stringify(normalize(value));
  }

  private isDuplicateIdempotencyError(
    error: unknown,
  ): error is DuplicateIdempotencyKeyError {
    return (
      error instanceof Error && error.name === 'DuplicateIdempotencyKeyError'
    );
  }
}
