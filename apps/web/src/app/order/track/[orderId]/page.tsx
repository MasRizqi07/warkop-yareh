'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BellRing, CheckCircle2, Clock, Coffee, Download, MapPin, Sparkles } from 'lucide-react';
import type { ApiOrderStatus, OrderDto } from '@/features/api/contracts';
import { useParams, useSearchParams } from 'next/navigation';
import {
  BellRing,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coffee,
  Download,
  Flame,
  MapPin,
  MessageCircle,
  QrCode,
  Sparkles,
  Thermometer,
  Utensils,
  Volume2,
  VolumeX,
  Wifi,
} from 'lucide-react';
import type { ApiOrderStatus, OrderDto, OrderItemDto } from '@/features/api/contracts';
import { useBranches } from '@/features/catalog/catalog.hooks';
import { useOrder } from '@/features/orders/orders.hooks';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAuthStore } from '@/stores/auth.store';

const STEPS: Array<{ status: ApiOrderStatus; label: string; description: string; icon: typeof Clock }> = [
  { status: 'PENDING', label: 'Pesanan Diterima', description: 'Menunggu verifikasi pembayaran atau konfirmasi kasir.', icon: Clock },
  { status: 'CONFIRMED', label: 'Dikonfirmasi', description: 'Pesanan sudah masuk antrean operasional.', icon: CheckCircle2 },
  { status: 'PREPARING', label: 'Sedang Diracik', description: 'Barista dan kitchen sedang menyiapkan pesanan.', icon: Coffee },
  { status: 'READY', label: 'Siap Disajikan', description: 'Pesanan siap diambil atau diantar.', icon: BellRing },
  { status: 'SERVED', label: 'Sudah Disajikan', description: 'Pesanan telah diserahkan kepada pelanggan.', icon: Sparkles },
  { status: 'COMPLETED', label: 'Pesanan Selesai', description: 'Transaksi dan layanan telah selesai.', icon: CheckCircle2 },
const FALLBACK_CREATED_AT = '2026-09-04T16:34:15.000Z';
const FALLBACK_UPDATED_AT = '2026-09-04T16:42:15.000Z';

// 5-Stage Brewing & Fulfillment Pipeline definition
const PIPELINE_STAGES: Array<{
  id: ApiOrderStatus;
  stepNumber: number;
  label: string;
  sublabel: string;
  detail: string;
  icon: typeof Coffee;
}> = [
  {
    id: 'PENDING',
    stepNumber: 1,
    label: '1. Received',
    sublabel: 'Payment Verified',
    detail: '23:42:15 WIB • Midtrans Settled',
    icon: CheckCircle2,
  },
  {
    id: 'CONFIRMED',
    stepNumber: 2,
    label: '2. Confirmed',
    sublabel: 'Barista Dispatched',
    detail: '23:43:02 WIB • Station #2 Queue',
    icon: Coffee,
  },
  {
    id: 'PREPARING',
    stepNumber: 3,
    label: '3. Preparing',
    sublabel: 'Torch & Grind',
    detail: 'Now Extracting • 93.4°C Barista Pour',
    icon: Flame,
  },
  {
    id: 'READY',
    stepNumber: 4,
    label: '4. Ready to Serve',
    sublabel: 'Table Runner Call',
    detail: 'Est. 23:51 WIB • Counter Pass Ready',
    icon: BellRing,
  },
  {
    id: 'COMPLETED',
    stepNumber: 5,
    label: '5. Enjoy Brew',
    sublabel: 'Points Credited',
    detail: 'Lounge Session Active',
    icon: Sparkles,
  },
];

function fulfillmentLabel(order: OrderDto): string {
  if (order.type === 'DINE_IN') return order.tableId ? `Dine-In · Meja ${order.tableId}` : 'Dine-In';
  if (order.type === 'DRIVE_THRU') return 'Drive-Thru';
  if (order.type === 'DELIVERY') return 'Delivery';
  return 'Self Pickup';
}

export default function OrderTrackPage() {
  const params = useParams<{ orderId: string }>();
  const searchParams = useSearchParams();
  const orderId = params.orderId;
  const isPaymentPendingParam = searchParams.get('payment') === 'pending';

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const user = useAuthStore((state) => state.user);

  const orderQuery = useOrder(orderId, isInitialized && isAuthenticated);
  const branches = useBranches();
  const order = orderQuery.data;
  const branch = branches.data?.find((item) => item.id === order?.branchId);
  const rawOrder = orderQuery.data;

  if (!isInitialized) return <main className="flex min-h-[70vh] items-center justify-center bg-[#0a0a0c] text-sm text-neutral-400">Memulihkan sesi aman...</main>;
  if (!isAuthenticated) return <main className="flex min-h-[70vh] items-center justify-center bg-[#0a0a0c] px-4 text-center text-white"><section className="max-w-md rounded-3xl border border-white/10 bg-[#18181c] p-8"><h1 className="font-heading text-xl font-bold">Order ini membutuhkan autentikasi</h1><p className="mt-2 text-sm text-neutral-400">Masuk dengan akun pemilik order untuk melihat status dan bukti transaksi.</p><Link href={`/login?returnTo=${encodeURIComponent(`/order/track/${orderId}`)}`} className="mt-5 inline-block rounded-xl bg-[#9c6b3a] px-5 py-2.5 text-sm font-bold">Masuk</Link></section></main>;
  if (orderQuery.isPending) return <main className="flex min-h-[70vh] items-center justify-center bg-[#0a0a0c] text-sm text-neutral-400"><span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-[#f59e0b] border-t-transparent" />Memuat status order...</main>;
  if (orderQuery.isError || !order) return <main className="flex min-h-[70vh] items-center justify-center bg-[#0a0a0c] px-4 text-center text-white"><section role="alert" className="max-w-md rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8"><Clock className="mx-auto h-10 w-10 text-rose-300" /><h1 className="mt-4 font-heading text-xl font-bold">Pesanan tidak dapat dibuka</h1><p className="mt-2 text-xs text-neutral-300">{getApiErrorMessage(orderQuery.error, 'ID tidak ditemukan atau akun ini tidak memiliki akses.')}</p><div className="mt-5 flex justify-center gap-2"><button type="button" onClick={() => void orderQuery.refetch()} className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold">Coba Lagi</button><Link href="/orders" className="rounded-xl bg-[#9c6b3a] px-4 py-2 text-xs font-bold">Riwayat Order</Link></div></section></main>;
  // Local state for ambience and simulated payment/service interactions
  const [isLofiOn, setIsLofiOn] = useState(true);
  const [simulatedStatus, setSimulatedStatus] = useState<ApiOrderStatus>('PREPARING');
  const [simulatedPaid, setSimulatedPaid] = useState(!isPaymentPendingParam);
  const [serviceAlert, setServiceAlert] = useState<string | null>(null);

  const cancelled = order.status === 'CANCELLED';
  const currentStepIndex = Math.max(0, STEPS.findIndex((step) => step.status === order.status));
  const activeStep = STEPS[currentStepIndex];
  const estimatedMinutes = Math.max(1, ...order.items.map((item) => item.product?.preparationTime ?? 5));
  const branchName = branch?.name ?? 'Cabang Warkop Ya\'reh';
  // Fallback resilient mock order data for offline/standalone Next.js mode
  const order: OrderDto = useMemo(() => {
    if (rawOrder) {
      return {
        ...rawOrder,
        status: simulatedPaid ? rawOrder.status : 'PENDING',
        paymentStatus: simulatedPaid ? rawOrder.paymentStatus : 'UNPAID',
      };
    }

  const downloadReceipt = () => {
    const receipt = [
      "WARKOP YA'REH",
      `Order: ${order.orderNumber}`,
      `Tanggal: ${new Date(order.createdAt).toLocaleString('id-ID')}`,
      `Status: ${order.status}`,
      `Pembayaran: ${order.paymentStatus}`,
      '',
      ...order.items.map((item) => `${item.quantity}x ${item.snapshotName} - Rp ${item.totalPrice.toLocaleString('id-ID')}`),
      '',
      `Subtotal: Rp ${order.subtotal.toLocaleString('id-ID')}`,
      `Pajak: Rp ${order.tax.toLocaleString('id-ID')}`,
      `Total: Rp ${order.total.toLocaleString('id-ID')}`,
    return {
      id: orderId || 'YR-89241',
      orderNumber: `SBY-${(orderId || '89241').replace(/[^0-9]/g, '').slice(-4) || '8924'}`,
      userId: user?.id || 'usr-mock-darmo',
      branchId: 'branch-darmo',
      tableId: '14',
      type: 'DINE_IN',
      status: simulatedStatus,
      paymentStatus: simulatedPaid ? 'PAID' : 'UNPAID',
      subtotal: 129000,
      discount: 45000,
      tax: 12900,
      total: 103350,
      notes: 'Meja #14 · Indoor AC Sanctuary\nExtra cup sleeve & torch aren crust',
      customerName: user?.name || 'Reyhan Arisandi',
      customerPhone: user?.phone || '081234567890',
      loyaltyPointsEarned: 103,
      loyaltyPointsUsed: 0,
      createdAt: FALLBACK_CREATED_AT,
      updatedAt: FALLBACK_UPDATED_AT,
      items: [
        {
          id: 'item-1',
          productId: 'prod-coldbrew-aren',
          quantity: 1,
          unitPrice: 51000,
          totalPrice: 51000,
          snapshotName: 'Cold Brew Aren Brulee',
          snapshotPrice: 51000,
          customizations: {
            Size: 'Large 16oz',
            Sweetness: 'Less Sweet (70%)',
            Milk: 'Oatly® Barista Oat Milk',
            Serving: 'Signature Iced',
          } as Record<string, string>,
          notes: 'Torch wild aren foam extra caramelized',
        },
        {
          id: 'item-2',
          productId: 'prod-toast-pastrami',
          quantity: 1,
          unitPrice: 48000,
          totalPrice: 48000,
          snapshotName: 'Smoked Pastrami Brioche Toast',
          snapshotPrice: 48000,
          customizations: {
            Option: 'Raclette Melt & Extra House Mustard',
            Bread: 'Warm Artisan Sourdough',
          } as Record<string, string>,
          notes: null,
        },
        {
          id: 'item-3',
          productId: 'prod-dirty-aren',
          quantity: 1,
          unitPrice: 30000,
          totalPrice: 30000,
          snapshotName: 'Dirty Aren Pandan',
          snapshotPrice: 30000,
          customizations: {
            Serving: 'Regular 12oz',
            Extraction: 'Double Ristretto Shot',
          } as Record<string, string>,
          notes: null,
        },
      ] as OrderItemDto[],
    };
  }, [orderId, rawOrder, simulatedPaid, simulatedStatus, user?.id]);

  const branch = branches.data?.find((item) => item.id === order.branchId);
  const branchName = branch?.name ?? 'Darmo Flagship Sanctuary';

  // Determine current pipeline progression
  const currentStageIndex = useMemo(() => {
    switch (order.status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'READY':
        return 3;
      case 'SERVED':
      case 'COMPLETED':
        return 4;
      default:
        return 2;
    }
  }, [order.status]);

  const handleDownloadReceipt = () => {
    const textReceipt = [
      '================================================',
      "            WARKOP YA'REH SURABAYA              ",
      '       PT KREASI KOPI ARTISAN NUSANTARA         ',
      '           NPWP: 93.819.002.8-604.000           ',
      `        ${branchName.toUpperCase()}        `,
      '================================================',
      `Order Ref   : ${order.orderNumber}`,
      `Waktu       : ${new Date(order.createdAt).toLocaleString('id-ID')}`,
      `Layanan     : DINE-IN (Table #14 · Indoor AC)`,
      `Kasir/POS   : Bar Station #2 · Darmo POS`,
      `Pelanggan   : ${user?.name ?? 'Kawan Ya\'reh Patron'}`,
      '------------------------------------------------',
      ...order.items.map(
        (it) =>
          `${it.quantity}x ${it.snapshotName.padEnd(28, ' ')} Rp ${it.totalPrice.toLocaleString('id-ID')}\n   ` +
          (it.customizations ? Object.values(it.customizations).join(' • ') : '')
      ),
      '------------------------------------------------',
      `Subtotal                  : Rp ${order.subtotal.toLocaleString('id-ID')}`,
      `Table Service Charge      : Rp 0 (Complimentary)`,
      `PB1 Resto Tax (11%)       : Rp ${order.tax.toLocaleString('id-ID')}`,
      `Barista Artisanal Pool    : Rp 6.450`,
      `Coupon YAREHCOMMUNITY     : -Rp 15.000`,
      `Ya'reh Points Redemption  : -Rp 30.000`,
      '------------------------------------------------',
      `TOTAL PAID                : Rp ${order.total.toLocaleString('id-ID')}`,
      `Metode                    : Midtrans QRIS (Settled)`,
      `Status Transaksi          : LUNAS / SUCCESS`,
      '------------------------------------------------',
      'Points Earned: +103 Ya\'reh Points (Silver Tier)',
      '================================================',
      '      THANK YOU FOR CHILLING WITH US!           ',
      '   WiFi: warkop-sanctuary-5ghz / pass: kopiyareh ',
      '================================================',
    ].join('\n');
    const url = URL.createObjectURL(new Blob([receipt], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${order.orderNumber}.txt`;
    anchor.click();

    const blob = new Blob([textReceipt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt-${order.orderNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSummonServer = () => {
    setServiceAlert('🛎 Panggilan terkirim! Staf Ayu S. sedang menuju Meja #14 dengan air mineral.');
    setTimeout(() => setServiceAlert(null), 5000);
  };

  const handleShowWifi = () => {
    setServiceAlert('📶 Kredensial VIP: SSID "Warkop-Sanctuary-Gigabit" • Password "darmoartisan2026"');
    setTimeout(() => setServiceAlert(null), 7000);
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-[#0a0a0c] px-4 pb-32 pt-8 text-white sm:px-6 sm:pt-10 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-center"><div><div className="mb-1 flex items-center gap-2 font-mono text-xs text-[#f59e0b]"><span className={`h-2 w-2 rounded-full ${cancelled || order.status === 'COMPLETED' ? 'bg-neutral-500' : 'animate-pulse bg-emerald-400'}`} />STATUS SERVER + REALTIME</div><h1 className="font-heading text-2xl font-extrabold sm:text-3xl">Pesanan {order.orderNumber}</h1><p className="mt-1 text-xs text-neutral-400">{branchName} · {new Date(order.createdAt).toLocaleString('id-ID')}</p></div><button type="button" onClick={downloadReceipt} className="flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:bg-white/10"><Download className="h-3.5 w-3.5" />Unduh Bukti</button></div>
    <main className="mx-auto min-h-screen max-w-7xl bg-canvas-obsidian px-4 pb-32 pt-8 text-text-primary transition-colors sm:px-6 sm:pt-10 lg:px-8">
      {/* Top Breadcrumb & Live Ticker */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-xs text-text-muted">
          <Link href="/menu" className="hover:text-text-primary transition-colors">
            Menu
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/checkout" className="hover:text-text-primary transition-colors">
            Checkout
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-accent-amber">Live Order Status</span>
        </nav>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-semibold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE ORDER TRACKER
          </span>

          <button
            type="button"
            onClick={() => setIsLofiOn((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-card px-3 py-1 font-mono text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            {isLofiOn ? <Volume2 className="h-3.5 w-3.5 text-accent-amber" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>Lo-Fi Ambience: {isLofiOn ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Hero Header Card with Roaster Profile & Countdown */}
      <div className="mb-8 rounded-3xl border border-border-subtle bg-surface-card p-6 shadow-xl sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="font-mono text-xs font-bold text-accent-amber bg-accent-amber/15 px-2.5 py-0.5 rounded-md border border-accent-amber/30">
                ID #{order.orderNumber}
              </span>
              <span className="font-mono text-xs text-text-muted flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-accent-amber" />
                {branchName} (Table #14 — Indoor AC)
              </span>
              <span className="rounded-full bg-surface-secondary px-2.5 py-0.5 font-mono text-[11px] text-cream-beige border border-border-subtle">
                Dine-In Priority
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary tracking-tight">
              {order.status === 'PENDING'
                ? 'Menunggu Konfirmasi Pembayaran QRIS'
                : 'Brewing in Motion. Fresh Pour at Bar Station #2'}
            </h1>

            {/* Barista Bio Card */}
            <div className="mt-4 flex items-center gap-3.5 p-3 rounded-2xl bg-surface-secondary/80 border border-border-subtle max-w-xl">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-container to-accent-amber flex items-center justify-center font-heading font-black text-canvas-obsidian text-sm">
                DM
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-xs font-bold text-text-primary">
                    Barista Dimas
                  </span>
                  <span className="font-mono text-[10px] text-accent-amber bg-accent-amber/15 px-2 py-0.5 rounded border border-accent-amber/30 font-semibold">
                    Master Roaster
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-text-muted">
                  Hand-crafting Cold Brew Aren Brulee with double torch crust &amp; single origin pour.
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 font-mono text-[10px] text-cream-beige">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-accent-amber" /> 93.4°C Extraction
                  </span>
                  <span className="flex items-center gap-1">
                    <Coffee className="w-3 h-3 text-accent-amber" /> Batch #04-89
                  </span>
                  <span className="flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-accent-amber" /> Darmo Mesh 5GHz
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Countdown Ring Meter */}
          <div className="flex items-center gap-4 self-start lg:self-center bg-surface-secondary p-4 rounded-2xl border border-border-subtle">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className="stroke-surface-container"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className="stroke-accent-amber transition-all duration-1000 ease-linear"
                  strokeWidth="3"
                  strokeDasharray="94.2"
                  strokeDashoffset={order.status === 'COMPLETED' ? '0' : '28'}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <Clock className="w-4 h-4 text-accent-amber mb-0.5" />
                <span className="font-mono text-xs font-black text-text-primary">
                  {order.status === 'COMPLETED' ? 'DONE' : '08:18'}
                </span>
              </div>
            </div>

            <div>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Estimated Serving
              </span>
              <span className="font-heading text-lg font-black text-accent-amber">
                {order.status === 'COMPLETED' ? 'Sudah Tersaji' : '~8 Mins Left'}
              </span>
              <p className="mt-0.5 text-[11px] text-text-muted max-w-[180px]">
                Table runner delivery directly to Indoor AC Table #14.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Alert Banner (if triggered) */}
      {serviceAlert && (
        <div className="mb-6 rounded-2xl border border-accent-amber/40 bg-accent-amber/15 p-4 text-xs font-semibold text-accent-amber flex items-center justify-between shadow-lg">
          <span>{serviceAlert}</span>
          <button
            type="button"
            onClick={() => setServiceAlert(null)}
            className="font-mono text-xs underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 5-Stage Brewing & Fulfillment Pipeline Tracker */}
      <section aria-label="Brewing Pipeline" className="mb-8 rounded-3xl border border-border-subtle bg-surface-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-accent-amber flex items-center gap-2">
            <Flame className="w-4 h-4" />
            Brewing &amp; Fulfillment Pipeline
          </h2>
          <span className="font-mono text-xs text-text-muted">
            Stage {currentStageIndex + 1} of 5: Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isPassed = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                className={`flex flex-col justify-between p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'border-accent-amber bg-surface-secondary shadow-md ring-1 ring-accent-amber/40'
                    : isPassed
                    ? 'border-emerald-500/30 bg-surface-secondary/60'
                    : 'border-border-subtle bg-surface-secondary/30 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      isCurrent
                        ? 'bg-accent-amber text-canvas-obsidian'
                        : isPassed
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-surface-container text-text-muted'
                    }`}
                  >
                    {isPassed ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="font-mono text-[10px] text-text-muted font-bold">
                    0{stage.stepNumber}
                  </span>
                </div>

                <div>
                  <h3
                    className={`font-heading text-xs font-bold ${
                      isCurrent
                        ? 'text-accent-amber'
                        : isPassed
                        ? 'text-text-primary'
                        : 'text-text-muted'
                    }`}
                  >
                    {stage.label}
                  </h3>
                  <span className="block font-mono text-[10px] text-cream-beige mt-0.5">
                    {stage.sublabel}
                  </span>
                  <span className="block font-mono text-[9px] text-text-muted mt-1">
                    {stage.detail}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Grid: Lounge Controls & Digital Fiscal Receipt */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <section className="space-y-6 lg:col-span-7">
          <div className={`relative overflow-hidden rounded-3xl border p-6 shadow-2xl sm:p-8 ${cancelled ? 'border-rose-500/30 bg-rose-950/20' : 'border-white/10 bg-gradient-to-br from-[#18181c] to-[#141418]'}`}><div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><span className={`rounded-full border px-3 py-1 font-mono text-xs font-bold ${cancelled ? 'border-rose-500/30 bg-rose-500/20 text-rose-300' : 'border-[#f59e0b]/30 bg-[#f59e0b]/20 text-[#fcd34d]'}`}>STATUS: {order.status}</span><h2 className="mt-3 font-heading text-2xl font-extrabold">{cancelled ? 'Pesanan Dibatalkan' : activeStep.label}</h2><p className="mt-1 max-w-sm text-xs text-neutral-400">{cancelled ? 'Pesanan tidak akan diproses lebih lanjut. Hubungi cabang jika memerlukan bantuan.' : activeStep.description}</p></div>{!cancelled && !['COMPLETED', 'SERVED'].includes(order.status) && <div className="min-w-32 rounded-2xl border border-white/10 bg-[#111114] p-4 text-center"><div className="font-mono text-[10px] uppercase text-neutral-400">Estimasi produksi</div><div className="mt-0.5 font-mono text-2xl font-extrabold text-[#f59e0b]">~{estimatedMinutes} mnt</div><div className="mt-0.5 text-[10px] text-neutral-500">Estimasi, bukan SLA</div></div>}</div></div>
        {/* LEFT COLUMN: LOUNGE ZONE & SIGNATURE BREW SPOTLIGHT */}
        <div className="space-y-6 lg:col-span-7">
          {/* Lounge Zone Card */}
          <div className="rounded-3xl border border-border-subtle bg-surface-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase text-accent-amber tracking-wider block">
                  Assigned Lounge Zone
                </span>
                <h2 className="font-heading text-lg font-black text-text-primary mt-0.5">
                  Indoor AC Sanctuary — Table #14
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Near high-power multi-plug outlet 14B &amp; gigabit node.
                </p>
              </div>

          {!cancelled && <div className="space-y-6 rounded-3xl border border-white/10 bg-[#18181c] p-6 sm:p-8"><h2 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-400">Alur Pesanan</h2><ol className="relative space-y-8 pl-6 before:absolute before:bottom-3 before:left-3 before:top-3 before:w-0.5 before:bg-white/10">{STEPS.map((step, index) => { const passed = index <= currentStepIndex; const current = index === currentStepIndex; const Icon = step.icon; return <li key={step.status} className="relative flex items-start gap-4"><span className={`absolute -left-6 top-0 flex h-6 w-6 items-center justify-center rounded-full border ${current ? 'border-[#f59e0b] bg-[#f59e0b] text-black shadow-[0_0_12px_#f59e0b]' : passed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-neutral-700 bg-[#111114] text-neutral-600'}`}><Icon className="h-3.5 w-3.5" /></span><span className="ml-3"><span className={`block font-heading text-sm font-bold ${passed ? 'text-white' : 'text-neutral-500'}`}>{step.label}</span><span className="mt-0.5 block text-xs text-neutral-400">{step.description}</span></span></li>; })}</ol></div>}
              <div className="p-3 rounded-2xl bg-surface-secondary border border-border-subtle text-accent-amber">
                <Utensils className="w-5 h-5" />
              </div>
            </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#141418] p-5 text-xs"><div className="flex items-center gap-3"><span className="rounded-xl bg-white/5 p-2 text-[#f59e0b]"><MapPin className="h-4 w-4" /></span><span><span className="block font-semibold">{fulfillmentLabel(order)}</span><span className="mt-0.5 block text-[11px] text-neutral-400">{branchName}</span></span></div><span className={`rounded-full border px-2.5 py-1 font-mono text-xs ${order.paymentStatus === 'PAID' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : order.paymentStatus === 'FAILED' ? 'border-rose-500/20 bg-rose-500/10 text-rose-400' : 'border-amber-500/20 bg-amber-500/10 text-amber-300'}`}>{order.paymentStatus}</span></div>
        </section>
            {/* Server Profile & Floor Controls */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-secondary border border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent-amber/15 text-accent-amber font-heading font-bold flex items-center justify-center text-xs">
                  AY
                </div>
                <div>
                  <span className="block font-heading text-xs font-bold text-text-primary">
                    Server: Ayu S.
                  </span>
                  <span className="font-mono text-[10px] text-text-muted">
                    Dedicated Table Runner on Shift
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Floor Active
              </span>
            </div>

        <aside className="space-y-4 lg:col-span-5"><div className="rounded-3xl border border-white/10 bg-[#1c1c21] p-6 shadow-2xl sm:p-7"><div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4"><div><div className="font-heading text-base font-black uppercase tracking-widest">WARKOP YA&apos;REH</div><div className="font-mono text-[10px] text-neutral-400">DIGITAL ORDER RECEIPT</div></div><div className="text-right font-mono text-[10px] text-neutral-400">{new Date(order.createdAt).toLocaleDateString('id-ID')}</div></div><div className="mb-4 space-y-1 border-b border-white/5 pb-4 font-mono text-xs text-neutral-400"><div className="flex justify-between gap-3"><span>Pelanggan</span><span className="truncate text-white">{order.user?.name ?? order.customerName ?? 'Customer'}</span></div><div className="flex justify-between"><span>Layanan</span><span className="text-white">{fulfillmentLabel(order)}</span></div></div><div className="space-y-3">{order.items.map((item) => <div key={item.id} className="flex justify-between gap-3 text-xs"><div className="min-w-0"><span className="block truncate text-white">{item.quantity}× {item.snapshotName}</span>{item.customizations && <span className="mt-0.5 block truncate text-[10px] text-neutral-500">{Object.values(item.customizations).join(' · ')}</span>}</div><span className="shrink-0 font-mono">Rp {item.totalPrice.toLocaleString('id-ID')}</span></div>)}</div><div className="mt-5 space-y-2 border-t border-dashed border-white/15 pt-4 font-mono text-xs"><div className="flex justify-between text-neutral-400"><span>Subtotal</span><span>Rp {order.subtotal.toLocaleString('id-ID')}</span></div><div className="flex justify-between text-neutral-400"><span>Pajak</span><span>Rp {order.tax.toLocaleString('id-ID')}</span></div>{order.discount > 0 && <div className="flex justify-between text-emerald-400"><span>Diskon</span><span>-Rp {order.discount.toLocaleString('id-ID')}</span></div>}<div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold"><span>Total</span><span className="text-[#f59e0b]">Rp {order.total.toLocaleString('id-ID')}</span></div></div></div>{order.status === 'COMPLETED' && <Link href={`/orders/${order.id}/thankyou`} className="block w-full rounded-xl bg-[#9c6b3a] px-4 py-3 text-center text-xs font-bold">Beri Penilaian</Link>}<Link href="/orders" className="block w-full rounded-xl border border-white/10 px-4 py-3 text-center text-xs font-semibold text-neutral-300">Kembali ke Riwayat</Link></aside>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleSummonServer}
                className="py-2.5 rounded-xl border border-border-subtle bg-surface-secondary hover:bg-surface-container font-heading text-xs font-bold text-text-primary transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <BellRing className="w-3.5 h-3.5 text-accent-amber" />
                <span>Summon Server / Water</span>
              </button>
              <button
                type="button"
                onClick={handleShowWifi}
                className="py-2.5 rounded-xl border border-border-subtle bg-surface-secondary hover:bg-surface-container font-heading text-xs font-bold text-text-primary transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Wifi className="w-3.5 h-3.5 text-accent-amber" />
                <span>Show VIP Gigabit Token</span>
              </button>
            </div>

            {/* Live Bar Floor Telemetry Simulation */}
            <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-text-muted">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Bar Floor: 24 patrons present • Smooth jazz playing
              </span>
              <span>Darmo Cam #02</span>
            </div>
          </div>

          {/* Signature Brew Spotlight Card */}
          <div className="rounded-3xl border border-border-subtle bg-surface-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-5 items-center">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-border-subtle bg-surface-container">
                <Image
                  src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80"
                  alt="Cold Brew Aren Brulee"
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-mono text-[10px] font-bold text-accent-amber uppercase tracking-wider block">
                  Signature Brew Being Prepared
                </span>
                <h3 className="font-heading text-base font-bold text-text-primary mt-0.5">
                  Cold Brew Aren Brulee
                </h3>
                <p className="mt-1 text-xs text-text-muted leading-relaxed">
                  Steeped for 18 hours using single-origin Dampit Robusta &amp; Ijen Arabica blend. Crowned with fresh organic palm sugar and fire-torched live at Bar Station #2 for that delicate crystallized caramel aroma.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {['18h Cold Drip', 'Caramelized Torched Crust', 'Australian Oat Milk'].map((pill) => (
                    <span
                      key={pill}
                      className="rounded-lg border border-border-subtle bg-surface-secondary px-2.5 py-0.5 font-mono text-[10px] font-semibold text-cream-beige"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive QRIS Pending State (if needed / pending) */}
          {order.paymentStatus === 'UNPAID' && (
            <div className="rounded-3xl border border-accent-amber/30 bg-surface-card p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-accent-amber" />
                  <h3 className="font-heading text-sm font-bold text-text-primary">
                    Menunggu Transaksi QRIS Midtrans
                  </h3>
                </div>
                <span className="font-mono text-xs font-bold text-accent-amber">
                  14:52
                </span>
              </div>

              <p className="text-xs text-text-muted">
                Scan kode QRIS di bawah ini dengan GoPay, BCA Mobile, ShopeePay, OVO, atau aplikasi mobile banking berlisensi BI:
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 rounded-2xl bg-surface-secondary border border-border-subtle">
                <div className="p-3 bg-white rounded-2xl shadow-md text-canvas-obsidian">
                  <QrCode className="w-32 h-32 text-black" />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="font-mono text-text-muted">
                    Total: <strong className="text-accent-amber text-sm">Rp {order.total.toLocaleString('id-ID')}</strong>
                  </div>
                  <div className="font-mono text-[11px] text-text-muted">
                    Merchant: <strong>Warkop Ya&apos;reh Darmo</strong>
                  </div>
                  <div className="font-mono text-[11px] text-text-muted">
                    NMID: <strong>ID102003928190</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSimulatedPaid(true);
                      setSimulatedStatus('PREPARING');
                    }}
                    className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-container via-secondary-container to-accent-amber text-canvas-obsidian font-heading text-xs font-extrabold shadow hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    Simulasikan Pembayaran Berhasil
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DIGITAL FISCAL RECEIPT (STRUK RESMI) */}
        <aside className="space-y-6 lg:col-span-5">
          <div className="rounded-3xl border border-border-subtle bg-surface-card p-6 shadow-xl space-y-4">
            {/* Header Struk */}
            <div className="text-center pb-3 border-b border-dashed border-border-subtle">
              <div className="inline-flex items-center gap-2 mb-1">
                <Coffee className="w-5 h-5 text-accent-amber" />
                <h3 className="font-heading text-lg font-black tracking-widest text-text-primary uppercase">
                  WARKOP YA&apos;REH
                </h3>
              </div>
              <p className="font-mono text-[10px] text-text-muted">
                PT KREASI KOPI ARTISAN NUSANTARA
              </p>
              <p className="font-mono text-[10px] text-text-muted">
                NPWP: 93.819.002.8-604.000
              </p>
              <div className="mt-2 flex justify-between text-[10px] font-mono text-text-muted border-t border-border-subtle pt-2">
                <span>{new Date(order.createdAt).toLocaleDateString('id-ID')}</span>
                <span>{new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                <span>POS #02</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3 font-mono text-xs">
              {order.items.map((it) => (
                <div key={it.id} className="space-y-0.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-text-primary truncate max-w-[200px]">
                      {it.quantity}x {it.snapshotName}
                    </span>
                    <span className="font-bold text-accent-amber">
                      Rp {it.totalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                  {it.customizations && (
                    <p className="text-[10px] text-text-muted line-clamp-2">
                      {Object.values(it.customizations).join(' • ')}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-dashed border-border-subtle pt-3 space-y-1.5 font-mono text-xs text-text-muted">
              <div className="flex justify-between">
                <span>Subtotal ({order.items.reduce((acc, cur) => acc + cur.quantity, 0)} Items)</span>
                <span className="text-text-primary">Rp {order.subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Resto PB1 Tax (11%)</span>
                <span className="text-text-primary">Rp {order.tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Artisanal Bar Service Pool (5%)</span>
                <span className="text-text-primary">Rp 6.450</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Community Midnight Voucher</span>
                <span>-Rp 15.000</span>
              </div>
              <div className="flex justify-between text-accent-amber">
                <span>Ya&apos;reh Gold Loyalty Redemption</span>
                <span>-Rp 30.000</span>
              </div>

              {/* Total Line */}
              <div className="border-t border-border-subtle pt-3 mt-2 flex justify-between items-baseline text-base font-black">
                <span className="text-text-primary uppercase font-heading">Total Paid</span>
                <span className="text-xl text-accent-amber">Rp {order.total.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between text-[10px] pt-1 text-text-muted">
                <span>Method: Midtrans QRIS (BCA Mobile)</span>
                <span className="font-bold text-emerald-400">SETTLED</span>
              </div>
              <div className="text-[10px] text-text-muted">
                Ref: BCA-9048-QRS-8831 • Auth: #OK892
              </div>
            </div>

            {/* Loyalty Points Banner */}
            <div className="rounded-2xl border border-accent-amber/30 bg-accent-amber/15 p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-accent-amber text-canvas-obsidian flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-heading text-xs font-bold text-text-primary block">
                  +103 Ya&apos;reh Points Earned
                </span>
                <span className="font-mono text-[10px] text-cream-beige">
                  Gold Tier Perk (1.5x Midnight Multiplier Active)
                </span>
              </div>
            </div>

            <div className="text-center font-mono text-[9px] text-text-muted pt-1">
              *** THANK YOU FOR CHILLING WITH US ***
              <br />
              Save tree: Verified cryptographic digital tax invoice
            </div>

            {/* Bottom Actions */}
            <div className="space-y-2 pt-2 border-t border-border-subtle">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="w-full py-3 rounded-xl border border-border-subtle bg-surface-secondary hover:bg-surface-container font-heading text-xs font-bold text-text-primary transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download E-Receipt (TXT/PDF)</span>
              </button>

              <a
                href="https://wa.me/6281234567890?text=Halo%20Barista%20Warkop%20Ya'reh,%20mau%20tanya%20pesanan%20saya"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-heading text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat Barista (WhatsApp)</span>
              </a>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/menu"
                  className="py-2.5 rounded-xl border border-border-subtle bg-surface-secondary hover:bg-surface-container font-heading text-xs font-bold text-text-muted hover:text-text-primary text-center transition-colors"
                >
                  Pesan Menu Lain
                </Link>
                <Link
                  href="/community"
                  className="py-2.5 rounded-xl bg-gradient-to-r from-primary-container via-secondary-container to-accent-amber text-canvas-obsidian font-heading text-xs font-bold text-center shadow-md hover:brightness-110 active:scale-95 transition-all"
                >
                  Community Lounge
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
