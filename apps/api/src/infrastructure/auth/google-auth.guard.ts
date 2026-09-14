import {
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard, type IAuthModuleOptions } from '@nestjs/passport';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { CookieOptions, Request, Response } from 'express';

const GOOGLE_OAUTH_STATE_COOKIE = 'googleOAuthState';
const GOOGLE_OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

type GoogleOAuthRequest = Request & {
  cookies?: Record<string, string | undefined>;
};

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  canActivate(context: ExecutionContext) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (
      !clientId ||
      !clientSecret ||
      clientId.trim() === '' ||
      clientSecret.trim() === ''
    ) {
      throw new ServiceUnavailableException(
        'Google OAuth is not configured on this server',
      );
    }

    const request = context.switchToHttp().getRequest<GoogleOAuthRequest>();
    if (this.isCallback(request)) {
      const response = context.switchToHttp().getResponse<Response>();
      const receivedState = request.query.state;
      const expectedState = request.cookies?.[GOOGLE_OAUTH_STATE_COOKIE];
      response.clearCookie(
        GOOGLE_OAUTH_STATE_COOKIE,
        this.oauthStateCookieOptions(),
      );
      if (
        typeof receivedState !== 'string' ||
        typeof expectedState !== 'string' ||
        !this.statesMatch(receivedState, expectedState)
      ) {
        throw new UnauthorizedException('Invalid Google OAuth state');
      }
    }

    return super.canActivate(context);
  }

  getAuthenticateOptions(
    context: ExecutionContext,
  ): IAuthModuleOptions | undefined {
    const request = context.switchToHttp().getRequest<GoogleOAuthRequest>();
    if (this.isCallback(request)) return undefined;

    const state = randomBytes(32).toString('base64url');
    context
      .switchToHttp()
      .getResponse<Response>()
      .cookie(GOOGLE_OAUTH_STATE_COOKIE, state, {
        ...this.oauthStateCookieOptions(),
        maxAge: GOOGLE_OAUTH_STATE_TTL_MS,
      });
    return { state };
  }

  private isCallback(request: Request): boolean {
    return request.path.endsWith('/callback');
  }

  private statesMatch(received: string, expected: string): boolean {
    const receivedBuffer = Buffer.from(received);
    const expectedBuffer = Buffer.from(expected);
    return (
      receivedBuffer.length === expectedBuffer.length &&
      timingSafeEqual(receivedBuffer, expectedBuffer)
    );
  }

  private oauthStateCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth/google/callback',
    };
  }
}
