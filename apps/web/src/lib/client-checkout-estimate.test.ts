import { describe, expect, it } from 'vitest';
import { calculateClientCheckoutEstimate } from './client-checkout-estimate';

describe('client checkout estimate', () => {
  it('mirrors the server pricing contract', () => {
    expect(calculateClientCheckoutEstimate(100_000, 15_000, 200)).toEqual({
      subtotal: 100_000,
      tax: 11_000,
      serviceFee: 5_000,
      voucherDiscount: 15_000,
      pointsDiscount: 20_000,
      loyaltyPointsUsed: 200,
      maxRedeemablePoints: 850,
      total: 81_000,
    });
  });

  it('caps combined merchandise discounts at the subtotal', () => {
    expect(calculateClientCheckoutEstimate(10_000, 20_000, 100)).toEqual({
      subtotal: 10_000,
      tax: 1_100,
      serviceFee: 500,
      voucherDiscount: 10_000,
      pointsDiscount: 0,
      loyaltyPointsUsed: 0,
      maxRedeemablePoints: 0,
      total: 1_600,
    });
  });

  it('normalizes unsafe browser state instead of producing NaN totals', () => {
    expect(calculateClientCheckoutEstimate(Number.NaN, -1, 1.5)).toEqual({
      subtotal: 0,
      tax: 0,
      serviceFee: 0,
      voucherDiscount: 0,
      pointsDiscount: 0,
      loyaltyPointsUsed: 0,
      maxRedeemablePoints: 0,
      total: 0,
    });
  });
});
