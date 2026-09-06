import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import type { WsAuthenticatedUser } from './ws-auth-user.interface';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  canActivate(context: ExecutionContext): boolean {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const user = client.data.user as WsAuthenticatedUser | undefined;
      const expiresAt = client.data.authExpiresAt;
      if (!user?.id || typeof user.role !== 'string') {
        throw new WsException('Missing authenticated socket session');
      }
      if (typeof expiresAt === 'number' && expiresAt * 1000 <= Date.now()) {
        client.disconnect(true);
        throw new WsException('Socket session expired');
      }

      return true;
    } catch (error: unknown) {
      this.logger.warn(
        `WsJwtGuard rejected a message: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new WsException('Unauthorized access');
    }
  }
}
