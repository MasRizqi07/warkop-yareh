export class Order {
  id?: string;
  status: string;
  items: any[];

  constructor(status: string, items: any[]) {
    this.status = status;
    this.items = items;
  }

  canTransitionTo(newStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY'],
      READY: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: [],
    };
    return validTransitions[this.status]?.includes(newStatus) || false;
  }

  calculateTotal(): number {
    return this.items.reduce((acc, item) => {
      return acc + item.quantity * item.unitPrice;
    }, 0);
  }
}
