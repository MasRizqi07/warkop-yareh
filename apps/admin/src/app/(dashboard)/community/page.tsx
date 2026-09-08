'use client';

import { FormEvent, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  DataPanel,
  Notice,
  PageHeading,
  fieldClass,
  formatDateTime,
  primaryButtonClass,
  secondaryButtonClass,
  useAsyncResource,
} from '@/components/management/page-kit';
import {
  createCommunityGroup,
  deleteCommunityPost,
  getCommunityGroups,
  getRecentCommunityPosts,
} from '@/lib/management-api';
import { getAdminProfile } from '@/lib/operations-api';

async function loadCommunity() {
  const [groups, posts, user] = await Promise.all([
    getCommunityGroups(),
    getRecentCommunityPosts(),
    getAdminProfile(),
  ]);
  return { groups, posts: posts.data, user };
}

export default function CommunityPage() {
  const resource = useAsyncResource(loadCommunity);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', description: '' });
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const canModerate = ['ADMIN', 'SUPERADMIN'].includes(resource.data?.user.role ?? '');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      await createCommunityGroup(form);
      setForm({ name: '', category: '', description: '' });
      setShowForm(false);
      setNotice({ tone: 'success', text: 'Grup komunitas berhasil dibuat.' });
      await resource.reload();
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'Grup gagal dibuat.' });
    } finally {
      setBusy(false);
    }
  }

  async function removePost(id: string) {
    setDeletingId(id);
    setNotice(null);
    try {
      await deleteCommunityPost(id);
      setNotice({ tone: 'success', text: 'Post berhasil dihapus dan tercatat sebagai moderasi.' });
      await resource.reload();
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'Post gagal dihapus.' });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 p-5 sm:p-8">
      <PageHeading eyebrow="Patron community" title="Community hub" description="Grup dan post berasal dari database. Penghapusan post hanya tersedia bagi role yang diizinkan API." actions={<button type="button" className={primaryButtonClass} onClick={() => setShowForm(true)}><Plus className="mr-2 h-4 w-4" />Grup baru</button>} />
      {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
      {showForm ? (
        <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-5 md:grid-cols-2">
          <label className="text-sm font-semibold">Nama grup<input required minLength={3} maxLength={120} className={`${fieldClass} mt-2`} value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} /></label>
          <label className="text-sm font-semibold">Kategori<input maxLength={80} className={`${fieldClass} mt-2`} value={form.category} onChange={(event) => setForm((value) => ({ ...value, category: event.target.value }))} /></label>
          <label className="text-sm font-semibold md:col-span-2">Deskripsi<textarea rows={4} maxLength={2000} className={`${fieldClass} mt-2`} value={form.description} onChange={(event) => setForm((value) => ({ ...value, description: event.target.value }))} /></label>
          <div className="flex gap-3 md:col-span-2"><button disabled={busy} className={primaryButtonClass}>{busy ? 'Menyimpan…' : 'Simpan grup'}</button><button type="button" className={secondaryButtonClass} onClick={() => setShowForm(false)}>Batal</button></div>
        </form>
      ) : null}

      <DataPanel loading={resource.loading} error={resource.error} empty={!resource.data} onRetry={() => void resource.reload()}>
        {resource.data ? (
          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <section className="rounded-2xl border border-border-subtle bg-surface-card p-5"><h2 className="text-lg font-bold">Grup aktif ({resource.data.groups.length})</h2><ul className="mt-4 space-y-3">{resource.data.groups.map((group) => <li key={group.id} className="rounded-xl border border-border-subtle p-4"><div className="flex justify-between gap-3"><div><p className="font-bold">{group.name}</p><p className="text-xs uppercase tracking-wider text-accent">{group.category}</p></div><p className="text-xs text-text-secondary">{group._count.memberships} anggota · {group._count.posts} post</p></div><p className="mt-3 text-sm leading-5 text-text-secondary">{group.description || 'Belum ada deskripsi.'}</p></li>)}</ul></section>
            <section className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-card"><div className="border-b border-border-subtle p-5"><h2 className="text-lg font-bold">Post terbaru</h2><p className="text-sm text-text-secondary">Satu query terpaginasikan untuk menghindari pola N+1.</p></div>{resource.data.posts.length === 0 ? <p className="p-8 text-center text-sm text-text-secondary">Belum ada post.</p> : <ul className="divide-y divide-border-subtle">{resource.data.posts.map((post) => <li key={post.id} className="p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{post.author.name} <span className="font-normal text-text-secondary">di {post.group?.name ?? 'komunitas'}</span></p><p className="text-xs text-text-secondary">{formatDateTime(post.createdAt)}</p></div>{canModerate ? <button type="button" disabled={deletingId === post.id} onClick={() => void removePost(post.id)} className={secondaryButtonClass} aria-label={`Hapus post ${post.id}`}><Trash2 className="h-4 w-4" /></button> : null}</div><p className="mt-3 whitespace-pre-wrap text-sm leading-6">{post.content}</p></li>)}</ul>}</section>
          </div>
        ) : null}
      </DataPanel>
    </div>
  );
}
