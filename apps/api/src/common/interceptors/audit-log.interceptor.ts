import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { DatabaseService } from '../../infrastructure/database/database.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: DatabaseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only audit mutation operations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const userId = request.user?.id || null;
    const entity = context
      .getClass()
      .name.replace('Controller', '')
      .toLowerCase();
    const action = this.mapMethodToAction(method);
    const ipAddress = request.ip || request.headers['x-forwarded-for'];
    const userAgent = request.headers['user-agent'];

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          const entityId = responseData?.id || request.params?.id || null;
          await this.prisma.auditLog.create({
            data: {
              userId,
              action,
              entity,
              entityId,
              details: {
                method,
                path: request.url,
                body: this.sanitizeBody(request.body),
              },
              ipAddress,
              userAgent,
            },
          });
        } catch (error) {
          // Audit logging should never break the request
          console.error('Audit log error:', error);
        }
      }),
    );
  }

  private mapMethodToAction(method: string): string {
    const map: Record<string, string> = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };
    return map[method] || 'UNKNOWN';
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'passwordHash', 'token', 'secret'];
    for (const field of sensitiveFields) {
      if (sanitized[field]) sanitized[field] = '[REDACTED]';
    }
    return sanitized;
  }
}
