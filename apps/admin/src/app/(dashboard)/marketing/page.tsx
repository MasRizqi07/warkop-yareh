'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  MessageCircle,
  RefreshCw,
  Rocket,
  Save,
  Send,
  ShieldAlert,
} from 'lucide-react';
import {
  createCampaign,
  dispatchCampaign,
  getCampaigns,
  getMarketingProviderStatus,
  getOperationalBranchScope,
  testCampaign,
  updateCampaign,
  type BranchRecord,
  type CampaignInput,
  type MarketingCampaign,
} from '@/lib/operations-api';

const statusClass: Record<MarketingCampaign['status'], string> = {
  DRAFT: 'bg-surface-container text-text-muted',
  DISPATCHING: 'bg-secondary-container text-on-secondary-container',
  SENT: 'bg-primary-container text-on-primary-container',
  FAILED: 'bg-error-container text-on-error-container',
};

export default function MarketingCampaignStudioPage() {
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [providerConfigured, setProviderConfigured] = useState(false);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [objective, setObjective] = useState('night');
  const [audience, setAudience] = useState('night_owls');
  const [branchId, setBranchId] = useState('');
  const [discountPercent, setDiscountPercent] = useState('20');
  const [expiresInHours, setExpiresInHours] = useState('48');
  const [message, setMessage] = useState(
    "Temukan kembali ritual kopi malam Anda bersama Warkop Ya'reh."
  );
  const [includeHeaderMedia, setIncludeHeaderMedia] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [busy, setBusy] = useState<'save' | 'test' | 'dispatch' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [canManageMarketing, setCanManageMarketing] = useState<boolean | null>(
    null
  );
  const [canViewAllBranches, setCanViewAllBranches] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const scope = await getOperationalBranchScope();
      setCanManageMarketing(scope.canAccessManagement);
      setCanViewAllBranches(scope.canViewAllBranches);
      if (!scope.canAccessManagement) {
        throw new Error(
          'WhatsApp campaigns require a manager, owner, or admin role'
        );
      }
      const [campaignData, provider] = await Promise.all([
        getCampaigns({ limit: 20 }),
        getMarketingProviderStatus(),
      ]);
      setBranches(scope.branches);
      setCampaigns(campaignData.data);
      setProviderConfigured(provider.configured);
    } catch (loadError: unknown) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Marketing operations could not be loaded'
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
        setCanManageMarketing(scope.canAccessManagement);
        setCanViewAllBranches(scope.canViewAllBranches);
        if (!scope.canAccessManagement) {
          throw new Error(
            'WhatsApp campaigns require a manager, owner, or admin role'
          );
        }
        const [campaignData, provider] = await Promise.all([
          getCampaigns({ limit: 20 }),
          getMarketingProviderStatus(),
        ]);
        if (!active) return;
        setBranches(scope.branches);
        setCampaigns(campaignData.data);
        setProviderConfigured(provider.configured);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Marketing operations could not be loaded'
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const campaignInput = (): CampaignInput => {
    const discount = Number(discountPercent);
    const expiry = Number(expiresInHours);
    if (campaignName.trim().length < 3) {
      throw new Error('Campaign name must contain at least 3 characters');
    }
    if (!Number.isInteger(discount) || discount < 0 || discount > 100) {
      throw new Error('Discount must be a whole percentage from 0 to 100');
    }
    if (!Number.isInteger(expiry) || expiry < 1 || expiry > 720) {
      throw new Error('Expiry must be between 1 and 720 hours');
    }
    if (message.trim().length < 10) {
      throw new Error('Campaign message must contain at least 10 characters');
    }
    return {
      name: campaignName.trim(),
      objective,
      audience,
      ...(branchId ? { branchId } : {}),
      discountPercent: discount,
      expiresInHours: expiry,
      message: message.trim(),
      includeHeaderMedia,
    };
  };

  const persistDraft = async (): Promise<MarketingCampaign> => {
    const input = campaignInput();
    const campaign = campaignId
      ? await updateCampaign(campaignId, input)
      : await createCampaign(input);
    setCampaignId(campaign.id);
    setCampaigns((current) => [
      campaign,
      ...current.filter((item) => item.id !== campaign.id),
    ]);
    return campaign;
  };

  const saveDraft = async () => {
    setBusy('save');
    setError(null);
    setNotice(null);
    try {
      const campaign = await persistDraft();
      setNotice(`Draft ${campaign.id} persisted. Reload to verify it remains.`);
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Campaign draft could not be saved'
      );
    } finally {
      setBusy(null);
    }
  };

  const sendTest = async () => {
    setBusy('test');
    setError(null);
    setNotice(null);
    try {
      const campaign = await persistDraft();
      const result = await testCampaign(campaign.id, testPhone);
      setNotice(`Provider accepted test message ${result.providerMessageId}.`);
    } catch (sendError: unknown) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : 'Test message was not accepted'
      );
    } finally {
      setBusy(null);
    }
  };

  const broadcast = async () => {
    setBusy('dispatch');
    setError(null);
    setNotice(null);
    try {
      const campaign = await persistDraft();
      const dispatched = await dispatchCampaign(campaign.id);
      setCampaigns((current) => [
        dispatched,
        ...current.filter((item) => item.id !== dispatched.id),
      ]);
      if (dispatched.status === 'DISPATCHING') {
        setNotice(
          'Campaign queued for background delivery. Refresh the list to inspect the final provider-confirmed count.'
        );
      } else if (dispatched.status === 'SENT') {
        setNotice(
          `SENT: ${dispatched.recipientCount} provider-confirmed recipients.`
        );
      } else {
        setError(
          'One or more deliveries failed. Review delivery status before retrying.'
        );
      }
    } catch (dispatchError: unknown) {
      setError(
        dispatchError instanceof Error
          ? dispatchError.message
          : 'Campaign dispatch failed'
      );
    } finally {
      setBusy(null);
    }
  };

  const editCampaign = (campaign: MarketingCampaign) => {
    setCampaignId(campaign.id);
    setCampaignName(campaign.name);
    setObjective(campaign.objective);
    setAudience(campaign.audience);
    setBranchId(campaign.branchId ?? '');
    setDiscountPercent(String(campaign.discountPercent));
    setExpiresInHours(String(campaign.expiresInHours));
    setMessage(campaign.message);
    setIncludeHeaderMedia(campaign.includeHeaderMedia);
    setNotice(`Loaded ${campaign.id}.`);
    setError(null);
  };

  const resetForm = () => {
    setCampaignId(null);
    setCampaignName('');
    setObjective('night');
    setAudience('night_owls');
    setBranchId('');
    setDiscountPercent('20');
    setExpiresInHours('48');
    setMessage("Temukan kembali ritual kopi malam Anda bersama Warkop Ya'reh.");
    setIncludeHeaderMedia(false);
    setNotice(null);
    setError(null);
  };

  if (!loading && canManageMarketing === false) {
    return (
      <main className="min-h-screen bg-canvas-obsidian px-4 py-8 text-text-primary sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-error/40 bg-error-container p-6 text-on-error-container">
          <ShieldAlert className="h-6 w-6" />
          <h1 className="mt-4 text-2xl font-bold">Marketing access denied</h1>
          <p className="mt-2 text-sm">
            WhatsApp campaigns require a manager, owner, or admin role. No
            campaign or provider data was requested for this session.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas-obsidian px-4 py-8 text-text-primary sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent-amber">
              Growth / Persistent Campaign Operations
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              WhatsApp Campaign Studio
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-text-muted">
              Drafts and delivery outcomes are database-backed. A campaign is
              marked sent only after the WhatsApp provider returns message IDs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-border-subtle bg-surface-card px-4 py-2 text-sm"
            >
              New draft
            </button>
            <button
              type="button"
              onClick={() => void loadData()}
              className="primary-cta-motion inline-flex items-center gap-2 rounded-xl bg-brand-coffee px-4 py-2 text-sm font-semibold text-on-primary"
            >
              <RefreshCw className="h-4 w-4" /> Reload
            </button>
          </div>
        </header>

        <section
          className={`flex items-start gap-3 rounded-2xl border p-4 ${
            providerConfigured
              ? 'border-primary/30 bg-primary-container text-on-primary-container'
              : 'border-error/40 bg-error-container text-on-error-container'
          }`}
        >
          {providerConfigured ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <div>
            <strong>
              WhatsApp provider{' '}
              {providerConfigured ? 'configured' : 'not configured'}
            </strong>
            <p className="mt-1 text-xs opacity-80">
              {providerConfigured
                ? 'Test and live dispatch actions will call the configured Cloud API.'
                : 'Drafts remain available, but test/live dispatch returns 503 instead of simulating success.'}
            </p>
          </div>
        </section>

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

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void saveDraft();
            }}
            className="space-y-6 rounded-3xl border border-border-subtle bg-surface-card p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-4">
              <div>
                <h2 className="text-xl font-bold">Campaign configuration</h2>
                <p className="mt-1 font-mono text-xs text-text-muted">
                  {campaignId ? `Editing ${campaignId}` : 'Unsaved draft'}
                </p>
              </div>
              <MessageCircle className="h-6 w-6 text-accent-amber" />
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs text-text-muted">
                Campaign name
              </span>
              <input
                required
                minLength={3}
                maxLength={160}
                value={campaignName}
                onChange={(event) => setCampaignName(event.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-surface-secondary px-3 py-2.5 text-sm"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-xs text-text-muted">
                  Objective
                </span>
                <select
                  value={objective}
                  onChange={(event) => setObjective(event.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-surface-secondary px-3 py-2.5 text-sm"
                >
                  <option value="birthday">Birthday voucher</option>
                  <option value="night">Weekend night boost</option>
                  <option value="single_origin">New single origin</option>
                  <option value="rsvp">Community RSVP</option>
                  <option value="retention">Retention</option>
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-xs text-text-muted">
                  Audience
                </span>
                <select
                  value={audience}
                  onChange={(event) => setAudience(event.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-surface-secondary px-3 py-2.5 text-sm"
                >
                  <option value="night_owls">Night owls</option>
                  <option value="all_active">Active · 14 days</option>
                  <option value="at_risk">At risk · 21 days</option>
                  <option value="coworking">Coworking patrons</option>
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-xs text-text-muted">
                  Branch scope
                </span>
                <select
                  value={branchId}
                  onChange={(event) => setBranchId(event.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-surface-secondary px-3 py-2.5 text-sm"
                >
                  <option value="">
                    {canViewAllBranches
                      ? 'All permitted branches'
                      : 'Assigned branch'}
                  </option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-xs text-text-muted">
                  Discount (%)
                </span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={discountPercent}
                  onChange={(event) => setDiscountPercent(event.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-surface-secondary px-3 py-2.5 text-sm"
                />
              </label>
              <label>
                <span className="mb-1.5 block text-xs text-text-muted">
                  Expiry (hours)
                </span>
                <input
                  type="number"
                  min={1}
                  max={720}
                  value={expiresInHours}
                  onChange={(event) => setExpiresInHours(event.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-surface-secondary px-3 py-2.5 text-sm"
                />
              </label>
              <label className="flex items-center gap-3 self-end rounded-xl border border-border-subtle bg-surface-secondary px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={includeHeaderMedia}
                  onChange={(event) =>
                    setIncludeHeaderMedia(event.target.checked)
                  }
                />{' '}
                Header media
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs text-text-muted">
                Campaign message / in-app copy
              </span>
              <textarea
                required
                minLength={10}
                maxLength={1000}
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="w-full resize-y rounded-xl border border-border-subtle bg-surface-secondary px-3 py-2.5 text-sm"
              />
            </label>

            <div className="flex flex-wrap items-end gap-3 border-t border-border-subtle pt-5">
              <button
                type="submit"
                disabled={busy !== null}
                className="primary-cta-motion inline-flex items-center gap-2 rounded-xl bg-brand-coffee px-4 py-2.5 text-sm font-semibold text-on-primary disabled:opacity-40"
              >
                <Save className="h-4 w-4" />
                {busy === 'save' ? 'Saving…' : 'Save draft'}
              </button>
              <label className="min-w-[220px] flex-1">
                <span className="mb-1 block text-xs text-text-muted">
                  Test recipient phone
                </span>
                <input
                  value={testPhone}
                  onChange={(event) => setTestPhone(event.target.value)}
                  placeholder="+62812…"
                  className="w-full rounded-xl border border-border-subtle bg-surface-secondary px-3 py-2.5 text-sm"
                />
              </label>
              <button
                type="button"
                disabled={
                  busy !== null ||
                  !providerConfigured ||
                  testPhone.trim().length < 8
                }
                onClick={() => void sendTest()}
                className="primary-cta-motion inline-flex items-center gap-2 rounded-xl border border-primary/30 px-4 py-2.5 text-sm font-semibold text-primary disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
                {busy === 'test' ? 'Sending…' : 'Test send'}
              </button>
              <button
                type="button"
                disabled={busy !== null || !providerConfigured}
                onClick={() => void broadcast()}
                className="primary-cta-motion inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary disabled:opacity-40"
              >
                <Rocket className="h-4 w-4" />
                {busy === 'dispatch' ? 'Queueing…' : 'Queue broadcast'}
              </button>
            </div>
          </form>

          <aside className="sticky top-24 rounded-3xl border border-border-subtle bg-surface-card p-5">
            <p className="font-mono text-xs uppercase tracking-widest text-accent-amber">
              Template preview
            </p>
            <div className="mt-4 rounded-3xl border border-outline-variant bg-surface-secondary p-4">
              <div className="rounded-2xl bg-primary-container p-4 text-on-primary-container shadow-lg">
                <strong className="block text-sm">
                  {campaignName || 'Campaign name'}
                </strong>
                <p className="mt-2 text-sm leading-relaxed">{message}</p>
                <p className="mt-3 font-mono text-xs">
                  {discountPercent || '0'}% · expires in {expiresInHours || '0'}
                  h
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-text-muted">
              The provider template receives exactly three body parameters:
              campaign name, discount, and expiry hours. Draft creation never
              sends a message.
            </p>
          </aside>
        </div>

        <section className="overflow-hidden rounded-3xl border border-border-subtle bg-surface-card">
          <div className="flex items-center justify-between border-b border-border-subtle p-5">
            <div>
              <h2 className="text-lg font-bold">Persisted campaign history</h2>
              <p className="mt-1 text-xs text-text-muted">
                Reloaded from GET /marketing/campaigns.
              </p>
            </div>
            <Clock3 className="h-5 w-5 text-accent-amber" />
          </div>
          {loading ? (
            <p className="p-8 text-center text-text-muted">
              Loading campaigns from API…
            </p>
          ) : campaigns.length === 0 ? (
            <p className="p-8 text-center text-text-muted">
              No campaign records yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-surface-secondary text-xs uppercase tracking-wider text-text-muted">
                  <tr>
                    <th className="p-4">Campaign</th>
                    <th className="p-4">Audience</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Recipients</th>
                    <th className="p-4">Created</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {campaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      data-testid={`campaign-row-${campaign.id}`}
                    >
                      <td className="p-4">
                        <strong>{campaign.name}</strong>
                        <span className="mt-1 block font-mono text-xs text-text-muted">
                          {campaign.id}
                        </span>
                      </td>
                      <td className="p-4">
                        {campaign.audience}
                        {campaign.branchId ? (
                          <span className="block text-xs text-text-muted">
                            Branch-scoped
                          </span>
                        ) : null}
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[campaign.status]}`}
                        >
                          {campaign.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono">
                        {campaign.recipientCount} confirmed /{' '}
                        {campaign._count.deliveries} attempts
                      </td>
                      <td className="p-4 text-xs">
                        {new Date(campaign.createdAt).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          disabled={
                            campaign.status === 'SENT' ||
                            campaign.status === 'DISPATCHING'
                          }
                          onClick={() => editCampaign(campaign)}
                          className="rounded-lg border border-border-subtle px-3 py-2 text-xs font-semibold disabled:opacity-40"
                        >
                          Edit draft
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
