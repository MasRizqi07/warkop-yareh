'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Award,
  CalendarClock,
  MessageCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  createCampaign,
  getCustomerInsights,
  type CustomerInsight,
} from '@/lib/operations-api';

type Cohort = CustomerInsight['cohort'] | 'all';

const rupiah = (value: number) =>
  `Rp ${value.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'No completed visit';

export default function PatronCrmPage() {
  const [customers, setCustomers] = useState<CustomerInsight[]>([]);
  const [search, setSearch] = useState('');
  const [cohort, setCohort] = useState<Cohort>('all');
  const [loading, setLoading] = useState(true);
  const [creatingFor, setCreatingFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCustomerInsights({ limit: 100 });
      setCustomers(response.data);
    } catch (loadError: unknown) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Customer analytics could not be loaded'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void getCustomerInsights({ limit: 100 })
      .then((response) => {
        if (active) setCustomers(response.data);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Customer analytics could not be loaded'
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('en-US');
    return customers.filter(
      (customer) =>
        (cohort === 'all' || customer.cohort === cohort) &&
        (!query ||
          customer.name.toLocaleLowerCase('en-US').includes(query) ||
          customer.email.toLocaleLowerCase('en-US').includes(query) ||
          customer.phone?.toLocaleLowerCase('en-US').includes(query))
    );
  }, [cohort, customers, search]);

  const summary = useMemo(
    () => ({
      total: customers.length,
      vip: customers.filter((customer) => customer.cohort === 'vip').length,
      atRisk: customers.filter((customer) => customer.cohort === 'at-risk')
        .length,
      newCustomers: customers.filter((customer) => customer.cohort === 'new')
        .length,
    }),
    [customers]
  );

  const createRetentionDraft = async (customer: CustomerInsight) => {
    setCreatingFor(customer.id);
    setError(null);
    setNotice(null);
    try {
      const campaign = await createCampaign({
        name: `Retention · ${customer.name}`,
        objective: 'retention',
        audience: 'single_customer',
        targetUserId: customer.id,
        discountPercent: 20,
        expiresInHours: 72,
        message: `Kami rindu menyeduh untuk ${customer.name}. Nikmati voucher retensi 20% dalam 72 jam ke depan.`,
        includeHeaderMedia: false,
      });
      setNotice(`Draft ${campaign.id} persisted for ${customer.name}.`);
      await loadCustomers();
    } catch (createError: unknown) {
      setError(
        createError instanceof Error
          ? createError.message
          : 'Retention draft could not be created'
      );
    } finally {
      setCreatingFor(null);
    }
  };

  return (
    <main className="min-h-screen bg-canvas-obsidian px-4 py-8 text-text-primary sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent-amber">
              Growth / Customer Intelligence
            </p>
            <h1 className="mt-2 text-3xl font-bold">Patron Lifecycle CRM</h1>
            <p className="mt-2 max-w-3xl text-sm text-text-muted">
              Cohorts and spend are calculated from persisted customer and
              completed-order records. Retention actions create reviewable
              campaign drafts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadCustomers()}
            className="primary-cta-motion inline-flex items-center justify-center gap-2 rounded-xl bg-brand-coffee px-4 py-2 text-sm font-semibold text-on-primary"
          >
            <RefreshCw className="h-4 w-4" /> Refresh analytics
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

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Customers', value: summary.total, icon: Users },
            { label: 'VIP patrons', value: summary.vip, icon: Award },
            { label: 'At risk', value: summary.atRisk, icon: ShieldAlert },
            {
              label: 'New · 30 days',
              value: summary.newCustomers,
              icon: UserPlus,
            },
          ].map(({ label, value, icon: Icon }) => (
            <article
              key={label}
              className="delight-card rounded-2xl border border-border-subtle bg-surface-card p-5"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-text-muted">
                {label}
                <Icon className="h-5 w-5 text-accent-amber" />
              </div>
              <p className="mt-4 font-mono text-3xl font-bold">{value}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-3 rounded-2xl border border-border-subtle bg-surface-card p-4 md:grid-cols-[1fr_auto]">
          <label className="relative">
            <span className="sr-only">Search patrons</span>
            <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, or phone"
              className="w-full rounded-xl border border-border-subtle bg-surface-secondary py-2.5 pl-10 pr-3 text-sm"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {(['all', 'vip', 'regular', 'at-risk', 'new'] as const).map(
              (value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={cohort === value}
                  onClick={() => setCohort(value)}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold capitalize ${
                    cohort === value
                      ? 'border-primary bg-primary-container text-on-primary-container'
                      : 'border-border-subtle bg-surface-secondary text-text-muted'
                  }`}
                >
                  {value}
                </button>
              )
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-card">
          {loading ? (
            <p className="p-8 text-center text-text-muted">
              Loading customer analytics from API…
            </p>
          ) : filteredCustomers.length === 0 ? (
            <p className="p-8 text-center text-text-muted">
              No customers match this cohort and search.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1020px] text-left text-sm">
                <thead className="bg-surface-secondary text-xs uppercase tracking-wider text-text-muted">
                  <tr>
                    <th className="p-4">Patron</th>
                    <th className="p-4">Cohort / Tier</th>
                    <th className="p-4">Completed spend</th>
                    <th className="p-4">Last visit</th>
                    <th className="p-4">Last retention draft</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      data-testid={`crm-row-${customer.id}`}
                      className="hover:bg-surface-container/40"
                    >
                      <td className="p-4">
                        <strong>{customer.name}</strong>
                        <span className="mt-1 block text-xs text-text-muted">
                          {customer.email} · {customer.phone ?? 'No phone'}
                        </span>
                        <span className="mt-1 block text-xs text-text-muted">
                          {customer.whatsAppMarketingOptInAt
                            ? 'WhatsApp marketing opt-in recorded'
                            : 'No WhatsApp marketing opt-in'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-surface-container px-2.5 py-1 text-xs font-semibold capitalize text-primary">
                          {customer.cohort}
                        </span>
                        <span className="ml-2 font-mono text-xs text-text-muted">
                          {customer.membershipTier} · {customer.loyaltyPoints}{' '}
                          pts
                        </span>
                      </td>
                      <td className="p-4 font-mono">
                        {rupiah(customer.totalSpend)}
                        <span className="mt-1 block text-xs text-text-muted">
                          {customer.orderCount} completed orders
                        </span>
                      </td>
                      <td className="p-4 text-xs">
                        <span className="inline-flex items-center gap-2">
                          <CalendarClock className="h-4 w-4 text-accent-amber" />
                          {formatDate(customer.lastVisit)}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs">
                        {customer.lastCampaign
                          ? `${customer.lastCampaign.status} · ${formatDate(customer.lastCampaign.createdAt)}`
                          : 'None'}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          disabled={
                            !customer.phone ||
                            !customer.whatsAppMarketingOptInAt ||
                            creatingFor === customer.id
                          }
                          title={
                            customer.whatsAppMarketingOptInAt
                              ? undefined
                              : 'Customer consent is required before creating a WhatsApp campaign'
                          }
                          onClick={() => void createRetentionDraft(customer)}
                          className="primary-cta-motion inline-flex items-center gap-2 rounded-xl bg-brand-coffee px-3 py-2 text-xs font-semibold text-on-primary disabled:opacity-40"
                        >
                          <MessageCircle className="h-4 w-4" />
                          {creatingFor === customer.id
                            ? 'Saving…'
                            : 'Create retention draft'}
                        </button>
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
