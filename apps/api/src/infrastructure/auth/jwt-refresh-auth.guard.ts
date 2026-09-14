import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser = AuthenticatedUser>(
    error: unknown,
    user: TUser | false | null | undefined,
  ): TUser {
    if (error instanceof Error) {
      throw error;
    }
    if (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (!user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    return user;
  }
}
