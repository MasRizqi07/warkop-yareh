'use client';

import Link from 'next/link';
import { Activity, CalendarDays, PackageCheck, ReceiptText } from 'lucide-react';
import {
  DataPanel,
  PageHeading,
  formatDateTime,
  formatRupiah,
  useAsyncResource,
} from '@/components/management/page-kit';
import {
  getBranchProducts,
  getOperationalBranchScope,
  getRevenueAnalytics,
} from '@/lib/operations-api';
import { getEvents, getOrders } from '@/lib/management-api';

async function loadOverview() {
  const scope = await getOperationalBranchScope();
  const branchId = scope.user.branchId ?? scope.branches[0]?.id;
  if (!branchId) throw new Error('Belum ada cabang aktif untuk ditampilkan.');

  const [orders, inventory, revenue, events] = await Promise.all([
    getOrders({ branchId, limit: 8 }),
    getBranchProducts(branchId),
    scope.canAccessManagement
      ? getRevenueAnalytics(branchId)
      : Promise.resolve(null),
    scope.canAccessManagement ? getEvents(branchId) : Promise.resolve(null),
  ]);
  return { scope, branchId, orders, inventory, revenue, events };
}

export default function AdminDashboard() {
  const resource = useAsyncResource(loadOverview);
  const overview = resource.data;
  const lowStock =
    overview?.inventory.filter((item) => {
      const quantity = Number(item.stockQuantity);
      const threshold = Number(item.stockThreshold);
      return (
        Number.isFinite(quantity) &&
        Number.isFinite(threshold) &&
        quantity <= threshold
      );
    }) ?? [];
  const openOrders =
    overview?.orders.data.filter(
      (order) => !['COMPLETED', 'CANCELLED'].includes(order.status),
    ).length ?? 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
      <PageHeading
        eyebrow="Operational intelligence"
        title="Ringkasan operasional"
        description="Data pada halaman ini dibaca langsung dari API untuk cabang aktif; tidak ada metrik demo atau status perangkat rekaan."
        actions={
          <button
            type="button"
            onClick={() => void resource.reload()}
            className="rounded-xl border border-border-subtle bg-surface-card px-4 py-2 text-sm font-semibold"
          >
            Muat ulang
          </button>
        }
      />

      <DataPanel
        loading={resource.loading}
        error={resource.error}
        empty={!overview}
        onRetry={() => void resource.reload()}
      >
        {overview ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: 'Pendapatan tercatat',
                  value: overview.revenue
                    ? formatRupiah(overview.revenue.totalRevenue)
                    : 'Akses terbatas',
                  icon: Activity,
                },
                {
                  label: 'Order aktif',
                  value: String(openOrders),
                  icon: ReceiptText,
                },
                {
                  label: 'Stok di ambang batas',
                  value: String(lowStock.length),
                  icon: PackageCheck,
                },
                {
                  label: 'Event tercatat',
                  value: overview.events
                    ? String(overview.events.meta.total)
                    : 'Akses terbatas',
                  icon: CalendarDays,
                },
              ].map(({ label, value, icon: Icon }) => (
                <article
                  key={label}
                  className="rounded-2xl border border-border-subtle bg-surface-card p-5"
                >
                  <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-text-secondary">
                    {label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-text-primary">
                    {value}
                  </p>
                </article>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <section className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-card">
                <div className="flex items-center justify-between border-b border-border-subtle p-5">
                  <div>
                    <h2 className="font-bold">Order terbaru</h2>
                    <p className="text-xs text-text-secondary">
                      {
                        overview.scope.branches.find(
                          (branch) => branch.id === overview.branchId,
                        )?.name
                      }
                    </p>
                  </div>
                  <Link href="/orders" className="text-sm font-semibold text-accent">
                    Lihat semua
                  </Link>
                </div>
                {overview.orders.data.length === 0 ? (
                  <p className="p-8 text-center text-sm text-text-secondary">
                    Belum ada order.
                  </p>
                ) : (
                  <ul className="divide-y divide-border-subtle">
                    {overview.orders.data.map((order) => (
                      <li
                        key={order.id}
                        className="flex flex-wrap items-center justify-between gap-3 p-4"
                      >
                        <div>
                          <p className="font-semibold">{order.orderNumber}</p>
                          <p className="text-xs text-text-secondary">
                            {formatDateTime(order.createdAt)} · {order.items.length}{' '}
                            item
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatRupiah(order.total)}</p>
                          <p className="text-xs text-text-secondary">
                            {order.status} / {order.paymentStatus}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-2xl border border-border-subtle bg-surface-card p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold">Perhatian stok</h2>
                  <Link href="/inventory" className="text-sm font-semibold text-accent">
                    Kelola
                  </Link>
                </div>
                {lowStock.length === 0 ? (
                  <p className="mt-8 text-sm text-text-secondary">
                    Tidak ada produk yang melewati ambang stok.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {lowStock.slice(0, 8).map((item) => (
                      <li
                        key={item.id}
                        className="rounded-xl border border-border-subtle p-3"
                      >
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-xs text-text-secondary">
                          {item.stockQuantity ?? '—'} {item.stockUnit ?? ''} · batas{' '}
                          {item.stockThreshold ?? '—'}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        ) : null}
      </DataPanel>
    </div>
  );
}
