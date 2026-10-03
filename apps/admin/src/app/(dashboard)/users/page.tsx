'use client';

import { FormEvent, useState } from 'react';
import { Search } from 'lucide-react';
import {
  DataPanel,
  PageHeading,
  fieldClass,
  secondaryButtonClass,
  useAsyncResource,
} from '@/components/management/page-kit';
import { getUsers } from '@/lib/management-api';

export default function UsersPage() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [role, setRole] = useState('');
  const resource = useAsyncResource(
    () => getUsers({ search: submittedQuery, role: role || undefined }),
    `${submittedQuery}\u0000${role}`,
  );

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedQuery(query.trim());
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 p-5 sm:p-8">
      <PageHeading
        eyebrow="Identity"
        title="Pelanggan & akun"
        description="Daftar akun terdaftar untuk administrasi identitas. Program poin dan keanggotaan tidak aktif."
      />
      <form onSubmit={search} className="grid gap-3 sm:grid-cols-[1fr_220px_auto]">
        <label className="relative">
          <span className="sr-only">Cari pengguna</span>
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-text-secondary" />
          <input className={`${fieldClass} pl-10`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nama, email, atau nomor telepon…" />
        </label>
        <label>
          <span className="sr-only">Filter peran</span>
          <select className={fieldClass} value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="">Semua peran</option>
            {['CUSTOMER', 'STAFF', 'CASHIER', 'KITCHEN', 'MANAGER', 'ADMIN', 'OWNER', 'SUPERADMIN'].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <button className={secondaryButtonClass}>Cari</button>
      </form>
      <DataPanel loading={resource.loading} error={resource.error} empty={(resource.data?.data.length ?? 0) === 0} onRetry={() => void resource.reload()}>
        <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface-card">
          <table className="min-w-[640px] w-full text-left text-sm">
            <thead className="border-b border-border-subtle bg-surface-secondary text-xs uppercase tracking-wider text-text-secondary">
              <tr><th className="p-4">Pengguna</th><th className="p-4">Peran</th><th className="p-4">Cabang</th><th className="p-4">Terdaftar</th></tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {resource.data?.data.map((user) => (
                <tr key={user.id}>
                  <td className="p-4"><p className="font-semibold">{user.name}</p><p className="text-xs text-text-secondary">{user.email}{user.phone ? ` · ${user.phone}` : ''}</p></td>
                  <td className="p-4">{user.role}</td>
                  <td className="p-4 text-text-secondary">{user.branchId ?? 'Tidak ditetapkan'}</td>
                  <td className="p-4 text-text-secondary">{new Date(user.createdAt).toLocaleDateString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataPanel>
    </div>
  );
}
