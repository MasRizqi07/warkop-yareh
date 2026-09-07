'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import {
  AlertCircle,
  BellRing,
  CheckCircle2,
  Clock,
  Coffee,
  Download,
  Flame,
  HelpCircle,
  Laptop,
  MapPin,
  Printer,
  QrCode,
  Receipt,
  RotateCcw,
  Sparkles,
  UserCheck,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import { Button } from '@warkop-yareh/ui';
import { useOrder } from './orders.hooks';
import { initializePayment } from './orders.api';
import { DataState, LoadingState } from '@/components/data-state';
import { useBranches } from '@/features/catalog/catalog.hooks';
import { getApiErrorMessage } from '@/lib/api-error';
import { downloadText } from '@/lib/download';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiOrderStatus } from '@/features/api/contracts';
import { assertPaymentRedirect } from './payment-navigation';
import { soundEffects } from '@/lib/audioAlerts';

const PIPELINE_STEPS = [
  { key: 'PENDING', label: '1. Diterima', desc: 'Sistem memverifikasi', icon: Clock },
  { key: 'CONFIRMED', label: '2. Antrean Bar', desc: 'Tiket dicetak KDS', icon: Receipt },
  { key: 'PREPARING', label: '3. Ekstraksi Aktif', desc: 'Barista sedang meracik', icon: Coffee },
  { key: 'READY', label: '4. Cek Kualitas', desc: 'Sensory pass siap', icon: Sparkles },
  { key: 'COMPLETED', label: '5. Siap Di Meja', desc: 'Disajikan hangat', icon: CheckCircle2 },
];

const rupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const initialized = useAuthStore((s) => s.isInitialized);
  const authenticated = useAuthStore((s) => s.isAuthenticated);
  const query = useOrder(orderId, initialized && authenticated);
  const branches = useBranches();
  const [notice, setNotice] = useState('');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(504); // 08:24

  const order = query.data;
  const branch = branches.data?.find((b) => b.id === order?.branchId);

  // Live countdown timer for active preparation
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const payment = useMutation({
    mutationFn: async () => {
      if (!order) throw new Error('Pesanan belum dimuat.');
      const result = await initializePayment(order.id, order.payment?.method ?? 'QRIS');
      window.location.assign(assertPaymentRedirect(result.redirectUrl));
    },
  });

  const waiter = useMutation({
    mutationFn: async () => {
      if (!order?.tableId) throw new Error('Pesanan tidak terhubung ke meja.');
      await api.post(`/tables/${encodeURIComponent(order.tableId)}/call`, { type: 'CALL_WAITER' });
    },
    onSuccess: () => {
      soundEffects.playKdsBell();
      setNotice('Permintaan pelayan terkirim. Barista on-duty segera menghampiri meja Anda.');
      setTimeout(() => setNotice(''), 5000);
    },
  });

  const currentStepIndex = order
    ? order.status === 'COMPLETED' || order.status === 'SERVED'
      ? 4
      : order.status === 'READY'
      ? 3
      : order.status === 'PREPARING'
      ? 2
      : order.status === 'CONFIRMED'
      ? 1
      : 0
    : 2; // default active brewing for simulated/preview view

  const handleDownloadReceipt = () => {
    if (!order) return;
    const lines = [
      '==========================================',
      "          WARKOP YA'REH SURABAYA          ",
      '       Specialty Coffee & Tech Sanctuary   ',
      '==========================================',
      `Cabang: ${branch?.name ?? 'Darmo Flagship'}`,
      `Order ID: #${order.orderNumber}`,
      `Tanggal: ${new Date(order.createdAt).toLocaleString('id-ID')}`,
      `Status: ${order.status} (${order.paymentStatus})`,
      '------------------------------------------',
      ...order.items.map(
        (item) => `${item.quantity}x ${item.snapshotName.padEnd(25)} ${rupiah(item.totalPrice)}`
      ),
      '------------------------------------------',
      `Subtotal:      ${rupiah(order.subtotal)}`,
      `Pajak PB1 10%: ${rupiah(order.tax)}`,
      `Service Fee:   ${rupiah(order.serviceFee)}`,
      `Diskon:        -${rupiah(order.discount)}`,
      '==========================================',
      `TOTAL:         ${rupiah(order.total)}`,
      '==========================================',
      '       TERIMA KASIH ATAS KUNJUNGANNYA     ',
      '      WiFi Password: "sanctuarycoffee"    ',
      '==========================================',
    ];
    downloadText(`struk-${order.orderNumber}.txt`, lines.join('\n'));
    soundEffects.playSuccessChime();
  };

  return (
    <main className="w-full min-h-screen bg-canvas-obsidian text-on-surface antialiased pb-32 pt-8">
      {/* Background Mesh */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-mesh opacity-30" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Context & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="text-xs font-mono text-text-muted hover:text-text-primary transition-colors flex items-center gap-1"
            >
              <span>← Riwayat Pesanan</span>
            </Link>
            <span className="text-text-muted">/</span>
            <span className="font-mono text-xs text-accent-amber font-bold">
              Live Cockpit
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void query.refetch()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-border-subtle hover:border-accent-amber/40 text-xs font-mono text-text-muted hover:text-text-primary transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh Status</span>
            </button>
            <button
              type="button"
              onClick={() => setIsReceiptModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-border-subtle hover:border-accent-amber/40 text-xs font-mono text-cream-beige font-semibold transition-all"
            >
              <Receipt className="w-3.5 h-3.5 text-accent-amber" />
              <span>Lihat Struk Digital</span>
            </button>
          </div>
        </div>

        {/* Master Live Header Banner */}
        <section className="bg-surface-card p-6 sm:p-8 rounded-3xl border border-border-subtle shadow-2xl space-y-6 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 bg-accent-amber/10 rounded-full blur-3xl" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* Order Code & Active Barista */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-surface-secondary px-3 py-1 rounded-md font-mono text-xs text-accent-amber font-bold border border-border-subtle">
                  #{order?.orderNumber ?? (orderId ? `YR-${orderId}` : 'YR-8921-VIP')}
                </span>
                <span className="font-mono text-xs text-text-muted">
                  • {branch?.name ?? 'Darmo Flagship Sanctuary'}
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                Seduhan Kopi Anda Sedang Diproses
              </h1>
              <div className="flex items-center gap-3 pt-1">
                <div className="w-10 h-10 rounded-full bg-brand-coffee/30 border border-accent-amber/40 flex items-center justify-center font-heading font-bold text-accent-amber">
                  DM
                </div>
                <div>
                  <div className="text-xs font-bold text-text-primary">Barista Dimas</div>
                  <div className="text-[11px] text-text-muted font-mono">Head Roaster &amp; Sensory Lead</div>
                </div>
              </div>
            </div>

            {/* Live Extraction Countdown Badge */}
            <div className="flex flex-col sm:items-end gap-1 bg-surface-secondary/80 p-4 rounded-2xl border border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-amber opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-amber" />
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-accent-amber font-bold">
                  LIVE EXTRACTION ACTIVE
                </span>
              </div>
              <div className="font-heading text-3xl sm:text-4xl font-black text-text-primary tracking-tight font-mono">
                {formatCountdown(secondsRemaining)}
              </div>
              <span className="text-[11px] text-text-muted font-mono">Estimasi pesanan tiba di meja</span>
            </div>
          </div>

          {/* 5-Step Horizontal Animated Pipeline */}
          <div className="pt-6 border-t border-border-subtle space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {PIPELINE_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isActive = idx === currentStepIndex;
                const Icon = step.icon;

                return (
                  <div
                    key={step.key}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2 ${
                      isActive
                        ? 'border-accent-amber bg-accent-amber/15 shadow-md ring-1 ring-accent-amber'
                        : isCompleted
                        ? 'border-emerald-500/40 bg-emerald-950/20'
                        : 'border-border-subtle bg-surface-secondary opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon
                        className={`w-5 h-5 ${
                          isActive
                            ? 'text-accent-amber animate-pulse'
                            : isCompleted
                            ? 'text-emerald-400'
                            : 'text-text-muted'
                        }`}
                      />
                      {isCompleted && (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">Done</span>
                      )}
                      {isActive && (
                        <span className="text-[10px] font-mono text-accent-amber font-bold animate-pulse">
                          Active
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-xs text-text-primary">{step.label}</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bento Grid: Table Zone, Summon Barista, Simulated Stream & Fast Lane Pass */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Assigned Table & Zone (4 cols) */}
          <div className="md:col-span-4 bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-accent-amber uppercase tracking-wider font-bold bg-accent-amber/15 px-2.5 py-0.5 rounded">
                  Assigned Zone
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary">
                {order?.tableId ? `Meja #${order.tableId}` : 'Meja #14 • Indoor AC'}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Darmo Floor 1 Quiet Work Zone. Pesanan akan diantarkan langsung ke meja Anda tanpa perlu antre ke counter.
              </p>
            </div>

            {/* Interactive Summon Server Button */}
            <div className="pt-4 border-t border-border-subtle space-y-2">
              <button
                type="button"
                onClick={() => waiter.mutate()}
                disabled={waiter.isPending}
                className="w-full py-3 rounded-xl bg-surface-secondary hover:bg-surface-container-high text-xs font-semibold text-text-primary border border-border-subtle hover:border-accent-amber/40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <BellRing className="w-4 h-4 text-accent-amber" />
                <span>{waiter.isPending ? 'Memanggil...' : 'Panggil Staf / Minta Air'}</span>
              </button>
              {notice && <p className="text-[11px] text-emerald-400 font-mono text-center">{notice}</p>}
            </div>
          </div>

          {/* Card 2: Simulated Live Stream Barista Camera (4 cols) */}
          <div className="md:col-span-4 bg-surface-card rounded-2xl border border-border-subtle shadow-xl overflow-hidden flex flex-col justify-between">
            <div className="relative h-44 w-full bg-surface-secondary">
              <Image
                src="/images/darmo-interior.png"
                alt="Live Barista Cam Stream"
                fill
                className="object-cover opacity-80"
                sizes="(max-width: 768px) 100vw, 350px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-canvas-obsidian via-transparent to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 font-mono text-[10px]">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-white font-bold uppercase tracking-wider">Barista Cam LIVE</span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-text-muted">
                <span>Station #2 Slow Drip Lab</span>
                <span className="text-emerald-400 font-semibold">1080p 60fps</span>
              </div>
            </div>
            <div className="p-4 space-y-1">
              <h4 className="font-heading font-bold text-xs text-text-primary">
                Transparansi Standar Kebersihan
              </h4>
              <p className="text-[11px] text-text-muted">
                Semua minuman diracik menggunakan filter steril dan air mineral reversed-osmosis berstandar SCA.
              </p>
            </div>
          </div>

          {/* Card 3: Scannable Fast-Lane Pickup Pass (4 cols) */}
          <div className="md:col-span-4 bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-accent-amber uppercase tracking-wider font-bold bg-accent-amber/15 px-2.5 py-0.5 rounded">
                  Fast-Lane Pass
                </span>
                <QrCode className="w-4 h-4 text-text-muted" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary">
                Digital Pass Pengambilan
              </h3>
              <p className="text-xs text-text-muted">
                Tunjukkan barcode ini kepada kasir/barista jika Anda memilih mode Self-Pickup atau Drive-Thru.
              </p>
            </div>

            {/* High-density barcode simulator */}
            <div className="p-3 bg-white rounded-xl text-center space-y-1">
              <div className="flex justify-center items-center gap-1 h-8">
                {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6].map((w, i) => (
                  <div key={i} className="bg-slate-900 h-full" style={{ width: `${(w % 4) + 2}px` }} />
                ))}
              </div>
              <span className="font-mono text-[11px] font-bold text-slate-900 tracking-widest block">
                YR-8921-VIP-2026
              </span>
            </div>
          </div>
        </div>

        {/* Notice for unpaid orders */}
        {order && order.paymentStatus === 'UNPAID' && (
          <section className="bg-surface-card p-6 rounded-2xl border border-accent-amber/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-heading font-bold text-base text-text-primary">
                Selesaikan Pembayaran Pesanan
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Lakukan pembayaran untuk mengonfirmasi pesanan Anda masuk ke antrean barista.
              </p>
            </div>
            <Button
              onClick={() => payment.mutate()}
              disabled={payment.isPending}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-coffee to-secondary-container text-xs font-bold text-text-primary shadow-md hover:scale-105 transition-all"
            >
              {payment.isPending ? 'Menyiapkan...' : `Bayar ${rupiah(order.total)}`}
            </Button>
          </section>
        )}
      </div>

      {/* ══════════════════════════════════════════
          DIGITAL THERMAL RECEIPT MODAL
          ══════════════════════════════════════════ */}
      <AnimatePresence>
        {isReceiptModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 font-mono text-xs relative max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1"
              >
                ✕
              </button>

              {/* Receipt Header */}
              <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-4">
                <h3 className="font-heading font-black text-xl tracking-tight text-slate-900">
                  WARKOP YA&apos;REH
                </h3>
                <p className="text-[11px] text-slate-600">Surabaya Specialty Sanctuary</p>
                <p className="text-[10px] text-slate-500">
                  {branch?.name ?? 'Darmo Flagship'} • 24/7 Ops
                </p>
                <p className="text-[10px] text-slate-500">
                  {new Date().toLocaleString('id-ID')}
                </p>
              </div>

              {/* Order Meta */}
              <div className="space-y-1 text-[11px] text-slate-600 border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-bold text-slate-900">
                    #{order?.orderNumber ?? 'YRH-8921'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir/Barista:</span>
                  <span>Dimas (Shift 2)</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold text-emerald-700">LUNAS (QRIS)</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 border-b border-dashed border-slate-300 pb-4">
                {(order?.items ?? [
                  {
                    id: '1',
                    quantity: 1,
                    snapshotName: 'Cold Brew Aren Brulee',
                    totalPrice: 32000,
                  },
                  {
                    id: '2',
                    quantity: 1,
                    snapshotName: 'Artisan Toasted Sourdough',
                    totalPrice: 28000,
                  },
                ]).map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.snapshotName}
                    </span>
                    <span className="font-bold">{rupiah(item.totalPrice)}</span>
                  </div>
                ))}
              </div>

              {/* Tax & Total */}
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{rupiah(order?.subtotal ?? 60000)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak Restoran PB1 (10%):</span>
                  <span>{rupiah(order?.tax ?? 6000)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Layanan:</span>
                  <span>{rupiah(order?.serviceFee ?? 2000)}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-slate-900 pt-2 border-t border-slate-300">
                  <span>TOTAL:</span>
                  <span>{rupiah(order?.total ?? 68000)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-dashed border-slate-300 flex gap-2">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Struk (.TXT)</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400 text-center">
                WiFi Voucher: <strong>sanctuarycoffee</strong>
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
