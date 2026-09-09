'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
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
import { getOrders, updateOrderStatus, type OrderRecord, type OrderStatus } from '@/lib/management-api';
import { getOperationalBranchScope } from '@/lib/operations-api';

async function loadOrders() {
  const scope = await getOperationalBranchScope();
  const branchId = scope.canViewAllBranches ? undefined : scope.user.branchId ?? undefined;
  const orders = await getOrders({ branchId, limit: 100 });
  return { scope, orders: orders.data };
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: 'PREPARING',
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'SERVED',
  SERVED: 'COMPLETED',
};

export default function OrdersPage() {
  const resource = useAsyncResource(loadOrders);
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const filtered = useMemo(() => {
    const needle = search.toLocaleLowerCase('id-ID').trim();
    return (resource.data?.orders ?? []).filter((order) =>
      (filter === 'ALL' || order.status === filter) &&
      (!needle || order.orderNumber.toLocaleLowerCase('id-ID').includes(needle) || (order.user?.name ?? order.customerName ?? 'walk-in').toLocaleLowerCase('id-ID').includes(needle)),
    );
  }, [filter, resource.data?.orders, search]);

  async function advance(order: OrderRecord) {
    const status = NEXT_STATUS[order.status];
    if (!status) return;
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
    <div className="mx-auto max-w-7xl space-y-7 p-5 sm:p-8">
      <PageHeading eyebrow="Order operations" title="Manajemen order" description="Order dipaginasikan dari server dan transisi status divalidasi ulang secara atomik oleh backend." actions={<button type="button" className={secondaryButtonClass} onClick={() => void resource.reload()}>Muat ulang</button>} />
      {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
      <div className="grid gap-3 sm:grid-cols-[1fr_240px]"><label className="relative"><span className="sr-only">Cari order</span><Search className="absolute left-3 top-3.5 h-4 w-4 text-text-secondary" /><input className={`${fieldClass} pl-10`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nomor order atau pelanggan…" /></label><label><span className="sr-only">Filter status</span><select className={fieldClass} value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}>{['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'].map((status) => <option key={status}>{status}</option>)}</select></label></div>
      <DataPanel loading={resource.loading} error={resource.error} empty={filtered.length === 0} onRetry={() => void resource.reload()}>
        <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface-card"><table className="min-w-[980px] w-full text-left text-sm"><thead className="border-b border-border-subtle bg-surface-secondary text-xs uppercase tracking-wider text-text-secondary"><tr><th className="p-4">Order</th><th className="p-4">Pelanggan</th><th className="p-4">Tipe</th><th className="p-4">Total</th><th className="p-4">Pembayaran</th><th className="p-4">Status</th><th className="p-4">Aksi</th></tr></thead><tbody className="divide-y divide-border-subtle">{filtered.map((order) => <OrderRow key={order.id} order={order} expanded={expandedId === order.id} busy={busyId === order.id} onToggle={() => setExpandedId((current) => current === order.id ? null : order.id)} onAdvance={() => void advance(order)} />)}</tbody></table></div>
      </DataPanel>
    </div>
  );
}

function OrderRow({ order, expanded, busy, onToggle, onAdvance }: { order: OrderRecord; expanded: boolean; busy: boolean; onToggle: () => void; onAdvance: () => void }) {
  const next = NEXT_STATUS[order.status];
  return (
    <>
      <tr><td className="p-4"><p className="font-bold">{order.orderNumber}</p><p className="text-xs text-text-secondary">{formatDateTime(order.createdAt)} · {order.items.length} item</p></td><td className="p-4">{order.user?.name ?? order.customerName ?? 'Walk-in'}</td><td className="p-4">{order.type}</td><td className="p-4"><p className="font-semibold">{formatRupiah(order.total)}</p><p className="text-xs text-text-secondary">PPN {formatRupiah(order.tax)} · service {formatRupiah(order.serviceFee)}</p></td><td className="p-4">{order.paymentStatus}</td><td className="p-4"><span className="rounded-full border border-border-subtle px-2.5 py-1 text-xs font-bold">{order.status}</span></td><td className="p-4"><div className="flex gap-2"><button type="button" className={secondaryButtonClass} onClick={onToggle}>{expanded ? 'Tutup' : 'Detail'}</button>{next ? <button type="button" disabled={busy} className={secondaryButtonClass} onClick={onAdvance}>{next}</button> : null}</div></td></tr>
      {expanded ? <tr><td colSpan={7} className="bg-surface-secondary p-5"><ul className="grid gap-2 md:grid-cols-2">{order.items.map((item) => <li key={item.id} className="flex justify-between rounded-lg border border-border-subtle bg-surface-card p-3"><span>{item.quantity}× {item.snapshotName}</span><span>{formatRupiah(item.totalPrice)}</span></li>)}</ul></td></tr> : null}
    </>
  );
}
