import type { Server } from 'node:http';
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';
import { CatalogController } from './catalog.controller';
import { CatalogService } from '../../application/services/catalog.service';
import { JwtAuthGuard } from '../../../../infrastructure/auth/jwt-auth.guard';
import { ROLES_KEY } from '../../../../common/decorators/roles.decorator';
import { Role } from '@warkop-yareh/database';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';

let mockUser: AuthenticatedUser | null = null;

function getControllerMethod(
  methodName: 'updateBranchProduct' | 'toggleAvailability',
): (...args: unknown[]) => unknown {
  const method = Object.getOwnPropertyDescriptor(
    CatalogController.prototype,
    methodName,
  )?.value as unknown;
  if (typeof method !== 'function') {
    throw new Error(`CatalogController.${methodName} is not a method`);
  }
  return method as (...args: unknown[]) => unknown;
}

class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser | null }>();
    req.user = mockUser;
    return true;
  }
}

describe('CatalogController (E2E / Controller)', () => {
  let app: INestApplication<Server>;
  let catalogService: jest.Mocked<Partial<CatalogService>>;

  beforeAll(async () => {
    catalogService = {
      getFullCatalog: jest.fn(),
      listCategories: jest.fn(),
      listProducts: jest.fn(),
      getProduct: jest.fn(),
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      toggleAvailability: jest.fn(),
      updateBranchProduct: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [{ provide: CatalogService, useValue: catalogService }],
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
    mockUser = {
      id: 'admin-1',
      email: 'admin@example.test',
      name: 'Admin',
      role: Role.ADMIN,
      branchId: 'branch-1',
    };
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

  it('limits inventory and price changes to management roles while preserving staff availability access', () => {
    const updateBranchProduct = getControllerMethod('updateBranchProduct');
    const toggleAvailability = getControllerMethod('toggleAvailability');
    expect(Reflect.getMetadata(ROLES_KEY, updateBranchProduct)).toEqual([
      Role.MANAGER,
      Role.ADMIN,
      Role.OWNER,
      Role.SUPERADMIN,
    ]);
    expect(Reflect.getMetadata(ROLES_KEY, toggleAvailability)).toEqual(
      expect.arrayContaining([Role.STAFF, Role.CASHIER, Role.KITCHEN]),
    );
  });
});
