import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const authToken = this.extractTokenFromHeader(client);

      if (!authToken) {
        throw new WsException('Missing auth token');
      }

      const payload = this.jwtService.verify(authToken, {
        secret: process.env.JWT_SECRET || 'fallback_secret',
      });

      // Attach user to socket data for later use
      client.data.user = payload;

      return true;
    } catch (err) {
      this.logger.error('WsJwtGuard failed', err);
      throw new WsException('Unauthorized access');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }

    // Fallback to auth query param if provided
    const queryToken = client.handshake.auth?.token;
    if (queryToken) {
      return queryToken;
    }

    return undefined;
  }
}
