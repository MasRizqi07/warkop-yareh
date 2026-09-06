'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Building2, CheckCircle2, CreditCard, Lock, QrCode, ShieldCheck, ShoppingBag } from 'lucide-react';
import type { ApiOrderType, ApiPaymentMethod } from '@/features/api/contracts';
import { useActiveBranch } from '@/features/catalog/catalog.hooks';
import { createOrder, initializePayment } from '@/features/orders/orders.api';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore, useCheckoutStore } from '@/stores';

const PAYMENT_OPTIONS: Array<{ id: ApiPaymentMethod; title: string; description: string; icon: typeof QrCode }> = [
  { id: 'QRIS', title: 'QRIS', description: 'GoPay, OVO, ShopeePay, dan mobile banking.', icon: QrCode },
  { id: 'E_WALLET', title: 'E-Wallet', description: 'Pilih dompet digital yang tersedia di Midtrans.', icon: Building2 },
  { id: 'DEBIT', title: 'Virtual Account / Debit', description: 'Pilih bank dan instruksi transfer di halaman pembayaran.', icon: Building2 },
  { id: 'CREDIT_CARD', title: 'Kartu Kredit / Debit Online', description: 'Diproses melalui halaman aman Midtrans.', icon: CreditCard },
];

function toApiOrderType(type: ReturnType<typeof useCheckoutStore.getState>['fulfillmentType']): ApiOrderType {
  if (type === 'dine-in') return 'DINE_IN';
  if (type === 'drive-thru') return 'DRIVE_THRU';
  if (type === 'delivery') return 'DELIVERY';
  return 'TAKE_AWAY';
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const estimatedSubtotal = useCartStore((state) => state.total());
  const fulfillmentType = useCheckoutStore((state) => state.fulfillmentType);
  const setFulfillmentType = useCheckoutStore((state) => state.setFulfillmentType);
  const tableId = useCheckoutStore((state) => state.tableId);
  const tableLabel = useCheckoutStore((state) => state.tableLabel);
  const deliveryAddress = useCheckoutStore((state) => state.deliveryAddress);
  const setDeliveryAddress = useCheckoutStore((state) => state.setDeliveryAddress);
  const { activeBranch, isPending: branchPending } = useActiveBranch();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [paymentMethod, setPaymentMethod] = useState<ApiPaymentMethod>('QRIS');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const idempotency = useRef<{ fingerprint: string; key: string } | null>(null);

  const estimatedTotal = estimatedSubtotal + Math.round(estimatedSubtotal * 0.11);
  const requestFingerprint = useMemo(
    () => JSON.stringify({ branchId: activeBranch?.id, items: items.map((item) => ({ id: item.product.id, quantity: item.quantity, customizations: item.customizations, notes: item.notes })), fulfillmentType, tableId, deliveryAddress, notes }),
    [activeBranch?.id, deliveryAddress, fulfillmentType, items, notes, tableId],
  );

  const handleProcessOrder = async () => {
    if (!activeBranch || !isAuthenticated || !user || items.length === 0) return;
    if (fulfillmentType === 'delivery' && deliveryAddress.trim().length < 10) {
      setError('Alamat pengantaran harus diisi lengkap, minimal 10 karakter.');
      return;
    }
    setError('');
    setIsProcessing(true);

    try {
      if (!idempotency.current || idempotency.current.fingerprint !== requestFingerprint) {
        idempotency.current = { fingerprint: requestFingerprint, key: crypto.randomUUID() };
      }
      const combinedNotes = [
        notes.trim(),
        fulfillmentType === 'delivery' ? `Alamat pengantaran: ${deliveryAddress.trim()}` : '',
        fulfillmentType === 'dine-in' && tableLabel ? `Label meja: ${tableLabel}` : '',
      ].filter(Boolean).join('\n');
      const order = await createOrder(
        {
          branchId: activeBranch.id,
          type: toApiOrderType(fulfillmentType),
          ...(fulfillmentType === 'dine-in' && tableId ? { tableId } : {}),
          ...(combinedNotes ? { notes: combinedNotes } : {}),
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            ...(item.customizations ? { customizations: item.customizations } : {}),
            ...(item.notes ? { notes: item.notes } : {}),
          })),
        },
        idempotency.current.key,
      );
      setCreatedOrderId(order.id);
      const payment = await initializePayment(order.id, paymentMethod);
      clearCart();

      if (payment.redirectUrl && !payment.token.startsWith('mock-snap-token-')) {
        window.location.assign(payment.redirectUrl);
        return;
      }
      router.push(`/order/track/${encodeURIComponent(order.id)}?payment=pending`);
    } catch (caught) {
      setError(getApiErrorMessage(caught, 'Pesanan belum berhasil diproses. Silakan coba lagi.'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isInitialized || branchPending) {
    return <main className="flex min-h-[70vh] items-center justify-center bg-[#0a0a0c] text-sm text-neutral-400"><span className="h-5 w-5 animate-spin rounded-full border-2 border-[#f59e0b] border-t-transparent" /><span className="ml-3">Menyiapkan checkout aman...</span></main>;
  }

  if (!isAuthenticated || !user) {
    return <main className="mx-auto flex min-h-[75vh] max-w-lg items-center px-4 text-center text-white"><section className="w-full rounded-3xl border border-white/10 bg-[#18181c] p-8"><ShieldCheck className="mx-auto h-12 w-12 text-[#f59e0b]" /><h1 className="mt-4 font-heading text-2xl font-bold">Masuk untuk checkout</h1><p className="mt-2 text-sm text-neutral-400">Akun diperlukan agar order, pembayaran, dan status realtime hanya dapat dilihat oleh pemiliknya.</p><Link href="/login?returnTo=%2Fcheckout" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#9c6b3a] px-6 py-3 text-sm font-bold">Masuk ke Akun <ArrowRight className="h-4 w-4" /></Link></section></main>;
  }

  if (!activeBranch) {
    return <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 text-center text-white"><section role="alert" className="w-full rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8"><h1 className="font-heading text-xl font-bold">Cabang aktif tidak tersedia</h1><p className="mt-2 text-sm text-neutral-300">Pilih cabang yang tersedia sebelum melanjutkan checkout.</p><Link href="/menu" className="mt-5 inline-block rounded-xl bg-[#9c6b3a] px-5 py-2.5 text-sm font-bold">Kembali ke Menu</Link></section></main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl bg-[#0a0a0c] px-4 pb-32 pt-8 text-white sm:px-6 sm:pt-10 lg:px-8">
      <div className="mb-8 border-b border-white/5 pb-6"><div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#f59e0b]"><ShieldCheck className="h-4 w-4 text-emerald-400" />Checkout terautentikasi • harga divalidasi server</div><h1 className="font-heading text-3xl font-extrabold sm:text-4xl">Pembayaran Digital</h1><p className="mt-1 text-sm text-neutral-400">Cabang: <span className="font-semibold text-white">{activeBranch.name}</span> · Pemesan: <span className="font-semibold text-white">{user.name}</span></p></div>

      {items.length === 0 ? (
        <section className="mx-auto max-w-md rounded-3xl border border-white/5 bg-[#141418] p-8 py-20 text-center"><ShoppingBag className="mx-auto h-12 w-12 text-neutral-500" /><h2 className="mt-4 font-heading text-lg font-bold">Keranjang masih kosong</h2><p className="mt-2 text-xs text-neutral-400">Pilih menu dari katalog aktif sebelum checkout.</p><Link href="/menu" className="mt-6 inline-block rounded-xl bg-[#9c6b3a] px-5 py-2.5 text-xs font-bold">Buka Katalog</Link></section>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <section className="space-y-4 rounded-3xl border border-white/10 bg-[#18181c] p-6"><h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#f59e0b]">01. Tipe Pemesanan</h2><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{(['dine-in', 'pickup', 'drive-thru', 'delivery'] as const).map((type) => <button type="button" key={type} aria-pressed={fulfillmentType === type} onClick={() => setFulfillmentType(type)} className={`rounded-2xl border p-3 text-left text-xs font-bold capitalize ${fulfillmentType === type ? 'border-[#9c6b3a] bg-[#9c6b3a]/20' : 'border-white/5 bg-[#111114] text-neutral-400'}`}>{type.replace('-', ' ')}</button>)}</div>{fulfillmentType === 'dine-in' && <p className="rounded-xl bg-white/5 p-3 text-xs text-neutral-400">{tableLabel ? `Meja dari QR: ${tableLabel}` : 'Meja akan ditentukan staf. Scan QR meja untuk menautkan pesanan secara otomatis.'}</p>}{fulfillmentType === 'delivery' && <div><label htmlFor="delivery-address" className="mb-1.5 block text-xs font-medium text-neutral-300">Alamat pengantaran</label><textarea id="delivery-address" required minLength={10} maxLength={500} value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} rows={3} className="w-full rounded-xl border border-white/10 bg-[#111114] p-3 text-xs text-white focus:border-[#f59e0b] focus:outline-none" placeholder="Nama jalan, nomor, gedung, dan patokan..." /></div>}</section>

            <section className="space-y-4 rounded-3xl border border-white/10 bg-[#18181c] p-6"><h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#f59e0b]">02. Catatan Pesanan</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><span className="mb-1.5 block text-xs font-medium text-neutral-300">Nama</span><div className="rounded-xl border border-white/5 bg-[#111114] px-4 py-2.5 text-xs text-neutral-300">{user.name}</div></div><div><span className="mb-1.5 block text-xs font-medium text-neutral-300">Kontak</span><div className="rounded-xl border border-white/5 bg-[#111114] px-4 py-2.5 text-xs text-neutral-300">{user.phone || user.email}</div></div></div><div><label htmlFor="order-notes" className="mb-1.5 block text-xs font-medium text-neutral-300">Catatan umum (opsional)</label><input id="order-notes" type="text" maxLength={500} value={notes} onChange={(event) => setNotes(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#111114] px-4 py-2.5 text-xs text-white focus:border-[#f59e0b] focus:outline-none" placeholder="Contoh: pesanan dibungkus terpisah" /></div></section>

            <section className="space-y-4 rounded-3xl border border-white/10 bg-[#18181c] p-6"><h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#f59e0b]">03. Metode Pembayaran</h2><div className="space-y-2.5">{PAYMENT_OPTIONS.map((option) => { const Icon = option.icon; const selected = paymentMethod === option.id; return <button key={option.id} type="button" aria-pressed={selected} onClick={() => setPaymentMethod(option.id)} className={`flex w-full items-start justify-between gap-3 rounded-2xl border p-4 text-left ${selected ? 'border-[#f59e0b] bg-[#9c6b3a]/15' : 'border-white/5 bg-[#111114]'}`}><div className="flex items-start gap-3"><span className={`rounded-xl p-2.5 ${selected ? 'bg-[#f59e0b] text-black' : 'bg-white/5 text-neutral-400'}`}><Icon className="h-5 w-5" /></span><span><span className="block text-sm font-bold text-white">{option.title}</span><span className="mt-0.5 block text-[11px] text-neutral-400">{option.description}</span></span></div>{selected && <CheckCircle2 className="mt-1 h-5 w-5 text-[#f59e0b]" />}</button>; })}</div></section>
          </div>

          <aside className="lg:col-span-5"><div className="sticky top-24 space-y-4 rounded-3xl border border-white/10 bg-[#18181c] p-6"><h2 className="flex items-center justify-between font-heading text-base font-bold"><span>Ringkasan Pesanan</span><span className="font-mono text-xs text-neutral-400">{items.reduce((count, item) => count + item.quantity, 0)} item</span></h2><div className="max-h-64 space-y-3 overflow-y-auto pr-1">{items.map((item) => <div key={`${item.product.id}-${JSON.stringify(item.customizations)}-${item.notes ?? ''}`} className="flex items-center justify-between gap-3 border-b border-white/5 pb-2.5 text-xs"><div className="min-w-0"><span className="block truncate font-medium text-white">{item.quantity}× {item.product.name}</span>{item.customizations && <span className="mt-0.5 block truncate text-[10px] text-neutral-400">{Object.values(item.customizations).join(' • ')}</span>}</div><span className="whitespace-nowrap font-mono font-semibold">Rp {(item.unitPrice * item.quantity).toLocaleString('id-ID')}</span></div>)}</div><div className="space-y-2 border-t border-white/5 pt-3 text-xs text-neutral-400"><div className="flex justify-between"><span>Estimasi subtotal</span><span className="font-mono text-white">Rp {estimatedSubtotal.toLocaleString('id-ID')}</span></div><div className="flex justify-between"><span>Estimasi pajak 11%</span><span className="font-mono text-white">Rp {Math.round(estimatedSubtotal * 0.11).toLocaleString('id-ID')}</span></div><div className="flex items-baseline justify-between border-t border-white/10 pt-3"><span className="font-heading text-base font-bold text-white">Estimasi total</span><span className="font-mono text-2xl font-extrabold text-[#f59e0b]">Rp {estimatedTotal.toLocaleString('id-ID')}</span></div></div>
            {error && <div role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">{error}{createdOrderId && <Link href={`/order/track/${createdOrderId}`} className="mt-2 block font-bold underline">Buka order yang sudah dibuat</Link>}</div>}
            <button type="button" onClick={() => void handleProcessOrder()} disabled={isProcessing} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] px-6 py-4 font-heading text-sm font-bold text-white disabled:cursor-wait disabled:opacity-50">{isProcessing ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Memproses...</> : <><Lock className="h-4 w-4" />Buat Pesanan &amp; Bayar</>}</button><p className="text-center text-[11px] leading-relaxed text-neutral-500">Harga final berasal dari database cabang. Jika konfigurasi gateway lokal belum tersedia, order tetap tercatat sebagai belum dibayar dan dapat dilacak.</p></div></aside>
        </div>
      )}
    </main>
  );
}
