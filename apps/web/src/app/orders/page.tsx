'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ClipboardList, Search } from 'lucide-react';
import { useMyOrders } from '@/features/orders/orders.hooks';
import { useAuthStore } from '@/stores/auth.store';
import { getApiErrorMessage } from '@/lib/api-error';

export default function OrdersIndexPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const orders = useMyOrders(isInitialized && isAuthenticated);
  const [orderIdInput, setOrderIdInput] = useState('');

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const orderId = orderIdInput.trim();
    if (orderId) router.push(`/order/track/${encodeURIComponent(orderId)}`);
  };

  return (
    <main className="mx-auto min-h-screen max-w-2xl space-y-6 bg-[#0a0a0c] px-4 pb-32 pt-12 text-white sm:px-6">
      <section className="space-y-6 rounded-3xl border border-white/10 bg-[#141418] p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#9c6b3a]/40 bg-[#9c6b3a]/20 text-[#f59e0b]"><Search className="h-8 w-8" /></div>
        <div><h1 className="font-heading text-2xl font-extrabold">Lacak Pesanan Warkop Ya&apos;reh</h1><p className="mt-1 text-xs text-neutral-400">Masukkan ID atau nomor order persis seperti yang tertera pada bukti transaksi.</p></div>
        <form onSubmit={handleSearch} className="space-y-3"><label htmlFor="order-search" className="sr-only">ID atau nomor order</label><input id="order-search" type="text" value={orderIdInput} onChange={(event) => setOrderIdInput(event.target.value)} placeholder="Contoh: WY-20260906-..." maxLength={160} className="w-full rounded-xl border border-white/10 bg-[#18181c] px-4 py-3 text-center font-mono text-sm font-bold text-white placeholder-neutral-500 focus:border-[#f59e0b] focus:outline-none" required /><button type="submit" className="w-full rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] px-4 py-3 text-xs font-bold text-white">Lacak Status</button></form>
      </section>

      {!isInitialized ? (
        <div className="rounded-3xl border border-white/5 bg-[#18181c] p-6 text-center text-xs text-neutral-400">Memulihkan sesi...</div>
      ) : !isAuthenticated ? (
        <section className="rounded-3xl border border-white/10 bg-[#18181c] p-6 text-center"><ClipboardList className="mx-auto h-8 w-8 text-neutral-500" /><h2 className="mt-3 font-heading text-base font-bold">Riwayat order bersifat privat</h2><p className="mt-1 text-xs text-neutral-400">Masuk untuk melihat seluruh order milik akunmu.</p><Link href="/login?returnTo=%2Forders" className="mt-4 inline-block rounded-xl bg-white/10 px-4 py-2 text-xs font-bold">Masuk</Link></section>
      ) : orders.isPending ? (
        <div className="rounded-3xl border border-white/5 bg-[#18181c] p-6 text-center text-xs text-neutral-400">Memuat riwayat order...</div>
      ) : orders.isError ? (
        <section role="alert" className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-center"><p className="text-xs text-rose-200">{getApiErrorMessage(orders.error, 'Riwayat order belum dapat dimuat.')}</p><button type="button" onClick={() => void orders.refetch()} className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold">Coba Lagi</button></section>
      ) : orders.data?.length ? (
        <section className="space-y-3 rounded-3xl border border-white/10 bg-[#18181c] p-6"><h2 className="font-mono text-xs font-bold uppercase text-neutral-400">Pesanan Terakhir</h2>{orders.data.map((order) => <Link key={order.id} href={`/order/track/${encodeURIComponent(order.id)}`} className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#111114] p-3 text-xs transition-colors hover:border-white/20"><span className="min-w-0"><span className="block truncate font-mono font-bold text-white">{order.orderNumber}</span><span className="mt-0.5 block text-[11px] text-neutral-400">{order.items.reduce((count, item) => count + item.quantity, 0)} item · {new Date(order.createdAt).toLocaleDateString('id-ID')} · {order.status}</span></span><span className="ml-3 flex shrink-0 items-center gap-2"><span className="font-mono font-bold text-[#f59e0b]">Rp {order.total.toLocaleString('id-ID')}</span><ChevronRight className="h-4 w-4 text-neutral-500" /></span></Link>)}</section>
      ) : (
        <section className="rounded-3xl border border-white/10 bg-[#18181c] p-8 text-center"><ClipboardList className="mx-auto h-9 w-9 text-neutral-500" /><h2 className="mt-3 font-heading text-base font-bold">Belum ada order</h2><Link href="/menu" className="mt-4 inline-block rounded-xl bg-[#9c6b3a] px-4 py-2 text-xs font-bold">Pilih Menu</Link></section>
      )}
    </main>
  );
}
