/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { CatalogController } from './catalog.controller';
import { CatalogService } from '../../application/services/catalog.service';
import { DatabaseService } from '../../../../infrastructure/database/database.service';
import { JwtAuthGuard } from '../../../../infrastructure/auth/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';

let mockUser: any = null;

class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = mockUser;
    return true;
  }
}

describe('CatalogController (E2E / Controller)', () => {
  let app: INestApplication;
  let catalogService: jest.Mocked<Partial<CatalogService>>;
  let prisma: jest.Mocked<Partial<DatabaseService>>;

  beforeAll(async () => {
    catalogService = {
      getFullCatalog: jest.fn(),
      listCategories: jest.fn(),
      listProducts: jest.fn(),
      getProduct: jest.fn(),
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      toggleAvailability: jest.fn(),
    };

    prisma = {
      branchProduct: {
        findMany: jest.fn(),
      } as any,
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [
        { provide: CatalogService, useValue: catalogService },
        { provide: DatabaseService, useValue: prisma },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = null;
  });

  it('GET /api/v1/catalog -> public read access works without auth (@Public)', async () => {
    (catalogService.getFullCatalog as jest.Mock).mockResolvedValue([
      { id: 'cat-1', name: 'Coffee', products: [] },
    ]);

    const res = await request(app.getHttpServer())
      .get('/api/v1/catalog?branchId=branch-1')
      .expect(200);

    expect(res.body.data).toBeDefined();
    expect(catalogService.getFullCatalog).toHaveBeenCalledWith('branch-1');
  });

  it('GET /api/v1/categories -> public read access works without auth (@Public)', async () => {
    (catalogService.listCategories as jest.Mock).mockResolvedValue([
      { id: 'cat-1', name: 'Coffee' },
    ]);

    const res = await request(app.getHttpServer())
      .get('/api/v1/categories')
      .expect(200);

    expect(res.body.data).toHaveLength(1);
  });

  it('GET /api/v1/products -> public read access works without auth (@Public)', async () => {
    (catalogService.listProducts as jest.Mock).mockResolvedValue({
      data: [{ id: 'prod-1', name: 'Kopi Susu' }],
      total: 1,
    });

    const res = await request(app.getHttpServer())
      .get('/api/v1/products')
      .expect(200);

    expect(res.body.data).toBeDefined();
  });

  it('POST /api/v1/products -> creates product when authorized user has MANAGER or ADMIN role', async () => {
    mockUser = { id: 'admin-1', role: 'ADMIN' };
    (catalogService.createProduct as jest.Mock).mockResolvedValue({
      id: 'prod-new',
      name: 'V60 Manual Brew',
      price: 25000,
    });

    const res = await request(app.getHttpServer())
      .post('/api/v1/products')
      .send({
        name: 'V60 Manual Brew',
        categoryId: 'cat-1',
        price: 25000,
      })
      .expect(201);

    expect(res.body.data.id).toBe('prod-new');
  });
});
