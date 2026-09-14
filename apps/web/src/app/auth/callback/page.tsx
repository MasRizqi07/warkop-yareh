'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { api, refreshAccessToken } from '@/lib/api';
import type { User } from '@warkop-yareh/types';

export default function AuthCallbackPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const completeAuthentication = async () => {
      try {
        const accessToken = await refreshAccessToken();
        const response = await api.get<{ data: User }>('/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!isMounted) return;
        setAuth(response.data.data, accessToken);
        router.replace('/');
      } catch {
        if (isMounted) {
          setError(
            'Gagal memverifikasi sesi login Google. Silakan coba kembali.'
          );
        }
      }
    };

    void completeAuthentication();

    return () => {
      isMounted = false;
    };
  }, [router, setAuth]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="text-center max-w-md p-6 bg-white dark:bg-slate-900 rounded-2xl shadow border border-slate-200 dark:border-slate-800">
          <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Autentikasi Gagal
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            {error}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors"
          >
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mx-auto mb-4" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Menyelesaikan autentikasi Google...
        </p>
      </div>
    </div>
  );
}
