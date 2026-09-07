'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Bike,
  Car,
  Check,
  ChevronRight,
  Coffee,
  CreditCard,
  Minus,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
  Users,
  Utensils,
  Wallet,
  Zap,
} from 'lucide-react';
import { useActiveBranch } from '@/features/catalog/catalog.hooks';
import { type FulfillmentType, useCartStore, useCheckoutStore } from '@/stores';
import { soundEffects } from '@/lib/audioAlerts';

const rupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore((state) => state.total());

  const fulfillmentType = useCheckoutStore((state) => state.fulfillmentType);
  const setFulfillmentType = useCheckoutStore((state) => state.setFulfillmentType);
  const splitBillCount = useCheckoutStore((state) => state.splitBillCount);
  const setSplitBillCount = useCheckoutStore((state) => state.setSplitBillCount);
  const { activeBranch } = useActiveBranch();

  const [usePoints, setUsePoints] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'qris' | 'bca-va' | 'mandiri-va' | 'card'>('qris');

  useEffect(() => {
    setCartOpen(false);
  }, [setCartOpen]);

  const tax = Math.round(subtotal * 0.1); // PB1 10%
  const platformFee = items.length > 0 ? 2000 : 0;
  const pointsDiscount = usePoints ? Math.min(subtotal, 15000) : 0;
  const total = Math.max(0, subtotal + tax + platformFee - pointsDiscount);
  const perPerson = Math.ceil(total / Math.max(1, splitBillCount));

  const handleProceed = () => {
    soundEffects.playSuccessChime();
    router.push('/checkout');
  };

  return (
    <main className="w-full min-h-screen bg-canvas-obsidian text-on-surface antialiased pb-32 pt-8">
      {/* Subtle Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-mesh opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Contextual Navigation & Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-card border border-border-subtle flex items-center justify-center text-accent-amber shadow-md">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                <Link href="/menu" className="hover:text-text-primary transition-colors">
                  Menu
                </Link>
                <span>/</span>
                <span className="text-accent-amber font-semibold">Cart Sanctuary Review</span>
                <span>/</span>
                <span className="text-text-muted/60">Midtrans Checkout</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mt-0.5">
                Order Sanctuary Review
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-surface-card px-3.5 py-1.5 rounded-full border border-border-subtle shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-xs text-text-primary uppercase tracking-wider font-bold">
                Kitchen Live
              </span>
              <span className="font-mono text-xs text-text-muted">· Avg Prep ~12m</span>
            </div>
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors p-2 rounded-xl bg-surface-card border border-border-subtle hover:border-rose-400/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kosongkan</span>
              </button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="max-w-xl mx-auto py-20 text-center rounded-3xl border border-border-subtle bg-surface-card p-8 shadow-2xl space-y-6">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-surface-secondary border border-border-subtle flex items-center justify-center text-text-muted">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-bold text-text-primary">
                Keranjang Seduhan Kosong
              </h2>
              <p className="text-sm text-text-muted max-w-md mx-auto leading-relaxed">
                Anda belum memilih racikan kopi atau menu artisanal. Jelajahi katalog kopi specialty kami untuk memulai ritual Anda.
              </p>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-coffee to-secondary-container text-text-primary font-heading font-bold text-sm shadow-md hover:scale-105 transition-all"
            >
              <Coffee className="w-4 h-4" />
              <span>Buka Menu Sanctuary</span>
            </Link>
          </div>
        ) : (
          /* Main Desktop 2-Column Framework (62% / 38%) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Fulfillment, Cart Items, Split Bill (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Fulfillment Channel Selector (4-way Interactive Cards) */}
              <section className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-accent-amber" />
                    <h2 className="font-heading text-base sm:text-lg font-bold text-text-primary">
                      Fulfillment Channel
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-cream-beige bg-surface-secondary px-2.5 py-1 rounded-md border border-border-subtle">
                    {activeBranch?.name ?? 'Darmo Flagship'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Dine In */}
                  <div
                    onClick={() => setFulfillmentType('dine-in')}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      fulfillmentType === 'dine-in'
                        ? 'border-accent-amber bg-gradient-to-br from-surface-card to-surface-container-high ring-1 ring-accent-amber shadow-md'
                        : 'border-border-subtle bg-surface-secondary hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent-amber/15 flex items-center justify-center text-accent-amber">
                          <Utensils className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-text-primary">Dine-In (Active)</div>
                          <div className="font-mono text-[11px] text-accent-amber">Meja #14 · Indoor AC</div>
                        </div>
                      </div>
                      {fulfillmentType === 'dine-in' && (
                        <div className="w-4 h-4 rounded-full bg-accent-amber flex items-center justify-center text-canvas-obsidian">
                          <Check className="w-3 h-3 font-bold" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-mono">
                      ✓ Terverifikasi via QR Meja
                    </p>
                  </div>

                  {/* Self-Pickup */}
                  <div
                    onClick={() => setFulfillmentType('pickup')}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      fulfillmentType === 'pickup'
                        ? 'border-accent-amber bg-gradient-to-br from-surface-card to-surface-container-high ring-1 ring-accent-amber shadow-md'
                        : 'border-border-subtle bg-surface-secondary hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-card flex items-center justify-center text-text-muted">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-text-primary">Self-Pickup</div>
                          <div className="font-mono text-[11px] text-text-muted">Loket Barista</div>
                        </div>
                      </div>
                      {fulfillmentType === 'pickup' && (
                        <div className="w-4 h-4 rounded-full bg-accent-amber flex items-center justify-center text-canvas-obsidian">
                          <Check className="w-3 h-3 font-bold" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted mt-2">Siap ~15 menit di pickup station</p>
                  </div>

                  {/* Drive-Thru */}
                  <div
                    onClick={() => setFulfillmentType('drive-thru')}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      fulfillmentType === 'drive-thru'
                        ? 'border-accent-amber bg-gradient-to-br from-surface-card to-surface-container-high ring-1 ring-accent-amber shadow-md'
                        : 'border-border-subtle bg-surface-secondary hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-card flex items-center justify-center text-text-muted">
                          <Car className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-text-primary">Drive-Thru</div>
                          <div className="font-mono text-[11px] text-text-muted">Lane 2 Quick-Bay</div>
                        </div>
                      </div>
                      {fulfillmentType === 'drive-thru' && (
                        <div className="w-4 h-4 rounded-full bg-accent-amber flex items-center justify-center text-canvas-obsidian">
                          <Check className="w-3 h-3 font-bold" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted mt-2 font-mono">Plat: L 1892 YR</p>
                  </div>

                  {/* Delivery */}
                  <div
                    onClick={() => setFulfillmentType('delivery')}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      fulfillmentType === 'delivery'
                        ? 'border-accent-amber bg-gradient-to-br from-surface-card to-surface-container-high ring-1 ring-accent-amber shadow-md'
                        : 'border-border-subtle bg-surface-secondary hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-card flex items-center justify-center text-text-muted">
                          <Bike className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-text-primary">Priority Delivery</div>
                          <div className="font-mono text-[11px] text-text-muted">Instant Courier</div>
                        </div>
                      </div>
                      {fulfillmentType === 'delivery' && (
                        <div className="w-4 h-4 rounded-full bg-accent-amber flex items-center justify-center text-canvas-obsidian">
                          <Check className="w-3 h-3 font-bold" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted mt-2">Area Surabaya radius 10 km</p>
                  </div>
                </div>
              </section>

              {/* 2. Cart Items List */}
              <section className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <h2 className="font-heading text-base sm:text-lg font-bold text-text-primary">
                    Daftar Pesanan ({items.reduce((s, i) => s + i.quantity, 0)} Item)
                  </h2>
                  <Link href="/menu" className="text-xs text-accent-amber hover:underline font-semibold">
                    + Tambah Menu
                  </Link>
                </div>

                <div className="divide-y divide-border-subtle">
                  {items.map((item, idx) => (
                    <div key={`${item.product.id}-${idx}`} className="py-4 flex gap-4 items-start">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-secondary border border-border-subtle">
                        <Image
                          src={item.product.image || '/images/cold-brew-aren-brulee.png'}
                          alt={item.product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-heading font-bold text-sm text-text-primary truncate">
                            {item.product.name}
                          </h3>
                          <span className="font-mono text-xs font-bold text-accent-amber shrink-0">
                            {rupiah(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                        {item.customizations && (
                          <div className="text-[11px] text-text-muted font-mono leading-tight">
                            {Object.entries(item.customizations).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                          </div>
                        )}
                        {item.notes && (
                          <p className="text-[11px] text-text-muted italic">
                            Catatan: {item.notes}
                          </p>
                        )}
                        <div className="pt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-surface-secondary p-1 rounded-lg border border-border-subtle">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.customizations, item.notes)}
                              className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text-primary"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-mono text-xs font-bold text-text-primary">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.customizations, item.notes)}
                              className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text-primary"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.product.id, item.customizations, item.notes)}
                            className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. Split Bill Calculator */}
              <section className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent-amber" />
                    <h2 className="font-heading text-base sm:text-lg font-bold text-text-primary">
                      Split Bill Patungan ({splitBillCount} Orang)
                    </h2>
                  </div>
                  <span className="font-mono text-xs font-bold text-accent-amber">
                    {rupiah(perPerson)} / orang
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  Geser untuk membagi tagihan secara merata bersama teman semeja.
                </p>
                <div className="space-y-3 pt-2">
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={splitBillCount}
                    onChange={(e) => setSplitBillCount(Number(e.target.value))}
                    className="w-full accent-accent-amber cursor-pointer"
                  />
                  <div className="flex justify-between font-mono text-[10px] text-text-muted">
                    <span>1 (Sendiri)</span>
                    <span>2 Orang</span>
                    <span>3 Orang</span>
                    <span>4 Orang</span>
                    <span>5 Orang</span>
                    <span>6 Orang</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Sticky Summary & Payment Methods (5 cols) */}
            <aside className="lg:col-span-5 sticky top-24 space-y-6">
              <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <h3 className="font-heading font-bold text-base text-text-primary">
                    Ringkasan Pembayaran
                  </h3>
                  <span className="font-mono text-[10px] text-emerald-400 uppercase bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    Midtrans Secured
                  </span>
                </div>

                {/* Loyalty Point Deduction Slider/Toggle */}
                <div className="p-4 rounded-xl bg-surface-secondary border border-border-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent-amber" />
                      <span className="text-xs font-semibold text-text-primary">Kawan Ya&apos;reh Points</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUsePoints(!usePoints)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        usePoints ? 'bg-accent-amber' : 'bg-surface-card'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-canvas-obsidian shadow-lg ring-0 transition duration-200 ease-in-out ${
                          usePoints ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex justify-between text-xs font-mono text-text-muted">
                    <span>Saldo: 1,450 YR PTS</span>
                    {usePoints && <span className="text-accent-amber font-bold">-Rp 15.000</span>}
                  </div>
                </div>

                {/* Midtrans Payment Options */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                    Pilih Metode Pembayaran
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPayment('qris')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedPayment === 'qris'
                          ? 'border-accent-amber bg-accent-amber/15 shadow-sm ring-1 ring-accent-amber'
                          : 'border-border-subtle bg-surface-secondary hover:border-primary/40'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-accent-amber mb-1.5" />
                      <div className="text-xs font-bold text-text-primary">QRIS Instan</div>
                      <div className="text-[10px] text-text-muted">GoPay, Shopee, BCA</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPayment('bca-va')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedPayment === 'bca-va'
                          ? 'border-accent-amber bg-accent-amber/15 shadow-sm ring-1 ring-accent-amber'
                          : 'border-border-subtle bg-surface-secondary hover:border-primary/40'
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-primary mb-1.5" />
                      <div className="text-xs font-bold text-text-primary">BCA Virtual</div>
                      <div className="text-[10px] text-text-muted">Verifikasi Otomatis</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPayment('mandiri-va')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedPayment === 'mandiri-va'
                          ? 'border-accent-amber bg-accent-amber/15 shadow-sm ring-1 ring-accent-amber'
                          : 'border-border-subtle bg-surface-secondary hover:border-primary/40'
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-cream-beige mb-1.5" />
                      <div className="text-xs font-bold text-text-primary">Mandiri VA</div>
                      <div className="text-[10px] text-text-muted">ATM &amp; Livin&apos;</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPayment('card')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedPayment === 'card'
                          ? 'border-accent-amber bg-accent-amber/15 shadow-sm ring-1 ring-accent-amber'
                          : 'border-border-subtle bg-surface-secondary hover:border-primary/40'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-secondary mb-1.5" />
                      <div className="text-xs font-bold text-text-primary">Kartu Kredit</div>
                      <div className="text-[10px] text-text-muted">Visa / Mastercard</div>
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t border-border-subtle space-y-2 text-xs">
                  <div className="flex justify-between text-text-muted">
                    <span>Subtotal Menu</span>
                    <span className="font-mono text-text-primary">{rupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Pajak Restoran PB1 (10%)</span>
                    <span className="font-mono text-text-primary">{rupiah(tax)}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Biaya Layanan &amp; Platform</span>
                    <span className="font-mono text-text-primary">{rupiah(platformFee)}</span>
                  </div>
                  {usePoints && (
                    <div className="flex justify-between text-accent-amber font-mono font-bold">
                      <span>Diskon Poin Kawan Ya&apos;reh</span>
                      <span>-{rupiah(pointsDiscount)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-border-subtle flex justify-between items-center">
                    <div>
                      <span className="block font-bold text-text-primary text-sm">Total Tagihan</span>
                      <span className="font-mono text-[11px] text-text-muted">
                        ({rupiah(perPerson)} / pax)
                      </span>
                    </div>
                    <span className="font-mono text-xl font-extrabold text-accent-amber">
                      {rupiah(total)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceed}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-coffee via-secondary-container to-accent-amber text-canvas-obsidian font-heading font-bold text-sm shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Bayar Sekarang (Midtrans)</span>
                </button>

                <p className="text-[11px] text-text-muted text-center font-mono">
                  Enkripsi 256-bit SSL · Midtrans Snap Payment Gateway
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
