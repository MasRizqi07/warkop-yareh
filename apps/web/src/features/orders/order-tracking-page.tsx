'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { BellRing, CheckCircle2, Clock, Coffee, Download, MapPin, Receipt } from 'lucide-react';
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

const PIPELINE: { status: ApiOrderStatus; label: string; detail: string; icon: typeof Coffee }[] = [
  { status: 'PENDING', label: 'Diterima', detail: 'Menunggu pembayaran dan konfirmasi.', icon: Clock },
  { status: 'CONFIRMED', label: 'Dikonfirmasi', detail: 'Pesanan masuk antrean bar.', icon: CheckCircle2 },
  { status: 'PREPARING', label: 'Diracik', detail: 'Barista sedang menyiapkan pesanan.', icon: Coffee },
  { status: 'READY', label: 'Siap', detail: 'Pesanan siap diambil atau disajikan.', icon: BellRing },
  { status: 'COMPLETED', label: 'Selesai', detail: 'Terima kasih sudah berkunjung.', icon: CheckCircle2 },
];
const rupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const initialized = useAuthStore((s) => s.isInitialized);
  const authenticated = useAuthStore((s) => s.isAuthenticated);
  const query = useOrder(orderId, initialized && authenticated);
  const branches = useBranches();
  const [notice, setNotice] = useState('');
  const order = query.data;
  const payment = useMutation({ mutationFn: async () => {
    if (!order) throw new Error('Pesanan belum dimuat.');
    const result = await initializePayment(order.id, order.payment?.method ?? 'QRIS');
    window.location.assign(assertPaymentRedirect(result.redirectUrl));
  } });
  const waiter = useMutation({ mutationFn: async () => {
    if (!order?.tableId) throw new Error('Pesanan tidak terhubung ke meja.');
    await api.post(`/tables/${encodeURIComponent(order.tableId)}/call`, { type: 'CALL_WAITER' });
  }, onSuccess: () => setNotice('Permintaan bantuan sudah diterima. Silakan tunggu staf.') });
  const step = order ? order.status === 'SERVED' ? 3 : PIPELINE.findIndex((s) => s.status === order.status) : -1;
  const branch = branches.data?.find((b) => b.id === order?.branchId);
  const receipt = () => {
    if (!order) return;
    const lines = ["WARKOP YA'REH", branch?.name ?? '', order.orderNumber, new Date(order.createdAt).toLocaleString('id-ID'), `Status: ${order.status} / ${order.paymentStatus}`, '', ...order.items.map((item) => `${item.quantity} x ${item.snapshotName}: ${rupiah(item.totalPrice)}`), '', `Subtotal: ${rupiah(order.subtotal)}`, `Pajak: ${rupiah(order.tax)}`, `Service fee: ${rupiah(order.serviceFee)}`, `Diskon: ${rupiah(order.discount)}`, `Total: ${rupiah(order.total)}`];
    downloadText(`receipt-${order.orderNumber.replace(/[^a-zA-Z0-9-]/g, '')}.txt`, lines.join('\n'));
  };

  return <main className="mx-auto min-h-screen max-w-6xl space-y-6 px-4 pb-32 pt-10 text-text-primary sm:px-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><Link href="/orders" className="text-sm text-text-muted">Riwayat pesanan</Link><h1 className="mt-3 text-3xl font-bold">Your Sanctuary Brew</h1><p className="mt-2 text-text-muted">Ikuti pesanan dari bar hingga siap dinikmati.</p></div><Coffee className="h-10 w-10 text-accent-amber" /></header>
    {!initialized ? <LoadingState label="Memulihkan sesi..." /> : !authenticated ? <DataState title="Masuk untuk melacak pesanan Anda" loginPath={`/order/track/${orderId}`} /> : query.isPending ? <LoadingState /> : query.isError ? <DataState title="Pesanan belum dapat ditampilkan" detail={getApiErrorMessage(query.error, 'Pesanan tidak ditemukan atau tidak dapat diakses oleh akun ini.')} retry={() => void query.refetch()} /> : order && <>
      <section className="rounded-3xl border border-accent-amber/30 bg-surface-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs text-text-muted">ORDER ID</p><h2 className="mt-1 break-all font-mono text-xl font-bold text-accent-amber">{order.orderNumber}</h2><p className="mt-3 flex items-center gap-2 text-sm"><MapPin className="h-4 w-4" />{branch?.name ?? 'Cabang pesanan'} · {order.type.replaceAll('_', ' ')}</p></div><div className="space-y-2 text-sm"><p className="rounded-full border border-border-subtle px-4 py-2">Status pesanan: {order.status}</p><p className="rounded-full border border-border-subtle px-4 py-2">Pembayaran: {order.paymentStatus}</p></div></div>
        {order.status === 'CANCELLED' ? <p className="mt-6" role="status">Pesanan dibatalkan. Hubungi cabang untuk bantuan.</p> : <ol className="mt-8 grid gap-3 sm:grid-cols-5">{PIPELINE.map((stage, index) => <li key={stage.status} aria-current={step === index ? 'step' : undefined} className={`rounded-2xl border p-4 ${index <= step ? 'border-accent-amber/40 bg-accent-amber/5' : 'border-border-subtle'}`}><stage.icon className={`mb-4 h-6 w-6 ${index <= step ? 'text-accent-amber' : 'text-text-muted'}`} /><strong className="text-sm">{stage.label}</strong><p className="mt-2 text-xs text-text-muted">{stage.detail}</p></li>)}</ol>}
        <div className="mt-6 flex flex-wrap gap-3"><Button variant="secondary" onClick={() => void query.refetch()} disabled={query.isFetching}>Perbarui status</Button>{order.tableId && !['CANCELLED', 'COMPLETED'].includes(order.status) && <Button variant="secondary" disabled={waiter.isPending} onClick={() => waiter.mutate()}><BellRing className="h-4 w-4" />Panggil staf</Button>}</div>
      </section>
      {notice && <DataState title={notice} />}{waiter.isError && <DataState title="Permintaan belum terkirim" detail={getApiErrorMessage(waiter.error)} />}
      {order.paymentStatus === 'UNPAID' && !['CANCELLED', 'COMPLETED'].includes(order.status) && <section className="rounded-2xl border border-border-subtle bg-surface-card p-6"><h2 className="text-xl font-semibold">Selesaikan pembayaran</h2><p className="my-3 text-sm text-text-muted">QRIS, batas waktu pembayaran, dan instruksi bank tersedia di halaman Midtrans. Status pesanan diperbarui setelah konfirmasi pembayaran diterima.</p><Button disabled={payment.isPending} onClick={() => payment.mutate()}>{payment.isPending ? 'Menyiapkan pembayaran...' : `Bayar ${rupiah(order.total)}`}</Button>{payment.isError && <p role="alert" className="mt-4 text-sm">{getApiErrorMessage(payment.error)}</p>}</section>}
      <section className="rounded-2xl border border-border-subtle bg-surface-card p-6 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-4"><h2 className="flex items-center gap-2 text-xl font-semibold"><Receipt className="text-accent-amber" />Digital Receipt</h2><Button variant="secondary" onClick={receipt}><Download className="h-4 w-4" />Unduh struk</Button></div><ul className="my-6 divide-y divide-border-subtle">{order.items.map((item) => <li key={item.id} className="flex justify-between gap-4 py-4"><div className="min-w-0"><p className="font-semibold">{item.quantity} × {item.snapshotName}</p>{item.customizations && <p className="mt-1 break-words text-xs text-text-muted">{Object.entries(item.customizations).map(([key, value]) => `${key}: ${value}`).join(' · ')}</p>}{item.notes && <p className="mt-1 text-xs text-text-muted">{item.notes}</p>}</div><span className="shrink-0 font-mono text-sm">{rupiah(item.totalPrice)}</span></li>)}</ul><dl className="ml-auto max-w-sm space-y-3">{[['Subtotal', order.subtotal], ['Pajak 11%', order.tax], ['Service fee 5%', order.serviceFee], ['Diskon', -order.discount], ['Total', order.total]].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><dt>{label}</dt><dd className="font-mono">{rupiah(Number(value))}</dd></div>)}</dl>{order.status === 'COMPLETED' && <Link href={`/orders/${encodeURIComponent(order.id)}/thankyou`} className="mt-6 inline-block text-accent-amber underline">Bagikan ulasan kunjungan</Link>}</section>
    </>}
  </main>;
}
