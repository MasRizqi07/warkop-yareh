'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Check,
  Clock,
  Coffee,
  Copy,
  Laptop,
  MapPin,
  Monitor,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
  Zap,
} from 'lucide-react';
import { Button, Input } from '@warkop-yareh/ui';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAuthStore } from '@/stores/auth.store';
import { useBranchStore } from '@/stores/branch.store';
import { useActiveBranch } from '@/features/catalog/catalog.hooks';
import type { ApiEnvelope, PaginatedApiEnvelope } from '@/features/api/contracts';
import { initializePayment, type OrderQuote } from '@/features/orders/orders.api';
import { assertPaymentRedirect } from '@/features/orders/payment-navigation';
import { DataState, LoadingState } from '@/components/data-state';
import { downloadText } from '@/lib/download';
import { soundEffects } from '@/lib/audioAlerts';

type Package = {
  id: string;
  name: string;
  description: string;
  price: number;
  startTime: string;
  durationMinutes: number;
};
type Addon = Pick<Package, 'id' | 'name' | 'price'>;
type Desk = {
  id: string;
  name: string;
  number: string;
  zone: string | null;
  type: string;
  capacity: number;
  available: boolean;
};
type Reservation = {
  id: string;
  orderId: string | null;
  status: string;
  startAt: string;
  endAt: string;
  guestCount: number;
  table?: { name: string };
};
type BookingResult = {
  reservation: Reservation;
  orderId: string;
  total: number;
};

const rupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;
const todayWib = () =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(new Date());

export default function BookingPage() {
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.isInitialized);
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const branches = useActiveBranch();
  const setBranch = useBranchStore((state) => state.setActiveBranchId);
  const client = useQueryClient();

  const [date, setDate] = useState(todayWib);
  const [packageId, setPackage] = useState('booking-night-owl');
  const [addonIds, setAddons] = useState<string[]>([]);
  const [tableId, setTable] = useState('');
  const [zone, setZone] = useState('all');
  const [guestCount, setGuests] = useState(1);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState<BookingResult | null>(null);
  const [notice, setNotice] = useState('');

  const attempt = useRef<{ fingerprint: string; key: string } | null>(null);
  const enabled = initialized && authenticated;

  const catalog = useQuery({
    queryKey: ['booking-catalog', user?.id],
    enabled,
    queryFn: async () =>
      (await api.get<ApiEnvelope<{ packages: Package[]; addons: Addon[] }>>('/bookings/catalog'))
        .data.data,
  });

  const quote = useQuery({
    queryKey: ['booking-quote', user?.id, packageId, addonIds],
    enabled,
    retry: false,
    queryFn: async () =>
      (
        await api.post<ApiEnvelope<OrderQuote>>('/bookings/quote', {
          packageId,
          addonIds,
        })
      ).data.data,
  });

  const tables = useQuery({
    queryKey: ['booking-tables', user?.id, branches.activeBranch?.id, packageId, date],
    enabled: enabled && Boolean(branches.activeBranch),
    retry: false,
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<Desk[]>>('/bookings/availability', {
          params: { branchId: branches.activeBranch?.id, packageId, date },
        })
      ).data.data,
  });

  const selectedTable = tables.data?.find(
    (table) => table.id === tableId && table.available && table.capacity >= guestCount
  );
  const selectedPackage = catalog.data?.packages.find((item) => item.id === packageId);
  const zones = [...new Set((tables.data ?? []).map((table) => table.zone || table.type))];

  // 14-day interactive ribbon
  const ribbon = useMemo(() => {
    return Array.from({ length: 14 }, (_, offset) => {
      const day = new Date(`${todayWib()}T00:00:00+07:00`);
      day.setUTCDate(day.getUTCDate() + offset);
      const iso = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(day);
      const dayNum = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
      }).format(day);
      const weekday = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        weekday: 'short',
      }).format(day);
      const month = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        month: 'short',
      }).format(day);

      const tag = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : [0, 6].includes(day.getDay()) ? 'Weekend' : 'Open';

      return { id: iso, dayNum, weekday, month, tag };
    });
  }, []);

  const purchase = useMutation({
    mutationFn: async () => {
      if (
        !selectedTable ||
        !branches.activeBranch ||
        !quote.data ||
        quote.isFetching ||
        tables.isFetching ||
        quote.isError
      ) {
        throw new Error('Pilih meja tersedia dan tunggu harga dikonfirmasi.');
      }
      const payload = {
        branchId: branches.activeBranch.id,
        tableId,
        packageId,
        addonIds,
        date,
        guestCount,
        specialRequests: notes.trim(),
        expectedTotal: quote.data.total,
      };
      const fingerprint = JSON.stringify({ userId: user?.id, payload });
      if (!attempt.current) {
        try {
          const prior: unknown = JSON.parse(
            sessionStorage.getItem('warkop-booking-attempt') ?? 'null'
          );
          if (
            prior &&
            typeof prior === 'object' &&
            'fingerprint' in prior &&
            prior.fingerprint === fingerprint &&
            'key' in prior &&
            typeof prior.key === 'string'
          ) {
            attempt.current = { fingerprint, key: prior.key };
          }
        } catch {
          attempt.current = null;
        }
      }
      if (attempt.current?.fingerprint !== fingerprint) {
        attempt.current = { fingerprint, key: crypto.randomUUID() };
      }
      try {
        sessionStorage.setItem('warkop-booking-attempt', JSON.stringify(attempt.current));
      } catch {
        setNotice('Penyimpanan browser tidak tersedia; pertahankan halaman ini untuk mencoba ulang.');
      }
      const result = (
        await api.post<ApiEnvelope<BookingResult>>('/bookings', payload, {
          headers: { 'Idempotency-Key': attempt.current.key },
        })
      ).data.data;
      setSaved(result);
      soundEffects.playSuccessChime();
      void client.invalidateQueries({ queryKey: ['reservations', user?.id] });
      void client.invalidateQueries({ queryKey: ['booking-tables'] });
      const payment = await initializePayment(result.orderId, 'QRIS');
      const destination = assertPaymentRedirect(payment.redirectUrl);
      window.location.assign(destination);
    },
  });

  return (
    <main className="w-full min-h-screen bg-canvas-obsidian text-on-surface antialiased pb-32 pt-8">
      {/* Top Context & Live Telemetry Strip */}
      <div className="border-b border-border-subtle bg-surface-secondary/70 py-4 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-amber/15 border border-accent-amber/30 flex items-center justify-center text-accent-amber">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent-amber uppercase tracking-widest font-bold">
                  Workspace Sanctuary
                </span>
                <span className="text-text-muted">•</span>
                <span className="text-xs text-text-primary font-semibold">
                  {branches.activeBranch?.name ?? 'Darmo Flagship'}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Pilih paket, meja, dan sesi kerja. Reservasi dikonfirmasi instan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-full border border-border-subtle">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-text-primary font-medium">42/65 Desks Active</span>
              <span className="text-outline-variant">•</span>
              <span className="text-emerald-400">Gigabit Fiber Ready</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {!initialized ? (
          <LoadingState label="Memulihkan sesi..." />
        ) : !authenticated ? (
          <DataState
            title="Masuk untuk memesan workspace"
            detail="Nikmati koneksi internet prioritas, fasilitas pod fokus, dan racikan kopi barista."
            loginPath="/booking"
          />
        ) : (
          <fieldset disabled={purchase.isPending} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form & Ribbon (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              {/* SECTION 1: Date Ribbon */}
              <section className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-accent-amber" />
                    <h2 className="font-heading text-lg font-bold text-text-primary">
                      Pilih Tanggal Sesi (14 Hari ke Depan)
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-text-muted">Surabaya Local Time (WIB)</span>
                </div>

                {/* 14-Day Horizontal Scroll Strip */}
                <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                  {ribbon.map((item) => {
                    const isSelected = date === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          setDate(item.id);
                          setTable('');
                        }}
                        className={`flex-shrink-0 flex flex-col items-center justify-center w-20 sm:w-24 py-3 px-2 rounded-xl text-center transition-all ${
                          isSelected
                            ? 'bg-gradient-to-b from-brand-coffee/40 to-surface-secondary border-2 border-accent-amber shadow-[0_0_16px_rgba(245,158,11,0.25)]'
                            : 'bg-surface-secondary border border-border-subtle hover:border-accent-amber/40'
                        }`}
                      >
                        <span
                          className={`font-mono text-[10px] uppercase font-bold tracking-wider ${
                            isSelected ? 'text-accent-amber' : 'text-text-muted'
                          }`}
                        >
                          {item.tag}
                        </span>
                        <span className="font-heading text-xl sm:text-2xl font-bold text-text-primary my-0.5">
                          {item.dayNum}
                        </span>
                        <span className="text-xs text-text-muted">
                          {item.weekday}, {item.month}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* SECTION 2: Packages Matrix */}
              <section className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent-amber" />
                    <h2 className="font-heading text-lg font-bold text-text-primary">
                      Paket Waktu &amp; Sesi
                    </h2>
                  </div>
                  <span className="text-xs text-text-muted">Pilih durasi kerja</span>
                </div>

                {catalog.isPending ? (
                  <LoadingState />
                ) : catalog.isError ? (
                  <DataState title="Paket gagal dimuat" retry={() => void catalog.refetch()} />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {catalog.data?.packages.map((item) => {
                      const isSelected = packageId === item.id;
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => {
                            setPackage(item.id);
                            setTable('');
                          }}
                          className={`p-5 rounded-xl border text-left transition-all relative ${
                            isSelected
                              ? 'border-accent-amber bg-accent-amber/10 shadow-md'
                              : 'border-border-subtle bg-surface-secondary hover:border-primary/40'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-accent-amber flex items-center justify-center text-canvas-obsidian">
                              <Check className="w-3.5 h-3.5 font-bold" />
                            </div>
                          )}
                          <h3 className="font-heading font-bold text-base text-text-primary">
                            {item.name}
                          </h3>
                          <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
                            <span className="font-mono text-xs text-text-muted">
                              {item.durationMinutes / 60} jam • mulai {item.startTime} WIB
                            </span>
                            <span className="font-mono text-sm font-bold text-accent-amber">
                              {rupiah(item.price)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* SECTION 3: Desks & Zone Selector */}
              <section className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-accent-amber" />
                    <h2 className="font-heading text-lg font-bold text-text-primary">
                      Pilih Meja / Pod
                    </h2>
                  </div>

                  {/* Zone Filter Buttons */}
                  <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-canvas-obsidian border border-border-subtle">
                    <button
                      type="button"
                      onClick={() => setZone('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        zone === 'all'
                          ? 'bg-primary-container text-on-primary-container'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      Semua Zona
                    </button>
                    {zones.map((z) => (
                      <button
                        type="button"
                        key={z}
                        onClick={() => setZone(z)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                          zone === z
                            ? 'bg-primary-container text-on-primary-container'
                            : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        {z.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {tables.isPending || tables.isFetching ? (
                  <LoadingState label="Memeriksa ketersediaan meja..." />
                ) : tables.isError ? (
                  <DataState
                    title="Ketersediaan belum dapat dikonfirmasi"
                    detail={getApiErrorMessage(tables.error)}
                    retry={() => void tables.refetch()}
                  />
                ) : !tables.data?.length ? (
                  <DataState title="Belum ada meja aktif di cabang ini" />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {tables.data
                      .filter((table) => zone === 'all' || (table.zone || table.type) === zone)
                      .map((table) => {
                        const isSelected = tableId === table.id;
                        const isAvailable = table.available && table.capacity >= guestCount;
                        return (
                          <button
                            key={table.id}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => setTable(table.id)}
                            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-3 relative ${
                              !isAvailable
                                ? 'opacity-40 border-border-subtle bg-surface-secondary cursor-not-allowed'
                                : isSelected
                                ? 'border-accent-amber bg-accent-amber/15 shadow-lg ring-1 ring-accent-amber'
                                : 'border-border-subtle bg-surface-secondary hover:border-primary/40'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <Monitor className={`w-5 h-5 ${isSelected ? 'text-accent-amber' : 'text-text-muted'}`} />
                                <span
                                  className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                                    isAvailable
                                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-rose-950/60 text-rose-400'
                                  }`}
                                >
                                  {isAvailable ? 'Tersedia' : 'Penuh'}
                                </span>
                              </div>
                              <h4 className="font-heading font-bold text-sm text-text-primary mt-2">
                                {table.name || table.number}
                              </h4>
                              <p className="text-[11px] text-text-muted capitalize">
                                {table.zone || table.type || 'Workspace'}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted font-mono">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-accent-amber" />
                                <span>{table.capacity} tamu</span>
                              </span>
                              {isSelected && <span className="text-accent-amber font-bold">Dipilih</span>}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                )}
              </section>

              {/* SECTION 4: Add-ons & Special Instructions */}
              <section className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xl space-y-4">
                <h2 className="font-heading text-lg font-bold text-text-primary">
                  Tambahan Fasilitas &amp; Catatan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catalog.data?.addons.map((addon) => {
                    const isChecked = addonIds.includes(addon.id);
                    return (
                      <label
                        key={addon.id}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'border-accent-amber bg-accent-amber/10'
                            : 'border-border-subtle bg-surface-secondary hover:border-border-subtle/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              setAddons((prev) =>
                                e.target.checked
                                  ? [...prev, addon.id].sort()
                                  : prev.filter((id) => id !== addon.id)
                              );
                            }}
                            className="rounded border-border-subtle text-accent-amber focus:ring-accent-amber"
                          />
                          <span className="text-xs font-semibold text-text-primary">{addon.name}</span>
                        </div>
                        <span className="font-mono text-xs text-accent-amber font-bold">
                          {rupiah(addon.price)}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div>
                  <label htmlFor="notes" className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted block mb-1.5">
                    Permintaan Khusus (Opsional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Contoh: Butuh kabel HDMI tambahan, kursi anak, atau request colokan ekstra..."
                    className="w-full rounded-xl border border-border-subtle bg-surface-secondary p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-amber/40"
                  />
                </div>
              </section>
            </div>

            {/* Right Column: Sticky Reservation Checkout Sidebar (4 cols) */}
            <aside className="lg:col-span-4 sticky top-24 space-y-6">
              <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <h3 className="font-heading font-bold text-base text-text-primary">
                    Ringkasan Reservasi
                  </h3>
                  <span className="font-mono text-[10px] text-accent-amber uppercase bg-accent-amber/15 px-2 py-0.5 rounded">
                    Instant Lock
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Cabang</span>
                    <span className="font-semibold text-text-primary">{branches.activeBranch?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Tanggal Sesi</span>
                    <span className="font-mono font-bold text-text-primary">{date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Paket</span>
                    <span className="font-semibold text-text-primary">{selectedPackage?.name ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Meja Terpilih</span>
                    <span className="font-semibold text-accent-amber">
                      {selectedTable ? `${selectedTable.name || selectedTable.number}` : 'Pilih Meja'}
                    </span>
                  </div>
                </div>

                {/* Price Breakdown */}
                {quote.isPending || quote.isFetching ? (
                  <LoadingState label="Menghitung total harga..." />
                ) : quote.isError ? (
                  <DataState title="Harga gagal dimuat" detail={getApiErrorMessage(quote.error)} />
                ) : quote.data && (
                  <div className="pt-3 border-t border-border-subtle space-y-2 text-xs">
                    <div className="flex justify-between text-text-muted">
                      <span>Paket &amp; Tambahan</span>
                      <span className="font-mono text-text-primary">{rupiah(quote.data.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-text-muted">
                      <span>Pajak Restoran PB1 (10%)</span>
                      <span className="font-mono text-text-primary">{rupiah(quote.data.tax)}</span>
                    </div>
                    <div className="flex justify-between text-text-muted">
                      <span>Service Fee (5%)</span>
                      <span className="font-mono text-text-primary">{rupiah(quote.data.serviceFee)}</span>
                    </div>
                    <div className="pt-2 border-t border-border-subtle flex justify-between items-center">
                      <span className="font-bold text-text-primary text-sm">Total Bayar</span>
                      <span className="font-mono text-base font-extrabold text-accent-amber">
                        {rupiah(quote.data.total)}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => purchase.mutate()}
                  disabled={
                    !selectedTable ||
                    !quote.data ||
                    quote.isFetching ||
                    quote.isError ||
                    tables.isFetching ||
                    purchase.isPending
                  }
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-coffee via-secondary-container to-accent-amber text-canvas-obsidian font-heading font-bold text-sm shadow-xl hover:scale-102 transition-all cursor-pointer"
                >
                  {purchase.isPending ? 'Mengunci Meja & Membuka Pembayaran...' : 'Reservasi & Bayar (Midtrans)'}
                </Button>

                {notice && <p className="text-xs text-accent-amber font-mono text-center">{notice}</p>}
                {purchase.isError && (
                  <p className="text-xs text-rose-400 font-mono text-center">
                    {getApiErrorMessage(purchase.error)}
                  </p>
                )}
              </div>
            </aside>
          </fieldset>
        )}
      </div>
    </main>
  );
}
