import { ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Role } from '@warkop-yareh/database';
import { WsJwtGuard } from './ws-jwt.guard';

describe('WsJwtGuard', () => {
  let guard: WsJwtGuard;

  beforeEach(() => {
    guard = new WsJwtGuard();
  });

  function contextFor(data: Record<string, unknown>): ExecutionContext {
    return {
      switchToWs: () => ({
        getClient: () => ({
          data,
          disconnect: jest.fn(),
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('rejects a message without an authenticated socket session', () => {
    expect(() => guard.canActivate(contextFor({}))).toThrow(WsException);
  });

  it('rejects an expired socket session', () => {
    expect(() =>
      guard.canActivate(
        contextFor({
          user: { id: 'user-1', role: Role.CUSTOMER },
          authExpiresAt: Math.floor(Date.now() / 1000) - 1,
        }),
      ),
    ).toThrow(WsException);
  });

  it('accepts a non-expired authenticated socket session', () => {
    expect(
      guard.canActivate(
        contextFor({
          user: { id: 'user-1', role: Role.CUSTOMER },
          authExpiresAt: Math.floor(Date.now() / 1000) + 60,
        }),
      ),
    ).toBe(true);
  });
});
