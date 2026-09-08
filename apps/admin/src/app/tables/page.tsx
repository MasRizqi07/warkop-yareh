'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { BellRing, Users } from 'lucide-react';
import {
  DataPanel,
  Notice,
  PageHeading,
  fieldClass,
  formatDateTime,
  formatRupiah,
  secondaryButtonClass,
  useAsyncResource,
} from '@/components/management/page-kit';
import { getAdminToken } from '@/lib/api';
import {
  getTables,
  getWaiterCalls,
  resolveWaiterCall,
  updateTableStatus,
  type TableRecord,
} from '@/lib/management-api';
import { getOperationalBranchScope } from '@/lib/operations-api';

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1').replace(/\/api\/v1\/?$/, '');
const TRANSITIONS: Record<TableRecord['status'], TableRecord['status'][]> = {
  AVAILABLE: ['OCCUPIED', 'RESERVED', 'MAINTENANCE'],
  OCCUPIED: ['CLEANING'],
  RESERVED: ['OCCUPIED', 'AVAILABLE'],
  CLEANING: ['AVAILABLE', 'MAINTENANCE'],
  MAINTENANCE: ['AVAILABLE'],
};

export default function TablesDashboardPage() {
  const scope = useAsyncResource(getOperationalBranchScope);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const branchId = selectedBranchId ?? scope.data?.user.branchId ?? scope.data?.branches[0]?.id ?? '';
  const resource = useAsyncResource(async () => {
    if (!branchId) return { tables: [], calls: [] };
    const [tables, calls] = await Promise.all([getTables(branchId), getWaiterCalls(branchId)]);
    return { tables, calls };
  }, branchId);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const reloadTables = resource.reload;

  useEffect(() => {
    if (!branchId) return;
    const token = getAdminToken();
    if (!token) return;
    const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket', 'polling'] });
    socket.on('connect', () => socket.emit('joinCashier', { branchId }));
    socket.on('table.updated', () => void reloadTables());
    socket.on('waiter.called', () => void reloadTables());
    socket.on('waiter.resolved', () => void reloadTables());
    return () => {
      socket.disconnect();
    };
  }, [branchId, reloadTables]);

  async function setStatus(table: TableRecord, status: TableRecord['status']) {
    setBusyId(table.id);
    setNotice(null);
    try {
      await updateTableStatus(table.id, status);
      setNotice({ tone: 'success', text: `Meja ${table.number} diperbarui menjadi ${status}.` });
      await resource.reload();
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'Status meja gagal diperbarui.' });
    } finally {
      setBusyId(null);
    }
  }

  async function resolveCall(id: string) {
    setBusyId(id);
    setNotice(null);
    try {
      await resolveWaiterCall(id);
      setNotice({ tone: 'success', text: 'Panggilan waiter ditandai selesai.' });
      await resource.reload();
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'Panggilan gagal diselesaikan.' });
    } finally {
      setBusyId(null);
    }
  }

  const occupied = resource.data?.tables.filter((table) => table.status === 'OCCUPIED').length ?? 0;
  const total = resource.data?.tables.length ?? 0;

  return (
    <div className="mx-auto min-h-screen max-w-7xl space-y-7 p-5 sm:p-8">
      <PageHeading eyebrow="Live floor" title="Meja & waiter calls" description="Status awal selalu dimuat dari API, lalu disinkronkan melalui kanal WebSocket terautentikasi untuk cabang yang dipilih." actions={<button type="button" className={secondaryButtonClass} onClick={() => void resource.reload()}>Muat ulang</button>} />
      <div className="grid gap-4 sm:grid-cols-[minmax(240px,1fr)_180px_180px]"><label className="text-sm font-semibold">Cabang<select disabled={!scope.data?.canViewAllBranches} className={`${fieldClass} mt-2`} value={branchId} onChange={(event) => setSelectedBranchId(event.target.value)}><option value="">Pilih cabang</option>{scope.data?.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label><div className="rounded-xl border border-border-subtle bg-surface-card p-4"><p className="text-xs text-text-secondary">Okupansi</p><p className="mt-1 text-xl font-bold">{total ? Math.round((occupied / total) * 100) : 0}%</p></div><div className="rounded-xl border border-border-subtle bg-surface-card p-4"><p className="text-xs text-text-secondary">Panggilan aktif</p><p className="mt-1 text-xl font-bold">{resource.data?.calls.length ?? 0}</p></div></div>
      {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
      <DataPanel loading={scope.loading || resource.loading} error={scope.error || resource.error} empty={!branchId} onRetry={() => { void scope.reload(); void resource.reload(); }}>
        {resource.data ? <div className="grid gap-6 xl:grid-cols-[1fr_340px]"><section><h2 className="mb-4 text-lg font-bold">Denah operasional</h2>{resource.data.tables.length === 0 ? <p className="rounded-2xl border border-dashed border-border-subtle p-8 text-center text-text-secondary">Belum ada meja aktif.</p> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{resource.data.tables.map((table) => <article key={table.id} className="rounded-2xl border border-border-subtle bg-surface-card p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-accent">{table.status}</p><h3 className="mt-2 text-2xl font-bold">Meja {table.number}</h3></div><p className="flex items-center gap-1 text-sm text-text-secondary"><Users className="h-4 w-4" />{table.capacity}</p></div>{table.orders[0] ? <div className="mt-4 rounded-xl bg-surface-secondary p-3"><p className="text-sm font-semibold">Order aktif</p><p className="text-xs text-text-secondary">{table.orders[0].status} · {formatRupiah(table.orders[0].total)}</p></div> : <p className="mt-4 text-sm text-text-secondary">Tidak ada order aktif.</p>}<label className="mt-5 block text-xs font-semibold">Ubah status<select disabled={busyId === table.id} className={`${fieldClass} mt-2`} value="" onChange={(event) => { if (event.target.value) void setStatus(table, event.target.value as TableRecord['status']); }}><option value="">Pilih transisi…</option>{TRANSITIONS[table.status].map((status) => <option key={status}>{status}</option>)}</select></label></article>)}</div>}</section><aside><h2 className="mb-4 text-lg font-bold">Panggilan waiter</h2>{resource.data.calls.length === 0 ? <p className="rounded-2xl border border-dashed border-border-subtle p-8 text-center text-sm text-text-secondary">Tidak ada panggilan tertunda.</p> : <ul className="space-y-3">{resource.data.calls.map((call) => <li key={call.id} className="rounded-2xl border border-border-subtle bg-surface-card p-4"><div className="flex items-start gap-3"><BellRing className="mt-1 h-5 w-5 text-accent" /><div className="flex-1"><p className="font-bold">Meja {call.table.number}</p><p className="text-xs text-text-secondary">{call.type} · {call.priority ?? 'NORMAL'}</p><p className="mt-1 text-xs text-text-secondary">{formatDateTime(call.createdAt)}</p></div></div><button type="button" disabled={busyId === call.id} className={`${secondaryButtonClass} mt-4 w-full`} onClick={() => void resolveCall(call.id)}>Tandai selesai</button></li>)}</ul>}</aside></div> : null}
      </DataPanel>
    </div>
  );
}
