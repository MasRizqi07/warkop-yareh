import { describe, expect, it } from 'vitest';
import { getFirstBookableDate, isBookingStartFuture } from './booking-date';

describe('booking date validation', () => {
  it('keeps today when the selected package starts later in WIB', () => {
    const now = new Date('2026-09-15T10:00:00+07:00');
    expect(getFirstBookableDate('19:00', now)).toBe('2026-09-15');
    expect(isBookingStartFuture('2026-09-15', '19:00', now)).toBe(true);
  });

  it('moves to tomorrow when the selected package start has passed', () => {
    const now = new Date('2026-09-15T23:00:00+07:00');
    expect(getFirstBookableDate('19:00', now)).toBe('2026-09-16');
    expect(isBookingStartFuture('2026-09-15', '19:00', now)).toBe(false);
  });
});
