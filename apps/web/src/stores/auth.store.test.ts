import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth.store';
import { User } from '@warkop-yareh/types';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
  });

  it('should initialize with default values', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set authentication state', () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' } as unknown as User;
    const mockToken = 'mock-token-123';

    useAuthStore.getState().setAuth(mockUser, mockToken);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should set access token', () => {
    const mockToken = 'new-mock-token';
    useAuthStore.getState().setAccessToken(mockToken);

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe(mockToken);
  });

  it('should clear state on logout', () => {
    const mockUser = { id: '1', name: 'Test' } as unknown as User;
    useAuthStore.getState().setAuth(mockUser, 'token');
    
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
