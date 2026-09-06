import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { RawDatabaseService } from '../../infrastructure/database/raw-database.service';
import { RedisService } from '../../infrastructure/redis/redis.service';

@ApiTags('health')
@Public()
@Controller('api/v1/health')
export class HealthController {
  constructor(
    private readonly database: RawDatabaseService,
    private readonly redis: RedisService,
  ) {}

  @Get('live')
  @ApiOperation({ summary: 'Process liveness probe' })
  getLiveness() {
    return {
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Database and Redis readiness probe' })
  async getReadiness() {
    try {
      const [, redisStatus] = await Promise.all([
        this.database.$queryRaw`SELECT 1`,
        this.redis.ping(),
      ]);
      return {
        data: {
          status: 'ready',
          services: {
            database: 'up',
            redis: redisStatus.startsWith('PONG') ? 'up' : 'degraded',
          },
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: unknown) {
      throw new ServiceUnavailableException(
        'Service dependencies are unavailable',
        {
          cause: error,
        },
      );
    }
  }
}
