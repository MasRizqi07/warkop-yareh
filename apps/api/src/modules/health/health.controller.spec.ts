import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { RawDatabaseService } from '../../infrastructure/database/raw-database.service';
import { RedisService } from '../../infrastructure/redis/redis.service';

describe('HealthController', () => {
  let controller: HealthController;
  const database = { $queryRaw: jest.fn() };
  const redis = { ping: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: RawDatabaseService, useValue: database },
        { provide: RedisService, useValue: redis },
      ],
    }).compile();
    controller = module.get(HealthController);
  });

  it('reports liveness without checking external dependencies', () => {
    expect(controller.getLiveness().data.status).toBe('ok');
    expect(database.$queryRaw).not.toHaveBeenCalled();
  });

  it('reports readiness only when database and Redis respond', async () => {
    database.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    redis.ping.mockResolvedValue('PONG');

    await expect(controller.getReadiness()).resolves.toEqual(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'ready' }),
      }),
    );
  });

  it('fails readiness when a dependency is unavailable', async () => {
    database.$queryRaw.mockRejectedValue(new Error('database offline'));
    redis.ping.mockResolvedValue('PONG');

    await expect(controller.getReadiness()).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
