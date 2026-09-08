'use client';

import { FormEvent, useState } from 'react';
import { Search } from 'lucide-react';
import {
  DataPanel,
  Notice,
  PageHeading,
  fieldClass,
  primaryButtonClass,
  secondaryButtonClass,
  useAsyncResource,
} from '@/components/management/page-kit';
import { awardPoints, getUsers, type UserRecord } from '@/lib/management-api';

export default function UsersPage() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [role, setRole] = useState('');
  const resource = useAsyncResource(
    () => getUsers({ search: submittedQuery, role: role || undefined }),
    `${submittedQuery}\u0000${role}`,
  );
  const [selected, setSelected] = useState<UserRecord | null>(null);
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedQuery(query.trim());
  }

  async function submitPoints(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const value = Number(points);
    if (!Number.isSafeInteger(value) || value < 1) {
      setNotice({ tone: 'error', text: 'Poin harus berupa bilangan bulat positif.' });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      await awardPoints(selected.id, value, reason.trim());
      setSelected(null);
      setPoints('');
      setReason('');
      setNotice({ tone: 'success', text: `${value.toLocaleString('id-ID')} poin berhasil diberikan kepada ${selected.name}.` });
      await resource.reload();
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'Poin gagal diberikan.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 p-5 sm:p-8">
      <PageHeading eyebrow="Identity" title="Akun pengguna" description="Daftar ini berasal dari identity service. Akun baru dibuat melalui alur registrasi terverifikasi; admin tidak membuat identitas palsu dari halaman ini." />
      {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
      {selected ? (
        <form onSubmit={submitPoints} className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div><p className="text-sm font-bold">Berikan poin kepada {selected.name}</p><p className="mt-1 text-xs text-text-secondary">Saldo saat ini {selected.loyaltyPoints.toLocaleString('id-ID')} poin. Penyesuaian akan tercatat sebagai transaksi loyalty.</p></div>
          <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Jumlah<input required type="number" min={1} max={1_000_000} step={1} className={`${fieldClass} mt-2`} value={points} onChange={(event) => setPoints(event.target.value)} /></label><label className="text-sm font-semibold">Alasan<input required minLength={3} maxLength={300} className={`${fieldClass} mt-2`} value={reason} onChange={(event) => setReason(event.target.value)} /></label></div>
          <div className="flex gap-2"><button disabled={saving} className={primaryButtonClass}>{saving ? 'Menyimpan…' : 'Berikan'}</button><button type="button" className={secondaryButtonClass} onClick={() => setSelected(null)}>Batal</button></div>
        </form>
      ) : null}

      <form onSubmit={search} className="grid gap-3 sm:grid-cols-[1fr_220px_auto]">
        <label className="relative"><span className="sr-only">Cari pengguna</span><Search className="absolute left-3 top-3.5 h-4 w-4 text-text-secondary" /><input className={`${fieldClass} pl-10`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nama, email, atau nomor telepon…" /></label>
        <label><span className="sr-only">Filter role</span><select className={fieldClass} value={role} onChange={(event) => setRole(event.target.value)}><option value="">Semua role</option>{['CUSTOMER', 'STAFF', 'CASHIER', 'KITCHEN', 'MANAGER', 'ADMIN', 'OWNER', 'SUPERADMIN'].map((item) => <option key={item}>{item}</option>)}</select></label>
        <button className={secondaryButtonClass}>Cari</button>
      </form>

      <DataPanel loading={resource.loading} error={resource.error} empty={(resource.data?.data.length ?? 0) === 0} onRetry={() => void resource.reload()}>
        <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface-card"><table className="min-w-[860px] w-full text-left text-sm"><thead className="border-b border-border-subtle bg-surface-secondary text-xs uppercase tracking-wider text-text-secondary"><tr><th className="p-4">Pengguna</th><th className="p-4">Role</th><th className="p-4">Tier</th><th className="p-4">Poin</th><th className="p-4">Cabang</th><th className="p-4">Aksi</th></tr></thead><tbody className="divide-y divide-border-subtle">{resource.data?.data.map((user) => <tr key={user.id}><td className="p-4"><p className="font-semibold">{user.name}</p><p className="text-xs text-text-secondary">{user.email}{user.phone ? ` · ${user.phone}` : ''}</p></td><td className="p-4">{user.role}</td><td className="p-4">{user.membershipTier}</td><td className="p-4 font-semibold">{user.loyaltyPoints.toLocaleString('id-ID')}</td><td className="p-4 text-text-secondary">{user.branchId ?? 'Lintas cabang / pelanggan'}</td><td className="p-4">{user.role === 'CUSTOMER' ? <button type="button" className={secondaryButtonClass} onClick={() => { setSelected(user); setNotice(null); }}>Berikan poin</button> : <span className="text-xs text-text-secondary">Dikelola lewat provisioning role</span>}</td></tr>)}</tbody></table></div>
      </DataPanel>
    </div>
  );
}
