'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { io } from 'socket.io-client';
import { Clock, Coffee, UtensilsCrossed } from 'lucide-react';
import { getAdminToken } from '@/lib/api';
import { getOrders, updateOrderStatus, type OrderRecord, type OrderStatus } from '@/lib/management-api';
import { getOperationalBranchScope } from '@/lib/operations-api';
import { DataPanel, Notice, fieldClass, useAsyncResource } from '@/components/management/page-kit';

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1').replace(/\/api\/v1\/?$/, '');
const COLUMNS: Array<{ status: OrderStatus; label: string; next?: OrderStatus }> = [
  { status: 'PENDING', label: 'Baru', next: 'PREPARING' },
  { status: 'CONFIRMED', label: 'Terkonfirmasi', next: 'PREPARING' },
  { status: 'PREPARING', label: 'Disiapkan', next: 'READY' },
  { status: 'READY', label: 'Siap diantar', next: 'SERVED' },
];

function Elapsed({ createdAt }: { createdAt: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);
  const elapsed = Math.max(0, now - new Date(createdAt).getTime());
  const minutes = Math.floor(elapsed / 60_000);
  const seconds = Math.floor((elapsed % 60_000) / 1_000);
  return <span className={minutes >= 10 ? 'text-red-400' : minutes >= 5 ? 'text-amber-400' : 'text-slate-300'}>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>;
}

export default function KitchenPage() {
  const scope = useAsyncResource(getOperationalBranchScope);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const branchId = selectedBranchId ?? scope.data?.user.branchId ?? scope.data?.branches[0]?.id ?? '';
  const resource = useAsyncResource(async () => {
    if (!branchId) return [];
    const response = await getOrders({ branchId, limit: 100 });
    return response.data.filter((order) => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(order.status));
  }, branchId);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const reloadOrders = resource.reload;

  useEffect(() => {
    if (!branchId) return;
    const token = getAdminToken();
    if (!token) return;
    const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket', 'polling'] });
    socket.on('connect', () => socket.emit('joinKitchen', { branchId }));
    socket.on('order.created', () => void reloadOrders());
    socket.on('order.updated', () => void reloadOrders());
    return () => {
      socket.disconnect();
    };
  }, [branchId, reloadOrders]);

  async function advance(order: OrderRecord, status: OrderStatus) {
    setBusyId(order.id);
    setNotice(null);
    try {
      await updateOrderStatus(order.id, status);
      setNotice({ tone: 'success', text: `${order.orderNumber} diperbarui menjadi ${status}.` });
      await resource.reload();
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'Status order gagal diperbarui.' });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-6">
      <header className="mx-auto flex max-w-[1800px] flex-col gap-4 border-b border-slate-800 pb-5 md:flex-row md:items-end md:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-400">Authenticated live terminal</p><h1 className="mt-2 text-3xl font-bold">Kitchen Display System</h1><p className="mt-1 text-sm text-slate-400">Order awal dari REST API, pembaruan dari WebSocket cabang yang terotorisasi.</p></div>
        <div className="flex flex-wrap items-end gap-3"><label className="text-xs font-semibold text-slate-300">Cabang<select disabled={!scope.data?.canViewAllBranches} className={`${fieldClass} mt-2 min-w-56 bg-slate-900`} value={branchId} onChange={(event) => setSelectedBranchId(event.target.value)}><option value="">Pilih cabang</option>{scope.data?.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label><button type="button" onClick={() => void resource.reload()} className="min-h-11 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold">Muat ulang</button><Link href="/" className="min-h-11 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold leading-7">Dashboard</Link></div>
      </header>
      {notice ? <div className="mx-auto mt-5 max-w-[1800px]"><Notice tone={notice.tone}>{notice.text}</Notice></div> : null}
      <div className="mx-auto mt-6 max-w-[1800px]"><DataPanel loading={scope.loading || resource.loading} error={scope.error || resource.error} empty={!branchId} onRetry={() => { void scope.reload(); void resource.reload(); }}>{branchId ? <div className="grid gap-5 xl:grid-cols-4">{COLUMNS.map((column) => { const orders = (resource.data ?? []).filter((order) => order.status === column.status); return <section key={column.status} className="min-h-[420px] rounded-2xl border border-slate-800 bg-slate-900/60"><div className="flex items-center justify-between border-b border-slate-800 p-4"><h2 className="font-bold">{column.label}</h2><span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-bold">{orders.length}</span></div>{orders.length === 0 ? <div className="flex min-h-80 flex-col items-center justify-center gap-3 text-slate-500"><Coffee className="h-7 w-7" /><p className="text-sm">Tidak ada order</p></div> : <ul className="space-y-4 p-4">{orders.map((order) => <li key={order.id} className="rounded-xl border border-slate-700 bg-slate-900 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-lg font-bold">{order.orderNumber}</p><p className="mt-1 text-xs text-slate-400">{order.type}{order.tableId ? ' · dine-in' : ''}</p></div><p className="flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 font-mono text-xs"><Clock className="h-3.5 w-3.5" /><Elapsed createdAt={order.createdAt} /></p></div><ul className="my-4 space-y-2 border-y border-slate-800 py-3">{order.items.map((item) => <li key={item.id} className="flex gap-3 text-sm"><span className="font-bold text-amber-400">{item.quantity}×</span><span>{item.snapshotName}{item.notes ? <span className="block text-xs text-slate-400">{item.notes}</span> : null}</span></li>)}</ul>{column.next ? <button type="button" disabled={busyId === order.id} onClick={() => void advance(order, column.next!)} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><UtensilsCrossed className="h-4 w-4" />{column.next === 'PREPARING' ? 'Mulai siapkan' : column.next === 'READY' ? 'Tandai siap' : 'Tandai disajikan'}</button> : null}</li>)}</ul>}</section>; })}</div> : null}</DataPanel></div>
    </main>
  );
}
