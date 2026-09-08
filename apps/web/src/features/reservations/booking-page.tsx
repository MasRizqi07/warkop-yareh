'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Check, Copy, Monitor, Users } from 'lucide-react';
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

type Package = { id: string; name: string; description: string; price: number; startTime: string; durationMinutes: number };
type Addon = Pick<Package, 'id' | 'name' | 'price'>;
type Desk = { id: string; name: string; number: string; zone: string | null; type: string; capacity: number; available: boolean };
type Reservation = { id: string; orderId: string | null; status: string; startAt: string; endAt: string; guestCount: number; table?: { name: string } };
type BookingResult = { reservation: Reservation; orderId: string; total: number };
const rupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;
const todayWib = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(new Date());
const formatDate = (value: string) => new Date(value).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' });

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
  const catalog = useQuery({ queryKey: ['booking-catalog', user?.id], enabled, queryFn: async () => (await api.get<ApiEnvelope<{ packages: Package[]; addons: Addon[] }>>('/bookings/catalog')).data.data });
  const quote = useQuery({ queryKey: ['booking-quote', user?.id, packageId, addonIds], enabled, retry: false, queryFn: async () => (await api.post<ApiEnvelope<OrderQuote>>('/bookings/quote', { packageId, addonIds })).data.data });
  const tables = useQuery({ queryKey: ['booking-tables', user?.id, branches.activeBranch?.id, packageId, date], enabled: enabled && Boolean(branches.activeBranch), retry: false, queryFn: async () => (await api.get<ApiEnvelope<Desk[]>>('/bookings/availability', { params: { branchId: branches.activeBranch?.id, packageId, date } })).data.data });
  const history = useQuery({ queryKey: ['reservations', user?.id], enabled, queryFn: async () => (await api.get<PaginatedApiEnvelope<Reservation>>('/reservations', { params: { limit: 20 } })).data.data });
  const selectedTable = tables.data?.find((table) => table.id === tableId && table.available && table.capacity >= guestCount);
  const selectedPackage = catalog.data?.packages.find((item) => item.id === packageId);
  const zones = [...new Set((tables.data ?? []).map((table) => table.zone || table.type))];
  const ribbon = useMemo(() => Array.from({ length: 14 }, (_, offset) => {
    const day = new Date(`${todayWib()}T00:00:00+07:00`);
    day.setUTCDate(day.getUTCDate() + offset);
    return { id: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(day), label: new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'short', day: 'numeric' }).format(day) };
  }), []);

  const purchase = useMutation({ mutationFn: async () => {
    if (!selectedTable || !branches.activeBranch || !quote.data || quote.isFetching || tables.isFetching || quote.isError) throw new Error('Pilih meja tersedia dan tunggu harga dikonfirmasi.');
    const payload = { branchId: branches.activeBranch.id, tableId, packageId, addonIds, date, guestCount, specialRequests: notes.trim(), expectedTotal: quote.data.total };
    const fingerprint = JSON.stringify({ userId: user?.id, payload });
    if (!attempt.current) {
      try {
        const prior: unknown = JSON.parse(sessionStorage.getItem('warkop-booking-attempt') ?? 'null');
        if (prior && typeof prior === 'object' && 'fingerprint' in prior && prior.fingerprint === fingerprint && 'key' in prior && typeof prior.key === 'string') attempt.current = { fingerprint, key: prior.key };
      } catch { attempt.current = null; }
    }
    if (attempt.current?.fingerprint !== fingerprint) attempt.current = { fingerprint, key: crypto.randomUUID() };
    try { sessionStorage.setItem('warkop-booking-attempt', JSON.stringify(attempt.current)); } catch { setNotice('Penyimpanan browser tidak tersedia; pertahankan halaman ini untuk mencoba ulang.'); }
    const result = (await api.post<ApiEnvelope<BookingResult>>('/bookings', payload, { headers: { 'Idempotency-Key': attempt.current.key } })).data.data;
    setSaved(result);
    void client.invalidateQueries({ queryKey: ['reservations', user?.id] });
    void client.invalidateQueries({ queryKey: ['booking-tables'] });
    const payment = await initializePayment(result.orderId, 'QRIS');
    const destination = assertPaymentRedirect(payment.redirectUrl);
    window.location.assign(destination);
  } });
  const cancel = useMutation({ mutationFn: (id: string) => api.patch(`/reservations/${encodeURIComponent(id)}/status`, { status: 'CANCELLED' }), onSuccess: () => { void client.invalidateQueries({ queryKey: ['reservations', user?.id] }); void client.invalidateQueries({ queryKey: ['booking-tables'] }); } });
  const copy = async (code: string) => { try { await navigator.clipboard.writeText(code); setNotice('Kode reservasi disalin.'); } catch { setNotice(`Kode reservasi: ${code}`); } };
  const calendar = (reservation: Reservation) => {
    const stamp = (value: string) => new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    downloadText(`booking-${reservation.id}.ics`, ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Warkop Yareh//Booking//ID', 'BEGIN:VEVENT', `UID:${reservation.id}@warkopyareh.com`, `DTSTAMP:${stamp(new Date().toISOString())}`, `DTSTART:${stamp(reservation.startAt)}`, `DTEND:${stamp(reservation.endAt)}`, "SUMMARY:Workspace Warkop Ya'reh", 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'), 'text/calendar;charset=utf-8');
  };

  return <main className="mx-auto min-h-screen max-w-7xl space-y-7 px-4 py-10 pb-32 text-text-primary sm:px-6">
    <header><p className="font-mono text-sm text-accent-amber">WORKSPACE SANCTUARY</p><h1 className="mt-3 text-3xl font-bold sm:text-4xl">Reserve Your Focus Space</h1><p className="mt-3 text-text-muted">Pilih paket, tanggal, dan meja. Reservasi dikonfirmasi setelah pembayaran diterima.</p></header>
    {!initialized ? <LoadingState label="Memulihkan sesi..." /> : !authenticated ? <DataState title="Masuk untuk memesan workspace" loginPath="/booking" /> : <>
      <fieldset disabled={purchase.isPending} className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <section className="space-y-4 rounded-2xl border border-border-subtle bg-surface-card p-5"><h2 className="text-xl font-semibold">Lokasi &amp; Tanggal</h2>{branches.isError ? <DataState title="Cabang gagal dimuat" retry={() => void branches.refetch()} /> : <><label htmlFor="booking-branch" className="block text-sm">Cabang tujuan</label><select id="booking-branch" value={branches.activeBranch?.id ?? ''} onChange={(event) => { setBranch(event.target.value); setTable(''); setZone('all'); }} className="w-full rounded-xl border border-border-subtle bg-surface-secondary p-3">{branches.data?.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></>}
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">{ribbon.map((day) => <Button key={day.id} variant={date === day.id ? 'default' : 'secondary'} aria-pressed={date === day.id} onClick={() => { setDate(day.id); setTable(''); }}>{day.label}</Button>)}</div><label htmlFor="booking-date" className="block text-sm">Tanggal lain</label><Input id="booking-date" type="date" value={date} min={todayWib()} onChange={(event) => { setDate(event.target.value); setTable(''); }} />
          </section>
          <section className="space-y-4 rounded-2xl border border-border-subtle bg-surface-card p-5"><h2 className="text-xl font-semibold">Paket Workspace</h2>{catalog.isPending ? <LoadingState /> : catalog.isError ? <DataState title="Paket gagal dimuat" retry={() => void catalog.refetch()} /> : <div className="grid gap-3 sm:grid-cols-2">{catalog.data?.packages.map((item) => <button type="button" key={item.id} aria-pressed={packageId === item.id} onClick={() => { setPackage(item.id); setTable(''); }} className={`rounded-xl border p-5 text-left ${packageId === item.id ? 'border-accent-amber bg-accent-amber/10' : 'border-border-subtle bg-surface-secondary'}`}><h3 className="font-semibold">{item.name}</h3><p className="my-2 text-xs text-text-muted">{item.description}</p><p className="text-sm">{item.durationMinutes / 60} jam · mulai {item.startTime} WIB</p><p className="mt-3 font-mono text-accent-amber">{rupiah(item.price)}</p></button>)}</div>}</section>
          <section className="space-y-4 rounded-2xl border border-border-subtle bg-surface-card p-5"><h2 className="text-xl font-semibold">Pilih Meja</h2><div className="flex flex-wrap gap-2"><Button variant={zone === 'all' ? 'default' : 'secondary'} onClick={() => setZone('all')}>Semua zona</Button>{zones.map((item) => <Button key={item} variant={zone === item ? 'default' : 'secondary'} onClick={() => setZone(item)}>{item}</Button>)}</div><label htmlFor="booking-guests" className="block text-sm">Jumlah tamu</label><Input id="booking-guests" type="number" min={1} max={50} value={guestCount} onChange={(event) => setGuests(Math.min(50, Math.max(1, Math.trunc(Number(event.target.value) || 1))))} />
            {tables.isPending || tables.isFetching ? <LoadingState label="Memeriksa ketersediaan..." /> : tables.isError ? <DataState title="Ketersediaan belum dapat dikonfirmasi" detail={getApiErrorMessage(tables.error)} retry={() => void tables.refetch()} /> : !tables.data?.length ? <DataState title="Belum ada meja aktif di cabang ini" /> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{tables.data.filter((table) => zone === 'all' || (table.zone || table.type) === zone).map((table) => <button key={table.id} type="button" disabled={!table.available || table.capacity < guestCount} aria-pressed={tableId === table.id} onClick={() => setTable(table.id)} className={`space-y-2 rounded-xl border p-4 text-left disabled:opacity-40 ${tableId === table.id ? 'border-accent-amber bg-accent-amber/10' : 'border-border-subtle'}`}><Monitor className="h-5 w-5" /><p className="font-semibold">{table.name || table.number}</p><p className="flex items-center gap-1 text-xs"><Users className="h-3 w-3" />{table.capacity} tamu</p><p className="text-xs">{table.available ? 'Tersedia' : 'Sudah dipesan'}</p></button>)}</div>}
          </section>
          <section className="space-y-4 rounded-2xl border border-border-subtle bg-surface-card p-5"><h2 className="text-xl font-semibold">Tambahan Kenyamanan</h2>{catalog.data?.addons.map((item) => <label key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-border-subtle p-4"><span><input type="checkbox" checked={addonIds.includes(item.id)} onChange={(event) => setAddons((current) => event.target.checked ? [...current, item.id].sort() : current.filter((id) => id !== item.id))} className="mr-3" />{item.name}</span><span className="shrink-0 font-mono text-sm">{rupiah(item.price)}</span></label>)}<label htmlFor="booking-notes" className="block text-sm">Permintaan khusus</label><textarea id="booking-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={1000} rows={3} className="w-full rounded-xl border border-border-subtle bg-surface-secondary p-3" /></section>
        </div>
        <aside className="h-fit space-y-4 rounded-2xl border border-border-subtle bg-surface-card p-5 lg:sticky lg:top-24"><h2 className="text-xl font-semibold">Ringkasan Reservasi</h2><p>{selectedPackage?.name}</p><p className="text-sm text-text-muted">{date} · {selectedTable?.name ?? 'Pilih meja'} · {guestCount} tamu</p>{quote.isPending || quote.isFetching ? <LoadingState label="Menghitung harga..." /> : quote.isError ? <DataState title="Harga gagal dimuat" detail={getApiErrorMessage(quote.error)} retry={() => void quote.refetch()} /> : quote.data && <dl className="space-y-3 text-sm">{[['Paket & tambahan', quote.data.subtotal], ['Pajak 11%', quote.data.tax], ['Service fee 5%', quote.data.serviceFee], ['Total', quote.data.total]].map(([label, amount]) => <div key={label} className="flex justify-between gap-3"><dt>{label}</dt><dd className="font-mono">{rupiah(Number(amount))}</dd></div>)}</dl>}<Button className="w-full" onClick={() => purchase.mutate()} disabled={!selectedTable || !quote.data || quote.isFetching || quote.isError || tables.isFetching || purchase.isPending}>{purchase.isPending ? 'Menyimpan reservasi...' : 'Reservasi & Bayar'}</Button>{purchase.isError && <DataState title="Reservasi belum dibayar" detail={getApiErrorMessage(purchase.error)} />}</aside>
      </fieldset>
      {saved && <section className="space-y-4 rounded-2xl border border-accent-amber bg-surface-card p-6"><h2 className="flex items-center gap-2 text-xl font-semibold"><Check />Reservasi tersimpan, menunggu pembayaran</h2><p className="break-all font-mono text-sm">{saved.reservation.id}</p><div className="flex flex-wrap gap-3"><Button variant="secondary" onClick={() => void copy(saved.reservation.id)}><Copy />Salin kode</Button><Link href={`/order/track/${encodeURIComponent(saved.orderId)}`} className="rounded-xl bg-accent-amber px-4 py-3 text-sm font-semibold text-black">Lanjutkan pembayaran</Link></div></section>}
      {notice && <p role="status" className="break-words text-sm text-accent-amber">{notice}</p>}
      <section className="space-y-4 rounded-2xl border border-border-subtle bg-surface-card p-5"><h2 className="text-xl font-semibold">Reservasi Saya</h2>{history.isPending ? <LoadingState /> : history.isError ? <DataState title="Riwayat gagal dimuat" retry={() => void history.refetch()} /> : !history.data?.length ? <DataState title="Belum ada reservasi" /> : <ul className="divide-y divide-border-subtle">{history.data.map((reservation) => <li key={reservation.id} className="space-y-3 py-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-semibold">{reservation.table?.name ?? 'Meja'} · {reservation.guestCount} tamu</p><span className="font-mono text-xs">{reservation.status}</span></div><p className="text-sm text-text-muted">{formatDate(reservation.startAt)} — {formatDate(reservation.endAt)} WIB</p><div className="flex flex-wrap gap-2">{reservation.orderId && <Link href={`/order/track/${encodeURIComponent(reservation.orderId)}`} className="rounded-xl border border-border-subtle px-4 py-2 text-sm">Pesanan &amp; pembayaran</Link>}{reservation.status === 'CONFIRMED' && <Button variant="secondary" onClick={() => calendar(reservation)}><Calendar />Simpan kalender</Button>}{['PENDING', 'CONFIRMED'].includes(reservation.status) && <Button variant="secondary" disabled={cancel.isPending} onClick={() => cancel.mutate(reservation.id)}>Batalkan</Button>}</div></li>)}</ul>}{cancel.isError && <DataState title="Reservasi belum dibatalkan" detail={getApiErrorMessage(cancel.error)} />}</section>
    </>}
  </main>;
}
