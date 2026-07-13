export function canTransitionOrder(currentStatus: string, newStatus: string): boolean {
  const transitions: Record<string, string[]> = {
    'PENDING': ['PREPARING', 'CANCELLED'],
    'PREPARING': ['READY', 'CANCELLED'],
    'READY': ['COMPLETED'],
    'COMPLETED': [],
    'CANCELLED': []
  };
  return transitions[currentStatus]?.includes(newStatus) ?? false;
}

export function calculateCheckoutTotal(items: { price: number, quantity: number }[], taxRate: number = 0.1) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * taxRate;
  return {
    subtotal,
    tax,
    total: subtotal + tax
  };
}
