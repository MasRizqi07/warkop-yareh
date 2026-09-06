import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  withCredentials: true, // Crucial for sending/receiving httpOnly refresh token cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let pendingRefresh: Promise<string> | null = null;

const AUTH_ROUTES_WITHOUT_REFRESH = [
  '/auth/login',
  '/auth/register',
  '/auth/otp/send',
  '/auth/otp/verify',
  '/auth/refresh',
  '/auth/logout',
];

function canAttemptRefresh(url?: string): boolean {
  if (!url) return false;
  return !AUTH_ROUTES_WITHOUT_REFRESH.some((route) => url.includes(route));
}

export function refreshAccessToken(): Promise<string> {
  if (pendingRefresh) return pendingRefresh;
  const session = useAuthStore.getState();
  pendingRefresh = axios.post<{ data: { accessToken: string } }>(
    `${API_URL}/auth/refresh`, {}, { withCredentials: true, timeout: 15_000 },
  ).then((response) => {
    const current = useAuthStore.getState();
    if (current.user !== session.user || current.accessToken !== session.accessToken || current.isAuthenticated !== session.isAuthenticated) {
      throw new Error('Session changed while refreshing credentials');
    }
    const token = response.data.data.accessToken;
    if (typeof token !== 'string' || !token) throw new Error('Invalid session response');
    current.setAccessToken(token);
    return token;
  }).finally(() => { pendingRefresh = null; });
  return pendingRefresh;
}

api.interceptors.response.use((response) => response, async (error: AxiosError) => {
  const request = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
  if (error.response?.status !== 401 || !request || request._retry || !canAttemptRefresh(request.url)) throw error;
  request._retry = true;
  const currentToken = useAuthStore.getState().accessToken;
  try {
    const token = currentToken && request.headers.Authorization !== `Bearer ${currentToken}`
      ? currentToken : await refreshAccessToken();
    request.headers.Authorization = `Bearer ${token}`;
    return await api(request);
  } catch (refreshError) {
    if (axios.isAxiosError(refreshError) && [401, 403].includes(refreshError.response?.status ?? 0)) {
      useAuthStore.getState().logout();
    }
    throw refreshError;
  }
});
