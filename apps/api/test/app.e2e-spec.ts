import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Application health and global authentication (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('exposes the public liveness endpoint from the real application module', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health/live')
      .expect(200)
      .expect(
        ({
          body,
        }: {
          body: { data: { status: string; timestamp: string } };
        }) => {
          expect(body.data.status).toBe('ok');
          expect(Number.isNaN(Date.parse(body.data.timestamp))).toBe(false);
        },
      );
  });

  it('connects to the migrated database and Redis for readiness', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect(
        ({
          body,
        }: {
          body: {
            data: {
              status: string;
              services: { database: string; redis: string };
            };
          };
        }) => {
          expect(body.data).toMatchObject({
            status: 'ready',
            services: { database: 'up', redis: 'up' },
          });
        },
      );
  });

  it('rejects an unauthenticated request through the global JWT guard', () => {
    return request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
  });

  afterEach(async () => {
    await app.close();
  });
});
