const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const ADMIN_ROLES = new Set([
  'STAFF',
  'CASHIER',
  'KITCHEN',
  'MANAGER',
  'ADMIN',
  'OWNER',
  'SUPERADMIN',
]);

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  branchId?: string | null;
}

interface LoginResponse {
  data?: {
    accessToken?: string;
    user?: AdminUser;
  };
  error?: { message?: string };
  message?: string;
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem('admin_access_token');
}

export function setAdminToken(token: string): void {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem('admin_access_token', token);
  }
}

export function clearAdminToken(): void {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem('admin_access_token');
  }
}

function extractErrorMessage(data: LoginResponse, fallback: string) {
  return data.error?.message || data.message || fallback;
}

async function revokeUnauthorizedSession(accessToken?: string) {
  if (!accessToken) return;

  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => undefined);
}

export async function adminLogin(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = (await response.json().catch(() => ({}))) as LoginResponse;

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, 'Unable to sign in'));
  }

  const accessToken = data.data?.accessToken;
  const user = data.data?.user;
  if (!accessToken || !user) {
    throw new Error('The authentication response is incomplete');
  }

  if (!ADMIN_ROLES.has(user.role)) {
    await revokeUnauthorizedSession(accessToken);
    throw new Error('This account does not have admin portal access');
  }

  setAdminToken(accessToken);
  return user;
}

async function refreshAdminToken(): Promise<string | null> {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) return null;

  const data = (await response.json()) as LoginResponse;
  const accessToken = data.data?.accessToken;
  if (!accessToken) return null;

  setAdminToken(accessToken);
  return accessToken;
}

function redirectToLogin() {
  if (typeof window === 'undefined' || window.location.pathname === '/login') {
    return;
  }

  const loginUrl = new URL('/login', window.location.origin);
  loginUrl.searchParams.set(
    'redirect_url',
    `${window.location.pathname}${window.location.search}`,
  );
  window.location.replace(loginUrl);
}

export async function adminLogout() {
  const token = getAdminToken();
  try {
    if (token) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } finally {
    clearAdminToken();
  }
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  let token = getAdminToken() || (await refreshAdminToken());
  if (!token) {
    redirectToLogin();
    throw new Error('Authentication required');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
    Authorization: `Bearer ${token}`,
  };

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (response.status === 401) {
    token = await refreshAdminToken();
    if (!token) {
      clearAdminToken();
      redirectToLogin();
      throw new Error('Your session has expired');
    }

    headers.Authorization = `Bearer ${token}`;
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers,
    });
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as LoginResponse;
    throw new Error(
      extractErrorMessage(data, `Request failed with status ${response.status}`),
    );
  }

  return response.json() as Promise<T>;
}
