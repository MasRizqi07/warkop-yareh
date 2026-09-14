import {
  ExecutionContext,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { GoogleAuthGuard } from './google-auth.guard';

function createContext({
  path = '/api/v1/auth/google',
  state,
  cookieState,
}: {
  path?: string;
  state?: string;
  cookieState?: string;
} = {}) {
  const cookie = jest.fn();
  const clearCookie = jest.fn();
  const context = {
    switchToHttp: () => ({
      getRequest: () => ({
        path,
        query: { state },
        cookies: { googleOAuthState: cookieState },
      }),
      getResponse: () => ({ cookie, clearCookie }),
    }),
  } as unknown as ExecutionContext;
  return { context, cookie, clearCookie };
}

describe('GoogleAuthGuard', () => {
  let guard: GoogleAuthGuard;
  const originalEnv = process.env;

  beforeEach(() => {
    guard = new GoogleAuthGuard();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('throws ServiceUnavailableException (503) when GOOGLE_CLIENT_ID is missing', () => {
    delete process.env.GOOGLE_CLIENT_ID;
    process.env.GOOGLE_CLIENT_SECRET = 'some-secret';

    const { context } = createContext();

    expect(() => guard.canActivate(context)).toThrow(
      ServiceUnavailableException,
    );
  });

  it('throws ServiceUnavailableException (503) when GOOGLE_CLIENT_SECRET is missing', () => {
    process.env.GOOGLE_CLIENT_ID = 'some-id';
    delete process.env.GOOGLE_CLIENT_SECRET;

    const { context } = createContext();

    expect(() => guard.canActivate(context)).toThrow(
      ServiceUnavailableException,
    );
  });

  it('calls super.canActivate when credentials are validly configured', () => {
    process.env.GOOGLE_CLIENT_ID = 'valid-id';
    process.env.GOOGLE_CLIENT_SECRET = 'valid-secret';

    const { context } = createContext();

    const superSpy = jest
      .spyOn(Object.getPrototypeOf(GoogleAuthGuard.prototype), 'canActivate')
      .mockReturnValue(true);

    const result = guard.canActivate(context);
    expect(result).toBe(true);
    superSpy.mockRestore();
  });

  it('creates a cryptographically random state and stores it in an HttpOnly cookie', () => {
    const { context, cookie } = createContext();

    const options = guard.getAuthenticateOptions(context);

    expect(options?.state).toEqual(expect.any(String));
    expect(options?.state).toHaveLength(43);
    expect(cookie).toHaveBeenCalledWith(
      'googleOAuthState',
      options?.state,
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/api/v1/auth/google/callback',
      }),
    );
  });

  it('accepts a matching callback state and clears the one-time cookie', () => {
    process.env.GOOGLE_CLIENT_ID = 'valid-id';
    process.env.GOOGLE_CLIENT_SECRET = 'valid-secret';
    const state = 'state-value-with-sufficient-entropy';
    const { context, clearCookie } = createContext({
      path: '/api/v1/auth/google/callback',
      state,
      cookieState: state,
    });
    const superSpy = jest
      .spyOn(Object.getPrototypeOf(GoogleAuthGuard.prototype), 'canActivate')
      .mockReturnValue(true);

    expect(guard.canActivate(context)).toBe(true);
    expect(clearCookie).toHaveBeenCalledWith(
      'googleOAuthState',
      expect.objectContaining({ path: '/api/v1/auth/google/callback' }),
    );
    superSpy.mockRestore();
  });

  it('rejects a callback whose state does not match the one-time cookie', () => {
    process.env.GOOGLE_CLIENT_ID = 'valid-id';
    process.env.GOOGLE_CLIENT_SECRET = 'valid-secret';
    const { context } = createContext({
      path: '/api/v1/auth/google/callback',
      state: 'received-state',
      cookieState: 'different-state',
    });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
