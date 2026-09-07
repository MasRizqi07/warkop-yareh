import axios from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { refreshAccessToken } from './api';
import { useAuthStore } from '../stores/auth.store';

afterEach(() => { vi.restoreAllMocks(); useAuthStore.getState().logout(); });

describe('Session refresh coordination', () => {
  it('shares one request across concurrent bootstrap and API retries', async () => {
    let complete!: (value: { data: { data: { accessToken: string } } }) => void;
    const response = new Promise<{ data: { data: { accessToken: string } } }>((resolve) => { complete = resolve; });
    const post = vi.spyOn(axios, 'post').mockReturnValue(response);
    const first = refreshAccessToken();
    const second = refreshAccessToken();
    expect(first).toBe(second);
    complete({ data: { data: { accessToken: 'new-access-token' } } });
    await expect(first).resolves.toBe('new-access-token');
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('allows a retry after a network failure', async () => {
    const post = vi.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Network unavailable')).mockResolvedValueOnce({ data: { data: { accessToken: 'recovered-token' } } });
    await expect(refreshAccessToken()).rejects.toThrow('Network unavailable');
    await expect(refreshAccessToken()).resolves.toBe('recovered-token');
    expect(post).toHaveBeenCalledTimes(2);
  });

  it('does not overwrite credentials from a newer login', async () => {
    let complete!: (value: { data: { data: { accessToken: string } } }) => void;
    vi.spyOn(axios, 'post').mockReturnValue(new Promise((resolve) => { complete = resolve; }));
    const pending = refreshAccessToken();
    useAuthStore.getState().setAccessToken('newer-session');
    complete({ data: { data: { accessToken: 'old-session' } } });
    await expect(pending).rejects.toThrow('Session changed');
    expect(useAuthStore.getState().accessToken).toBe('newer-session');
  });
});
