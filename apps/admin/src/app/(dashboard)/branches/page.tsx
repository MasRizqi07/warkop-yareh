'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  Clock3,
  MapPin,
  RefreshCw,
  Save,
  Search,
  Store,
  Users,
} from 'lucide-react';
import {
  getBranches,
  getBranchProducts,
  updateBranch,
  updateBranchProduct,
  type BranchProductRecord,
  type BranchRecord,
} from '@/lib/operations-api';

interface ProductMatrixRow {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  byBranch: Map<string, BranchProductRecord>;
}

const rupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

export default function MultiBranchManagementPage() {
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [branchProducts, setBranchProducts] = useState<BranchProductRecord[]>(
    []
  );
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [search, setSearch] = useState('');
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [capacityDraft, setCapacityDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [branchData, productData] = await Promise.all([
        getBranches(),
        getBranchProducts(),
      ]);
      setBranches(branchData);
      setBranchProducts(productData);
      setSelectedBranchId((current) => current || branchData[0]?.id || '');
      setPriceDrafts(
        Object.fromEntries(
          productData.map((item) => [
            item.id,
            item.priceOverride === null ? '' : String(item.priceOverride),
          ])
        )
      );
    } catch (loadError: unknown) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Branch operations data could not be loaded'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectedBranch = branches.find(
    (branch) => branch.id === selectedBranchId
  );

  useEffect(() => {
    setCapacityDraft(selectedBranch ? String(selectedBranch.capacity) : '');
  }, [selectedBranch]);

  const matrix = useMemo(() => {
    const rows = new Map<string, ProductMatrixRow>();
    for (const item of branchProducts) {
      const row = rows.get(item.productId) ?? {
        id: item.productId,
        name: item.product.name,
        category: item.product.category.name,
        basePrice: item.product.price,
        byBranch: new Map<string, BranchProductRecord>(),
      };
      row.byBranch.set(item.branchId, item);
      rows.set(item.productId, row);
    }
    const query = search.trim().toLocaleLowerCase('en-US');
    return [...rows.values()].filter(
      (row) =>
        !query ||
        row.name.toLocaleLowerCase('en-US').includes(query) ||
        row.category.toLocaleLowerCase('en-US').includes(query)
    );
  }, [branchProducts, search]);

  const replaceBranchProduct = (updated: BranchProductRecord) => {
    setBranchProducts((current) =>
      current.map((item) => (item.id === updated.id ? updated : item))
    );
    setPriceDrafts((current) => ({
      ...current,
      [updated.id]:
        updated.priceOverride === null ? '' : String(updated.priceOverride),
    }));
  };

  const savePrice = async (item: BranchProductRecord) => {
    const key = `price:${item.id}`;
    const raw = priceDrafts[item.id] ?? '';
    const priceOverride = raw.trim() === '' ? null : Number(raw);
    if (
      priceOverride !== null &&
      (!Number.isInteger(priceOverride) || priceOverride < 0)
    ) {
      setError('Price overrides must be non-negative whole Rupiah values');
      return;
    }
    setSavingKey(key);
    setError(null);
    try {
      replaceBranchProduct(
        await updateBranchProduct(item.branchId, item.productId, {
          priceOverride,
        })
      );
      setNotice(
        `${item.product.name} price persisted for ${item.branch.name}.`
      );
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Price override could not be saved'
      );
    } finally {
      setSavingKey(null);
    }
  };

  const toggleAvailability = async (item: BranchProductRecord) => {
    const key = `availability:${item.id}`;
    setSavingKey(key);
    setError(null);
    try {
      const updated = await updateBranchProduct(item.branchId, item.productId, {
        isAvailable: !item.isAvailable,
      });
      replaceBranchProduct(updated);
      setNotice(
        `${updated.product.name} is now ${updated.isAvailable ? 'available' : 'unavailable'} at ${updated.branch.name}.`
      );
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Availability could not be saved'
      );
    } finally {
      setSavingKey(null);
    }
  };

  const saveCapacity = async () => {
    if (!selectedBranch) return;
    const capacity = Number(capacityDraft);
    if (!Number.isInteger(capacity) || capacity < 0) {
      setError('Branch capacity must be a non-negative whole number');
      return;
    }
    const key = `branch:${selectedBranch.id}`;
    setSavingKey(key);
    setError(null);
    try {
      const updated = await updateBranch(selectedBranch.id, { capacity });
      setBranches((current) =>
        current.map((branch) => (branch.id === updated.id ? updated : branch))
      );
      setNotice(`${updated.name} capacity persisted.`);
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Branch capacity could not be saved'
      );
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <main className="min-h-screen bg-canvas-obsidian px-4 py-8 text-text-primary sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent-amber">
              Store Ops / Branch API
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Multi-Branch Catalog Control
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-text-muted">
              Outlet metadata, localized prices, and availability come from the
              branch and catalog APIs. Every edit is persisted before the UI is
              updated.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            className="primary-cta-motion inline-flex items-center justify-center gap-2 rounded-xl bg-brand-coffee px-4 py-2 text-sm font-semibold text-on-primary"
          >
            <RefreshCw className="h-4 w-4" /> Reload API data
          </button>
        </header>

        {(error || notice) && (
          <div
            role={error ? 'alert' : 'status'}
            className={`rounded-xl border px-4 py-3 text-sm ${
              error
                ? 'border-error/40 bg-error-container text-on-error-container'
                : 'border-primary/30 bg-primary-container text-on-primary-container'
            }`}
          >
            {error ?? notice}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {branches.map((branch) => (
            <button
              key={branch.id}
              type="button"
              onClick={() => setSelectedBranchId(branch.id)}
              className={`delight-card rounded-2xl border p-5 text-left ${
                selectedBranchId === branch.id
                  ? 'border-accent-amber bg-surface-container'
                  : 'border-border-subtle bg-surface-card'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">{branch.name}</h2>
                  <p className="mt-1 text-xs text-text-muted">
                    {branch.address}, {branch.city}
                  </p>
                </div>
                {branch.isMainBranch && (
                  <span className="rounded-full bg-primary-container px-2 py-1 text-[10px] font-bold text-on-primary-container">
                    MAIN
                  </span>
                )}
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-surface-secondary p-3">
                  <dt className="flex items-center gap-1 text-text-muted">
                    <Users className="h-3.5 w-3.5" /> Capacity
                  </dt>
                  <dd className="mt-1 font-mono text-lg font-bold">
                    {branch.capacity}
                  </dd>
                </div>
                <div className="rounded-xl bg-surface-secondary p-3">
                  <dt className="flex items-center gap-1 text-text-muted">
                    <Clock3 className="h-3.5 w-3.5" /> Weekday
                  </dt>
                  <dd className="mt-1 font-mono font-semibold">
                    {branch.weekdayHours}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 flex items-center gap-2 text-xs text-text-muted">
                <MapPin className="h-4 w-4 text-accent-amber" />
                {branch.province} · {branch.features.length} features
              </p>
            </button>
          ))}
        </section>

        {selectedBranch && (
          <section className="rounded-2xl border border-border-subtle bg-surface-card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-accent-amber">
                  Persisted outlet setting
                </p>
                <h2 className="mt-1 text-lg font-bold">
                  {selectedBranch.name} capacity
                </h2>
              </div>
              <div className="flex gap-2">
                <input
                  aria-label={`${selectedBranch.name} capacity`}
                  type="number"
                  min={0}
                  value={capacityDraft}
                  onChange={(event) => setCapacityDraft(event.target.value)}
                  className="w-32 rounded-xl border border-border-subtle bg-surface-secondary px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  disabled={savingKey === `branch:${selectedBranch.id}`}
                  onClick={() => void saveCapacity()}
                  className="primary-cta-motion inline-flex items-center gap-2 rounded-xl bg-brand-coffee px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-40"
                >
                  <Save className="h-4 w-4" /> Save
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-card">
          <div className="flex flex-col gap-3 border-b border-border-subtle p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Store className="h-5 w-5 text-accent-amber" /> Localized
                pricing &amp; availability
              </h2>
              <p className="mt-1 text-xs text-text-muted">
                Blank override means the product base price is used.
              </p>
            </div>
            <label className="relative w-full sm:w-72">
              <span className="sr-only">Filter branch catalog</span>
              <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Filter products"
                className="w-full rounded-xl border border-border-subtle bg-surface-secondary py-2.5 pl-10 pr-3 text-sm"
              />
            </label>
          </div>

          {loading ? (
            <p className="p-8 text-center text-text-muted">
              Loading branch catalog from API…
            </p>
          ) : matrix.length === 0 ? (
            <p className="p-8 text-center text-text-muted">
              No branch products match this filter.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-surface-secondary text-xs uppercase tracking-wider text-text-muted">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Base price</th>
                    {branches.map((branch) => (
                      <th key={branch.id} className="p-4">
                        {branch.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {matrix.map((row) => (
                    <tr
                      key={row.id}
                      className="align-top hover:bg-surface-container/30"
                    >
                      <td className="p-4">
                        <strong>{row.name}</strong>
                        <span className="mt-1 block text-xs text-text-muted">
                          {row.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono">{rupiah(row.basePrice)}</td>
                      {branches.map((branch) => {
                        const item = row.byBranch.get(branch.id);
                        if (!item)
                          return (
                            <td
                              key={branch.id}
                              className="p-4 text-xs text-text-muted"
                            >
                              Not assigned
                            </td>
                          );
                        return (
                          <td key={branch.id} className="p-4">
                            <div
                              className="space-y-2"
                              data-testid={`branch-product-${item.id}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs">Rp</span>
                                <input
                                  aria-label={`${row.name} price at ${branch.name}`}
                                  type="number"
                                  min={0}
                                  placeholder={String(row.basePrice)}
                                  value={priceDrafts[item.id] ?? ''}
                                  onChange={(event) =>
                                    setPriceDrafts((current) => ({
                                      ...current,
                                      [item.id]: event.target.value,
                                    }))
                                  }
                                  className="w-24 rounded-lg border border-border-subtle bg-surface-secondary px-2 py-1.5 font-mono text-xs"
                                />
                                <button
                                  type="button"
                                  aria-label={`Save ${row.name} price at ${branch.name}`}
                                  disabled={savingKey === `price:${item.id}`}
                                  onClick={() => void savePrice(item)}
                                  className="rounded-lg border border-primary/30 p-1.5 text-primary disabled:opacity-40"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              </div>
                              <button
                                type="button"
                                disabled={
                                  savingKey === `availability:${item.id}`
                                }
                                onClick={() => void toggleAvailability(item)}
                                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold disabled:opacity-40 ${
                                  item.isAvailable
                                    ? 'border-primary/30 bg-primary-container text-on-primary-container'
                                    : 'border-error/30 bg-error-container text-on-error-container'
                                }`}
                              >
                                {item.isAvailable
                                  ? 'AVAILABLE'
                                  : 'OUT OF STOCK'}
                              </button>
                            </div>
                          </td>
                        );
                      })}
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
