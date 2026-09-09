'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Edit3,
  RefreshCw,
  Save,
  Search,
  X,
} from 'lucide-react';
import {
  getBranchProducts,
  getOperationalBranchScope,
  updateBranchProduct,
  type BranchProductRecord,
  type BranchRecord,
} from '@/lib/operations-api';

type StockHealth = 'critical' | 'low' | 'healthy' | 'untracked';

interface InventoryForm {
  stockQuantity: string;
  stockCapacity: string;
  stockThreshold: string;
  stockUnit: string;
  supplier: string;
  leadTimeHours: string;
  burnRatePerDay: string;
}

const numberOrNull = (value: string): number | null =>
  value.trim() === '' ? null : Number(value);

const displayNumber = (value: string | number | null): string =>
  value === null
    ? '—'
    : Number(value).toLocaleString('id-ID', { maximumFractionDigits: 3 });

function stockHealth(item: BranchProductRecord): StockHealth {
  if (item.stockQuantity === null || item.stockThreshold === null)
    return 'untracked';
  const quantity = Number(item.stockQuantity);
  const threshold = Number(item.stockThreshold);
  if (quantity <= threshold) return 'critical';
  if (quantity <= threshold * 1.5) return 'low';
  return 'healthy';
}

function formFromItem(item: BranchProductRecord): InventoryForm {
  return {
    stockQuantity:
      item.stockQuantity === null ? '' : String(item.stockQuantity),
    stockCapacity:
      item.stockCapacity === null ? '' : String(item.stockCapacity),
    stockThreshold:
      item.stockThreshold === null ? '' : String(item.stockThreshold),
    stockUnit: item.stockUnit ?? '',
    supplier: item.supplier ?? '',
    leadTimeHours:
      item.leadTimeHours === null ? '' : String(item.leadTimeHours),
    burnRatePerDay:
      item.burnRatePerDay === null ? '' : String(item.burnRatePerDay),
  };
}

export default function EnterpriseInventoryPage() {
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [items, setItems] = useState<BranchProductRecord[]>([]);
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState<StockHealth | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<BranchProductRecord | null>(null);
  const [form, setForm] = useState<InventoryForm | null>(null);
  const [canUpdateInventory, setCanUpdateInventory] = useState(false);

  const loadItems = useCallback(async (branchId: string) => {
    setLoading(true);
    setError(null);
    try {
      setItems(await getBranchProducts(branchId));
    } catch (loadError: unknown) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Inventory could not be loaded'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void getOperationalBranchScope()
      .then(async (scope) => {
        if (!active) return;
        const records = scope.branches;
        setBranches(records);
        setCanUpdateInventory(scope.canUpdateBranchProducts);
        const initialBranchId = records[0]?.id || '';
        setSelectedBranchId(initialBranchId);
        if (!initialBranchId) return;
        const branchItems = await getBranchProducts(initialBranchId);
        if (active) setItems(branchItems);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Branches could not be loaded'
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('en-US');
    return items.filter((item) => {
      const health = stockHealth(item);
      return (
        (healthFilter === 'all' || health === healthFilter) &&
        (!query ||
          item.product.name.toLocaleLowerCase('en-US').includes(query) ||
          item.product.slug.toLocaleLowerCase('en-US').includes(query) ||
          item.supplier?.toLocaleLowerCase('en-US').includes(query))
      );
    });
  }, [healthFilter, items, search]);

  const summary = useMemo(
    () => ({
      total: items.length,
      tracked: items.filter((item) => item.stockQuantity !== null).length,
      critical: items.filter((item) => stockHealth(item) === 'critical').length,
      unavailable: items.filter((item) => !item.isAvailable).length,
    }),
    [items]
  );

  const openEditor = (item: BranchProductRecord) => {
    setEditing(item);
    setForm(formFromItem(item));
    setNotice(null);
  };

  const saveInventory = async () => {
    if (!editing || !form) return;
    if (!canUpdateInventory) {
      setError('Your role has read-only inventory access');
      return;
    }
    const capacity = numberOrNull(form.stockCapacity);
    const threshold = numberOrNull(form.stockThreshold);
    if (capacity !== null && capacity <= 0) {
      setError('Capacity must be greater than zero');
      return;
    }
    if (capacity !== null && threshold !== null && threshold > capacity) {
      setError('Threshold cannot exceed capacity');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateBranchProduct(
        editing.branchId,
        editing.productId,
        {
          stockQuantity: numberOrNull(form.stockQuantity),
          stockCapacity: capacity,
          stockThreshold: threshold,
          stockUnit: form.stockUnit.trim() || null,
          supplier: form.supplier.trim() || null,
          leadTimeHours: numberOrNull(form.leadTimeHours),
          burnRatePerDay: numberOrNull(form.burnRatePerDay),
        }
      );
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      setNotice(`${updated.product.name} inventory persisted.`);
      setEditing(null);
      setForm(null);
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Inventory could not be saved'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-canvas-obsidian px-4 py-8 text-text-primary sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent-amber">
              Supply Chain Ops / Persistent Branch Inventory
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Silo &amp; Ingredient Telemetry
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-text-muted">
              Quantities, thresholds, suppliers, and runway are loaded from the
              branch catalog API and survive a reload.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Inventory branch"
              value={selectedBranchId}
              onChange={(event) => {
                const nextBranchId = event.target.value;
                setSelectedBranchId(nextBranchId);
                void loadItems(nextBranchId);
              }}
              className="rounded-xl border border-border-subtle bg-surface-card px-4 py-2 text-sm"
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() =>
                selectedBranchId && void loadItems(selectedBranchId)
              }
              className="primary-cta-motion inline-flex items-center gap-2 rounded-xl bg-brand-coffee px-4 py-2 text-sm font-semibold text-on-primary"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
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

        {!canUpdateInventory && !loading && (
          <p className="rounded-xl border border-border-subtle bg-surface-card px-4 py-3 text-sm text-text-muted">
            Inventory is read-only for your role. A manager, owner, or admin is
            required to persist telemetry changes.
          </p>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Branch SKUs', value: summary.total, icon: Boxes },
            {
              label: 'Stock-tracked',
              value: summary.tracked,
              icon: CheckCircle2,
            },
            {
              label: 'Critical threshold',
              value: summary.critical,
              icon: AlertTriangle,
            },
            { label: 'Unavailable', value: summary.unavailable, icon: X },
          ].map(({ label, value, icon: Icon }) => (
            <article
              key={label}
              className="delight-card rounded-2xl border border-border-subtle bg-surface-card p-5"
            >
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-xs uppercase tracking-wider">
                  {label}
                </span>
                <Icon className="h-5 w-5 text-accent-amber" />
              </div>
              <p
                className="mt-4 font-mono text-3xl font-bold"
                data-countup-value={value}
              >
                {value}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-border-subtle bg-surface-card p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <label className="relative">
              <span className="sr-only">Search inventory</span>
              <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search product, SKU, or supplier"
                className="w-full rounded-xl border border-border-subtle bg-surface-secondary py-2.5 pl-10 pr-3 text-sm"
              />
            </label>
            <select
              aria-label="Inventory health filter"
              value={healthFilter}
              onChange={(event) =>
                setHealthFilter(event.target.value as StockHealth | 'all')
              }
              className="rounded-xl border border-border-subtle bg-surface-secondary px-3 py-2.5 text-sm"
            >
              <option value="all">All health states</option>
              <option value="critical">Critical</option>
              <option value="low">Low</option>
              <option value="healthy">Healthy</option>
              <option value="untracked">Not tracked</option>
            </select>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-card">
          {loading ? (
            <p className="p-8 text-center text-text-muted">
              Loading inventory from API…
            </p>
          ) : filteredItems.length === 0 ? (
            <p className="p-8 text-center text-text-muted">
              No branch inventory matches this filter.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-surface-secondary text-xs uppercase tracking-wider text-text-muted">
                  <tr>
                    <th className="p-4">Product / SKU</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Threshold</th>
                    <th className="p-4">Runway</th>
                    <th className="p-4">Supplier</th>
                    <th className="p-4">Health</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {filteredItems.map((item) => {
                    const health = stockHealth(item);
                    const burnRate =
                      item.burnRatePerDay === null
                        ? 0
                        : Number(item.burnRatePerDay);
                    const runway =
                      burnRate > 0 && item.stockQuantity !== null
                        ? Number(item.stockQuantity) / burnRate
                        : null;
                    return (
                      <tr
                        key={item.id}
                        data-testid={`inventory-row-${item.productId}`}
                        className="hover:bg-surface-container/40"
                      >
                        <td className="p-4">
                          <strong>{item.product.name}</strong>
                          <span className="mt-1 block font-mono text-xs text-text-muted">
                            {item.product.slug}
                          </span>
                        </td>
                        <td className="p-4 font-mono">
                          {displayNumber(item.stockQuantity)} /{' '}
                          {displayNumber(item.stockCapacity)}{' '}
                          {item.stockUnit ?? ''}
                        </td>
                        <td className="p-4 font-mono">
                          {displayNumber(item.stockThreshold)}{' '}
                          {item.stockUnit ?? ''}
                        </td>
                        <td className="p-4 font-mono">
                          {runway === null ? '—' : `${runway.toFixed(1)} days`}
                        </td>
                        <td className="p-4">
                          {item.supplier ?? 'Not configured'}
                          <span className="mt-1 block text-xs text-text-muted">
                            {item.leadTimeHours === null
                              ? 'Lead time not set'
                              : `${item.leadTimeHours}h lead time`}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              health === 'critical'
                                ? 'bg-error-container text-on-error-container'
                                : health === 'healthy'
                                  ? 'bg-primary-container text-on-primary-container'
                                  : 'bg-surface-container text-text-muted'
                            }`}
                          >
                            {health}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            disabled={!canUpdateInventory}
                            onClick={() => openEditor(item)}
                            className="primary-cta-motion inline-flex items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 text-xs font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Edit3 className="h-4 w-4" /> Adjust
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {editing && form && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-canvas-obsidian/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void saveInventory();
            }}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border-subtle bg-surface-card p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-accent-amber">
                  Persist inventory telemetry
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  {editing.product.name}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close inventory editor"
                onClick={() => setEditing(null)}
                className="rounded-lg p-2 text-text-muted hover:bg-surface-container"
              >
                <X />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ['stockQuantity', 'Current quantity', 'number'],
                ['stockCapacity', 'Capacity', 'number'],
                ['stockThreshold', 'Low-stock threshold', 'number'],
                ['stockUnit', 'Unit (kg, L, pcs)', 'text'],
                ['supplier', 'Supplier', 'text'],
                ['leadTimeHours', 'Lead time (hours)', 'number'],
                ['burnRatePerDay', 'Burn rate / day', 'number'],
              ].map(([field, label, type]) => (
                <label
                  key={field}
                  className={field === 'supplier' ? 'sm:col-span-2' : ''}
                >
                  <span className="mb-1.5 block text-xs text-text-muted">
                    {label}
                  </span>
                  <input
                    type={type}
                    min={type === 'number' ? 0 : undefined}
                    step={type === 'number' ? '0.001' : undefined}
                    value={form[field as keyof InventoryForm]}
                    onChange={(event) =>
                      setForm((current) =>
                        current
                          ? { ...current, [field]: event.target.value }
                          : current
                      )
                    }
                    className="w-full rounded-xl border border-border-subtle bg-surface-secondary px-3 py-2.5 text-sm"
                  />
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl border border-border-subtle px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="primary-cta-motion inline-flex items-center gap-2 rounded-xl bg-brand-coffee px-5 py-2 text-sm font-semibold text-on-primary disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : 'Save inventory'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
