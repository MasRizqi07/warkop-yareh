import { describe, expect, it } from 'vitest';
import { getPaymentFeedback } from './payment-feedback';

describe('getPaymentFeedback', () => {
  it.each([
    ['UNPAID', 'PENDING', undefined, 'pending', true],
    ['UNPAID', 'PENDING', 'expire', 'expired', false],
    ['FAILED', 'CANCELLED', undefined, 'failed', false],
    ['PAID', 'CONFIRMED', undefined, 'paid', false],
    ['REFUNDED', 'CANCELLED', undefined, 'refunded', false],
    ['UNPAID', 'CANCELLED', undefined, 'cancelled', false],
  ] as const)(
    'maps %s/%s with gateway %s to a reachable %s state',
    (paymentStatus, orderStatus, gatewayStatus, kind, canInitializePayment) => {
      expect(
        getPaymentFeedback(paymentStatus, orderStatus, gatewayStatus)
      ).toMatchObject({ kind, canInitializePayment });
    }
  );

  it.each(['cancel', 'deny', 'failure'])(
    'maps Midtrans %s to the failed state before persistence catches up',
    (gatewayStatus) => {
      expect(getPaymentFeedback('UNPAID', 'PENDING', gatewayStatus).kind).toBe(
        'failed'
      );
    }
  );
});
