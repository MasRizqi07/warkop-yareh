const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_access_token');
}

export function setAdminToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_access_token', token);
  }
}

export function clearAdminToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_access_token');
  }
}

export async function adminLogin(
  email = 'admin@coldnbrew.id',
  password = 'Admin123!',
): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    const token =
      data.data?.tokens?.accessToken || data.data?.accessToken || null;
    if (token) {
      setAdminToken(token);
    }
    return token;
  } catch (err) {
    console.error('Admin login failed:', err);
    return null;
  }
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  let token = getAdminToken();
  if (!token) {
    token = await adminLogin();
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If 401 Unauthorized, attempt transparent re-login and retry request once
  if (res.status === 401) {
    token = await adminLogin();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message =
      errorData.error?.message ||
      errorData.message ||
      `HTTP Error ${res.status}`;
    throw new Error(message);
  }

  return res.json();
}
