import { createHash, randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderType, Prisma } from '@warkop-yareh/database';
import { DatabaseService } from '../../../../infrastructure/database/database.service';
import { calculateCheckout } from '../../../ordering/domain/checkout-pricing';

const PACKAGES = [
  { id: 'booking-morning', startTime: '08:00', durationMinutes: 240 },
  { id: 'booking-afternoon', startTime: '13:00', durationMinutes: 300 },
  { id: 'booking-night-owl', startTime: '19:00', durationMinutes: 420 },
  { id: 'booking-full-day', startTime: '08:00', durationMinutes: 1440 },
] as const;
const ADDONS = ['booking-cold-brew', 'booking-brew-flight', 'booking-monitor'];

export interface BookingInput {
  branchId: string;
  tableId: string;
  packageId: string;
  addonIds?: string[];
  date: string;
  guestCount: number;
  specialRequests?: string;
  expectedTotal: number;
}

export function bookingInterval(packageId: string, date: string) {
  const selected = PACKAGES.find((item) => item.id === packageId);
  if (!selected) throw new BadRequestException('Unknown booking package');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new BadRequestException('Use YYYY-MM-DD for the booking date');
  const day = new Date(`${date}T00:00:00.000Z`);
  if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== date) throw new BadRequestException('Invalid booking date');
  const startAt = new Date(`${date}T${selected.startTime}:00+07:00`);
  if (startAt.getTime() <= Date.now() || startAt.getTime() > Date.now() + 366 * 86400000) throw new BadRequestException('Choose a future booking within one year');
  const endAt = new Date(startAt.getTime() + selected.durationMinutes * 60000);
  const endTime = new Date(endAt.getTime() + 7 * 3600000).toISOString().slice(11, 16);
  return { date: day, startTime: selected.startTime, endTime, startAt, endAt };
}

@Injectable()
export class BookingService {
  constructor(private readonly prisma: DatabaseService) {}

  async catalog() {
    const products = await this.prisma.product.findMany({ where: { id: { in: [...PACKAGES.map((item) => item.id), ...ADDONS] }, deletedAt: null }, select: { id: true, name: true, description: true, price: true } });
    return {
      packages: PACKAGES.flatMap((schedule) => {
        const product = products.find((item) => item.id === schedule.id);
        return product ? [{ ...product, ...schedule }] : [];
      }),
      addons: products.filter((item) => ADDONS.includes(item.id)),
    };
  }

  async quote(packageId: string, addonIds: string[] = []) {
    return this.prisma.withTenantTransaction(async (tx) => this.price(tx, packageId, addonIds));
  }

  async availability(branchId: string, packageId: string, date: string) {
    const { startAt, endAt } = bookingInterval(packageId, date);
    return this.prisma.withTenantTransaction(async (tx) => {
      const available = await tx.$queryRaw<Array<{ id: string }>>`SELECT id FROM public.available_booking_tables(${branchId}, ${startAt}::timestamp, ${endAt}::timestamp)`;
      const tables = await tx.table.findMany({ where: { branchId, isActive: true }, select: { id: true, name: true, number: true, zone: true, type: true, capacity: true }, orderBy: { number: 'asc' } });
      const ids = new Set(available.map((item) => item.id));
      return tables.map((table) => ({ ...table, available: ids.has(table.id) }));
    });
  }

  async create(userId: string, input: BookingInput, key: string) {
    if (!key || key.trim().length < 8 || key.length > 128) throw new BadRequestException('Idempotency-Key must have 8-128 characters');
    const normalized = { ...input, addonIds: [...(input.addonIds ?? [])].sort(), specialRequests: input.specialRequests?.trim() ?? '' };
    const fingerprint = createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
    const keyHash = createHash('sha256').update(`booking\0${userId}\0${key.trim()}`).digest('hex');
    return this.prisma.withTenantTransaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${keyHash}))`;
      const existing = await tx.order.findUnique({ where: { idempotencyKeyHash: keyHash }, include: { reservation: true } });
      if (existing) {
        if (existing.requestFingerprint !== fingerprint) throw new ConflictException('Idempotency key was used for a different booking');
        return { reservation: existing.reservation, orderId: existing.id, total: existing.total };
      }
      const interval = bookingInterval(input.packageId, input.date);
      await tx.$queryRaw`SELECT id FROM tables WHERE id = ${input.tableId} FOR UPDATE`;
      const table = await tx.table.findFirst({ where: { id: input.tableId, branchId: input.branchId, isActive: true, branch: { isActive: true, deletedAt: null } } });
      if (!table) throw new NotFoundException('Table is not available at this branch');
      if (input.guestCount > table.capacity) throw new BadRequestException('Guest count exceeds table capacity');
      const available = await tx.$queryRaw<Array<{ id: string }>>`SELECT id FROM public.available_booking_tables(${input.branchId}, ${interval.startAt}::timestamp, ${interval.endAt}::timestamp)`;
      if (!available.some((item) => item.id === table.id)) throw new ConflictException('Table is already reserved for this time slot');
      const quote = await this.price(tx, input.packageId, normalized.addonIds);
      if (quote.total !== input.expectedTotal) throw new ConflictException('Booking price changed; refresh the quote');
      const order = await tx.order.create({ data: {
        orderNumber: `WY-BOOK-${randomUUID().toUpperCase()}`, userId, branchId: input.branchId,
        type: OrderType.DINE_IN, tableId: table.id, subtotal: quote.subtotal, tax: quote.tax,
        serviceFee: quote.serviceFee, total: quote.total, notes: normalized.specialRequests,
        idempotencyKeyHash: keyHash, requestFingerprint: fingerprint,
        items: { create: quote.items.map((item) => ({ productId: item.id, quantity: 1, unitPrice: item.price, totalPrice: item.price, snapshotName: item.name, snapshotPrice: item.price, snapshotTax: 0 })) },
      } });
      const reservation = await tx.reservation.create({ data: { userId, branchId: input.branchId, tableId: table.id, ...interval, guestCount: input.guestCount, specialRequests: normalized.specialRequests, orderId: order.id } });
      await tx.outboxEvent.create({ data: { aggregateType: 'Reservation', aggregateId: reservation.id, eventType: 'ReservationCreated', payload: { reservationId: reservation.id, orderId: order.id, userId, branchId: input.branchId } } });
      return { reservation, orderId: order.id, total: order.total };
    });
  }

  private async price(tx: Prisma.TransactionClient, packageId: string, addonIds: string[]) {
    if (!PACKAGES.some((item) => item.id === packageId) || addonIds.some((id) => !ADDONS.includes(id)) || new Set(addonIds).size !== addonIds.length) throw new BadRequestException('Invalid package or add-on selection');
    const ids = [packageId, ...addonIds];
    const items = await tx.product.findMany({ where: { id: { in: ids }, deletedAt: null }, select: { id: true, name: true, price: true } });
    if (items.length !== ids.length || items.some((item) => !Number.isSafeInteger(item.price) || item.price <= 0)) throw new BadRequestException('Booking prices are not configured');
    return { ...calculateCheckout(items.reduce((sum, item) => sum + item.price, 0)), items };
  }
}
