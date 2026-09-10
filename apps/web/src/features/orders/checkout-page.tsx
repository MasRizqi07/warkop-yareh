'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Bike, Car, Coffee, CreditCard, Minus, Plus, ShoppingBag, Utensils } from 'lucide-react';
import { Button, Input } from '@warkop-yareh/ui';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore, useCheckoutStore, type FulfillmentType, getCartItemId } from '@/stores';
import { useActiveBranch, useCatalog } from '@/features/catalog/catalog.hooks';
import type { ApiOrderType, ApiPaymentMethod } from '@/features/api/contracts';
import { createOrder, initializePayment, quoteOrder, type CreateOrderRequest } from './orders.api';
import { assertPaymentRedirect } from './payment-navigation';
import { getApiErrorMessage } from '@/lib/api-error';
import { DataState, LoadingState } from '@/components/data-state';

const TYPES: Record<FulfillmentType, ApiOrderType> = { 'dine-in': 'DINE_IN', pickup: 'TAKE_AWAY', 'drive-thru': 'DRIVE_THRU', delivery: 'DELIVERY' };
const MODES = [{ type: 'dine-in', name: 'Dine-in', icon: Utensils }, { type: 'pickup', name: 'Self-pickup', icon: ShoppingBag }, { type: 'drive-thru', name: 'Drive-thru', icon: Car }, { type: 'delivery', name: 'Delivery', icon: Bike }] as const;
const rupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

export default function CheckoutPage() {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.isInitialized);
  const authenticated = useAuthStore((s) => s.isAuthenticated);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const checkout = useCheckoutStore();
  const branches = useActiveBranch();
  const catalog = useCatalog(branches.activeBranch?.id);
  const [notes, setNotes] = useState('');
  const [plate, setPlate] = useState('');
  const [voucherDraft, setVoucherDraft] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [pointsDraft, setPointsDraft] = useState(0);
  const [points, setPoints] = useState(0);
  const [method, setMethod] = useState<ApiPaymentMethod>('QRIS');
  const [pendingOrder, setPendingOrder] = useState<string | null>(null);
  const attempt = useRef<{ fingerprint: string; key: string } | null>(null);
  const quoteRequest = useMemo<CreateOrderRequest>(() => ({
    branchId: branches.activeBranch?.id ?? '', type: TYPES[checkout.fulfillmentType],
    ...(checkout.fulfillmentType === 'dine-in' && checkout.tableId ? { tableId: checkout.tableId } : {}),
    notes: '',
    ...(voucherCode ? { voucherCode } : {}), ...(points > 0 ? { loyaltyPointsUsed: points } : {}),
    items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity, customizations: item.customizations, notes: item.notes })),
  }), [branches.activeBranch?.id, checkout.fulfillmentType, checkout.tableId, items, points, voucherCode]);
  const ready = initialized && authenticated && Boolean(branches.activeBranch) && items.length > 0;
  const quote = useQuery({ queryKey: ['checkout-quote', user?.id, quoteRequest], queryFn: () => quoteOrder(quoteRequest), enabled: ready, retry: false, staleTime: 0 });
  const purchase = useMutation({ mutationFn: async () => {
    if (!ready || !quote.data || quote.isFetching || quote.isError) throw new Error('Tunggu ringkasan harga selesai diperbarui.');
    if (checkout.fulfillmentType === 'dine-in' && !checkout.tableId) throw new Error('Pindai QR meja untuk pesanan dine-in.');
    if (checkout.fulfillmentType === 'delivery' && checkout.deliveryAddress.trim().length < 10) throw new Error('Isi alamat lengkap, minimal 10 karakter.');
    if (checkout.fulfillmentType === 'drive-thru' && plate.trim().length < 3) throw new Error('Isi nomor kendaraan untuk drive-thru.');
    const request: CreateOrderRequest = {
      ...quoteRequest,
      notes: [notes.trim(), checkout.fulfillmentType === 'delivery' ? `Alamat: ${checkout.deliveryAddress.trim()}` : '', checkout.fulfillmentType === 'drive-thru' ? `Kendaraan: ${plate.trim().toUpperCase()}` : ''].filter(Boolean).join('\n'),
    };
    const payload = { ...request, expectedTotal: quote.data.total };
    const fingerprint = JSON.stringify({ userId: user?.id, payload });
    if (!attempt.current) {
      try { const previous: unknown = JSON.parse(sessionStorage.getItem('warkop-checkout-attempt') ?? 'null'); if (previous && typeof previous === 'object' && 'fingerprint' in previous && previous.fingerprint === fingerprint && 'key' in previous && typeof previous.key === 'string' && previous.key.length >= 8 && previous.key.length <= 128) attempt.current = { fingerprint, key: previous.key }; } catch { attempt.current = null; }
    }
    if (attempt.current?.fingerprint !== fingerprint) attempt.current = { fingerprint, key: crypto.randomUUID() };
    try { sessionStorage.setItem('warkop-checkout-attempt', JSON.stringify(attempt.current)); } catch { /* The mounted checkout retains its retry key when browser storage is unavailable. */ }
    const order = await createOrder(payload, attempt.current.key);
    setPendingOrder(order.id);
    const payment = await initializePayment(order.id, method);
    const destination = assertPaymentRedirect(payment.redirectUrl);
    if (useCartStore.getState().items === items) useCartStore.getState().clearCart();
    try { sessionStorage.removeItem('warkop-checkout-attempt'); } catch { attempt.current = null; }
    window.location.assign(destination);
  } });
  const pairings = (catalog.data?.products ?? []).filter((product) => !items.some((item) => item.product.id === product.id)).slice(0, 3);

  return <main className="mx-auto min-h-screen max-w-7xl space-y-7 px-4 pb-32 pt-10 text-text-primary sm:px-6">
    <header><Link href="/cart" className="text-sm text-text-muted">Keranjang Anda</Link><h1 className="mt-3 text-3xl font-bold sm:text-4xl">Complete Your Sanctuary Order</h1><p className="mt-2 text-text-muted">Pilih cara menikmati pesanan dan lanjutkan pembayaran.</p></header>
    {!initialized ? <LoadingState label="Memulihkan sesi..." /> : !authenticated ? <DataState title="Masuk untuk menyelesaikan pesanan" detail="Keranjang Anda tetap tersimpan." loginPath="/checkout" /> : !items.length ? <DataState title="Keranjang kosong" detail="Pilih menu untuk memulai pesanan." /> : <>
      {branches.isError && <DataState title="Cabang belum dapat dimuat" retry={() => void branches.refetch()} />}
      <fieldset disabled={purchase.isPending} className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-border-subtle bg-surface-card p-5 sm:p-7"><h2 className="text-xl font-semibold">Fulfillment · {branches.activeBranch?.name ?? 'Memuat cabang...'}</h2><div className="my-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{MODES.map((mode) => <Button key={mode.type} variant={checkout.fulfillmentType === mode.type ? 'default' : 'secondary'} aria-pressed={checkout.fulfillmentType === mode.type} onClick={() => checkout.setFulfillmentType(mode.type)} disabled={purchase.isPending}><mode.icon className="h-4 w-4" />{mode.name}</Button>)}</div>
            {checkout.fulfillmentType === 'dine-in' && <p className="text-sm text-text-muted">{checkout.tableId ? `Meja: ${checkout.tableLabel || checkout.tableId}` : 'Pindai kode QR di meja sebelum melanjutkan.'}</p>}
            {checkout.fulfillmentType === 'delivery' && <div><label htmlFor="delivery-address" className="mb-2 block text-sm">Alamat pengantaran</label><textarea id="delivery-address" value={checkout.deliveryAddress} onChange={(event) => checkout.setDeliveryAddress(event.target.value)} maxLength={250} rows={3} className="w-full rounded-xl border border-border-subtle bg-surface-secondary p-3" /></div>}
            {checkout.fulfillmentType === 'drive-thru' && <div><label htmlFor="vehicle-plate" className="mb-2 block text-sm">Nomor kendaraan</label><Input id="vehicle-plate" value={plate} onChange={(event) => setPlate(event.target.value)} maxLength={20} /></div>}
            <div className="mt-5"><label htmlFor="order-notes" className="mb-2 block text-sm">Catatan pesanan</label><textarea id="order-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={200} rows={2} className="w-full rounded-xl border border-border-subtle bg-surface-secondary p-3" /></div>
          </section>
          <section className="rounded-2xl border border-border-subtle bg-surface-card p-5 sm:p-7"><h2 className="text-xl font-semibold">Pesanan Anda</h2><ul className="mt-4 divide-y divide-border-subtle">{items.map((item) => <li key={getCartItemId(item.product.id, item.customizations, item.notes)} className="flex flex-wrap items-center justify-between gap-4 py-4"><div className="min-w-0"><h3 className="font-semibold">{item.product.name}</h3><p className="mt-1 text-xs text-text-muted">{Object.values(item.customizations ?? {}).join(' · ')}</p><p className="mt-2 text-sm text-accent-amber">{rupiah(item.unitPrice * item.quantity)}</p></div><div className="flex items-center gap-2"><Button variant="secondary" size="icon" aria-label={`Kurangi ${item.product.name}`} disabled={purchase.isPending} onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.customizations, item.notes)}><Minus /></Button><span className="w-7 text-center">{item.quantity}</span><Button variant="secondary" size="icon" aria-label={`Tambah ${item.product.name}`} disabled={purchase.isPending || item.quantity >= 100} onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.customizations, item.notes)}><Plus /></Button></div></li>)}</ul></section>
          <section className="space-y-5 rounded-2xl border border-border-subtle bg-surface-card p-5 sm:p-7"><h2 className="text-xl font-semibold">Voucher &amp; Kawan Points</h2><div><label htmlFor="voucher-code" className="mb-2 block text-sm">Kode voucher</label><div className="flex flex-wrap gap-2"><Input id="voucher-code" value={voucherDraft} onChange={(event) => setVoucherDraft(event.target.value)} maxLength={40} className="min-w-0 flex-1 uppercase" /><Button variant="secondary" onClick={() => setVoucherCode(voucherDraft.trim().toUpperCase())}>Terapkan</Button>{voucherCode && <Button variant="secondary" onClick={() => { setVoucherCode(''); setVoucherDraft(''); }}>Hapus</Button>}</div></div><div><label htmlFor="checkout-points" className="mb-2 block text-sm">Tukar poin · 1 PTS = Rp100</label><div className="flex flex-wrap gap-2"><Input id="checkout-points" type="number" min={0} max={1000000} step={1} value={pointsDraft} onChange={(event) => setPointsDraft(Math.max(0, Math.trunc(Number(event.target.value) || 0)))} className="min-w-0 flex-1" /><Button variant="secondary" onClick={() => setPoints(pointsDraft)}>Terapkan poin</Button></div><p className="mt-2 text-xs text-text-muted">Voucher dan poin berlaku pada harga menu. Pajak dan service fee tetap dibayarkan.</p></div></section>
          {pairings.length > 0 && <section className="space-y-4"><h2 className="flex items-center gap-2 text-xl font-semibold"><Coffee className="text-accent-amber" />Midnight Pairings</h2><div className="grid gap-3 sm:grid-cols-3">{pairings.map((product) => <article key={product.id} className="flex flex-col rounded-2xl border border-border-subtle bg-surface-card p-4"><h3 className="flex-1 text-sm font-semibold">{product.name}</h3><p className="my-3 text-sm text-accent-amber">{rupiah(product.price)}</p><Button variant="secondary" disabled={purchase.isPending} onClick={() => useCartStore.getState().addItem(product)}>Tambah</Button></article>)}</div></section>}
        </div>
        <aside className="space-y-5 rounded-2xl border border-border-subtle bg-surface-card p-5 lg:sticky lg:top-24"><h2 className="text-xl font-semibold">Ringkasan pembayaran</h2>{quote.isPending || quote.isFetching ? <LoadingState label="Memperbarui harga..." /> : quote.isError ? <DataState title="Harga belum dapat dikonfirmasi" detail={getApiErrorMessage(quote.error)} retry={() => void quote.refetch()} /> : quote.data && <dl className="space-y-3 text-sm">{[['Subtotal', quote.data.subtotal], ['Pajak 11%', quote.data.tax], ['Service fee 5%', quote.data.serviceFee], ['Voucher', -quote.data.voucherDiscount], ['Poin', -quote.data.pointsDiscount], ['Total', quote.data.total]].map(([label, value]) => <div key={label} className="flex justify-between gap-3"><dt>{label}</dt><dd className="font-mono">{rupiah(Number(value))}</dd></div>)}</dl>}
          <div><label htmlFor="payment-method" className="mb-2 block text-sm">Metode pembayaran</label><select id="payment-method" value={method} onChange={(event) => setMethod(event.target.value as ApiPaymentMethod)} className="w-full rounded-xl border border-border-subtle bg-surface-secondary p-3 text-sm"><option value="QRIS">QRIS / e-wallet</option><option value="DEBIT">Virtual account</option><option value="CREDIT_CARD">Kartu kredit</option></select></div>
          <div><label htmlFor="split-bill" className="block text-sm">Patungan: {checkout.splitBillCount} orang</label><input id="split-bill" className="my-3 w-full" type="range" min={1} max={10} value={checkout.splitBillCount} onChange={(event) => checkout.setSplitBillCount(Number(event.target.value))} /><p className="text-xs text-text-muted">{quote.data ? `${rupiah(Math.ceil(quote.data.total / checkout.splitBillCount))} per orang. ` : ''}Pembayaran dilakukan satu kali untuk seluruh pesanan.</p></div>
          <Button className="w-full" disabled={!ready || !quote.data || quote.isFetching || quote.isError || purchase.isPending} onClick={() => purchase.mutate()}><CreditCard className="h-4 w-4" />{purchase.isPending ? 'Memproses...' : 'Lanjut ke pembayaran'}</Button>{purchase.isError && <DataState title="Pembayaran belum dimulai" detail={getApiErrorMessage(purchase.error)} />}{pendingOrder && <Link href={`/order/track/${encodeURIComponent(pendingOrder)}`} className="block break-words text-sm text-accent-amber underline">Pesanan tersimpan. Buka status dan lanjutkan pembayaran.</Link>}<p className="text-xs text-text-muted">QRIS dan batas waktu pembayaran ditampilkan pada halaman Midtrans.</p>
        </aside>
      </fieldset>
    </>}
  </main>;
}
