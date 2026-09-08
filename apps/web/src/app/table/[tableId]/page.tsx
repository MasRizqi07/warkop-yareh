'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, BellRing, Coffee, HandPlatter, Plus, ReceiptText, Search, ShoppingBag, Users } from 'lucide-react';
import type { Product } from '@warkop-yareh/types';
import { ProductCustomizerModal } from '@/components/menu/ProductCustomizerModal';
import { DataState, LoadingState } from '@/components/data-state';
import { getBranches, getCatalog, toUiProduct } from '@/features/catalog/catalog.api';
import { createWaiterCall, getPublicTable } from '@/features/public/public.api';
import { getApiErrorMessage } from '@/lib/api-error';
import { useBranchStore } from '@/stores/branch.store';
import { useCartStore, useCheckoutStore } from '@/stores';

const STATUS_LABELS = {
  AVAILABLE: 'Tersedia',
  OCCUPIED: 'Sedang digunakan',
  RESERVED: 'Dipesan',
  CLEANING: 'Sedang dibersihkan',
  MAINTENANCE: 'Dalam perawatan',
} as const;

const CALL_OPTIONS = [
  { type: 'CALL_WAITER' as const, label: 'Panggil staf', detail: 'Staf akan menuju meja ini.', icon: BellRing },
  { type: 'REQUEST_BILL' as const, label: 'Minta tagihan', detail: 'Staf akan membantu proses pembayaran.', icon: ReceiptText },
  { type: 'NEED_ASSISTANCE' as const, label: 'Perlu bantuan', detail: 'Gunakan untuk kebutuhan mendesak di meja.', icon: HandPlatter },
];

export default function TableMenuPage() {
  const params = useParams<{ tableId: string }>();
  const tableId = Array.isArray(params.tableId) ? params.tableId[0] : params.tableId;
  const [search, setSearch] = useState('');
  const [customizing, setCustomizing] = useState<Product | null>(null);
  const itemCount = useCartStore((state) => state.itemCount());

  const table = useQuery({
    queryKey: ['public-table', tableId],
    queryFn: () => getPublicTable(tableId),
    enabled: Boolean(tableId),
    retry: 1,
  });
  const branches = useQuery({ queryKey: ['branches'], queryFn: getBranches, staleTime: 5 * 60_000, retry: 1 });
  const catalog = useQuery({
    queryKey: ['catalog', table.data?.branchId ?? 'none'],
    queryFn: () => getCatalog(table.data!.branchId),
    enabled: Boolean(table.data?.branchId),
    select: (data) => ({ ...data, products: data.products.map((product) => toUiProduct(product, table.data!.branchId)) }),
    staleTime: 60_000,
    retry: 1,
  });
  const waiterCall = useMutation({ mutationFn: (type: (typeof CALL_OPTIONS)[number]['type']) => createWaiterCall(tableId, type) });

  useEffect(() => {
    if (!table.data) return;
    const branchStore = useBranchStore.getState();
    if (branchStore.activeBranchId && branchStore.activeBranchId !== table.data.branchId) {
      useCartStore.getState().clearCart();
    }
    branchStore.setActiveBranchId(table.data.branchId);
    const checkout = useCheckoutStore.getState();
    checkout.setFulfillmentType('dine-in');
    checkout.setTable(table.data.id, `Meja ${table.data.number}`);
  }, [table.data]);

  const products = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('id-ID');
    if (!needle) return catalog.data?.products ?? [];
    return (catalog.data?.products ?? []).filter((product) =>
      [product.name, product.description, ...(product.tags ?? [])].some((value) => value.toLocaleLowerCase('id-ID').includes(needle)),
    );
  }, [catalog.data?.products, search]);

  if (table.isPending) {
    return <main className="mx-auto min-h-screen max-w-7xl px-4 pb-28 pt-24"><LoadingState label="Menghubungkan meja…" /></main>;
  }
  if (table.isError || !table.data) {
    return <main className="mx-auto min-h-screen max-w-7xl px-4 pb-28 pt-24"><DataState title="Meja tidak dapat dibuka" detail={getApiErrorMessage(table.error, 'Kode meja tidak valid atau meja sedang tidak aktif.')} retry={() => void table.refetch()} /></main>;
  }

  const currentTable = table.data;
  const branch = branches.data?.find((item) => item.id === currentTable.branchId);
  const orderingUnavailable = currentTable.status === 'MAINTENANCE' || currentTable.status === 'CLEANING';

  return (
    <main className="min-h-screen bg-background pb-32 text-text-primary">
      <section className="border-b border-border-subtle bg-surface-secondary pt-20">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-amber">Dine-in terhubung</p>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Meja {currentTable.number}</h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-text-muted">
              <span>{branch?.name ?? 'Cabang sedang dimuat'}</span>
              <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" />Kapasitas {currentTable.capacity}</span>
              <span className="rounded-full border border-border-subtle bg-surface-card px-3 py-1 font-semibold text-text-primary">{STATUS_LABELS[currentTable.status]}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/cart" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-5 py-3 text-sm font-bold"><ShoppingBag className="h-4 w-4" />Keranjang ({itemCount})</Link>
            <Link href="/checkout" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary-container px-5 py-3 text-sm font-bold text-on-primary-container">Checkout meja ini<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl items-start gap-8 px-4 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 space-y-6" aria-labelledby="table-menu-heading">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div><h2 id="table-menu-heading" className="text-2xl font-bold">Menu cabang</h2><p className="mt-1 text-sm text-text-muted">Harga dan ketersediaan diambil langsung dari katalog cabang meja ini.</p></div>
            <label className="relative block sm:w-72"><span className="sr-only">Cari menu</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari menu…" className="min-h-11 w-full rounded-xl border border-border-subtle bg-surface-card py-2 pl-10 pr-3 text-sm outline-none focus:border-accent-amber" /></label>
          </div>

          {orderingUnavailable ? <DataState title="Pemesanan meja sedang dinonaktifkan" detail={`Status meja saat ini: ${STATUS_LABELS[currentTable.status]}. Hubungi staf bila status belum diperbarui.`} /> : catalog.isPending ? <LoadingState label="Memuat katalog cabang…" /> : catalog.isError ? <DataState title="Katalog belum dapat dimuat" detail={getApiErrorMessage(catalog.error)} retry={() => void catalog.refetch()} /> : products.length === 0 ? <DataState title="Menu tidak ditemukan" detail={search ? 'Coba kata kunci lain.' : 'Belum ada produk aktif pada cabang ini.'} /> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <article key={product.id} className="flex overflow-hidden rounded-2xl border border-border-subtle bg-surface-card sm:flex-col"><div className="relative h-36 w-32 shrink-0 bg-surface-container sm:h-44 sm:w-full"><Image src={product.image} alt={product.name} fill sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 128px" className="object-cover" /></div><div className="flex min-w-0 flex-1 flex-col p-4"><h3 className="font-bold">{product.name}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-text-muted">{product.description}</p><div className="mt-auto flex items-end justify-between gap-3 pt-4"><div><p className="font-mono text-sm font-bold text-accent-amber">Rp {product.price.toLocaleString('id-ID')}</p><p className="mt-1 text-[11px] text-text-muted">± {product.preparationTime} menit</p></div><button type="button" onClick={() => setCustomizing(product)} aria-label={`Pesan ${product.name}`} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-primary-container px-3 text-on-primary-container"><Plus className="h-4 w-4" /></button></div></div></article>)}</div>}
        </section>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <section className="space-y-4 rounded-2xl border border-border-subtle bg-surface-card p-5">
            <div><h2 className="flex items-center gap-2 font-bold"><Coffee className="h-5 w-5 text-accent-amber" />Bantuan meja</h2><p className="mt-1 text-xs leading-5 text-text-muted">Permintaan dicatat di server dan diteruskan ke panel operasional cabang.</p></div>
            <div className="space-y-2">{CALL_OPTIONS.map((option) => <button key={option.type} type="button" disabled={waiterCall.isPending} onClick={() => waiterCall.mutate(option.type)} className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-border-subtle bg-surface-secondary p-3 text-left disabled:opacity-50"><option.icon className="h-5 w-5 shrink-0 text-accent-amber" /><span><strong className="block text-sm">{option.label}</strong><span className="mt-0.5 block text-xs text-text-muted">{option.detail}</span></span></button>)}</div>
            {waiterCall.isSuccess && <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-400">Permintaan diterima. Staf cabang telah diberi notifikasi.</p>}
            {waiterCall.isError && <DataState title="Permintaan belum terkirim" detail={getApiErrorMessage(waiterCall.error)} />}
          </section>
          <section className="rounded-2xl border border-border-subtle bg-surface-card p-5 text-sm text-text-muted"><h2 className="font-bold text-text-primary">Harga final</h2><p className="mt-2 leading-6">Keranjang menampilkan estimasi. Server memvalidasi harga, stok, pajak 11%, dan service fee 5% saat checkout.</p></section>
        </aside>
      </div>

      <ProductCustomizerModal product={customizing} isOpen={Boolean(customizing)} onClose={() => setCustomizing(null)} />
    </main>
  );
}
