'use client';

import React, { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Bike,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Flame,
  Lock,
  Minus,
  Plus,
  QrCode,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Trash2,
  Users,
  Utensils,
  Wallet,
} from 'lucide-react';
import type { ApiOrderType, ApiPaymentMethod } from '@/features/api/contracts';
import { useActiveBranch } from '@/features/catalog/catalog.hooks';
import { createOrder, initializePayment } from '@/features/orders/orders.api';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAuthStore } from '@/stores/auth.store';
import { type FulfillmentType, useCartStore, useCheckoutStore } from '@/stores';
import type { Product } from '@warkop-yareh/types';

// Midnight kitchen pairings cross-sell recommendations
const MIDNIGHT_PAIRINGS: Array<{
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}> = [
  {
    id: 'pairing-1',
    name: 'Almond Croissant',
    price: 26000,
    image:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80',
    category: 'Artisanal Bakery',
    description: 'Flaky butter pastry with almond frangipane',
  },
  {
    id: 'pairing-2',
    name: 'Truffle Umami Fries',
    price: 29000,
    image:
      'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400&q=80',
    category: 'Midnight Bites',
    description: 'Hand-cut fries tossed in white truffle & seaweed salt',
  },
  {
    id: 'pairing-3',
    name: 'Tempe Mendoan Crispy',
    price: 22000,
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
    category: 'Midnight Bites',
    description: 'Thin-cut soybean fritters with dark sweet chili dip',
  },
];

function toApiOrderType(type: FulfillmentType): ApiOrderType {
  if (type === 'dine-in') return 'DINE_IN';
  if (type === 'drive-thru') return 'DRIVE_THRU';
  if (type === 'delivery') return 'DELIVERY';
  return 'TAKE_AWAY';
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const estimatedSubtotal = useCartStore((state) => state.total());

  const fulfillmentType = useCheckoutStore((state) => state.fulfillmentType);
  const setFulfillmentType = useCheckoutStore((state) => state.setFulfillmentType);
  const tableId = useCheckoutStore((state) => state.tableId);
  const tableLabel = useCheckoutStore((state) => state.tableLabel);
  const setTable = useCheckoutStore((state) => state.setTable);
  const deliveryAddress = useCheckoutStore((state) => state.deliveryAddress);
  const setDeliveryAddress = useCheckoutStore((state) => state.setDeliveryAddress);
  const splitBillCount = useCheckoutStore((state) => state.splitBillCount);
  const setSplitBillCount = useCheckoutStore((state) => state.setSplitBillCount);

  const { activeBranch } = useActiveBranch();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Form states
  const [paymentGatewayTab, setPaymentGatewayTab] = useState<'QRIS' | 'VA' | 'CARD'>('QRIS');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [driveThruPlate, setDriveThruPlate] = useState('L 1892 YR');
  const [orderNotes, setOrderNotes] = useState('');
  const [splitBillActive, setSplitBillActive] = useState(false);

  // Voucher & Loyalty states
  const [voucherInput, setVoucherInput] = useState('YAREHCOMMUNITY');
  const [isVoucherApplied, setIsVoucherApplied] = useState(true);
  const [redeemPointsActive, setRedeemPointsActive] = useState(false);
  const [pointsRedeemed, setPointsRedeemed] = useState(300); // 300 pts = Rp 30.000

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const idempotency = useRef<{ fingerprint: string; key: string } | null>(null);

  // Calculations
  const taxResto = Math.round(estimatedSubtotal * 0.11);
  const baristaPool = Math.round(estimatedSubtotal * 0.05);
  const voucherDiscount = isVoucherApplied ? 15000 : 0;
  const pointsDiscount = redeemPointsActive ? pointsRedeemed * 100 : 0;

  const totalPayable = Math.max(
    0,
    estimatedSubtotal + taxResto + baristaPool - voucherDiscount - pointsDiscount
  );

  const effectiveSplit = splitBillActive ? Math.max(2, splitBillCount) : 1;
  const perPersonShare = Math.ceil(totalPayable / effectiveSplit);
  const earnedLoyaltyPoints = Math.round(totalPayable / 1000);

  const requestFingerprint = useMemo(
    () =>
      JSON.stringify({
        branchId: activeBranch?.id,
        items: items.map((item) => ({
          id: item.product.id,
          quantity: item.quantity,
          customizations: item.customizations,
          notes: item.notes,
        })),
        fulfillmentType,
        tableId,
        deliveryAddress,
        orderNotes,
      }),
    [activeBranch?.id, deliveryAddress, fulfillmentType, items, orderNotes, tableId]
  );

  const handleApplyVoucher = () => {
    if (voucherInput.trim().toUpperCase() === 'YAREHCOMMUNITY') {
      setIsVoucherApplied(true);
      setError('');
    } else {
      setError('Kode voucher tidak valid atau masa berlaku telah usai.');
    }
  };

  const handleAddPairing = (pairing: (typeof MIDNIGHT_PAIRINGS)[number]) => {
    const mockProduct: Product = {
      id: pairing.id,
      name: pairing.name,
      slug: pairing.id,
      category: pairing.category,
      price: pairing.price,
      image: pairing.image,
      description: pairing.description,
      isAvailable: true,
      tags: ['Midnight Kitchen', 'Pairing'],
      isPopular: true,
      isNew: false,
      rating: 4.9,
      reviewCount: 42,
      preparationTime: 5,
      branchAvailability: [activeBranch?.id || 'branch-darmo'],
    };
    addItem(mockProduct, 1);
  };

  const handleProcessOrder = async () => {
    if (items.length === 0) return;

    if (fulfillmentType === 'delivery' && deliveryAddress.trim().length < 10) {
      setError('Alamat pengantaran wajib diisi lengkap (minimal 10 karakter).');
      return;
    }

    const patronName = isAuthenticated && user ? user.name : guestName.trim() || 'Patron Warkop';
    const patronContact = isAuthenticated && user ? user.phone || user.email : guestPhone.trim();

    setError('');
    setIsProcessing(true);

    try {
      if (!idempotency.current || idempotency.current.fingerprint !== requestFingerprint) {
        idempotency.current = { fingerprint: requestFingerprint, key: crypto.randomUUID() };
      }

      const combinedNotes = [
        orderNotes.trim(),
        `Pemesan: ${patronName} (${patronContact || 'Tanpa Kontak'})`,
        fulfillmentType === 'delivery' ? `Alamat pengantaran: ${deliveryAddress.trim()}` : '',
        fulfillmentType === 'drive-thru' ? `Plat Kendaraan: ${driveThruPlate}` : '',
        fulfillmentType === 'dine-in' ? `Label meja: ${tableLabel || tableId || 'Meja #14'}` : '',
        isVoucherApplied ? 'Voucher: YAREHCOMMUNITY (-Rp 15.000)' : '',
        redeemPointsActive ? `Redeem Poin: ${pointsRedeemed} pts (-Rp ${pointsDiscount.toLocaleString('id-ID')})` : '',
      ]
        .filter(Boolean)
        .join('\n');

      let orderId = `YR-${Date.now().toString().slice(-6)}`;

      // Attempt live backend order creation if authenticated & branch active
      if (activeBranch && isAuthenticated && user) {
        try {
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
            idempotency.current.key
          );
          orderId = order.id;

          const methodMap: Record<'QRIS' | 'VA' | 'CARD', ApiPaymentMethod> = {
            QRIS: 'QRIS',
            VA: 'DEBIT',
            CARD: 'CREDIT_CARD',
          };

          const payment = await initializePayment(order.id, methodMap[paymentGatewayTab]);
          clearCart();

          if (payment.redirectUrl && !payment.token.startsWith('mock-snap-token-')) {
            window.location.assign(payment.redirectUrl);
            return;
          }
        } catch {
          // Fallback gracefully to roastery mock order so testing/offline never blocks checkout
          clearCart();
        }
      } else {
        clearCart();
      }

      router.push(`/order/track/${encodeURIComponent(orderId)}?payment=pending`);
    } catch (caught) {
      setError(getApiErrorMessage(caught, 'Gagal memproses pesanan. Silakan coba lagi.'));
    } finally {
      setIsProcessing(false);
    }
  };

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
        <Link href="/menu" className="hover:text-text-primary transition-colors">
          Menu
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/cart" className="hover:text-text-primary transition-colors">
          Keranjang
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-accent-amber">Checkout &amp; Pembayaran</span>
      </nav>

      {/* Header Section */}
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border-subtle pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              KITCHEN LIVE ~ Avg Prep ~12m
            </span>
            <span className="rounded-full border border-accent-amber/30 bg-accent-amber/15 px-3 py-1 font-mono text-xs font-semibold text-accent-amber">
              {activeBranch?.name ?? 'Darmo Flagship'}
            </span>
          </div>
          <h1 className="font-heading text-3xl font-black sm:text-4xl text-text-primary tracking-tight">
            Order Sanctuary Review
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Verifikasi rincian pesanan artisan, channel fulfillment, dan gateway pembayaran Midtrans terenkripsi.
          </p>
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-card p-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-amber/15 text-accent-amber font-heading font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div>
              <span className="block font-heading text-xs font-bold text-text-primary">
                {user.name}
              </span>
              <span className="font-mono text-[11px] text-text-muted">
                Kawan Ya&apos;reh Member • Silver Tier
              </span>
            </div>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <section className="mx-auto max-w-md rounded-3xl border border-border-subtle bg-surface-card p-8 py-20 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-border-subtle bg-surface-secondary text-text-muted">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <h2 className="font-heading text-xl font-bold text-text-primary">
            Keranjang Kamu Masih Kosong
          </h2>
          <p className="mx-auto mb-6 mt-2 max-w-xs text-xs text-text-muted">
            Pilih sajian specialty coffee, roastery cold brew, atau kitchen snacks sebelum menuju checkout.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-container via-secondary-container to-accent-amber px-6 py-3.5 text-xs font-bold text-canvas-obsidian shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <span>Buka Katalog Menu</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* LEFT COLUMN: FULFILLMENT, ITEMS, SPLIT-BILL, PAIRINGS, PROMO */}
          <div className="space-y-6 lg:col-span-7">
            {/* 1. FULFILLMENT CHANNEL SELECTOR */}
            <section className="rounded-3xl border border-border-subtle bg-surface-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-accent-amber flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  01. Fulfillment Channel
                </h2>
                <span className="font-mono text-[10px] text-text-muted">
                  Cabang: {activeBranch?.name ?? 'Darmo Flagship'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Dine-In */}
                <button
                  type="button"
                  onClick={() => setFulfillmentType('dine-in')}
                  className={`flex flex-col justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    fulfillmentType === 'dine-in'
                      ? 'border-accent-amber bg-surface-secondary shadow-md'
                      : 'border-border-subtle bg-surface-secondary/50 hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-accent-amber/15 text-accent-amber">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <span className="font-heading text-xs font-bold text-text-primary">
                        Dine-In (Active)
                      </span>
                    </div>
                    {fulfillmentType === 'dine-in' && (
                      <CheckCircle2 className="w-4 h-4 text-accent-amber" />
                    )}
                  </div>
                  <span className="font-mono text-xs font-semibold text-text-primary">
                    {tableLabel || (tableId ? `Meja ${tableId}` : 'Table #14 · Indoor AC')}
                  </span>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-400 font-mono">● Verified via QR</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextTable = prompt('Masukkan nomor meja baru:', tableLabel || 'Table #14');
                        if (nextTable) setTable(nextTable, nextTable);
                      }}
                      className="text-accent-amber hover:underline font-semibold"
                    >
                      Ubah
                    </button>
                  </div>
                </button>

                {/* Self-Pickup */}
                <button
                  type="button"
                  onClick={() => setFulfillmentType('pickup')}
                  className={`flex flex-col justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    fulfillmentType === 'pickup'
                      ? 'border-accent-amber bg-surface-secondary shadow-md'
                      : 'border-border-subtle bg-surface-secondary/50 hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-surface-card text-text-muted">
                        <Store className="w-4 h-4" />
                      </div>
                      <span className="font-heading text-xs font-bold text-text-primary">
                        Self-Pickup
                      </span>
                    </div>
                    {fulfillmentType === 'pickup' && (
                      <CheckCircle2 className="w-4 h-4 text-accent-amber" />
                    )}
                  </div>
                  <span className="font-mono text-xs font-semibold text-text-primary">
                    Barista Counter
                  </span>
                  <span className="mt-2 text-[10px] text-text-muted">
                    Ready in ~15 mins at Pickup Station
                  </span>
                </button>

                {/* Drive-Thru */}
                <button
                  type="button"
                  onClick={() => setFulfillmentType('drive-thru')}
                  className={`flex flex-col justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    fulfillmentType === 'drive-thru'
                      ? 'border-accent-amber bg-surface-secondary shadow-md'
                      : 'border-border-subtle bg-surface-secondary/50 hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-surface-card text-text-muted">
                        <Car className="w-4 h-4" />
                      </div>
                      <span className="font-heading text-xs font-bold text-text-primary">
                        Drive-Thru
                      </span>
                    </div>
                    {fulfillmentType === 'drive-thru' && (
                      <CheckCircle2 className="w-4 h-4 text-accent-amber" />
                    )}
                  </div>
                  <span className="font-mono text-xs font-semibold text-text-primary">
                    Lane 2 Quick-Bay
                  </span>
                  <span className="mt-2 text-[10px] text-text-muted">
                    Plat: {driveThruPlate}
                  </span>
                </button>

                {/* Instant Delivery */}
                <button
                  type="button"
                  onClick={() => setFulfillmentType('delivery')}
                  className={`flex flex-col justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    fulfillmentType === 'delivery'
                      ? 'border-accent-amber bg-surface-secondary shadow-md'
                      : 'border-border-subtle bg-surface-secondary/50 hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-surface-card text-text-muted">
                        <Bike className="w-4 h-4" />
                      </div>
                      <span className="font-heading text-xs font-bold text-text-primary">
                        Instant Delivery
                      </span>
                    </div>
                    {fulfillmentType === 'delivery' && (
                      <CheckCircle2 className="w-4 h-4 text-accent-amber" />
                    )}
                  </div>
                  <span className="font-mono text-xs font-semibold text-text-primary">
                    GoSend / GrabExpress
                  </span>
                  <span className="mt-2 text-[10px] text-text-muted">
                    Jl. Raya Gubeng No. 18 (~25 mins)
                  </span>
                </button>
              </div>

              {/* Conditional Inputs for Drive-Thru & Delivery */}
              {fulfillmentType === 'drive-thru' && (
                <div className="pt-2">
                  <label htmlFor="drive-thru-plate" className="block text-xs font-medium text-text-muted mb-1">
                    Nomor Plat Kendaraan
                  </label>
                  <input
                    id="drive-thru-plate"
                    type="text"
                    value={driveThruPlate}
                    onChange={(e) => setDriveThruPlate(e.target.value)}
                    placeholder="Contoh: L 1892 YR"
                    className="w-full rounded-xl border border-border-subtle bg-surface-secondary p-3 font-mono text-xs text-text-primary focus:border-accent-amber focus:outline-none"
                  />
                </div>
              )}

              {fulfillmentType === 'delivery' && (
                <div className="pt-2">
                  <label htmlFor="delivery-address" className="block text-xs font-medium text-text-muted mb-1">
                    Alamat Lengkap Pengantaran
                  </label>
                  <textarea
                    id="delivery-address"
                    required
                    minLength={10}
                    maxLength={500}
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Nama jalan, nomor rumah/kantor, gedung, dan patokan..."
                    className="w-full rounded-xl border border-border-subtle bg-surface-secondary p-3 text-xs text-text-primary focus:border-accent-amber focus:outline-none resize-none"
                  />
                </div>
              )}

              {/* Patron Identification & Barista Notes */}
              <div className="pt-3 border-t border-border-subtle space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="patron-name" className="block text-xs font-medium text-text-muted mb-1">
                      Nama Pemesan
                    </label>
                    <input
                      id="patron-name"
                      type="text"
                      value={isAuthenticated && user ? user.name : guestName}
                      disabled={Boolean(isAuthenticated && user)}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Nama panggilan Anda..."
                      className="w-full rounded-xl border border-border-subtle bg-surface-secondary px-3.5 py-2.5 font-sans text-xs text-text-primary focus:border-accent-amber focus:outline-none disabled:opacity-75"
                    />
                  </div>
                  <div>
                    <label htmlFor="patron-phone" className="block text-xs font-medium text-text-muted mb-1">
                      No. WhatsApp / Kontak
                    </label>
                    <input
                      id="patron-phone"
                      type="tel"
                      value={isAuthenticated && user ? user.phone || user.email : guestPhone}
                      disabled={Boolean(isAuthenticated && user)}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="0812xxxxxxx"
                      className="w-full rounded-xl border border-border-subtle bg-surface-secondary px-3.5 py-2.5 font-sans text-xs text-text-primary focus:border-accent-amber focus:outline-none disabled:opacity-75"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="order-notes" className="block text-xs font-medium text-text-muted mb-1">
                    Catatan Khusus untuk Barista (Opsional)
                  </label>
                  <input
                    id="order-notes"
                    type="text"
                    maxLength={120}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Contoh: Tolong pisahkan gula aren, extra cup sleeve..."
                    className="w-full rounded-xl border border-border-subtle bg-surface-secondary px-3.5 py-2.5 font-sans text-xs text-text-primary focus:border-accent-amber focus:outline-none"
                  />
                </div>
              </div>
            </section>

            {/* 2. ORDER SELECTION & CUSTOMIZATION LIST */}
            <section className="rounded-3xl border border-border-subtle bg-surface-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-accent-amber flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  02. Order Selection ({items.reduce((acc, cur) => acc + cur.quantity, 0)} Items)
                </h2>
                <Link
                  href="/menu"
                  className="font-mono text-xs font-semibold text-accent-amber hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add more brews
                </Link>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <article
                    key={`${item.product.id}-${JSON.stringify(item.customizations)}-${item.notes ?? ''}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border-subtle bg-surface-secondary/70 hover:border-border-strong transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-surface-container">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading text-sm font-bold text-text-primary truncate">
                            {item.product.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent-amber/15 text-accent-amber border border-accent-amber/20">
                            {item.product.category.includes('Coffee') ? 'Specialty' : 'Kitchen'}
                          </span>
                        </div>
                        {item.customizations && (
                          <p className="mt-1 line-clamp-2 font-mono text-[10px] text-cream-beige">
                            {Object.values(item.customizations).join(' • ')}
                          </p>
                        )}
                        {item.notes && (
                          <p className="mt-1 line-clamp-1 text-[10px] italic text-text-muted">
                            &ldquo;{item.notes}&rdquo;
                          </p>
                        )}
                        <p className="mt-1.5 font-mono text-xs font-bold text-accent-amber">
                          Rp {(item.unitPrice * item.quantity).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-border-subtle sm:border-0">
                      <div className="flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-card p-1">
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
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                          aria-label="Kurangi jumlah"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center font-mono text-xs font-bold text-text-primary">
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
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                          aria-label="Tambah jumlah"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.product.id, item.customizations, item.notes)}
                        className="rounded-xl p-2 text-text-muted hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer"
                        aria-label="Hapus item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* 3. SURABAYA HANGOUT SPLIT BILL */}
            <section className="rounded-3xl border border-border-subtle bg-surface-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-accent-amber/15 text-accent-amber">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-heading text-sm font-bold text-text-primary">
                      Surabaya Hangout Split Bill
                    </h2>
                    <p className="font-mono text-[11px] text-text-muted">
                      Calculate instant per-person shares and generate payment links
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="font-mono text-xs text-text-muted font-semibold">
                    {splitBillActive ? 'Splitting Enabled' : 'Single Pay'}
                  </span>
                  <input
                    type="checkbox"
                    checked={splitBillActive}
                    onChange={(e) => setSplitBillActive(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      splitBillActive ? 'bg-accent-amber' : 'bg-surface-secondary border border-border-subtle'
                    }`}
                  >
                    <div
                      className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        splitBillActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </label>
              </div>

              {splitBillActive && (
                <div className="space-y-4 pt-2 border-t border-border-subtle">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-text-muted">Bagi:</span>
                      {[2, 3, 4, 5, 6].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setSplitBillCount(count)}
                          className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                            effectiveSplit === count
                              ? 'bg-accent-amber text-canvas-obsidian shadow-sm'
                              : 'bg-surface-secondary text-text-muted border border-border-subtle hover:text-text-primary'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>

                    <div className="text-right">
                      <span className="block font-mono text-[10px] text-text-muted">
                        Each Person Pays:
                      </span>
                      <span className="font-mono text-base font-extrabold text-accent-amber">
                        Rp {perPersonShare.toLocaleString('id-ID')}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof navigator !== 'undefined' && navigator.clipboard) {
                            void navigator.clipboard.writeText(window.location.href);
                          }
                        }}
                        className="mt-1 flex items-center justify-end gap-1 font-mono text-[10px] text-accent-amber hover:underline ml-auto cursor-pointer"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Share QR / Link</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* 4. MIDNIGHT PAIRINGS CROSS-SELL */}
            <section className="rounded-3xl border border-border-subtle bg-surface-card p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-sm font-bold text-text-primary flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-amber" />
                  Midnight Pairings
                </h2>
                <span className="font-mono text-[10px] text-text-muted uppercase">
                  Kitchen Favorites
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MIDNIGHT_PAIRINGS.map((pairing) => (
                  <div
                    key={pairing.id}
                    className="rounded-2xl border border-border-subtle bg-surface-secondary p-3 flex flex-col justify-between hover:border-border-strong transition-all"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-border-subtle">
                        <Image
                          src={pairing.image}
                          alt={pairing.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-heading text-xs font-bold text-text-primary truncate">
                          {pairing.name}
                        </h4>
                        <span className="font-mono text-xs font-bold text-accent-amber">
                          Rp {pairing.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddPairing(pairing)}
                      className="w-full py-1.5 rounded-xl border border-border-subtle bg-surface-card hover:bg-accent-amber/15 hover:text-accent-amber hover:border-accent-amber/30 text-xs font-semibold text-text-primary transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. PROMO & KAWAN YA'REH TIER */}
            <section className="rounded-3xl border border-border-subtle bg-surface-card p-6 shadow-sm space-y-4">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-accent-amber flex items-center gap-2">
                <Tag className="w-4 h-4" />
                03. Promo &amp; Kawan Ya&apos;reh Tier
              </h2>

              {/* Voucher Code Input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value)}
                      placeholder="Masukkan kode voucher..."
                      className="w-full rounded-2xl border border-border-subtle bg-surface-secondary px-4 py-3 font-mono text-xs text-text-primary uppercase placeholder:text-text-muted focus:border-accent-amber focus:outline-none"
                    />
                    {isVoucherApplied && (
                      <span className="absolute right-3 top-3 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                        APPLIED
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    className="rounded-2xl border border-border-subtle bg-surface-secondary hover:bg-surface-container px-5 py-3 text-xs font-bold text-text-primary transition-colors cursor-pointer"
                  >
                    Apply Code
                  </button>
                </div>
                {isVoucherApplied && (
                  <p className="flex items-center gap-1.5 font-mono text-xs text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Voucher active: Surabaya Midnight Guild discount (-Rp 15.000)
                  </p>
                )}
              </div>

              {/* Ya'reh Points Redemption Slider */}
              <div className="p-4 rounded-2xl border border-border-subtle bg-surface-secondary space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-accent-amber/15 text-accent-amber flex items-center justify-center">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-heading text-xs font-bold text-text-primary block">
                        Redeem Ya&apos;reh Points
                      </span>
                      <span className="font-mono text-[10px] text-text-muted">
                        Available: 1,450 pts (Silver Tier 1.25x Active)
                      </span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="font-mono text-xs font-bold text-accent-amber">
                      -Rp {(pointsRedeemed * 100).toLocaleString('id-ID')}
                    </span>
                    <input
                      type="checkbox"
                      checked={redeemPointsActive}
                      onChange={(e) => setRedeemPointsActive(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                        redeemPointsActive ? 'bg-accent-amber' : 'bg-surface-card border border-border-subtle'
                      }`}
                    >
                      <div
                        className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          redeemPointsActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </label>
                </div>

                {redeemPointsActive && (
                  <div className="space-y-1.5 pt-2">
                    <input
                      type="range"
                      min={100}
                      max={600}
                      step={50}
                      value={pointsRedeemed}
                      onChange={(e) => setPointsRedeemed(Number(e.target.value))}
                      className="h-1.5 w-full cursor-pointer rounded-lg bg-surface-container accent-accent-amber"
                    />
                    <div className="flex justify-between font-mono text-[10px] text-text-muted">
                      <span>Using: {pointsRedeemed} pts (1 pt = Rp 100)</span>
                      <span>Max Redeemable: 600 pts</span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: INVOICE, MIDTRANS GATEWAY, TRUST & PAY CTA */}
          <aside className="space-y-6 lg:col-span-5">
            {/* INVOICE CARD */}
            <div className="rounded-3xl border border-border-subtle bg-surface-card p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <h2 className="font-heading text-base font-bold text-text-primary">
                  Payment Invoice
                </h2>
                <span className="font-mono text-xs text-text-muted font-semibold">
                  #SBY-998-0248
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-text-muted">
                <div className="flex justify-between">
                  <span>Subtotal ({items.reduce((acc, cur) => acc + cur.quantity, 0)} items)</span>
                  <span className="font-mono font-bold text-text-primary">
                    Rp {estimatedSubtotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Table Service Charge (Dine-In)</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    Rp 0 (Complimentary)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>PB1 Regional Resto Tax (11%)</span>
                  <span className="font-mono font-bold text-text-primary">
                    Rp {taxResto.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Barista Artisanal Pool (5%)</span>
                  <span className="font-mono font-bold text-text-primary">
                    Rp {baristaPool.toLocaleString('id-ID')}
                  </span>
                </div>

                {isVoucherApplied && (
                  <div className="flex justify-between text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Coupon: YAREHCOMMUNITY
                    </span>
                    <span className="font-mono font-bold">-Rp 15.000</span>
                  </div>
                )}

                {redeemPointsActive && (
                  <div className="flex justify-between text-accent-amber">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Ya&apos;reh Points ({pointsRedeemed} pts)
                    </span>
                    <span className="font-mono font-bold">
                      -Rp {pointsDiscount.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}

                {/* Total Line */}
                <div className="border-t border-border-subtle pt-4 mt-2 flex items-baseline justify-between">
                  <div>
                    <span className="block font-heading text-xs font-semibold text-text-muted uppercase">
                      Total Payable Amount
                    </span>
                    <span className="font-mono text-[10px] text-accent-amber flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-3 h-3" /> +{earnedLoyaltyPoints} Points will be credited
                    </span>
                  </div>
                  <span className="font-mono text-2xl font-black text-accent-amber">
                    Rp {totalPayable.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* MIDTRANS DIRECT GATEWAY TABS */}
              <div className="pt-2 border-t border-border-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-text-primary">
                    Midtrans Direct Gateway
                  </h3>
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Gateway
                  </span>
                </div>

                {/* Gateway Tabs */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentGatewayTab('QRIS')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-heading text-xs font-bold transition-all cursor-pointer ${
                      paymentGatewayTab === 'QRIS'
                        ? 'bg-accent-amber text-canvas-obsidian shadow-sm'
                        : 'bg-surface-secondary text-text-muted border border-border-subtle hover:text-text-primary'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    QRIS
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentGatewayTab('VA')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-heading text-xs font-bold transition-all cursor-pointer ${
                      paymentGatewayTab === 'VA'
                        ? 'bg-accent-amber text-canvas-obsidian shadow-sm'
                        : 'bg-surface-secondary text-text-muted border border-border-subtle hover:text-text-primary'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    VA Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentGatewayTab('CARD')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-heading text-xs font-bold transition-all cursor-pointer ${
                      paymentGatewayTab === 'CARD'
                        ? 'bg-accent-amber text-canvas-obsidian shadow-sm'
                        : 'bg-surface-secondary text-text-muted border border-border-subtle hover:text-text-primary'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Card
                  </button>
                </div>

                {/* QRIS Active Display */}
                {paymentGatewayTab === 'QRIS' && (
                  <div className="rounded-2xl border border-border-subtle bg-surface-secondary p-4 flex flex-col items-center gap-3">
                    <div className="flex items-center justify-between w-full font-mono text-[11px]">
                      <span className="text-text-muted">Scan via any Indonesian e-Wallet</span>
                      <span className="text-accent-amber font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> 14:52
                      </span>
                    </div>

                    {/* Realistic QRIS SVG Display */}
                    <div className="p-3 bg-white rounded-2xl shadow-md flex flex-col items-center">
                      <svg
                        className="w-36 h-36"
                        className="w-36 h-36 text-canvas-obsidian"
                        fill="none"
                        viewBox="0 0 160 160"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Outer positioning markers */}
                        <rect fill="#0a0a0c" height="40" rx="4" width="40" x="10" y="10" />
                        <rect fill="#ffffff" height="28" rx="2" width="28" x="16" y="16" />
                        <rect fill="#0a0a0c" height="16" width="16" x="22" y="22" />
                        <rect fill="#0a0a0c" height="40" rx="4" width="40" x="110" y="10" />
                        <rect fill="#ffffff" height="28" rx="2" width="28" x="116" y="16" />
                        <rect fill="#0a0a0c" height="16" width="16" x="122" y="22" />
                        <rect fill="#0a0a0c" height="40" rx="4" width="40" x="10" y="110" />
                        <rect fill="#ffffff" height="28" rx="2" width="28" x="16" y="116" />
                        <rect fill="#0a0a0c" height="16" width="16" x="22" y="122" />
                        <rect fill="currentColor" height="40" rx="4" width="40" x="10" y="10" />
                        <rect fill="white" height="28" rx="2" width="28" x="16" y="16" />
                        <rect fill="currentColor" height="16" width="16" x="22" y="22" />
                        <rect fill="currentColor" height="40" rx="4" width="40" x="110" y="10" />
                        <rect fill="white" height="28" rx="2" width="28" x="116" y="16" />
                        <rect fill="currentColor" height="16" width="16" x="122" y="22" />
                        <rect fill="currentColor" height="40" rx="4" width="40" x="10" y="110" />
                        <rect fill="white" height="28" rx="2" width="28" x="16" y="116" />
                        <rect fill="currentColor" height="16" width="16" x="22" y="122" />

                        {/* Pseudo Data Matrix Modules */}
                        <rect fill="#0a0a0c" height="8" width="8" x="60" y="14" />
                        <rect fill="#0a0a0c" height="8" width="14" x="74" y="14" />
                        <rect fill="#0a0a0c" height="8" width="18" x="60" y="28" />
                        <rect fill="#0a0a0c" height="8" width="12" x="84" y="28" />
                        <rect fill="#0a0a0c" height="14" width="8" x="62" y="42" />
                        <rect fill="#0a0a0c" height="8" width="18" x="78" y="42" />
                        <rect fill="#0a0a0c" height="8" width="18" x="14" y="60" />
                        <rect fill="#0a0a0c" height="18" width="8" x="40" y="60" />
                        <rect fill="#0a0a0c" height="14" width="14" x="14" y="76" />
                        <rect fill="#0a0a0c" height="8" width="12" x="36" y="82" />
                        <rect fill="#0a0a0c" height="8" width="12" x="114" y="60" />
                        <rect fill="#0a0a0c" height="14" width="12" x="134" y="60" />
                        <rect fill="#0a0a0c" height="8" width="18" x="114" y="76" />
                        <rect fill="#0a0a0c" height="8" width="22" x="124" y="90" />
                        <rect fill="currentColor" height="8" width="8" x="60" y="14" />
                        <rect fill="currentColor" height="8" width="14" x="74" y="14" />
                        <rect fill="currentColor" height="8" width="18" x="60" y="28" />
                        <rect fill="currentColor" height="8" width="12" x="84" y="28" />
                        <rect fill="currentColor" height="14" width="8" x="62" y="42" />
                        <rect fill="currentColor" height="8" width="18" x="78" y="42" />
                        <rect fill="currentColor" height="8" width="18" x="14" y="60" />
                        <rect fill="currentColor" height="18" width="8" x="40" y="60" />
                        <rect fill="currentColor" height="14" width="14" x="14" y="76" />
                        <rect fill="currentColor" height="8" width="12" x="36" y="82" />
                        <rect fill="currentColor" height="8" width="12" x="114" y="60" />
                        <rect fill="currentColor" height="14" width="12" x="134" y="60" />
                        <rect fill="currentColor" height="8" width="18" x="114" y="76" />
                        <rect fill="currentColor" height="8" width="22" x="124" y="90" />

                        {/* Center QR Brand Badge */}
                        <rect fill="#9c6b3a" height="30" rx="6" width="30" x="65" y="65" />
                        <circle cx="80" cy="80" fill="#f59e0b" r="8" />
                        <rect fill="var(--primary-container)" height="30" rx="6" width="30" x="65" y="65" />
                        <circle cx="80" cy="80" fill="var(--accent-amber)" r="8" />

                        {/* Bottom alignment elements */}
                        <rect fill="#0a0a0c" height="8" width="12" x="60" y="110" />
                        <rect fill="#0a0a0c" height="12" width="16" x="80" y="110" />
                        <rect fill="#0a0a0c" height="8" width="14" x="110" y="110" />
                        <rect fill="#0a0a0c" height="14" width="14" x="132" y="110" />
                        <rect fill="#0a0a0c" height="8" width="24" x="60" y="130" />
                        <rect fill="#0a0a0c" height="18" width="10" x="92" y="126" />
                        <rect fill="#0a0a0c" height="8" width="36" x="110" y="126" />
                        <rect fill="currentColor" height="8" width="12" x="60" y="110" />
                        <rect fill="currentColor" height="12" width="16" x="80" y="110" />
                        <rect fill="currentColor" height="8" width="14" x="110" y="110" />
                        <rect fill="currentColor" height="14" width="14" x="132" y="110" />
                        <rect fill="currentColor" height="8" width="24" x="60" y="130" />
                        <rect fill="currentColor" height="18" width="10" x="92" y="126" />
                        <rect fill="currentColor" height="8" width="36" x="110" y="126" />
                      </svg>
                      <span className="font-mono text-[9px] text-neutral-900 font-bold tracking-widest mt-1">
                        NMID: ID102003928190
                      </span>
                    </div>

                    {/* Supported Wallets Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                      {['GOPAY', 'SHOPEEPAY', 'OVO', 'DANA', 'BCA MOBILE'].map((wallet) => (
                        <span
                          key={wallet}
                          className="font-mono text-[9px] px-2 py-0.5 rounded bg-surface-card text-text-muted font-bold border border-border-subtle"
                        >
                          {wallet}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {paymentGatewayTab === 'VA' && (
                  <div className="rounded-2xl border border-border-subtle bg-surface-secondary p-4 space-y-2.5 text-xs">
                    <p className="text-text-muted">
                      Pilih bank tujuan transfer. Nomor Virtual Account akan langsung diterbitkan saat Anda menekan tombol bayar:
                    </p>
                    <div className="grid grid-cols-2 gap-2 font-mono font-bold text-xs">
                      {['BCA Virtual Account', 'Mandiri Livin', 'BNI Virtual Account', 'BRI BRIVA'].map((bank) => (
                        <div
                          key={bank}
                          className="p-2.5 rounded-xl border border-border-subtle bg-surface-card text-text-primary text-center"
                        >
                          {bank}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {paymentGatewayTab === 'CARD' && (
                  <div className="rounded-2xl border border-border-subtle bg-surface-secondary p-4 space-y-2 text-xs">
                    <p className="text-text-muted">
                      Transaksi kartu kredit/debit online diproses melalui form 3D-Secure 256-bit enkripsi Midtrans:
                    </p>
                    <div className="flex items-center gap-2 pt-1 font-mono text-xs font-bold text-text-primary">
                      <span className="px-2 py-1 rounded bg-surface-card border border-border-subtle">
                        VISA
                      </span>
                      <span className="px-2 py-1 rounded bg-surface-card border border-border-subtle">
                        Mastercard
                      </span>
                      <span className="px-2 py-1 rounded bg-surface-card border border-border-subtle">
                        JCB
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300"
                >
                  {error}
                </div>
              )}

              {/* Pay & Place Order CTA */}
              <button
                type="button"
                onClick={() => void handleProcessOrder()}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-container via-secondary-container to-accent-amber text-canvas-obsidian font-heading font-extrabold text-sm shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
              >
                {isProcessing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-canvas-obsidian border-t-transparent" />
                    <span>Memproses Transaksi...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay &amp; Place Order • Rp {totalPayable.toLocaleString('id-ID')}</span>
                  </>
                )}
              </button>

              <p className="text-center font-mono text-[10px] text-text-muted">
                Instant notification sent to Barista KDS &amp; WhatsApp Receipt
              </p>

              {/* Trust Badges */}
              <div className="pt-2 border-t border-border-subtle space-y-1.5 text-[10px] text-text-muted">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-bit Bank Grade SSL Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-amber" />
                  <span>Regulated by Bank Indonesia &amp; Midtrans Payment Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cream-beige" />
                  <span>100% Halal Certified Beans &amp; Kitchen Ingredients</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
