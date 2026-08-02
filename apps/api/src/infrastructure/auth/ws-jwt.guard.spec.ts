import { WsJwtGuard } from './ws-jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { ExecutionContext } from '@nestjs/common';

describe('WsJwtGuard', () => {
  let guard: WsJwtGuard;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    jwtService = { verify: jest.fn() } as any;
    guard = new WsJwtGuard(jwtService);
  });

  it('should throw WsException if no token is provided', async () => {
    const context = {
      switchToWs: () => ({
        getClient: () => ({
          handshake: { headers: {} },
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(WsException);
  });

  it('should throw WsException if token is invalid', async () => {
    const context = {
      switchToWs: () => ({
        getClient: () => ({
          handshake: { headers: { authorization: 'Bearer invalid_token' } },
        }),
      }),
    } as unknown as ExecutionContext;

    jwtService.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await expect(guard.canActivate(context)).rejects.toThrow(WsException);
  });

  it('should return true and assign user to client if token is valid', async () => {
    const mockClient = {
      handshake: { headers: { authorization: 'Bearer valid_token' } },
      data: {} as any,
    };

    const context = {
      switchToWs: () => ({
        getClient: () => mockClient,
      }),
    } as unknown as ExecutionContext;

    const payload = { userId: '123', role: 'CUSTOMER' };
    jwtService.verify.mockReturnValue(payload);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockClient.data.user).toEqual(payload);
  });
});
