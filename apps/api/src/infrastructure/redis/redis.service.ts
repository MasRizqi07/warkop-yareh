import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;
  private isConnected = false;
  private fallbackMap = new Map<string, { value: string; expiry?: number }>();

  onModuleInit(): void {
    const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

    this.client = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 3) {
          this.logger.warn(
            'Redis unavailable. Successfully activated in-memory cache fallback.',
          );
          return null;
        }
        return Math.min(times * 100, 1000);
      },
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.log('✅ Redis connected');
    });
    this.client.on('error', (err: Error) => {
      if (this.isConnected) {
        this.logger.warn(`Redis connection interrupted: ${err.message}`);
      }
    });
    this.client.on('close', () => {
      this.isConnected = false;
    });

    void this.client.connect().catch(() => {
      // Handled by retryStrategy and fallback
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit().catch(() => {});
  }

  async ping(): Promise<string> {
    if (!this.isConnected) return 'PONG (in-memory)';
    try {
      return await this.client.ping();
    } catch {
      return 'PONG (in-memory)';
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected) {
      const data = this.fallbackMap.get(key);
      if (!data) return null;
      if (data.expiry && Date.now() > data.expiry) {
        this.fallbackMap.delete(key);
        return null;
      }
      return data.value;
    }
    try {
      return await this.client.get(key);
    } catch (err: any) {
      this.logger.warn(
        `Redis get failed (${err.message}). Using in-memory fallback.`,
      );
      const data = this.fallbackMap.get(key);
      if (!data) return null;
      return data.value;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.fallbackMap.set(key, { value, expiry });

    if (!this.isConnected) return;
    try {
      if (ttlSeconds !== undefined) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (err: any) {
      this.logger.warn(
        `Redis set failed (${err.message}). Saved in-memory only.`,
      );
    }
  }

  async del(key: string): Promise<void> {
    this.fallbackMap.delete(key);
    if (!this.isConnected) return;
    try {
      await this.client.del(key);
    } catch (err: any) {
      this.logger.warn(`Redis del failed (${err.message}).`);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.fallbackMap.keys()) {
      if (regexPattern.test(key)) {
        this.fallbackMap.delete(key);
      }
    }

    if (!this.isConnected) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (err: any) {
      this.logger.warn(`Redis delPattern failed (${err.message}).`);
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }

  async ttl(key: string): Promise<number> {
    if (!this.isConnected) {
      const data = this.fallbackMap.get(key);
      if (!data) return -2;
      if (!data.expiry) return -1;
      const remaining = Math.round((data.expiry - Date.now()) / 1000);
      return remaining > 0 ? remaining : -2;
    }
    try {
      return await this.client.ttl(key);
    } catch (err: any) {
      this.logger.warn(`Redis ttl failed (${err.message}).`);
      return -1;
    }
  }
}
