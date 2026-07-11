import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { DatabaseService } from '../../infrastructure/database/database.service';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CUID_REGEX = /^c[a-z0-9]{24,}$/;

@Injectable()
export class TenantIsolationInterceptor implements NestInterceptor {
  constructor(private readonly prisma: DatabaseService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.id;
    const branchId = req.headers['x-branch-id'];

    // Strict format validation to block SQL injection vectors
    if (userId && !UUID_REGEX.test(userId) && !CUID_REGEX.test(userId)) {
      throw new ForbiddenException('Invalid User context ID format.');
    }
    if (branchId && !UUID_REGEX.test(branchId) && !CUID_REGEX.test(branchId)) {
      throw new ForbiddenException('Invalid Tenant context ID format.');
    }

    // Set application-level context for RLS policies (Phase 4)
    if (userId || branchId) {
      await this.prisma
        .$executeRaw`SELECT set_config('app.current_user_id', ${userId || ''}, true)`;
      await this.prisma
        .$executeRaw`SELECT set_config('app.current_branch_id', ${branchId || ''}, true)`;
    }

    return next.handle();
  }
}
