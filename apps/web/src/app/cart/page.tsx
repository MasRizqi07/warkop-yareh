'use client';

import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Bike,
  Car,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  Trash2,
  Users,
  Utensils,
} from 'lucide-react';
import { useActiveBranch } from '@/features/catalog/catalog.hooks';
import { type FulfillmentType, useCartStore, useCheckoutStore } from '@/stores';
import { useAuthStore } from '@/stores/auth.store';
import {
  quoteGuestOrder,
  quoteOrder,
  type CreateOrderRequest,
} from '@/features/orders/orders.api';
import { DataState, LoadingState } from '@/components/data-state';
import { getApiErrorMessage } from '@/lib/api-error';

const ORDER_TYPES: Record<FulfillmentType, CreateOrderRequest['type']> = {
  'dine-in': 'DINE_IN',
  pickup: 'TAKE_AWAY',
  'drive-thru': 'DRIVE_THRU',
  delivery: 'DELIVERY',
};

const FULFILLMENT_OPTIONS: Array<{
  type: FulfillmentType;
  label: string;
  icon: typeof Utensils;
}> = [
  { type: 'dine-in', label: 'Dine-In', icon: Utensils },
  { type: 'pickup', label: 'Self Pickup', icon: Store },
  { type: 'drive-thru', label: 'Drive-Thru', icon: Car },
  { type: 'delivery', label: 'Delivery', icon: Bike },
];

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.isInitialized);
  const authenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    setCartOpen(false);
  }, [setCartOpen]);
  const fulfillmentType = useCheckoutStore((state) => state.fulfillmentType);
  const setFulfillmentType = useCheckoutStore(
    (state) => state.setFulfillmentType
  );
  const splitBillCount = useCheckoutStore((state) => state.splitBillCount);
  const setSplitBillCount = useCheckoutStore(
    (state) => state.setSplitBillCount
  );
  const tableLabel = useCheckoutStore((state) => state.tableLabel);
  const tableId = useCheckoutStore((state) => state.tableId);
  const branches = useActiveBranch();
  const { activeBranch } = branches;
  const request = useMemo<CreateOrderRequest>(
    () => ({
      branchId: activeBranch?.id ?? '',
      type: ORDER_TYPES[fulfillmentType],
      ...(fulfillmentType === 'dine-in' && tableId ? { tableId } : {}),
      notes: '',
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        customizations: item.customizations,
        notes: item.notes,
      })),
    }),
    [activeBranch?.id, fulfillmentType, tableId, items]
  );
  const quote = useQuery({
    queryKey: ['checkout-quote', user?.id, request],
    queryFn: () =>
      authenticated ? quoteOrder(request) : quoteGuestOrder(request),
    enabled: initialized && Boolean(activeBranch) && items.length > 0,
    retry: false,
    staleTime: 0,
  });
  const confirmedQuote =
    !branches.isError && !quote.isFetching && !quote.isError
      ? quote.data
      : undefined;
  const perPersonShare = confirmedQuote
    ? Math.ceil(confirmedQuote.total / splitBillCount)
    : undefined;

  return (
    <main className="mx-auto min-h-screen max-w-7xl bg-canvas-obsidian px-4 pb-32 pt-8 text-text-primary transition-colors sm:px-6 sm:pt-10 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-2 font-mono text-xs text-text-muted"
      >
        <Link href="/" className="hover:text-text-primary transition-colors">
          Beranda
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href="/menu"
          className="hover:text-text-primary transition-colors"
        >
          Menu
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-accent-amber">Keranjang</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border-subtle pb-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">
            Keranjang Belanja
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {activeBranch
              ? `Pesanan untuk cabang ${activeBranch.name}`
              : 'Menyiapkan cabang aktif...'}
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="flex items-center gap-1.5 self-start text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Kosongkan keranjang
          </button>
        )}
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <section className="mx-auto max-w-xl rounded-3xl border border-border-subtle bg-surface-card p-8 py-20 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-border-subtle bg-surface-secondary text-text-muted">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <h2 className="font-heading text-xl font-bold text-text-primary">
            Belum ada item di keranjang
          </h2>
          <p className="mx-auto mb-8 mt-2 max-w-sm text-sm text-text-muted">
            Pilih sajian specialty coffee atau artisan snacks dari katalog untuk
            memulai pesanan.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-container via-secondary-container to-accent-amber px-6 py-3.5 text-sm font-bold text-canvas-obsidian shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <span>Buka Katalog Menu</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Cart Items Section */}
          <section
            aria-labelledby="cart-items-title"
            className="space-y-4 lg:col-span-7"
          >
            <div className="flex items-center justify-between px-1">
              <h2
                id="cart-items-title"
                className="font-mono text-xs font-bold uppercase tracking-wider text-text-muted"
              >
                Daftar Menu (
                {items.reduce((count, item) => count + item.quantity, 0)} Item)
              </h2>
              <Link
                href="/menu"
                className="font-mono text-xs font-semibold text-accent-amber hover:underline"
              >
                + Tambah Item Lain
              </Link>
            </div>

            {items.map((item) => (
              <article
                key={`${item.product.id}-${JSON.stringify(item.customizations)}-${item.notes ?? ''}`}
                className="flex flex-col justify-between gap-4 rounded-3xl border border-border-subtle bg-surface-card p-4 hover:border-border-strong transition-all shadow-sm sm:flex-row sm:items-center sm:p-5"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border-subtle bg-surface-container">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-heading text-base font-bold text-text-primary">
                      {item.product.name}
                    </h3>
                    {item.customizations && (
                      <p className="mt-1 line-clamp-2 font-mono text-[11px] text-cream-beige">
                        {Object.values(item.customizations).join(' • ')}
                      </p>
                    )}
                    {item.notes && (
                      <p className="mt-1 line-clamp-1 text-[11px] italic text-text-muted">
                        &ldquo;{item.notes}&rdquo;
                      </p>
                    )}
                    <p className="mt-2 font-mono text-xs text-text-muted">
                      Rp {item.unitPrice.toLocaleString('id-ID')} / item
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                  <span className="font-mono text-base font-extrabold text-accent-amber">
                    Rp{' '}
                    {(item.unitPrice * item.quantity).toLocaleString('id-ID')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-secondary p-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity - 1,
                            item.customizations,
                            item.notes
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-container transition-colors cursor-pointer"
                        aria-label={`Kurangi ${item.product.name}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center font-mono text-xs font-bold text-text-primary">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity + 1,
                            item.customizations,
                            item.notes
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-container transition-colors cursor-pointer"
                        aria-label={`Tambah ${item.product.name}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        removeItem(
                          item.product.id,
                          item.customizations,
                          item.notes
                        )
                      }
                      className="rounded-xl p-2 text-text-muted hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer"
                      aria-label={`Hapus ${item.product.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {/* Fulfillment Selector */}
            <div className="mt-6 space-y-3 rounded-3xl border border-border-subtle bg-surface-card p-5 sm:p-6 shadow-sm">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-text-muted">
                Tipe Pemesanan
              </h2>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {FULFILLMENT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = fulfillmentType === option.type;
                  return (
                    <button
                      key={option.type}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setFulfillmentType(option.type)}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3.5 text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-accent-amber bg-accent-amber/15 text-accent-amber shadow-sm'
                          : 'border-border-subtle bg-surface-secondary text-text-muted hover:border-border-strong hover:text-text-primary'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${isSelected ? 'text-accent-amber' : 'text-text-muted'}`}
                      />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
              {fulfillmentType === 'dine-in' && (
                <p className="rounded-xl border border-border-subtle bg-surface-secondary p-3 text-xs text-text-muted">
                  {tableLabel
                    ? `Meja terpilih dari QR: ${tableLabel}`
                    : 'Tanpa scan QR meja, staf barista akan mengantarkan pesanan ke mejamu saat konfirmasi.'}
                </p>
              )}
            </div>
          </section>

          {/* Sidebar Section */}
          <aside className="space-y-6 lg:col-span-5">
            {/* Split-Bill Calculator */}
            <div className="space-y-4 rounded-3xl border border-border-subtle bg-surface-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-accent-amber/20 bg-accent-amber/10 p-2 text-accent-amber">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-heading text-sm font-bold text-text-primary">
                      Kalkulator Split-Bill
                    </h2>
                    <p className="font-mono text-[11px] text-text-muted">
                      Estimasi pembagian per orang
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-accent-amber/30 bg-accent-amber/20 px-2.5 py-1 font-mono text-xs font-bold text-accent-amber">
                  {splitBillCount} orang
                </span>
              </div>

              <input
                aria-label="Jumlah orang untuk split bill"
                type="range"
                min={1}
                max={10}
                value={splitBillCount}
                onChange={(event) =>
                  setSplitBillCount(Number(event.target.value))
                }
                className="h-2 w-full cursor-pointer rounded-lg bg-surface-container accent-accent-amber"
              />

              <div className="flex items-center justify-between rounded-2xl border border-accent-amber/20 bg-surface-secondary p-3.5 text-xs">
                <span className="text-text-muted">Estimasi per orang:</span>
                <span className="font-mono text-sm font-bold text-accent-amber">
                  {perPersonShare === undefined
                    ? 'Belum tersedia'
                    : `Rp ${perPersonShare.toLocaleString('id-ID')}`}
                </span>
              </div>
            </div>

            {/* Estimated Order Summary */}
            <div className="sticky top-24 space-y-4 rounded-3xl border border-border-subtle bg-surface-card p-6 shadow-lg">
              <h2 className="font-heading text-base font-bold text-text-primary">
                Ringkasan Estimasi
              </h2>
              {!initialized ? (
                <LoadingState label="Memulihkan sesi..." />
              ) : branches.isError ? (
                <DataState
                  title="Cabang belum dapat dimuat"
                  retry={() => void branches.refetch()}
                />
              ) : !activeBranch || quote.isPending || quote.isFetching ? (
                <LoadingState label="Memperbarui harga..." />
              ) : quote.isError ? (
                <DataState
                  title="Harga belum dapat dikonfirmasi"
                  detail={getApiErrorMessage(quote.error)}
                  retry={() => void quote.refetch()}
                />
              ) : (
                confirmedQuote && (
                  <div className="space-y-2.5 border-t border-border-subtle pt-4 text-xs text-text-muted">
                    <div className="flex justify-between">
                      <span>Subtotal Pesanan</span>
                      <span className="font-mono font-bold text-text-primary">
                        Rp {confirmedQuote.subtotal.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pajak Restoran (11%)</span>
                      <span className="font-mono font-bold text-text-primary">
                        Rp {confirmedQuote.tax.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Fee (5%)</span>
                      <span className="font-mono font-bold text-text-primary">
                        Rp {confirmedQuote.serviceFee.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-border-subtle pt-3.5">
                      <span className="font-heading text-base font-bold text-text-primary">
                        Estimasi Total
                      </span>
                      <span className="font-mono text-2xl font-extrabold text-accent-amber">
                        Rp {confirmedQuote.total.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                )
              )}
              <p className="text-[11px] leading-relaxed text-text-muted">
                Estimasi berasal dari server.{' '}
                {authenticated
                  ? 'Voucher dan poin dapat diterapkan pada langkah checkout.'
                  : 'Masuk saat checkout untuk menerapkan voucher dan poin.'}
              </p>
              <Link
                href="/checkout"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-container via-secondary-container to-accent-amber px-6 py-4 font-heading text-sm font-bold text-canvas-obsidian shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
