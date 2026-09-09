'use client';

import { FormEvent, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import {
  DataPanel,
  Notice,
  PageHeading,
  fieldClass,
  primaryButtonClass,
  secondaryButtonClass,
  useAsyncResource,
} from '@/components/management/page-kit';
import {
  createReward,
  getRewards,
  updateReward,
  type RewardRecord,
} from '@/lib/management-api';

const EMPTY_FORM = {
  name: '', description: '', pointsCost: '', category: '', tier: 'BRONZE' as RewardRecord['tier'], isAvailable: true, expiresAt: '',
};

export default function LoyaltyPage() {
  const resource = useAsyncResource(getRewards);
  const [editing, setEditing] = useState<RewardRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  function startCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setNotice(null);
  }

  function startEdit(reward: RewardRecord) {
    setEditing(reward);
    setForm({ name: reward.name, description: reward.description, pointsCost: String(reward.pointsCost), category: reward.category, tier: reward.tier, isAvailable: reward.isAvailable, expiresAt: reward.expiresAt?.slice(0, 10) ?? '' });
    setShowForm(true);
    setNotice(null);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyId(editing?.id ?? 'create');
    setNotice(null);
    try {
      const input = { name: form.name.trim(), description: form.description.trim(), pointsCost: Number(form.pointsCost), category: form.category.trim(), tier: form.tier, isAvailable: form.isAvailable, expiresAt: form.expiresAt ? `${form.expiresAt}T23:59:59.000Z` : null };
      if (editing) await updateReward(editing.id, input);
      else await createReward(input);
      setShowForm(false);
      setNotice({ tone: 'success', text: editing ? 'Reward berhasil diperbarui.' : 'Reward berhasil dibuat.' });
      await resource.reload();
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'Reward gagal disimpan.' });
    } finally {
      setBusyId(null);
    }
  }

  async function toggle(reward: RewardRecord) {
    setBusyId(reward.id);
    setNotice(null);
    try {
      await updateReward(reward.id, { isAvailable: !reward.isAvailable });
      setNotice({ tone: 'success', text: `${reward.name} ${reward.isAvailable ? 'dinonaktifkan' : 'diaktifkan'}.` });
      await resource.reload();
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'Reward gagal diperbarui.' });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 p-5 sm:p-8">
      <PageHeading eyebrow="Loyalty catalog" title="Reward & tier" description="Reward pelanggan dibaca dan dimutasi melalui API. Nilai poin selalu bilangan bulat dan masa berlaku tervalidasi server." actions={<button type="button" onClick={startCreate} className={primaryButtonClass}><Plus className="mr-2 h-4 w-4" />Reward baru</button>} />
      {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
      {showForm ? (
        <form onSubmit={save} className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-5 md:grid-cols-2">
          <label className="text-sm font-semibold">Nama<input required minLength={2} maxLength={160} className={`${fieldClass} mt-2`} value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} /></label>
          <label className="text-sm font-semibold">Kategori<input required minLength={2} maxLength={80} className={`${fieldClass} mt-2`} value={form.category} onChange={(event) => setForm((value) => ({ ...value, category: event.target.value }))} /></label>
          <label className="text-sm font-semibold">Biaya poin<input required type="number" min={1} max={1_000_000} step={1} className={`${fieldClass} mt-2`} value={form.pointsCost} onChange={(event) => setForm((value) => ({ ...value, pointsCost: event.target.value }))} /></label>
          <label className="text-sm font-semibold">Minimum tier<select className={`${fieldClass} mt-2`} value={form.tier} onChange={(event) => setForm((value) => ({ ...value, tier: event.target.value as RewardRecord['tier'] }))}>{['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].map((tier) => <option key={tier}>{tier}</option>)}</select></label>
          <label className="text-sm font-semibold">Berakhir pada<input type="date" className={`${fieldClass} mt-2`} value={form.expiresAt} onChange={(event) => setForm((value) => ({ ...value, expiresAt: event.target.value }))} /></label>
          <label className="flex items-center gap-3 self-end rounded-xl border border-border-subtle px-4 py-3 text-sm font-semibold"><input type="checkbox" checked={form.isAvailable} onChange={(event) => setForm((value) => ({ ...value, isAvailable: event.target.checked }))} />Tersedia untuk pelanggan</label>
          <label className="text-sm font-semibold md:col-span-2">Deskripsi<textarea required minLength={3} maxLength={2000} rows={4} className={`${fieldClass} mt-2`} value={form.description} onChange={(event) => setForm((value) => ({ ...value, description: event.target.value }))} /></label>
          <div className="flex gap-3 md:col-span-2"><button disabled={busyId !== null} className={primaryButtonClass}>{busyId ? 'Menyimpan…' : 'Simpan reward'}</button><button type="button" className={secondaryButtonClass} onClick={() => setShowForm(false)}>Batal</button></div>
        </form>
      ) : null}

      <DataPanel loading={resource.loading} error={resource.error} empty={(resource.data?.length ?? 0) === 0} onRetry={() => void resource.reload()}>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{resource.data?.map((reward) => <article key={reward.id} className="rounded-2xl border border-border-subtle bg-surface-card p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-accent">{reward.category} · {reward.tier}</p><h2 className="mt-2 text-lg font-bold">{reward.name}</h2></div><button type="button" className={secondaryButtonClass} onClick={() => startEdit(reward)} aria-label={`Edit ${reward.name}`}><Pencil className="h-4 w-4" /></button></div><p className="mt-3 min-h-15 text-sm leading-5 text-text-secondary">{reward.description}</p><div className="mt-5 flex items-center justify-between border-t border-border-subtle pt-4"><div><p className="text-xs text-text-secondary">Biaya</p><p className="text-xl font-bold">{reward.pointsCost.toLocaleString('id-ID')} poin</p></div><button type="button" disabled={busyId === reward.id} className={secondaryButtonClass} onClick={() => void toggle(reward)}>{reward.isAvailable ? 'Nonaktifkan' : 'Aktifkan'}</button></div></article>)}</div>
      </DataPanel>
    </div>
  );
}
