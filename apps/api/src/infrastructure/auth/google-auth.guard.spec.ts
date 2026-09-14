import { ExecutionContext, ServiceUnavailableException } from '@nestjs/common';
import { GoogleAuthGuard } from './google-auth.guard';

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

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
        getResponse: () => ({}),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(
      ServiceUnavailableException,
    );
  });

  it('throws ServiceUnavailableException (503) when GOOGLE_CLIENT_SECRET is missing', () => {
    process.env.GOOGLE_CLIENT_ID = 'some-id';
    delete process.env.GOOGLE_CLIENT_SECRET;

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
        getResponse: () => ({}),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(
      ServiceUnavailableException,
    );
  });

  it('calls super.canActivate when credentials are validly configured', () => {
    process.env.GOOGLE_CLIENT_ID = 'valid-id';
    process.env.GOOGLE_CLIENT_SECRET = 'valid-secret';

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
        getResponse: () => ({}),
      }),
    } as unknown as ExecutionContext;

    const superSpy = jest
      .spyOn(Object.getPrototypeOf(GoogleAuthGuard.prototype), 'canActivate')
      .mockReturnValue(true);

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
    superSpy.mockRestore();
  });
});
