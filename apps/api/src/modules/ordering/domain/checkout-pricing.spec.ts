import { calculateCheckout } from './checkout-pricing';

describe('Checkout pricing contract', () => {
  it('charges 11% tax and 5% service fee and redeems each point for Rp100', () => {
    expect(calculateCheckout(100_000, 15_000, 200, 300)).toEqual({
      subtotal: 100_000,
      tax: 11_000,
      serviceFee: 5_000,
      voucherDiscount: 15_000,
      pointsDiscount: 20_000,
      discount: 35_000,
      loyaltyPointsUsed: 200,
      maxRedeemablePoints: 300,
      total: 81_000,
    });
  });

  it('caps merchandise discounts and retains payable fees', () => {
    expect(calculateCheckout(10_000, 20_000, 0, 100).total).toBe(1_600);
    expect(() => calculateCheckout(10_000, 20_000, 1, 100)).toThrow();
    expect(() => calculateCheckout(10_000, 0, 101, 1_000)).toThrow();
    expect(() => calculateCheckout(10_000, 0, 10, 9)).toThrow();
  });

  it.each([NaN, Infinity, -1, 0, 1.5, 1_000_000_001])(
    'rejects invalid subtotal %s',
    (subtotal) => {
      expect(() => calculateCheckout(subtotal)).toThrow();
    },
  );

  it('rounds each fee to integer rupiah', () => {
    expect(calculateCheckout(105).total).toBe(122);
  });
});
