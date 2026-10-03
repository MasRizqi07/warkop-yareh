'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { SiteDraftDto } from '@/features/reality/contracts';
import {
  useRealityResource,
  useUnsavedChanges,
} from '@/features/reality/use-reality-resource';

const empty = {
  sectionKey: 'homepage.hero',
  title: '',
  subtitle: '',
  body: '',
  sourceReference: '',
};
export default function AdminSiteContentPage() {
  const resource = useRealityResource<SiteDraftDto>('/reality/site-content');
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<SiteDraftDto | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  useUnsavedChanges(dirty);
  const change = (name: string, value: string) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    setDirty(true);
    setMessage('');
  };
  function edit(row: SiteDraftDto) {
    if (dirty && !window.confirm('Buang perubahan yang belum disimpan?'))
      return;
    setEditing(row);
    setDirty(false);
    setMessage('');
    setSaveError('');
    setForm({
      sectionKey: row.sectionKey,
      title: row.title || '',
      subtitle: row.subtitle || '',
      body: row.body || '',
      sourceReference: row.metadata?.sourceReference || '',
    });
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaveError('');
    setMessage('');
    try {
      const existing =
        editing ??
        resource.rows.find((row) => row.sectionKey === form.sectionKey);
      await apiFetch('/reality/site-content', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          ...(existing ? { updatedAt: existing.updatedAt } : {}),
        }),
      });
      setDirty(false);
      setEditing(null);
      setForm(empty);
      setMessage('Draft tersimpan dan tetap privat.');
      await resource.reload();
    } catch (cause: unknown) {
      setSaveError(
        cause instanceof Error ? cause.message : 'Penyimpanan gagal'
      );
    } finally {
      setSaving(false);
    }
  }
  const inputClass =
    'w-full rounded-lg border border-white/20 bg-[#171719] px-3 py-2.5 text-sm text-white';
  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-8 space-y-6">
      <h1 className="text-2xl font-bold">Site Content &amp; Fakta Bisnis</h1>
      <p className="text-sm text-[#b5bdca]">
        Draft editorial disimpan secara privat dengan status UNVERIFIED. Simpan
        draft tidak menerbitkan klaim ke situs publik. Konten publik tetap
        mengikuti fakta bisnis yang telah disetujui.
      </p>
      {resource.loading && <p role="status">Memuat draft…</p>}
      {resource.error && (
        <div role="alert">
          <p>{resource.error}</p>
          <button
            className="py-3 underline"
            onClick={() => void resource.reload()}
          >
            Coba lagi
          </button>
        </div>
      )}
      {!resource.loading && !resource.error && !resource.rows.length && (
        <p>Belum ada draft tersimpan.</p>
      )}
      <ul className="space-y-3">
        {resource.rows.map((row) => (
          <li key={row.id} className="rounded-xl border border-white/10 p-4">
            <h2 className="font-bold">{row.title}</h2>
            <p className="text-sm text-[#b5bdca]">
              {row.sectionKey} •{' '}
              {row.isPublished
                ? 'Data lama: perlu tinjauan bukti'
                : 'Draft privat / UNVERIFIED'}
            </p>
            <p className="text-sm whitespace-pre-wrap mt-2">{row.body}</p>
            <button className="py-3 underline" onClick={() => edit(row)}>
              Edit {row.sectionKey}
            </button>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(event) => void save(event)}
        className="rounded-xl border border-white/10 p-4 sm:p-6 space-y-4"
      >
        <h2 className="text-lg font-bold">
          {editing ? 'Edit Draft' : 'Tambah Draft'}
        </h2>
        <label className="block space-y-1 text-sm">
          Bagian Konten
          <select
            disabled={Boolean(editing)}
            className={inputClass}
            value={form.sectionKey}
            onChange={(event) => change('sectionKey', event.target.value)}
          >
            {[
              'homepage.hero',
              'about.story',
              'menu.notice',
              'gallery.notice',
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="block space-y-1 text-sm">
          Judul Konten
          <input
            required
            maxLength={160}
            className={inputClass}
            value={form.title}
            onChange={(event) => change('title', event.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          Subjudul
          <input
            maxLength={500}
            className={inputClass}
            value={form.subtitle}
            onChange={(event) => change('subtitle', event.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          Isi Konten
          <textarea
            required
            maxLength={5000}
            rows={5}
            className={inputClass}
            value={form.body}
            onChange={(event) => change('body', event.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          Referensi Sumber
          <textarea
            maxLength={1000}
            className={inputClass}
            value={form.sourceReference}
            onChange={(event) => change('sourceReference', event.target.value)}
          />
        </label>
        {dirty && (
          <p className="text-sm text-amber-300">
            Ada perubahan belum disimpan.
          </p>
        )}
        <p role="status">{message}</p>
        {saveError && (
          <p role="alert" className="text-red-300">
            {saveError}
          </p>
        )}
        <button
          disabled={saving}
          className="rounded-lg bg-[#9c6b3a] text-white px-5 py-3 font-semibold disabled:opacity-60"
        >
          {saving ? 'Menyimpan…' : 'Simpan Draft'}
        </button>
      </form>
    </div>
  );
}
