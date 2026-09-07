'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CountUp } from '@warkop-yareh/ui';
import {
  Activity,
  BarChart3,
  Download,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  Store,
  Users,
  WalletCards,
} from 'lucide-react';
import {
  getAdminProfile,
  getBranches,
  getCategoryPerformance,
  getCustomerInsights,
  getRevenueAnalytics,
  type BranchRecord,
  type CategoryPerformance,
  type RevenueAnalytics,
} from '@/lib/operations-api';

interface AnalyticsSnapshot {
  revenue: RevenueAnalytics;
  categories: CategoryPerformance[];
  customerCount: number;
}

const GLOBAL_BRANCH_ROLES = new Set(['ADMIN', 'SUPERADMIN']);
const EMPTY_REVENUE: RevenueAnalytics = {
  totalRevenue: 0,
  orderCount: 0,
  averageOrderValue: 0,
};

const rupiah = (value: number) =>
  `Rp ${value.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;

async function fetchSnapshot(branchId?: string): Promise<AnalyticsSnapshot> {
  const [revenue, categories, customers] = await Promise.all([
    getRevenueAnalytics(branchId),
    getCategoryPerformance(branchId),
    getCustomerInsights({ branchId, page: 1, limit: 1 }),
  ]);
  return { revenue, categories, customerCount: customers.meta.total };
}

function csvCell(value: string | number): string {
  const text = String(value);
  const spreadsheetSafe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${spreadsheetSafe.replaceAll('"', '""')}"`;
}

function downloadFile(filename: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ExecutiveOperationsAnalyticsPage() {
  const requestId = useRef(0);
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [canViewConsolidated, setCanViewConsolidated] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [revenue, setRevenue] = useState<RevenueAnalytics>(EMPTY_REVENUE);
  const [categories, setCategories] = useState<CategoryPerformance[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applySnapshot = useCallback((snapshot: AnalyticsSnapshot) => {
    setRevenue(snapshot.revenue);
    setCategories(snapshot.categories);
    setCustomerCount(snapshot.customerCount);
    setLoadedAt(new Date());
  }, []);

  const loadSnapshot = useCallback(
    async (branchId: string) => {
      const currentRequest = ++requestId.current;
      setLoading(true);
      setError(null);
      try {
        const snapshot = await fetchSnapshot(branchId || undefined);
        if (requestId.current === currentRequest) applySnapshot(snapshot);
      } catch (loadError: unknown) {
        if (requestId.current !== currentRequest) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Analytics could not be loaded'
        );
      } finally {
        if (requestId.current === currentRequest) setLoading(false);
      }
    },
    [applySnapshot]
  );

  useEffect(() => {
    let active = true;
    const currentRequest = ++requestId.current;
    void Promise.all([getAdminProfile(), getBranches()])
      .then(async ([user, allBranches]) => {
        if (!active) return;
        const globalAccess = GLOBAL_BRANCH_ROLES.has(user.role);
        const visibleBranches = globalAccess
          ? allBranches
          : allBranches.filter((branch) => branch.id === user.branchId);
        const initialBranchId = globalAccess
          ? ''
          : visibleBranches[0]?.id || user.branchId || '';
        if (!globalAccess && !initialBranchId) {
          throw new Error(
            'This account needs a branch assignment before analytics can be opened'
          );
        }
        setCanViewConsolidated(globalAccess);
        setBranches(visibleBranches);
        setSelectedBranchId(initialBranchId);
        const snapshot = await fetchSnapshot(initialBranchId || undefined);
        if (active && requestId.current === currentRequest) {
          applySnapshot(snapshot);
        }
      })
      .catch((loadError: unknown) => {
        if (!active || requestId.current !== currentRequest) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Analytics could not be loaded'
        );
      })
      .finally(() => {
        if (active && requestId.current === currentRequest) setLoading(false);
      });
    return () => {
      active = false;
      requestId.current += 1;
    };
  }, [applySnapshot]);

  const selectedBranchName =
    branches.find((branch) => branch.id === selectedBranchId)?.name ??
    'Semua cabang';
  const totalUnits = useMemo(
    () => categories.reduce((sum, item) => sum + item.unitsSold, 0),
    [categories]
  );
  const maximumCategoryRevenue = Math.max(
    1,
    ...categories.map((item) => item.revenue)
  );

  const exportJson = () => {
    downloadFile(
      `analytics-${selectedBranchId || 'all'}-${Date.now()}.json`,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          scope: selectedBranchName,
          basis: 'completed orders, all time',
          revenue,
          customerCount,
          categories,
        },
        null,
        2
      ),
      'application/json;charset=utf-8'
    );
  };

  const exportCsv = () => {
    const rows = [
      ['category', 'units_sold', 'revenue_rupiah'],
      ...categories.map((item) => [
        item.category,
        item.unitsSold,
        item.revenue,
      ]),
    ];
    downloadFile(
      `category-performance-${selectedBranchId || 'all'}-${Date.now()}.csv`,
      rows.map((row) => row.map(csvCell).join(',')).join('\r\n'),
      'text/csv;charset=utf-8'
    );
  };

  return (
    <main className="min-h-screen bg-canvas-obsidian px-4 py-8 text-text-primary sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent-amber">
              <Activity className="h-4 w-4" /> Operations / Analytics
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Revenue &amp; Category Performance
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-text-muted">
              Angka dihitung dari order berstatus COMPLETED yang tersimpan.
              Cakupan waktu saat ini adalah sepanjang riwayat data, bukan feed
              real-time.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportCsv}
              disabled={loading || categories.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> CSV kategori
            </button>
            <button
              type="button"
              onClick={exportJson}
              disabled={loading || !loadedAt}
              className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> JSON snapshot
            </button>
            <button
              type="button"
              onClick={() => void loadSnapshot(selectedBranchId)}
              disabled={loading}
              className="primary-cta-motion inline-flex items-center gap-2 rounded-xl bg-brand-coffee px-4 py-2 text-sm font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              Muat ulang
            </button>
          </div>
        </header>

        <section className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3 text-sm font-medium">
            <Store className="h-4 w-4 text-accent-amber" />
            <span>Cakupan cabang</span>
            <select
              value={selectedBranchId}
              disabled={
                loading || (!canViewConsolidated && branches.length < 2)
              }
              onChange={(event) => {
                const branchId = event.target.value;
                setSelectedBranchId(branchId);
                void loadSnapshot(branchId);
              }}
              className="rounded-xl border border-border-subtle bg-surface-secondary px-3 py-2 text-text-primary disabled:opacity-60"
            >
              {canViewConsolidated && <option value="">Semua cabang</option>}
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>
          <p className="font-mono text-xs text-text-muted" aria-live="polite">
            {loading
              ? 'Mengambil snapshot…'
              : loadedAt
                ? `Dimuat ${loadedAt.toLocaleString('id-ID')}`
                : 'Belum ada snapshot'}
          </p>
        </section>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-error/40 bg-error-container px-4 py-3 text-sm text-on-error-container"
          >
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={WalletCards}
            label="Pendapatan selesai"
            value={revenue.totalRevenue}
            prefix="Rp "
            supporting={rupiah(revenue.totalRevenue)}
            loading={loading}
          />
          <MetricCard
            icon={ReceiptText}
            label="Order selesai"
            value={revenue.orderCount}
            supporting="Transaksi berstatus COMPLETED"
            loading={loading}
          />
          <MetricCard
            icon={BarChart3}
            label="Rata-rata nilai order"
            value={revenue.averageOrderValue}
            prefix="Rp "
            supporting={rupiah(revenue.averageOrderValue)}
            loading={loading}
          />
          <MetricCard
            icon={Users}
            label="Akun pelanggan"
            value={customerCount}
            supporting={`Dalam cakupan ${selectedBranchName}`}
            loading={loading}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-card">
          <div className="flex flex-col gap-2 border-b border-border-subtle p-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-accent-amber">
                Persisted order items
              </p>
              <h2 className="mt-1 text-xl font-semibold">Kinerja kategori</h2>
            </div>
            <p className="text-sm text-text-muted">
              {totalUnits.toLocaleString('id-ID')} unit pada {categories.length}{' '}
              kategori
            </p>
          </div>

          {loading ? (
            <div
              className="p-8 text-center text-sm text-text-muted"
              role="status"
            >
              Menghitung data kategori…
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center">
              <PackageCheck className="mx-auto h-9 w-9 text-text-muted" />
              <p className="mt-3 text-sm text-text-muted">
                Belum ada item dari order selesai untuk cakupan ini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-surface-secondary text-xs uppercase tracking-wider text-text-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Kategori</th>
                    <th className="px-5 py-3 text-right font-medium">Unit</th>
                    <th className="px-5 py-3 text-right font-medium">
                      Pendapatan
                    </th>
                    <th className="px-5 py-3 font-medium">Proporsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {categories.map((item) => (
                    <tr key={item.category}>
                      <td className="px-5 py-4 font-semibold">
                        {item.category}
                      </td>
                      <td className="px-5 py-4 text-right font-mono">
                        {item.unitsSold.toLocaleString('id-ID')}
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-accent-amber">
                        {rupiah(item.revenue)}
                      </td>
                      <td className="w-56 px-5 py-4">
                        <div className="h-2 overflow-hidden rounded-full bg-surface-secondary">
                          <div
                            className="h-full rounded-full bg-accent-amber"
                            style={{
                              width: `${Math.max(
                                2,
                                (item.revenue / maximumCategoryRevenue) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  prefix,
  supporting,
  loading,
}: {
  icon: typeof Activity;
  label: string;
  value: number;
  prefix?: string;
  supporting: string;
  loading: boolean;
}) {
  return (
    <article className="delight-card rounded-2xl border border-border-subtle bg-surface-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-muted">{label}</p>
        <Icon className="h-5 w-5 text-accent-amber" />
      </div>
      <p className="mt-4 font-mono text-2xl font-bold" aria-busy={loading}>
        {loading ? (
          <span className="text-text-muted">—</span>
        ) : (
          <CountUp value={value} prefix={prefix} />
        )}
      </p>
      <p className="mt-2 text-xs text-text-muted">{supporting}</p>
    </article>
  );
}
