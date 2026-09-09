import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import type { Server } from 'node:http';
import request from 'supertest';
import { IS_PUBLIC_KEY } from '../../../../common/decorators/public.decorator';
import { OrderingService } from '../../application/services/ordering.service';
import { GuestOrderQuotesController } from './guest-order-quotes.controller';

describe('GuestOrderQuotesController', () => {
  let app: INestApplication;
  const quoteOrder = jest.fn();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [GuestOrderQuotesController],
      providers: [
        { provide: OrderingService, useValue: { quoteOrder } },
        Reflector,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => app.close());

  beforeEach(() => {
    jest.clearAllMocks();
    quoteOrder.mockResolvedValue({
      subtotal: 12_000,
      tax: 1_320,
      serviceFee: 600,
      voucherDiscount: 0,
      pointsDiscount: 0,
      discount: 0,
      loyaltyPointsUsed: 0,
      maxRedeemablePoints: 0,
      total: 13_920,
    });
  });

  it('is explicitly public and passes only non-personal quote fields', async () => {
    expect(
      Reflect.getMetadata(
        IS_PUBLIC_KEY,
        // Method reference is inspected for decorator metadata, not invoked.
        // eslint-disable-next-line @typescript-eslint/unbound-method
        GuestOrderQuotesController.prototype.quote,
      ),
    ).toBe(true);

    await request(app.getHttpServer() as Server)
      .post('/api/v1/orders/quote/guest')
      .send({
        branchId: 'branch-1',
        type: 'TAKE_AWAY',
        items: [{ productId: 'prod-1', quantity: 1 }],
      })
      .expect(200);

    expect(quoteOrder).toHaveBeenCalledWith({
      branchId: 'branch-1',
      items: [{ productId: 'prod-1', quantity: 1 }],
      type: 'TAKE_AWAY',
      tableId: undefined,
      notes: undefined,
    });
  });

  it.each([
    { userId: 'user-1' },
    { voucherCode: 'PRIVATE' },
    { loyaltyPointsUsed: 10 },
    { expectedTotal: 1 },
  ])('rejects account-specific or stale-price field %p', async (extra) => {
    await request(app.getHttpServer() as Server)
      .post('/api/v1/orders/quote/guest')
      .send({
        branchId: 'branch-1',
        type: 'TAKE_AWAY',
        items: [{ productId: 'prod-1', quantity: 1 }],
        ...extra,
      })
      .expect(400);

    expect(quoteOrder).not.toHaveBeenCalled();
  });
});
