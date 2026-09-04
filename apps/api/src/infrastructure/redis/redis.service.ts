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
  private readonly fallbackMap = new Map<
    string,
    { value: string; expiry?: number }
  >();

  private get fallbackAllowed(): boolean {
    return process.env.NODE_ENV !== 'production';
  }

  async onModuleInit(): Promise<void> {
    const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

    this.client = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 3) {
          if (this.fallbackAllowed) {
            this.logger.warn(
              'Redis unavailable. Activated the development-only in-memory fallback.',
            );
          }
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

    try {
      await this.client.connect();
    } catch (error: unknown) {
      if (!this.fallbackAllowed) {
        throw new Error(
          `Redis is required in production: ${this.errorMessage(error)}`,
        );
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit().catch(() => {});
  }

  async ping(): Promise<string> {
    if (!this.isConnected) {
      this.assertFallbackAllowed('ping');
      return 'PONG (in-memory)';
    }
    try {
      return await this.client.ping();
    } catch (error: unknown) {
      this.assertFallbackAllowed('ping', error);
      return 'PONG (in-memory)';
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected) {
      this.assertFallbackAllowed('get');
      return this.getFallbackValue(key);
    }
    try {
      return await this.client.get(key);
    } catch (error: unknown) {
      this.assertFallbackAllowed('get', error);
      this.logger.warn(
        `Redis get failed (${this.errorMessage(error)}). Using in-memory fallback.`,
      );
      return this.getFallbackValue(key);
    }
  }

  /** Atomically reads and deletes a value. Used for one-time tokens. */
  async take(key: string): Promise<string | null> {
    if (!this.isConnected) {
      this.assertFallbackAllowed('take');
      const value = this.getFallbackValue(key);
      this.fallbackMap.delete(key);
      return value;
    }

    try {
      return await this.client.getdel(key);
    } catch (error: unknown) {
      this.assertFallbackAllowed('take', error);
      this.logger.warn(
        `Redis take failed (${this.errorMessage(error)}). Using in-memory fallback.`,
      );
      const value = this.getFallbackValue(key);
      this.fallbackMap.delete(key);
      return value;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;

    if (!this.isConnected) {
      this.assertFallbackAllowed('set');
      this.fallbackMap.set(key, { value, expiry });
      return;
    }
    try {
      if (ttlSeconds !== undefined) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (error: unknown) {
      this.assertFallbackAllowed('set', error);
      this.fallbackMap.set(key, { value, expiry });
      this.logger.warn(
        `Redis set failed (${this.errorMessage(error)}). Saved in-memory only.`,
      );
    }
  }

  async del(key: string): Promise<void> {
    this.fallbackMap.delete(key);
    if (!this.isConnected) {
      this.assertFallbackAllowed('delete');
      return;
    }
    try {
      await this.client.del(key);
    } catch (error: unknown) {
      this.assertFallbackAllowed('delete', error);
      this.logger.warn(`Redis delete failed (${this.errorMessage(error)}).`);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.fallbackMap.keys()) {
      if (regexPattern.test(key)) {
        this.fallbackMap.delete(key);
      }
    }

    if (!this.isConnected) {
      this.assertFallbackAllowed('pattern delete');
      return;
    }
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.client.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100,
        );
        cursor = nextCursor;
        if (keys.length > 0) await this.client.del(...keys);
      } while (cursor !== '0');
    } catch (error: unknown) {
      this.assertFallbackAllowed('pattern delete', error);
      this.logger.warn(
        `Redis pattern delete failed (${this.errorMessage(error)}).`,
      );
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
      this.assertFallbackAllowed('ttl');
      const data = this.fallbackMap.get(key);
      if (!data) return -2;
      if (!data.expiry) return -1;
      const remaining = Math.round((data.expiry - Date.now()) / 1000);
      return remaining > 0 ? remaining : -2;
    }
    try {
      return await this.client.ttl(key);
    } catch (error: unknown) {
      this.assertFallbackAllowed('ttl', error);
      this.logger.warn(`Redis ttl failed (${this.errorMessage(error)}).`);
      return -1;
    }
  }

  private getFallbackValue(key: string): string | null {
    const data = this.fallbackMap.get(key);
    if (!data) return null;
    if (data.expiry !== undefined && Date.now() >= data.expiry) {
      this.fallbackMap.delete(key);
      return null;
    }
    return data.value;
  }

  private assertFallbackAllowed(operation: string, cause?: unknown): void {
    if (this.fallbackAllowed) return;
    const detail = cause ? `: ${this.errorMessage(cause)}` : '';
    throw new Error(`Redis ${operation} unavailable in production${detail}`);
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
