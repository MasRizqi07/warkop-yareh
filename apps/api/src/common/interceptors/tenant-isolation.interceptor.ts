import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantContext } from '../../infrastructure/database/tenant-context';

@Injectable()
export class TenantIsolationInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    // Only trust branchId from authenticated user token
    const branchId = user?.branchId;

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
