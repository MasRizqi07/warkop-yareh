'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  HelpCircle,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  XCircle,
} from 'lucide-react';
import { soundEffects } from '@/lib/audioAlerts';

function PaymentStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('orderNumber') || 'YRH-8921';
  const initialStatus = searchParams.get('status') || 'pending';

  const [activeState, setActiveState] = useState<'pending' | 'expired' | 'failed'>(
    initialStatus === 'expired' ? 'expired' : initialStatus === 'failed' ? 'failed' : 'pending'
  );
  const [timeLeft, setTimeLeft] = useState(299); // 4m 59s
  const [copied, setCopied] = useState(false);
  const [activeGuide, setActiveGuide] = useState<'bca' | 'gopay' | 'shopee' | 'mandiri'>('bca');

  // Countdown timer for pending QRIS
  useEffect(() => {
    if (activeState !== 'pending' || timeLeft <= 0) {
      if (timeLeft <= 0 && activeState === 'pending') {
        setActiveState('expired');
      }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeState, timeLeft]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateSuccess = () => {
    soundEffects.playSuccessChime();
    router.push(`/order/track/${encodeURIComponent(orderId)}`);
  };

  return (
    <main className="w-full min-h-screen bg-canvas-obsidian text-on-surface antialiased pb-28 pt-8">
      {/* State Switcher Test Bar for Demonstration & Verification */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-xl bg-surface-secondary border border-border-subtle text-xs font-mono">
          <span className="text-text-muted flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-accent-amber animate-pulse" />
            Mode Simulasi Status:
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                setActiveState('pending');
                setTimeLeft(299);
              }}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeState === 'pending'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              1. QRIS Pending
            </button>
            <button
              onClick={() => setActiveState('expired')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeState === 'expired'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              2. QRIS Expired
            </button>
            <button
              onClick={() => setActiveState('failed')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeState === 'failed'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              3. Gagal / Declined
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="w-10 h-10 rounded-xl bg-surface-card border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="font-mono text-[10px] text-accent-amber uppercase tracking-widest block font-bold">
                Midtrans Snap Feedback Telemetry
              </span>
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-text-primary">
                {activeState === 'pending'
                  ? 'Menunggu Pembayaran QRIS'
                  : activeState === 'expired'
                  ? 'Sesi QRIS Kedaluwarsa'
                  : 'Pembayaran Tidak Berhasil'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
            <span>ID:</span>
            <button
              onClick={copyOrderId}
              className="flex items-center gap-1 text-accent-amber font-bold hover:underline"
            >
              <span>#{orderId}</span>
              <Copy className="w-3 h-3" />
            </button>
            {copied && <span className="text-emerald-400 text-[10px]">Disalin!</span>}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            STATE 1: QRIS PENDING
            ══════════════════════════════════════════ */}
        {activeState === 'pending' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: Dynamic QRIS Canvas Presentation (7 cols) */}
            <div className="md:col-span-7 bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-amber opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-amber" />
                  </span>
                  <span className="font-mono text-xs text-text-primary font-semibold">
                    Polling Verifikasi Otomatis
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-accent-amber bg-accent-amber/15 px-3 py-1 rounded-full border border-accent-amber/30">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Sisa Waktu {formatTimer(timeLeft)}</span>
                </div>
              </div>

              {/* Official QRIS Container Card */}
              <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-2xl space-y-4 max-w-sm mx-auto">
                {/* Official QRIS Red Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-black text-2xl tracking-tighter text-red-600">
                      QRIS
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                      Standar Pembayaran Nasional
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-semibold text-slate-600">ASPI • GPN</span>
                </div>

                {/* Merchant Name & NMID */}
                <div className="text-center space-y-0.5">
                  <h3 className="font-heading font-extrabold text-sm text-slate-900 tracking-tight">
                    WARKOP YA&apos;REH SURABAYA
                  </h3>
                  <p className="font-mono text-[10px] text-slate-500">NMID: ID1020084920194</p>
                </div>

                {/* Visual QR Code Display */}
                <div className="relative aspect-square w-full max-w-[220px] mx-auto bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-center shadow-inner">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full text-slate-900"
                    fill="currentColor"
                  >
                    {/* Stylized QR Matrix */}
                    <rect x="0" y="0" width="30" height="30" rx="4" />
                    <rect x="6" y="6" width="18" height="18" fill="white" />
                    <rect x="10" y="10" width="10" height="10" />

                    <rect x="70" y="0" width="30" height="30" rx="4" />
                    <rect x="76" y="6" width="18" height="18" fill="white" />
                    <rect x="80" y="10" width="10" height="10" />

                    <rect x="0" y="70" width="30" height="30" rx="4" />
                    <rect x="6" y="76" width="18" height="18" fill="white" />
                    <rect x="10" y="80" width="10" height="10" />

                    {/* Matrix Dots */}
                    <rect x="36" y="8" width="6" height="6" />
                    <rect x="48" y="14" width="6" height="6" />
                    <rect x="58" y="6" width="6" height="6" />
                    <rect x="38" y="38" width="8" height="8" />
                    <rect x="52" y="44" width="6" height="6" />
                    <rect x="64" y="38" width="6" height="6" />
                    <rect x="78" y="52" width="6" height="6" />
                    <rect x="42" y="62" width="6" height="6" />
                    <rect x="56" y="72" width="8" height="8" />
                    <rect x="68" y="80" width="6" height="6" />
                    <rect x="84" y="70" width="6" height="6" />
                  </svg>
                </div>

                <div className="text-center pt-1 border-t border-slate-200">
                  <span className="font-mono text-[10px] text-slate-500">
                    Dicetak Otomatis • Mendukung Seluruh Dompet Digital
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSimulateSuccess}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-coffee via-secondary-container to-accent-amber text-canvas-obsidian font-heading font-bold text-xs shadow-md hover:scale-102 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulasikan Pembayaran Selesai</span>
                </button>
                <button
                  type="button"
                  onClick={() => soundEffects.playSuccessChime()}
                  className="px-4 py-3 rounded-xl bg-surface-secondary border border-border-subtle hover:border-accent-amber/40 text-xs font-semibold text-text-primary flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-accent-amber" />
                  <span>Unduh QR</span>
                </button>
              </div>

              <div className="text-center text-[11px] text-text-muted font-mono">
                ⚡ Sistem memeriksa transaksi setiap 3 detik. Jangan tutup browser.
              </div>
            </div>

            {/* Right: Banking Scan Guides (5 cols) */}
            <div className="md:col-span-5 bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xl space-y-5">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-accent-amber" />
                <h3 className="font-heading text-base font-bold text-text-primary">
                  Panduan Scan QRIS
                </h3>
              </div>

              {/* Guide Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-surface-secondary border border-border-subtle font-mono text-[11px]">
                {(['bca', 'gopay', 'shopee', 'mandiri'] as const).map((app) => (
                  <button
                    key={app}
                    type="button"
                    onClick={() => setActiveGuide(app)}
                    className={`py-1.5 rounded-lg font-bold uppercase transition-all ${
                      activeGuide === app
                        ? 'bg-accent-amber text-canvas-obsidian shadow-sm'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {app}
                  </button>
                ))}
              </div>

              <div className="space-y-3 text-xs text-text-muted leading-relaxed">
                {activeGuide === 'bca' && (
                  <ol className="list-decimal pl-4 space-y-2">
                    <li>Buka aplikasi <strong className="text-text-primary">BCA Mobile</strong> atau <strong className="text-text-primary">myBCA</strong>.</li>
                    <li>Ketuk ikon <strong className="text-accent-amber">QRIS</strong> di bagian tengah navigasi bawah.</li>
                    <li>Arahkan kamera smartphone ke kode QRIS di samping.</li>
                    <li>Periksa nama merchant: <strong className="text-text-primary">WARKOP YA&apos;REH</strong>.</li>
                    <li>Masukkan PIN transaksi BCA Anda untuk menyelesaikan pembayaran.</li>
                  </ol>
                )}

                {activeGuide === 'gopay' && (
                  <ol className="list-decimal pl-4 space-y-2">
                    <li>Buka aplikasi <strong className="text-text-primary">GoPay</strong> atau <strong className="text-text-primary">Gojek</strong>.</li>
                    <li>Pilih menu <strong className="text-accent-amber">Bayar / Scan</strong>.</li>
                    <li>Pindai kode QRIS Warkop Ya&apos;reh di samping.</li>
                    <li>Konfirmasi nominal tagihan dan selesaikan dengan PIN atau sidik jari.</li>
                  </ol>
                )}

                {activeGuide === 'shopee' && (
                  <ol className="list-decimal pl-4 space-y-2">
                    <li>Buka aplikasi <strong className="text-text-primary">Shopee</strong>.</li>
                    <li>Ketuk logo <strong className="text-accent-amber">Scan QRIS</strong> di sebelah saldo ShopeePay.</li>
                    <li>Arahkan kamera ke QR code di samping.</li>
                    <li>Gunakan saldo ShopeePay atau SPayLater Anda untuk konfirmasi.</li>
                  </ol>
                )}

                {activeGuide === 'mandiri' && (
                  <ol className="list-decimal pl-4 space-y-2">
                    <li>Buka aplikasi <strong className="text-text-primary">Livin&apos; by Mandiri</strong>.</li>
                    <li>Pilih menu <strong className="text-accent-amber">QR Bayar</strong> di beranda.</li>
                    <li>Scan kode QRIS dan konfirmasi pembayaran dengan MPIN Mandiri Anda.</li>
                  </ol>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-surface-secondary border border-border-subtle text-[11px] text-text-muted space-y-1">
                <p className="font-semibold text-text-primary">Butuh Bantuan Barista?</p>
                <p>Tunjukkan layar ini kepada kasir jika ingin mengonversi ke pembayaran tunai.</p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STATE 2: QRIS EXPIRED
            ══════════════════════════════════════════ */}
        {activeState === 'expired' && (
          <div className="bg-surface-card p-8 sm:p-12 rounded-3xl border border-rose-500/30 text-center shadow-2xl space-y-6 max-w-xl mx-auto">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-bold text-text-primary">
                Waktu Pembayaran QRIS Telah Berakhir
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                Kode QRIS untuk pesanan <strong className="text-text-primary">#{orderId}</strong> telah kedaluwarsa demi keamanan transaksi perbankan. Silakan buat ulang kode pembayaran.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveState('pending');
                  setTimeLeft(299);
                  soundEffects.playSuccessChime();
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-coffee to-secondary-container text-text-primary font-heading font-bold text-xs shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Buat Ulang Kode QRIS Baru</span>
              </button>
              <Link
                href="/cart"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface-secondary border border-border-subtle hover:border-accent-amber/40 text-xs font-semibold text-text-primary transition-all"
              >
                Kembali ke Keranjang
              </Link>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STATE 3: PAYMENT FAILED / DECLINED
            ══════════════════════════════════════════ */}
        {activeState === 'failed' && (
          <div className="bg-surface-card p-8 sm:p-12 rounded-3xl border border-red-500/30 text-center shadow-2xl space-y-6 max-w-xl mx-auto">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
              <XCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="font-mono text-xs text-red-400 uppercase tracking-widest bg-red-950/80 px-3 py-1 rounded-full border border-red-500/30">
                ERROR: INSUFFICIENT_FUNDS / DECLINED
              </span>
              <h2 className="font-heading text-2xl font-bold text-text-primary pt-2">
                Transaksi Pembayaran Gagal
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                Penyedia pembayaran (bank/e-wallet) menolak otorisasi transaksi. Hal ini biasanya terjadi karena saldo tidak mencukupi atau limit harian rekening tercapai.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-secondary border border-border-subtle text-left text-xs text-text-muted space-y-2">
              <div className="flex items-center gap-2 text-text-primary font-semibold">
                <HelpCircle className="w-4 h-4 text-accent-amber" />
                <span>Langkah Penyelesaian Masalah:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Pastikan saldo rekening atau dompet digital Anda mencukupi total pesanan.</li>
                <li>Coba ganti metode pembayaran dengan Virtual Account BCA / Mandiri.</li>
                <li>Pilih opsi pembayaran tunai langsung di kasir barometer Warkop Ya&apos;reh.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/cart"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-coffee to-secondary-container text-text-primary font-heading font-bold text-xs shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <span>Coba Metode Pembayaran Lain</span>
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface-secondary border border-border-subtle hover:border-accent-amber/40 text-xs font-semibold text-text-primary transition-all"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas-obsidian" />}>
      <PaymentStatusContent />
    </Suspense>
  );
}
