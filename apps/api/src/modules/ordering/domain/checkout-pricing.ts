import { BadRequestException } from '@nestjs/common';

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

export function calculateCheckout(
  subtotal: number,
  voucherDiscount = 0,
  points = 0,
  balance = 0,
): OrderQuote {
  if (
    ![subtotal, voucherDiscount, points].every(
      (value) => Number.isSafeInteger(value) && value >= 0,
    ) ||
    !Number.isSafeInteger(balance) ||
    subtotal < 1 ||
    subtotal > 1_000_000_000
  ) {
    throw new BadRequestException('Invalid checkout amount');
  }
  const appliedVoucher = Math.min(subtotal, voucherDiscount);
  const maxRedeemablePoints = Math.min(
    Math.max(0, balance),
    Math.floor((subtotal - appliedVoucher) / 100),
  );
  if (points > maxRedeemablePoints)
    throw new BadRequestException(
      `Maximum redeemable points: ${maxRedeemablePoints}`,
    );
  const tax = Math.round((subtotal * 11) / 100);
  const serviceFee = Math.round((subtotal * 5) / 100);
  const pointsDiscount = points * 100;
  const discount = appliedVoucher + pointsDiscount;
  return {
    subtotal,
    tax,
    serviceFee,
    voucherDiscount: appliedVoucher,
    pointsDiscount,
    discount,
    loyaltyPointsUsed: points,
    maxRedeemablePoints,
    total: subtotal + tax + serviceFee - discount,
  };
}
