'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BellRing, CheckCircle2, Clock, Coffee, Download, MapPin, Sparkles } from 'lucide-react';
import type { ApiOrderStatus, OrderDto } from '@/features/api/contracts';
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
];

function fulfillmentLabel(order: OrderDto): string {
  if (order.type === 'DINE_IN') return order.tableId ? `Dine-In · Meja ${order.tableId}` : 'Dine-In';
  if (order.type === 'DRIVE_THRU') return 'Drive-Thru';
  if (order.type === 'DELIVERY') return 'Delivery';
  return 'Self Pickup';
}

export default function OrderTrackPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const orderQuery = useOrder(orderId, isInitialized && isAuthenticated);
  const branches = useBranches();
  const order = orderQuery.data;
  const branch = branches.data?.find((item) => item.id === order?.branchId);

  if (!isInitialized) return <main className="flex min-h-[70vh] items-center justify-center bg-[#0a0a0c] text-sm text-neutral-400">Memulihkan sesi aman...</main>;
  if (!isAuthenticated) return <main className="flex min-h-[70vh] items-center justify-center bg-[#0a0a0c] px-4 text-center text-white"><section className="max-w-md rounded-3xl border border-white/10 bg-[#18181c] p-8"><h1 className="font-heading text-xl font-bold">Order ini membutuhkan autentikasi</h1><p className="mt-2 text-sm text-neutral-400">Masuk dengan akun pemilik order untuk melihat status dan bukti transaksi.</p><Link href={`/login?returnTo=${encodeURIComponent(`/order/track/${orderId}`)}`} className="mt-5 inline-block rounded-xl bg-[#9c6b3a] px-5 py-2.5 text-sm font-bold">Masuk</Link></section></main>;
  if (orderQuery.isPending) return <main className="flex min-h-[70vh] items-center justify-center bg-[#0a0a0c] text-sm text-neutral-400"><span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-[#f59e0b] border-t-transparent" />Memuat status order...</main>;
  if (orderQuery.isError || !order) return <main className="flex min-h-[70vh] items-center justify-center bg-[#0a0a0c] px-4 text-center text-white"><section role="alert" className="max-w-md rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8"><Clock className="mx-auto h-10 w-10 text-rose-300" /><h1 className="mt-4 font-heading text-xl font-bold">Pesanan tidak dapat dibuka</h1><p className="mt-2 text-xs text-neutral-300">{getApiErrorMessage(orderQuery.error, 'ID tidak ditemukan atau akun ini tidak memiliki akses.')}</p><div className="mt-5 flex justify-center gap-2"><button type="button" onClick={() => void orderQuery.refetch()} className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold">Coba Lagi</button><Link href="/orders" className="rounded-xl bg-[#9c6b3a] px-4 py-2 text-xs font-bold">Riwayat Order</Link></div></section></main>;

  const cancelled = order.status === 'CANCELLED';
  const currentStepIndex = Math.max(0, STEPS.findIndex((step) => step.status === order.status));
  const activeStep = STEPS[currentStepIndex];
  const estimatedMinutes = Math.max(1, ...order.items.map((item) => item.product?.preparationTime ?? 5));
  const branchName = branch?.name ?? 'Cabang Warkop Ya\'reh';

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
    ].join('\n');
    const url = URL.createObjectURL(new Blob([receipt], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${order.orderNumber}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-[#0a0a0c] px-4 pb-32 pt-8 text-white sm:px-6 sm:pt-10 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-center"><div><div className="mb-1 flex items-center gap-2 font-mono text-xs text-[#f59e0b]"><span className={`h-2 w-2 rounded-full ${cancelled || order.status === 'COMPLETED' ? 'bg-neutral-500' : 'animate-pulse bg-emerald-400'}`} />STATUS SERVER + REALTIME</div><h1 className="font-heading text-2xl font-extrabold sm:text-3xl">Pesanan {order.orderNumber}</h1><p className="mt-1 text-xs text-neutral-400">{branchName} · {new Date(order.createdAt).toLocaleString('id-ID')}</p></div><button type="button" onClick={downloadReceipt} className="flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:bg-white/10"><Download className="h-3.5 w-3.5" />Unduh Bukti</button></div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <section className="space-y-6 lg:col-span-7">
          <div className={`relative overflow-hidden rounded-3xl border p-6 shadow-2xl sm:p-8 ${cancelled ? 'border-rose-500/30 bg-rose-950/20' : 'border-white/10 bg-gradient-to-br from-[#18181c] to-[#141418]'}`}><div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><span className={`rounded-full border px-3 py-1 font-mono text-xs font-bold ${cancelled ? 'border-rose-500/30 bg-rose-500/20 text-rose-300' : 'border-[#f59e0b]/30 bg-[#f59e0b]/20 text-[#fcd34d]'}`}>STATUS: {order.status}</span><h2 className="mt-3 font-heading text-2xl font-extrabold">{cancelled ? 'Pesanan Dibatalkan' : activeStep.label}</h2><p className="mt-1 max-w-sm text-xs text-neutral-400">{cancelled ? 'Pesanan tidak akan diproses lebih lanjut. Hubungi cabang jika memerlukan bantuan.' : activeStep.description}</p></div>{!cancelled && !['COMPLETED', 'SERVED'].includes(order.status) && <div className="min-w-32 rounded-2xl border border-white/10 bg-[#111114] p-4 text-center"><div className="font-mono text-[10px] uppercase text-neutral-400">Estimasi produksi</div><div className="mt-0.5 font-mono text-2xl font-extrabold text-[#f59e0b]">~{estimatedMinutes} mnt</div><div className="mt-0.5 text-[10px] text-neutral-500">Estimasi, bukan SLA</div></div>}</div></div>

          {!cancelled && <div className="space-y-6 rounded-3xl border border-white/10 bg-[#18181c] p-6 sm:p-8"><h2 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-400">Alur Pesanan</h2><ol className="relative space-y-8 pl-6 before:absolute before:bottom-3 before:left-3 before:top-3 before:w-0.5 before:bg-white/10">{STEPS.map((step, index) => { const passed = index <= currentStepIndex; const current = index === currentStepIndex; const Icon = step.icon; return <li key={step.status} className="relative flex items-start gap-4"><span className={`absolute -left-6 top-0 flex h-6 w-6 items-center justify-center rounded-full border ${current ? 'border-[#f59e0b] bg-[#f59e0b] text-black shadow-[0_0_12px_#f59e0b]' : passed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-neutral-700 bg-[#111114] text-neutral-600'}`}><Icon className="h-3.5 w-3.5" /></span><span className="ml-3"><span className={`block font-heading text-sm font-bold ${passed ? 'text-white' : 'text-neutral-500'}`}>{step.label}</span><span className="mt-0.5 block text-xs text-neutral-400">{step.description}</span></span></li>; })}</ol></div>}

          <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#141418] p-5 text-xs"><div className="flex items-center gap-3"><span className="rounded-xl bg-white/5 p-2 text-[#f59e0b]"><MapPin className="h-4 w-4" /></span><span><span className="block font-semibold">{fulfillmentLabel(order)}</span><span className="mt-0.5 block text-[11px] text-neutral-400">{branchName}</span></span></div><span className={`rounded-full border px-2.5 py-1 font-mono text-xs ${order.paymentStatus === 'PAID' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : order.paymentStatus === 'FAILED' ? 'border-rose-500/20 bg-rose-500/10 text-rose-400' : 'border-amber-500/20 bg-amber-500/10 text-amber-300'}`}>{order.paymentStatus}</span></div>
        </section>

        <aside className="space-y-4 lg:col-span-5"><div className="rounded-3xl border border-white/10 bg-[#1c1c21] p-6 shadow-2xl sm:p-7"><div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4"><div><div className="font-heading text-base font-black uppercase tracking-widest">WARKOP YA&apos;REH</div><div className="font-mono text-[10px] text-neutral-400">DIGITAL ORDER RECEIPT</div></div><div className="text-right font-mono text-[10px] text-neutral-400">{new Date(order.createdAt).toLocaleDateString('id-ID')}</div></div><div className="mb-4 space-y-1 border-b border-white/5 pb-4 font-mono text-xs text-neutral-400"><div className="flex justify-between gap-3"><span>Pelanggan</span><span className="truncate text-white">{order.user?.name ?? order.customerName ?? 'Customer'}</span></div><div className="flex justify-between"><span>Layanan</span><span className="text-white">{fulfillmentLabel(order)}</span></div></div><div className="space-y-3">{order.items.map((item) => <div key={item.id} className="flex justify-between gap-3 text-xs"><div className="min-w-0"><span className="block truncate text-white">{item.quantity}× {item.snapshotName}</span>{item.customizations && <span className="mt-0.5 block truncate text-[10px] text-neutral-500">{Object.values(item.customizations).join(' · ')}</span>}</div><span className="shrink-0 font-mono">Rp {item.totalPrice.toLocaleString('id-ID')}</span></div>)}</div><div className="mt-5 space-y-2 border-t border-dashed border-white/15 pt-4 font-mono text-xs"><div className="flex justify-between text-neutral-400"><span>Subtotal</span><span>Rp {order.subtotal.toLocaleString('id-ID')}</span></div><div className="flex justify-between text-neutral-400"><span>Pajak</span><span>Rp {order.tax.toLocaleString('id-ID')}</span></div>{order.discount > 0 && <div className="flex justify-between text-emerald-400"><span>Diskon</span><span>-Rp {order.discount.toLocaleString('id-ID')}</span></div>}<div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold"><span>Total</span><span className="text-[#f59e0b]">Rp {order.total.toLocaleString('id-ID')}</span></div></div></div>{order.status === 'COMPLETED' && <Link href={`/orders/${order.id}/thankyou`} className="block w-full rounded-xl bg-[#9c6b3a] px-4 py-3 text-center text-xs font-bold">Beri Penilaian</Link>}<Link href="/orders" className="block w-full rounded-xl border border-white/10 px-4 py-3 text-center text-xs font-semibold text-neutral-300">Kembali ke Riwayat</Link></aside>
      </div>
    </main>
  );
}
