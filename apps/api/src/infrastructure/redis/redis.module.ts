import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { RedisService } from './redis.service';

function bullConnection() {
  const redisUrl = new URL(process.env.REDIS_URL ?? 'redis://localhost:6379');
  const database = Number.parseInt(redisUrl.pathname.slice(1) || '0', 10);
  return {
    host: redisUrl.hostname,
    port: Number.parseInt(redisUrl.port || '6379', 10),
    ...(redisUrl.username
      ? { username: decodeURIComponent(redisUrl.username) }
      : {}),
    ...(redisUrl.password
      ? { password: decodeURIComponent(redisUrl.password) }
      : {}),
    ...(Number.isInteger(database) ? { db: database } : {}),
    ...(redisUrl.protocol === 'rediss:' ? { tls: {} } : {}),
  };
}

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      connection: bullConnection(),
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
