import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Prisma } from '@warkop-yareh/database';
import type { Request } from 'express';
import { Observable, mergeMap } from 'rxjs';
import { DatabaseService } from '../../infrastructure/database/database.service';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

type AuditedRequest = Request & {
  user?: AuthenticatedUser;
  body?: unknown;
};

type SanitizedJson =
  | string
  | number
  | boolean
  | null
  | SanitizedJson[]
  | { [key: string]: SanitizedJson };

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const SENSITIVE_KEYS =
  /password|passcode|code|token|secret|authorization|cookie/i;

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly prisma: DatabaseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();
    const request = context.switchToHttp().getRequest<AuditedRequest>();
    if (
      !MUTATION_METHODS.has(request.method) ||
      request.path.startsWith('/api/v1/auth/')
    ) {
      return next.handle();
    }

    return next.handle().pipe(
      mergeMap(async (responseData: unknown) => {
        try {
          await this.prisma.auditLog.create({
            data: {
              userId: request.user?.id ?? null,
              action: this.mapMethodToAction(request.method),
              entity: context
                .getClass()
                .name.replace('Controller', '')
                .toLowerCase(),
              entityId: this.resolveEntityId(responseData, request),
              details: {
                method: request.method,
                path: request.originalUrl,
                body: this.sanitizeValue(request.body),
              } as Prisma.InputJsonObject,
              ipAddress: request.ip,
              userAgent: request.get('user-agent')?.slice(0, 500),
            },
          });
        } catch (error: unknown) {
          this.logger.error(
            `Audit log write failed: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
        return responseData;
      }),
    );
  }

  private mapMethodToAction(method: string): string {
    if (method === 'POST') return 'CREATE';
    if (method === 'DELETE') return 'DELETE';
    return 'UPDATE';
  }

  private resolveEntityId(
    responseData: unknown,
    request: Request,
  ): string | null {
    const directId = this.readStringProperty(responseData, 'id');
    const data = this.readProperty(responseData, 'data');
    return (
      directId ??
      this.readStringProperty(data, 'id') ??
      this.readRouteParam(request.params.id) ??
      this.readRouteParam(request.params.eventId) ??
      this.readRouteParam(request.params.orderId) ??
      null
    );
  }

  private sanitizeValue(value: unknown, depth = 0): SanitizedJson {
    if (value === null || value === undefined) return null;
    if (depth >= 5) return '[TRUNCATED]';
    if (typeof value === 'string') return value.slice(0, 500);
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    if (Array.isArray(value)) {
      return value
        .slice(0, 50)
        .map((item) => this.sanitizeValue(item, depth + 1));
    }
    if (typeof value === 'object') {
      const sanitized: Record<string, SanitizedJson> = {};
      for (const [key, entry] of Object.entries(value).slice(0, 100)) {
        sanitized[key] = SENSITIVE_KEYS.test(key)
          ? '[REDACTED]'
          : this.sanitizeValue(entry, depth + 1);
      }
      return sanitized;
    }
    return String(value).slice(0, 500);
  }

  private readProperty(value: unknown, key: string): unknown {
    return typeof value === 'object' && value !== null
      ? Reflect.get(value, key)
      : undefined;
  }

  private readStringProperty(value: unknown, key: string): string | null {
    const property = this.readProperty(value, key);
    return typeof property === 'string' ? property : null;
  }

  private readRouteParam(value: string | string[] | undefined): string | null {
    return typeof value === 'string' ? value : null;
  }
}
