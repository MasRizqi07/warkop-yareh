import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/stores/auth.store';
import AuthCallbackPage from './page';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  refreshAccessToken: vi.fn(),
  replace: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  api: { get: mocks.get },
  refreshAccessToken: mocks.refreshAccessToken,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitialized: false,
    });
  });

  it('exchanges the HttpOnly refresh cookie and loads the authenticated user', async () => {
    const user = {
      id: 'google-user-1',
      name: 'Google User',
      email: 'google@example.test',
      role: 'CUSTOMER' as const,
      membershipTier: 'BRONZE' as const,
      loyaltyPoints: 0,
      joinedAt: '2026-09-15T00:00:00.000Z',
      branchId: null,
    };
    mocks.refreshAccessToken.mockResolvedValue('oauth-access-token');
    mocks.get.mockResolvedValue({ data: { data: user } });

    render(<AuthCallbackPage />);

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/'));
    expect(mocks.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(mocks.get).toHaveBeenCalledWith('/auth/me', {
      headers: { Authorization: 'Bearer oauth-access-token' },
    });
    expect(useAuthStore.getState()).toMatchObject({
      user,
      accessToken: 'oauth-access-token',
      isAuthenticated: true,
    });
  });

  it('shows a recoverable error when cookie exchange fails', async () => {
    mocks.refreshAccessToken.mockRejectedValue(new Error('Refresh failed'));

    render(<AuthCallbackPage />);

    expect(
      await screen.findByText(
        'Gagal memverifikasi sesi login Google. Silakan coba kembali.'
      )
    ).toBeDefined();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
