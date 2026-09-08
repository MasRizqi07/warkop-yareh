/**
 * Browser-side estimate only. The API quote remains authoritative for every
 * persisted order and payment request.
 */
export const CLIENT_CHECKOUT_RULES = {
  taxRatePercent: 11,
  serviceFeeRatePercent: 5,
  loyaltyPointValue: 100,
} as const;

export interface ClientCheckoutEstimate {
  subtotal: number;
  tax: number;
  serviceFee: number;
  voucherDiscount: number;
  pointsDiscount: number;
  loyaltyPointsUsed: number;
  maxRedeemablePoints: number;
  total: number;
}

function nonNegativeInteger(value: number): number {
  return Number.isSafeInteger(value) && value > 0 ? value : 0;
}

export function calculateClientCheckoutEstimate(
  subtotal: number,
  voucherDiscount = 0,
  redeemedPoints = 0
): ClientCheckoutEstimate {
  const safeSubtotal = nonNegativeInteger(subtotal);
  const appliedVoucher = Math.min(
    safeSubtotal,
    nonNegativeInteger(voucherDiscount)
  );
  const maxRedeemablePoints = Math.floor(
    (safeSubtotal - appliedVoucher) / CLIENT_CHECKOUT_RULES.loyaltyPointValue
  );
  const loyaltyPointsUsed = Math.min(
    maxRedeemablePoints,
    nonNegativeInteger(redeemedPoints)
  );
  const pointsDiscount =
    loyaltyPointsUsed * CLIENT_CHECKOUT_RULES.loyaltyPointValue;
  const tax = Math.round(
    (safeSubtotal * CLIENT_CHECKOUT_RULES.taxRatePercent) / 100
  );
  const serviceFee = Math.round(
    (safeSubtotal * CLIENT_CHECKOUT_RULES.serviceFeeRatePercent) / 100
  );

  return {
    subtotal: safeSubtotal,
    tax,
    serviceFee,
    voucherDiscount: appliedVoucher,
    pointsDiscount,
    loyaltyPointsUsed,
    maxRedeemablePoints,
    total: safeSubtotal + tax + serviceFee - appliedVoucher - pointsDiscount,
  };
}
