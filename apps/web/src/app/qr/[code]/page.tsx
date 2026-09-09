'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Coffee } from 'lucide-react';
import { DataState, LoadingState } from '@/components/data-state';
import { resolveTableQr } from '@/features/public/public.api';
import { getApiErrorMessage } from '@/lib/api-error';
import { useBranchStore } from '@/stores/branch.store';
import { useCartStore, useCheckoutStore } from '@/stores';

export default function QRScanPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = Array.isArray(params.code) ? params.code[0] : params.code;
  const table = useQuery({
    queryKey: ['table-qr', code],
    queryFn: () => resolveTableQr(code),
    enabled: Boolean(code),
    retry: false,
  });

  useEffect(() => {
    if (!table.data) return;
    const branch = useBranchStore.getState();
    if (branch.activeBranchId && branch.activeBranchId !== table.data.branchId) {
      useCartStore.getState().clearCart();
    }
    branch.setActiveBranchId(table.data.branchId);
    const checkout = useCheckoutStore.getState();
    checkout.setFulfillmentType('dine-in');
    checkout.setTable(table.data.id, `Meja ${table.data.number}`);
    router.replace(`/table/${encodeURIComponent(table.data.id)}`);
  }, [router, table.data]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-24 text-text-primary">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-border-subtle bg-surface-card p-7 text-center shadow-xl sm:p-9">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container"><Coffee className="h-10 w-10" /></div>
        {table.isError ? <DataState title="Kode QR tidak dapat digunakan" detail={getApiErrorMessage(table.error, 'Kode QR tidak valid atau meja sedang tidak aktif.')} retry={() => void table.refetch()} /> : <><h1 className="text-2xl font-bold">Menghubungkan meja</h1><p className="text-sm leading-6 text-text-muted">Kami sedang memvalidasi kode QR dan menyiapkan katalog cabang yang benar.</p><LoadingState label="Memvalidasi QR…" /></>}
      </div>
    </main>
  );
}
