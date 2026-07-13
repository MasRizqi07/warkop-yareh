import { describe, it, expect } from 'vitest';
import { canTransitionOrder, calculateCheckoutTotal } from './order-logic';

describe('Order Status Transition Logic', () => {
  it('should allow valid transitions', () => {
    expect(canTransitionOrder('PENDING', 'PREPARING')).toBe(true);
    expect(canTransitionOrder('PREPARING', 'READY')).toBe(true);
    expect(canTransitionOrder('READY', 'COMPLETED')).toBe(true);
  });

  it('should deny invalid transitions', () => {
    expect(canTransitionOrder('PENDING', 'COMPLETED')).toBe(false);
    expect(canTransitionOrder('COMPLETED', 'READY')).toBe(false);
    expect(canTransitionOrder('CANCELLED', 'PREPARING')).toBe(false);
  });
});

describe('POS Checkout Submission Logic', () => {
  it('should calculate correct totals', () => {
    const items = [
      { price: 25000, quantity: 2 },
      { price: 15000, quantity: 1 }
    ];
    // Subtotal: 50000 + 15000 = 65000
    // Tax (10%): 6500
    // Total: 71500
    const result = calculateCheckoutTotal(items, 0.1);
    expect(result.subtotal).toBe(65000);
    expect(result.tax).toBe(6500);
    expect(result.total).toBe(71500);
  });
});
