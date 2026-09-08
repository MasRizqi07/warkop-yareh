'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus, Search, ShoppingCart } from 'lucide-react';
import {
  DataPanel,
  Notice,
  fieldClass,
  formatRupiah,
  primaryButtonClass,
  secondaryButtonClass,
  useAsyncResource,
} from '@/components/management/page-kit';
import {
  createOrder,
  getCurrentShift,
  getTables,
  quoteOrder,
  settleCashPayment,
  type OrderQuote,
} from '@/lib/management-api';
import {
  getBranchProducts,
  getOperationalBranchScope,
} from '@/lib/operations-api';

export default function PosPage() {
  const scope = useAsyncResource(getOperationalBranchScope);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const branchId = selectedBranchId ?? scope.data?.user.branchId ?? scope.data?.branches[0]?.id ?? '';
  const catalog = useAsyncResource(async () => {
    if (!branchId) return { products: [], tables: [], shift: null };
    const [products, tables, shift] = await Promise.all([
      getBranchProducts(branchId),
      getTables(branchId),
      getCurrentShift(branchId),
    ]);
    return { products, tables, shift };
  }, branchId);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKE_AWAY'>('DINE_IN');
  const [tableId, setTableId] = useState('');
  const [quote, setQuote] = useState<OrderQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [processing, setProcessing] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [receipt, setReceipt] = useState<{ orderNumber: string; change: number } | null>(null);
  const idempotencyKey = useRef<string | null>(null);

  const items = useMemo(
    () => Object.entries(cart).filter(([, quantity]) => quantity > 0).map(([productId, quantity]) => ({ productId, quantity })),
    [cart],
  );
  const fingerprint = JSON.stringify({ branchId, items, orderType, tableId: orderType === 'DINE_IN' ? tableId : '' });

  useEffect(() => {
    idempotencyKey.current = null;
    let active = true;
    const timer = window.setTimeout(() => {
      if (!branchId || items.length === 0 || (orderType === 'DINE_IN' && !tableId)) {
        setQuote(null);
        setQuoteError(null);
        setQuoteLoading(false);
        return;
      }
      setQuoteLoading(true);
      setQuoteError(null);
      void quoteOrder({ branchId, items, type: orderType, ...(orderType === 'DINE_IN' ? { tableId } : {}) })
        .then((result) => { if (active) setQuote(result); })
        .catch((reason: unknown) => { if (active) { setQuote(null); setQuoteError(reason instanceof Error ? reason.message : 'Quote gagal dimuat.'); } })
        .finally(() => { if (active) setQuoteLoading(false); });
    }, branchId && items.length > 0 ? 250 : 0);
    return () => { active = false; window.clearTimeout(timer); };
  // fingerprint captures the complete order input and prevents stale quote reuse.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fingerprint]);

  const availableProducts = (catalog.data?.products ?? []).filter((item) => item.isAvailable && item.product.name.toLocaleLowerCase('id-ID').includes(search.toLocaleLowerCase('id-ID')));
  const selectedProducts = items.map((item) => ({ ...item, record: catalog.data?.products.find((candidate) => candidate.productId === item.productId) })).filter((item) => item.record);

  function changeQuantity(productId: string, delta: number) {
    setCart((current) => {
      const next = Math.max(0, Math.min(100, (current[productId] ?? 0) + delta));
      if (next === 0) {
        const nextCart = { ...current };
        delete nextCart[productId];
        return nextCart;
      }
      return { ...current, [productId]: next };
    });
  }

  async function pay() {
    if (!catalog.data?.shift) {
      setNotice({ tone: 'error', text: 'Buka shift kasir sebelum menerima pembayaran tunai.' });
      return;
    }
    if (!quote || quoteLoading || quoteError) {
      setNotice({ tone: 'error', text: 'Total server belum terkonfirmasi.' });
      return;
    }
    const cash = Number(cashReceived);
    if (!Number.isSafeInteger(cash) || cash < quote.total) {
      setNotice({ tone: 'error', text: 'Kas diterima harus berupa bilangan bulat dan tidak kurang dari total.' });
      return;
    }
    setProcessing(true);
    setNotice(null);
    try {
      idempotencyKey.current ??= `pos-${crypto.randomUUID()}`;
      const order = await createOrder({ branchId, items, type: orderType, ...(orderType === 'DINE_IN' ? { tableId } : {}), expectedTotal: quote.total }, idempotencyKey.current);
      const payment = await settleCashPayment(order.id, cash);
      setReceipt({ orderNumber: payment.order.orderNumber, change: payment.change });
      setNotice({ tone: 'success', text: `Pembayaran ${payment.order.orderNumber} tersimpan dan terkonfirmasi.` });
      setCart({});
      setCashReceived('');
      idempotencyKey.current = null;
      await catalog.reload();
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'Pembayaran gagal diproses.' });
    } finally {
      setProcessing(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface-primary p-4 text-text-primary sm:p-6">
      <header className="mx-auto flex max-w-[1700px] flex-col gap-4 border-b border-border-subtle pb-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">Server-authoritative cashier</p><h1 className="mt-2 text-3xl font-bold">Point of Sale</h1><p className="mt-1 text-sm text-text-secondary">Pajak 11%, service fee 5%, harga, dan total berasal dari quote API.</p></div><div className="flex flex-wrap items-end gap-3"><label className="text-xs font-semibold">Cabang<select disabled={!scope.data?.canViewAllBranches} className={`${fieldClass} mt-2 min-w-56`} value={branchId} onChange={(event) => { setSelectedBranchId(event.target.value); setCart({}); setReceipt(null); }}><option value="">Pilih cabang</option>{scope.data?.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label><Link href="/shifts" className={secondaryButtonClass}>{catalog.data?.shift ? 'Shift aktif' : 'Buka shift'}</Link><Link href="/" className={secondaryButtonClass}>Dashboard</Link></div></header>
      <div className="mx-auto mt-5 max-w-[1700px]">{notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}{receipt ? <div className="mt-3"><Notice tone="success">Struk {receipt.orderNumber} · kembalian {formatRupiah(receipt.change)}</Notice></div> : null}</div>
      <div className="mx-auto mt-6 max-w-[1700px]"><DataPanel loading={scope.loading || catalog.loading} error={scope.error || catalog.error} empty={!branchId} onRetry={() => { void scope.reload(); void catalog.reload(); }}>{branchId && catalog.data ? <div className="grid gap-6 xl:grid-cols-[1fr_430px]"><section><div className="mb-4 flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><span className="sr-only">Cari produk</span><Search className="absolute left-3 top-3.5 h-4 w-4 text-text-secondary" /><input className={`${fieldClass} pl-10`} placeholder="Cari menu…" value={search} onChange={(event) => setSearch(event.target.value)} /></label><div className="flex rounded-xl border border-border-subtle bg-surface-card p-1">{(['DINE_IN', 'TAKE_AWAY'] as const).map((type) => <button key={type} type="button" onClick={() => { setOrderType(type); if (type === 'TAKE_AWAY') setTableId(''); }} className={`min-h-9 rounded-lg px-4 text-xs font-bold ${orderType === type ? 'bg-accent text-white' : 'text-text-secondary'}`}>{type === 'DINE_IN' ? 'Dine-in' : 'Take away'}</button>)}</div></div>{!catalog.data.shift ? <div className="mb-4"><Notice tone="error">Tidak ada shift aktif. Katalog dapat dilihat, tetapi tombol pembayaran dikunci.</Notice></div> : null}{availableProducts.length === 0 ? <p className="rounded-2xl border border-dashed border-border-subtle p-10 text-center text-text-secondary">Tidak ada produk tersedia.</p> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{availableProducts.map((item) => <article key={item.id} className="rounded-2xl border border-border-subtle bg-surface-card p-4"><p className="text-xs font-bold uppercase tracking-wider text-accent">{item.product.category.name}</p><h2 className="mt-2 font-bold">{item.product.name}</h2><p className="mt-1 text-sm text-text-secondary">{formatRupiah(item.priceOverride ?? item.product.price)}</p><div className="mt-5 flex items-center justify-between"><button type="button" className={secondaryButtonClass} onClick={() => changeQuantity(item.productId, -1)} aria-label={`Kurangi ${item.product.name}`}><Minus className="h-4 w-4" /></button><span className="font-bold">{cart[item.productId] ?? 0}</span><button type="button" className={secondaryButtonClass} onClick={() => changeQuantity(item.productId, 1)} aria-label={`Tambah ${item.product.name}`}><Plus className="h-4 w-4" /></button></div></article>)}</div>}</section><aside className="h-fit rounded-2xl border border-border-subtle bg-surface-card p-5 xl:sticky xl:top-6"><div className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-accent" /><h2 className="text-lg font-bold">Keranjang ({items.reduce((sum, item) => sum + item.quantity, 0)})</h2></div>{selectedProducts.length === 0 ? <p className="my-8 text-center text-sm text-text-secondary">Pilih produk untuk memulai.</p> : <ul className="my-5 space-y-3">{selectedProducts.map((item) => <li key={item.productId} className="flex justify-between gap-3 text-sm"><span>{item.quantity}× {item.record!.product.name}</span><span className="font-semibold">{formatRupiah((item.record!.priceOverride ?? item.record!.product.price) * item.quantity)}</span></li>)}</ul>}{orderType === 'DINE_IN' ? <label className="block text-sm font-semibold">Meja<select required className={`${fieldClass} mt-2`} value={tableId} onChange={(event) => setTableId(event.target.value)}><option value="">Pilih meja</option>{catalog.data.tables.filter((table) => table.status === 'AVAILABLE' || table.status === 'OCCUPIED').map((table) => <option key={table.id} value={table.id}>Meja {table.number} · {table.status}</option>)}</select></label> : null}<div className="my-5 border-y border-border-subtle py-4">{quoteLoading ? <p role="status" className="text-sm text-text-secondary">Mengonfirmasi harga…</p> : quoteError ? <p role="alert" className="text-sm text-red-500">{quoteError}</p> : quote ? <dl className="space-y-2 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatRupiah(quote.subtotal)}</dd></div><div className="flex justify-between"><dt>Pajak 11%</dt><dd>{formatRupiah(quote.tax)}</dd></div><div className="flex justify-between"><dt>Service fee 5%</dt><dd>{formatRupiah(quote.serviceFee)}</dd></div><div className="flex justify-between border-t border-border-subtle pt-2 text-lg font-bold"><dt>Total</dt><dd>{formatRupiah(quote.total)}</dd></div></dl> : <p className="text-sm text-text-secondary">Lengkapi keranjang dan meja untuk memperoleh quote.</p>}</div><label className="block text-sm font-semibold">Kas diterima<input type="number" min={quote?.total ?? 1} step={1} className={`${fieldClass} mt-2`} value={cashReceived} onChange={(event) => setCashReceived(event.target.value)} /></label><button type="button" disabled={processing || !catalog.data.shift || !quote || quoteLoading} onClick={() => void pay()} className={`${primaryButtonClass} mt-4 w-full`}>{processing ? 'Memproses…' : quote ? `Bayar ${formatRupiah(quote.total)}` : 'Menunggu quote'}</button></aside></div> : null}</DataPanel></div>
    </main>
  );
}
