import { OrderStatus } from '@warkop-yareh/database';

interface PricedOrderItem {
  quantity: number;
  unitPrice: number;
}

export class Order {
  private static readonly transitions: Readonly<
    Record<OrderStatus, readonly OrderStatus[]>
  > = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY', 'CANCELLED'],
    READY: ['SERVED', 'COMPLETED'],
    SERVED: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  constructor(
    readonly status: OrderStatus,
    readonly items: readonly PricedOrderItem[],
  ) {}

  canTransitionTo(newStatus: OrderStatus): boolean {
    return Order.transitions[this.status].includes(newStatus);
  }

  calculateTotal(): number {
    return this.items.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0,
    );
  }
}
