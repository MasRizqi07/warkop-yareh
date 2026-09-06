'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { apiFetch, clearAdminToken, type AdminUser } from '@/lib/api';

const ALLOWED_ROLES = new Set(['STAFF', 'CASHIER', 'KITCHEN', 'MANAGER', 'ADMIN', 'OWNER', 'SUPERADMIN']);

export function AdminSessionBoundary({ children }: { children: React.ReactNode }) {
  const isLogin = usePathname() === '/login';
  const [session, setSession] = useState<{ authenticated: boolean; error: string | null }>({ authenticated: false, error: null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (isLogin) return;
    let active = true;
    void apiFetch<{ data: AdminUser }>('/auth/me').then(({ data }) => {
      if (!ALLOWED_ROLES.has(data.role)) {
        clearAdminToken();
        throw new Error('Akun ini tidak memiliki akses portal admin.');
      }
      if (active) setSession({ authenticated: true, error: null });
    }).catch((error: unknown) => {
      if (active) setSession({ authenticated: false, error: error instanceof Error ? error.message : 'Sesi tidak dapat diverifikasi.' });
    });
    return () => { active = false; };
  }, [isLogin, attempt]);
  if (isLogin || session.authenticated) return children;
  return <main className="flex min-h-screen items-center justify-center p-6"><div className="max-w-md space-y-5 rounded-2xl border border-border-subtle bg-surface-card p-6"><h1 className="text-xl font-semibold">{session.error ? 'Sesi admin belum tersedia' : 'Memverifikasi sesi admin...'}</h1>{session.error ? <><p role="alert" className="text-sm">{session.error}</p><button type="button" onClick={() => setAttempt((value) => value + 1)} className="rounded-xl border border-border-subtle px-4 py-2">Coba lagi</button><a href="/login" className="ml-4 underline">Masuk</a></> : <p role="status">Tunggu sebentar.</p>}</div></main>;
}
