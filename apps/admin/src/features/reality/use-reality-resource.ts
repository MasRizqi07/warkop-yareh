'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export function useRealityResource<T>(endpoint: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiFetch<{ data: T[] }>(endpoint);
      if (!Array.isArray(result.data))
        throw new Error('Respons penyimpanan tidak valid');
      setRows(result.data);
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : 'Data belum dapat dimuat'
      );
    } finally {
      setLoading(false);
    }
  }, [endpoint]);
  useEffect(() => {
    const controller = new AbortController();
    void apiFetch<{ data: T[] }>(endpoint, { signal: controller.signal })
      .then((result) => {
        if (!Array.isArray(result.data)) throw new Error('Respons penyimpanan tidak valid');
        if (!controller.signal.aborted) setRows(result.data);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted)
          setError(cause instanceof Error ? cause.message : 'Data belum dapat dimuat');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [endpoint]);
  return { rows, loading, error, reload };
}

export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
}
