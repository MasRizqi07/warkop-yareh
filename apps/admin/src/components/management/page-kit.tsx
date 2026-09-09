'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function formatRupiah(value: number | string | null | undefined) {
  const numeric = typeof value === 'string' ? Number(value) : (value ?? 0);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

export function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value));
}

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 border-b border-border-subtle pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}

export function Notice({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'success' | 'error';
  children: React.ReactNode;
}) {
  const colors = {
    info: 'border-border-subtle bg-surface-card text-text-secondary',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    error: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
  };
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${colors[tone]}`}>
      {children}
    </p>
  );
}

export function DataPanel({
  loading,
  error,
  empty,
  onRetry,
  children,
}: {
  loading: boolean;
  error: string | null;
  empty: boolean;
  onRetry: () => void;
  children: React.ReactNode;
}) {
  if (loading) {
    return <div role="status" className="rounded-2xl border border-border-subtle bg-surface-card p-10 text-center text-text-secondary">Memuat data terbaru…</div>;
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center">
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>
        <button type="button" onClick={onRetry} className="mt-4 rounded-lg border border-border-subtle px-4 py-2 text-sm font-semibold">Coba lagi</button>
      </div>
    );
  }
  if (empty) {
    return <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-card p-10 text-center text-sm text-text-secondary">Belum ada data yang cocok.</div>;
  }
  return <>{children}</>;
}

export function useAsyncResource<T>(
  loader: () => Promise<T>,
  dependencyKey: string | number = '',
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const loaderRef = useRef(loader);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  const reload = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await loaderRef.current();
      if (requestId.current === currentRequest) setData(result);
    } catch (reason) {
      if (requestId.current === currentRequest) {
        setError(reason instanceof Error ? reason.message : 'Permintaan gagal diproses.');
      }
    } finally {
      if (requestId.current === currentRequest) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void reload(), 0);
    return () => {
      window.clearTimeout(timer);
      requestId.current += 1;
    };
  }, [dependencyKey, reload]);

  return { data, setData, loading, error, reload };
}

export const fieldClass =
  'min-h-11 w-full rounded-xl border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20';

export const primaryButtonClass =
  'inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50';

export const secondaryButtonClass =
  'inline-flex min-h-11 items-center justify-center rounded-xl border border-border-subtle bg-surface-card px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-50';
