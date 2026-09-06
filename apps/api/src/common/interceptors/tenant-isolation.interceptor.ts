import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import type { Request } from 'express';
import { tenantContext } from '../../infrastructure/database/tenant-context';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class TenantIsolationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = req.user;
    // Only trust branchId from authenticated user token
    const branchId = user?.branchId ?? undefined;

    return new Observable((subscriber) => {
      tenantContext.run(
        { userId: user?.id, branchId, role: user?.role },
        () => {
          next.handle().subscribe(subscriber);
        },
      );
    });
  }
}
