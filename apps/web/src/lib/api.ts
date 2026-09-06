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

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: Error) => void }> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const AUTH_ROUTES_WITHOUT_REFRESH = [
  '/auth/login',
  '/auth/register',
  '/auth/otp/send',
  '/auth/otp/verify',
  '/auth/refresh',
];

function canAttemptRefresh(url?: string): boolean {
  if (!url) return false;
  return !AUTH_ROUTES_WITHOUT_REFRESH.some((route) => url.includes(route));
}

export async function refreshAccessToken(): Promise<string> {
  const response = await axios.post<{ data: { accessToken: string } }>(
    `${API_URL}/auth/refresh`,
    {},
    { withCredentials: true, timeout: 15_000 },
  );
  const accessToken = response.data.data.accessToken;
  useAuthStore.getState().setAccessToken(accessToken);
  return accessToken;
}

// Response Interceptor: Handle 401 & Transparent Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 Unauthorized and not already retrying
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      canAttemptRefresh(originalRequest.url)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token. 
        // The httpOnly cookie 'refreshToken' is automatically sent by browser because of withCredentials: true.
        const accessToken = await refreshAccessToken();
        
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        // Refresh failed (cookie expired, invalid, etc), force logout
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          const publicAuthPaths = ['/login', '/register', '/otp'];
          if (!publicAuthPaths.includes(window.location.pathname)) {
            window.location.replace(
              new URL('/login?session_expired=true', window.location.origin),
            );
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
