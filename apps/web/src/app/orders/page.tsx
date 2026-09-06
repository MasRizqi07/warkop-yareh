'use client';

import { useState } from 'react';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ClipboardList, Search } from 'lucide-react';
import {
  ArrowRight,
  ChevronRight,
  ClipboardList,
  Search,
} from 'lucide-react';
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
    <main className="mx-auto min-h-screen max-w-3xl space-y-8 bg-canvas-obsidian px-4 pb-32 pt-10 text-on-surface sm:px-6">
      {/* Subtle Glow */}
      <div className="fixed -top-20 right-1/3 w-96 h-96 bg-accent-amber/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-xs text-text-muted">
        <Link href="/" className="hover:text-primary transition-colors">
          Sanctuary Home
        </Link>
        <span className="text-outline-variant">/</span>
        <span className="text-accent-amber font-semibold">Track &amp; Order History</span>
      </nav>

      {/* Order Search Card */}
      <section className="space-y-6 rounded-3xl border border-border-subtle bg-surface-card p-6 sm:p-8 text-center shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-accent-amber shadow-inner">
          <Search className="h-7 w-7" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-headline-xl text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Lacak Status Pesanan Ya&apos;reh
          </h1>
          <p className="mx-auto max-w-md text-xs sm:text-sm text-text-muted font-body-md">
            Masukkan Order ID atau kode struk digital dari struk fisik atau notifikasi WhatsApp.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-3 max-w-md mx-auto">
          <label htmlFor="order-search" className="sr-only">
            ID atau nomor order
          </label>
          <div className="relative">
            <input
              id="order-search"
              type="text"
              value={orderIdInput}
              onChange={(event) => setOrderIdInput(event.target.value)}
              placeholder="Contoh: SBY-8921 atau YR-2026..."
              maxLength={160}
              className="w-full rounded-xl border border-border-subtle bg-surface-secondary px-4 py-3 text-center font-mono text-sm font-bold text-text-primary placeholder:text-text-muted placeholder:font-normal focus:border-accent-amber focus:bg-surface-container focus:outline-none transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-brand-coffee to-secondary-container hover:from-primary-container hover:to-secondary px-4 py-3 text-xs font-bold text-text-primary transition-all shadow-md active:scale-[0.99]"
          >
            Lacak Status &amp; Posisi Barista
          </button>
        </form>
      </section>

      {/* Authentication and Recent Orders List */}
      {!isInitialized ? (
        <div className="rounded-3xl border border-white/5 bg-[#18181c] p-6 text-center text-xs text-neutral-400">Memulihkan sesi...</div>
        <div className="rounded-3xl border border-border-subtle bg-surface-card p-6 text-center text-xs text-text-muted font-mono">
          Memulihkan sesi patron...
        </div>
      ) : !isAuthenticated ? (
        <section className="rounded-3xl border border-white/10 bg-[#18181c] p-6 text-center"><ClipboardList className="mx-auto h-8 w-8 text-neutral-500" /><h2 className="mt-3 font-heading text-base font-bold">Riwayat order bersifat privat</h2><p className="mt-1 text-xs text-neutral-400">Masuk untuk melihat seluruh order milik akunmu.</p><Link href="/login?returnTo=%2Forders" className="mt-4 inline-block rounded-xl bg-white/10 px-4 py-2 text-xs font-bold">Masuk</Link></section>
        <section className="rounded-3xl border border-border-subtle bg-surface-card p-8 text-center space-y-3 shadow-md">
          <ClipboardList className="mx-auto h-10 w-10 text-text-muted" />
          <h2 className="font-headline-md text-base font-bold text-text-primary">Riwayat Pesanan Akun Privat</h2>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Masuk ke Sanctuary Member Pass untuk mengakses riwayat e-receipt, loyalty reward point, dan reorder 1-klik.
          </p>
          <div className="pt-2">
            <Link
              href="/login?returnTo=%2Forders"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-coffee hover:bg-primary-container text-text-primary px-5 py-2.5 text-xs font-bold transition-all shadow-md"
            >
              <span>Masuk Akun Member</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      ) : orders.isPending ? (
        <div className="rounded-3xl border border-white/5 bg-[#18181c] p-6 text-center text-xs text-neutral-400">Memuat riwayat order...</div>
        <div className="rounded-3xl border border-border-subtle bg-surface-card p-8 text-center text-xs text-text-muted font-mono animate-pulse">
          Memuat riwayat transaksi PB1 Anda...
        </div>
      ) : orders.isError ? (
        <section role="alert" className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-center"><p className="text-xs text-rose-200">{getApiErrorMessage(orders.error, 'Riwayat order belum dapat dimuat.')}</p><button type="button" onClick={() => void orders.refetch()} className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold">Coba Lagi</button></section>
      ) : orders.data?.length ? (
        <section className="space-y-3 rounded-3xl border border-white/10 bg-[#18181c] p-6"><h2 className="font-mono text-xs font-bold uppercase text-neutral-400">Pesanan Terakhir</h2>{orders.data.map((order) => <Link key={order.id} href={`/order/track/${encodeURIComponent(order.id)}`} className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#111114] p-3 text-xs transition-colors hover:border-white/20"><span className="min-w-0"><span className="block truncate font-mono font-bold text-white">{order.orderNumber}</span><span className="mt-0.5 block text-[11px] text-neutral-400">{order.items.reduce((count, item) => count + item.quantity, 0)} item · {new Date(order.createdAt).toLocaleDateString('id-ID')} · {order.status}</span></span><span className="ml-3 flex shrink-0 items-center gap-2"><span className="font-mono font-bold text-[#f59e0b]">Rp {order.total.toLocaleString('id-ID')}</span><ChevronRight className="h-4 w-4 text-neutral-500" /></span></Link>)}</section>
        <section role="alert" className="rounded-3xl border border-error-container bg-error-container/20 p-6 text-center space-y-3">
          <p className="text-xs text-on-error font-medium">
            {getApiErrorMessage(orders.error, 'Riwayat order belum dapat dimuat saat ini.')}
          </p>
          <button
            type="button"
            onClick={() => void orders.refetch()}
            className="rounded-xl bg-surface-secondary hover:bg-surface-container px-4 py-2 text-xs font-bold text-text-primary transition-colors border border-border-subtle"
          >
            Coba Muat Ulang
          </button>
        </section>
      ) : orders.data && orders.data.length > 0 ? (
        <section className="space-y-4 rounded-3xl border border-border-subtle bg-surface-card p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-accent-amber">
              Pesanan Terakhir Anda ({orders.data.length})
            </h2>
            <Link
              href="/account"
              className="text-xs text-primary hover:text-accent-amber transition-colors flex items-center gap-1 font-semibold"
            >
              <span>Semua Arsip</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {orders.data.map((order) => (
              <Link
                key={order.id}
                href={`/order/track/${encodeURIComponent(order.id)}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-border-subtle bg-surface-secondary p-4 text-xs transition-all hover:border-accent-amber/40 hover:bg-surface-container group shadow-sm gap-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-text-primary text-sm group-hover:text-primary transition-colors">
                      {order.orderNumber}
                    </span>
                    <span className="text-border-subtle">•</span>
                    <span className="font-mono text-[10px] text-accent-amber bg-accent-amber/15 px-2 py-0.5 rounded-full font-semibold">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted">
                    {order.items.reduce((count, item) => count + item.quantity, 0)} items ·{' '}
                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    WIB
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-border-subtle">
                  <span className="font-mono font-bold text-accent-amber text-sm sm:text-base">
                    Rp {order.total.toLocaleString('id-ID')}
                  </span>
                  <div className="flex items-center gap-1 text-primary group-hover:translate-x-0.5 transition-transform">
                    <span className="text-[11px] font-semibold">Detail</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-white/10 bg-[#18181c] p-8 text-center"><ClipboardList className="mx-auto h-9 w-9 text-neutral-500" /><h2 className="mt-3 font-heading text-base font-bold">Belum ada order</h2><Link href="/menu" className="mt-4 inline-block rounded-xl bg-[#9c6b3a] px-4 py-2 text-xs font-bold">Pilih Menu</Link></section>
        <section className="rounded-3xl border border-border-subtle bg-surface-card p-10 text-center space-y-3 shadow-xl">
          <ClipboardList className="mx-auto h-12 w-12 text-text-muted" />
          <h2 className="font-headline-md text-base font-bold text-text-primary">Belum Ada Riwayat Order</h2>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Mulailah menjelajahi menu signature roastery kami untuk pesanan dine-in atau takeaway pertama Anda.
          </p>
          <div className="pt-2">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-coffee to-secondary-container hover:from-primary-container hover:to-secondary text-text-primary px-6 py-2.5 text-xs font-bold transition-all shadow-md"
            >
              <span>Jelajahi Menu Ya&apos;reh</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
