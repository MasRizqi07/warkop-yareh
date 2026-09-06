import { describe, expect, it } from 'vitest';
import { assertPaymentRedirect } from './payment-navigation';

describe('Payment navigation', () => {
  it.each(['https://app.midtrans.com/snap/v2/abc', 'https://app.sandbox.midtrans.com/snap/v2/abc'])('accepts the provider URL %s', (url) => {
    expect(assertPaymentRedirect(url)).toBe(url);
  });
  it.each(['javascript:alert(1)', 'http://app.midtrans.com/pay', 'https://app.midtrans.com.evil.test/pay', 'https://user:pass@app.midtrans.com/pay', 'https://evil.test/pay'])('rejects unsafe redirect %s', (url) => {
    expect(() => assertPaymentRedirect(url)).toThrow();
  });
});
