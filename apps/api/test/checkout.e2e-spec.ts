import { randomUUID } from 'node:crypto';
import { ConflictException } from '@nestjs/common';
import { BookingService } from '../src/modules/reservation/application/services/booking.service';
import {
  PrismaClient,
  OrderStatus,
  OrderType,
  PaymentStatus,
} from '@warkop-yareh/database';
import { DatabaseService } from '../src/infrastructure/database/database.service';
import { tenantContext } from '../src/infrastructure/database/tenant-context';
import { PrismaOrderingRepository } from '../src/modules/ordering/infrastructure/repositories/prisma-ordering.repository';
import type {
  CreateOrderData,
  OrderItemInput,
} from '../src/modules/ordering/domain/repositories/ordering.repository.interface';

describe('Checkout persistence, concurrency and RLS', () => {
  const suffix = randomUUID();
  const branchId = `checkout-branch-${suffix}`;
  const productId = `checkout-product-${suffix}`;
  const categoryId = `checkout-category-${suffix}`;
  const userId = `checkout-user-${suffix}`;
  const secondUserId = `checkout-other-${suffix}`;
  const tableId = `checkout-table-${suffix}`;
  let admin: PrismaClient;
  let database: DatabaseService;
  let repository: PrismaOrderingRepository;

  beforeAll(async () => {
    const url = process.env.DATABASE_URL;
    if (!url || new URL(url).pathname !== '/warkop_audit')
      throw new Error(
        'Checkout integration tests require the isolated warkop_audit database',
      );
    admin = new PrismaClient();
    database = new DatabaseService();
    await database.onModuleInit();
    repository = new PrismaOrderingRepository(database);
    await admin.branch.create({
      data: {
        id: branchId,
        slug: branchId,
        name: 'Checkout test',
        address: 'Test',
        city: 'Test',
        province: 'Test',
      },
    });
    await admin.user.create({
      data: {
        id: userId,
        name: 'Checkout test',
        email: `${suffix}@example.test`,
        loyaltyPoints: 100,
      },
    });
    await admin.user.create({
      data: {
        id: secondUserId,
        name: 'Other customer',
        email: `other-${suffix}@example.test`,
      },
    });
    await admin.table.create({
      data: {
        id: tableId,
        branchId,
        name: 'Workspace test',
        number: 'T-01',
        capacity: 4,
      },
    });
    await admin.category.create({
      data: { id: categoryId, slug: categoryId, name: 'Test' },
    });
    await admin.product.create({
      data: {
        id: productId,
        slug: productId,
        categoryId,
        name: 'Test coffee',
        description: 'Integration fixture',
        price: 10000,
      },
    });
  });

  afterAll(async () => {
    if (admin) {
      const owners = [userId, secondUserId];
      const orders = await admin.order.findMany({
        where: { userId: { in: owners } },
        select: { id: true },
      });
      const reservations = await admin.reservation.findMany({
        where: { userId: { in: owners } },
        select: { id: true },
      });
      await admin.outboxEvent.deleteMany({
        where: {
          aggregateId: {
            in: [...orders, ...reservations].map((item) => item.id),
          },
        },
      });
      await admin.reservation.deleteMany({ where: { userId: { in: owners } } });
      await admin.voucherRedemption.deleteMany({
        where: { userId: { in: owners } },
      });
      await admin.orderItem.deleteMany({
        where: { orderId: { in: orders.map((order) => order.id) } },
      });
      await admin.order.deleteMany({ where: { userId: { in: owners } } });
      await admin.loyaltyTransaction.deleteMany({
        where: { userId: { in: owners } },
      });
      await admin.user.deleteMany({ where: { id: { in: owners } } });
      await admin.product.deleteMany({ where: { id: productId } });
      await admin.category.deleteMany({ where: { id: categoryId } });
      await admin.table.deleteMany({ where: { id: tableId } });
      await admin.branch.deleteMany({ where: { id: branchId } });
      await admin.$disconnect();
    }
    if (database) await database.onModuleDestroy();
  });

  beforeEach(async () => {
    await admin.user.update({
      where: { id: userId },
      data: { loyaltyPoints: 100 },
    });
  });

  const asCustomer = <T>(operation: () => Promise<T>) =>
    tenantContext.run({ userId, role: 'CUSTOMER' }, operation);
  const asSystem = <T>(operation: () => Promise<T>) =>
    tenantContext.run({ role: 'SUPERADMIN' }, operation);
  const data = (points = 0): CreateOrderData => ({
    orderNumber: `TEST-${randomUUID()}`,
    userId,
    branchId,
    type: OrderType.TAKE_AWAY,
    subtotal: 10000,
    tax: 1100,
    serviceFee: 500,
    total: 11600,
    loyaltyPointsUsed: points,
    idempotencyKeyHash: randomUUID(),
    requestFingerprint: randomUUID(),
  });
  const items: OrderItemInput[] = [
    {
      productId,
      quantity: 1,
      unitPrice: 10000,
      totalPrice: 10000,
      customizations: null,
      notes: null,
      snapshotName: 'Test coffee',
      snapshotPrice: 10000,
      snapshotTax: 0,
    },
  ];

  it('rejects a changed quote without writing an order or spending points', async () => {
    const input = { ...data(50), expectedTotal: 9999 };
    await expect(
      asCustomer(() => repository.createOrder(input, items, {})),
    ).rejects.toThrow('Checkout total changed');
    expect(
      await admin.order.count({ where: { orderNumber: input.orderNumber } }),
    ).toBe(0);
    expect(
      (await admin.user.findUniqueOrThrow({ where: { id: userId } }))
        .loyaltyPoints,
    ).toBe(100);
  });

  it('allows only one concurrent redemption when the combined points exceed the balance', async () => {
    const results = await Promise.allSettled(
      [data(80), data(80)].map((input) =>
        asCustomer(() => repository.createOrder(input, items, {})),
      ),
    );
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(
      (await admin.user.findUniqueOrThrow({ where: { id: userId } }))
        .loyaltyPoints,
    ).toBe(20);
  });

  it('restores cancelled order points exactly once and rejects a stale transition', async () => {
    const order = await asCustomer(() =>
      repository.createOrder(data(50), items, {}),
    );
    await asCustomer(() =>
      repository.updateOrderStatus(order.id, OrderStatus.CANCELLED),
    );
    await expect(
      asCustomer(() =>
        repository.updateOrderStatus(order.id, OrderStatus.CONFIRMED),
      ),
    ).rejects.toThrow();
    expect(
      (await admin.user.findUniqueOrThrow({ where: { id: userId } }))
        .loyaltyPoints,
    ).toBe(100);
  });

  it('awards and reverses paid points once despite duplicate and out-of-order notifications', async () => {
    const order = await asCustomer(() =>
      repository.createOrder(data(50), items, {}),
    );
    await Promise.all(
      [1, 2].map(() =>
        asSystem(() =>
          repository.syncPaymentState(order.id, PaymentStatus.PAID),
        ),
      ),
    );
    expect(
      (await admin.user.findUniqueOrThrow({ where: { id: userId } }))
        .loyaltyPoints,
    ).toBe(56);
    await asSystem(() =>
      repository.syncPaymentState(order.id, PaymentStatus.FAILED),
    );
    expect(
      (await admin.order.findUniqueOrThrow({ where: { id: order.id } }))
        .paymentStatus,
    ).toBe(PaymentStatus.PAID);
    await Promise.all(
      [1, 2].map(() =>
        asSystem(() =>
          repository.syncPaymentState(order.id, PaymentStatus.REFUNDED),
        ),
      ),
    );
    expect(
      (await admin.user.findUniqueOrThrow({ where: { id: userId } }))
        .loyaltyPoints,
    ).toBe(100);
  });

  it('prevents a different customer from reading an order under RLS', async () => {
    const order = await asCustomer(() =>
      repository.createOrder(data(), items, {}),
    );
    expect(
      await tenantContext.run(
        { userId: 'another-customer', role: 'CUSTOMER' },
        () => repository.getOrder(order.id),
      ),
    ).toBeNull();
  });
  it('prices the approved workspace packages and add-ons from persisted products', async () => {
    const booking = new BookingService(database);
    const prices = await asCustomer(() => booking.catalog());
    expect(prices.packages.map((item) => item.price)).toEqual([
      35000, 45000, 55000, 85000,
    ]);
    const quote = await asCustomer(() =>
      booking.quote('booking-night-owl', ['booking-monitor']),
    );
    expect(quote.total).toBe(110200);
    await expect(
      asCustomer(() =>
        booking.quote('booking-morning', [
          'booking-monitor',
          'booking-monitor',
        ]),
      ),
    ).rejects.toThrow();
  });

  it('replays a booking, blocks cross-customer overlap across midnight, and releases a failed payment', async () => {
    const booking = new BookingService(database);
    const date = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
    const quote = await asCustomer(() => booking.quote('booking-night-owl'));
    const input = {
      branchId,
      tableId,
      packageId: 'booking-night-owl',
      date,
      guestCount: 2,
      expectedTotal: quote.total,
    };
    const key = randomUUID();
    const first = await asCustomer(() => booking.create(userId, input, key));
    const replay = await asCustomer(() => booking.create(userId, input, key));
    expect(replay.orderId).toBe(first.orderId);
    expect(
      first.reservation!.endAt.getTime() - first.reservation!.startAt.getTime(),
    ).toBe(7 * 3600000);
    const asOther = <T>(operation: () => Promise<T>) =>
      tenantContext.run({ userId: secondUserId, role: 'CUSTOMER' }, operation);
    await expect(
      asOther(() => booking.create(secondUserId, input, randomUUID())),
    ).rejects.toThrow(ConflictException);
    const otherView = await asOther(() =>
      booking.availability(branchId, input.packageId, date),
    );
    expect(otherView.find((table) => table.id === tableId)?.available).toBe(
      false,
    );
    await asSystem(() =>
      repository.syncPaymentState(first.orderId, PaymentStatus.FAILED),
    );
    expect(
      (
        await admin.reservation.findUniqueOrThrow({
          where: { id: first.reservation!.id },
        })
      ).status,
    ).toBe('CANCELLED');
    const next = await asOther(() =>
      booking.create(secondUserId, input, randomUUID()),
    );
    await asSystem(() =>
      repository.syncPaymentState(next.orderId, PaymentStatus.PAID),
    );
    expect(
      (
        await admin.reservation.findUniqueOrThrow({
          where: { id: next.reservation!.id },
        })
      ).status,
    ).toBe('CONFIRMED');
  });
});
