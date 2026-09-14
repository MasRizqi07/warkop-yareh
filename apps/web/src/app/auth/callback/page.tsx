'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(() =>
    token ? null : 'Token autentikasi tidak ditemukan dalam callback.'
  );

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    // Fetch authenticated user profile using the issued access token
    api
      .get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (!isMounted) return;
        const user = res.data.data;
        setAuth(user, token);
        router.replace('/');
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to complete Google authentication callback', err);
        setError('Gagal memverifikasi sesi login Google. Silakan coba kembali.');
      });

    return () => {
      isMounted = false;
    };
  }, [token, router, setAuth]);

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
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors"
          >
            Kembali ke Halaman Login
          </a>
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

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mx-auto mb-4" />
            <p className="text-sm text-slate-600">Memuat sesi...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
