'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { GalleryAssetDto } from '@/features/reality/contracts';
import {
  useRealityResource,
  useUnsavedChanges,
} from '@/features/reality/use-reality-resource';

const empty = {
  title: '',
  caption: '',
  imageUrl: '',
  branchId: '',
  provenance: 'UNVERIFIED',
  isVerified: false,
  sourceUrl: '',
  sourceType: '',
  capturedAt: '',
  lastVerifiedAt: '',
};

export default function AdminGalleryPage() {
  const resource = useRealityResource<GalleryAssetDto>('/reality/gallery');
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<GalleryAssetDto | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  useUnsavedChanges(dirty);

  const change = (name: string, value: string | boolean) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    setDirty(true);
    setMessage('');
  };
  function edit(row: GalleryAssetDto) {
    if (dirty && !window.confirm('Buang perubahan yang belum disimpan?'))
      return;
    setEditing(row);
    setForm({
      title: row.title,
      caption: row.caption || '',
      imageUrl: row.imageUrl,
      branchId: row.branchId || '',
      provenance: row.provenance,
      isVerified: row.isVerified,
      sourceUrl: row.sourceUrl || '',
      sourceType: row.sourceType || '',
      capturedAt: row.capturedAt?.slice(0, 10) || '',
      lastVerifiedAt: row.lastVerifiedAt?.slice(0, 10) || '',
    });
    setDirty(false);
    setSaveError('');
    setMessage('');
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaveError('');
    setMessage('');
    try {
      const data = {
        ...form,
        branchId: form.branchId || undefined,
        sourceUrl: form.sourceUrl || undefined,
        sourceType: form.sourceType || undefined,
        capturedAt: form.capturedAt || undefined,
        lastVerifiedAt: form.lastVerifiedAt || undefined,
        ...(editing ? { updatedAt: editing.updatedAt } : {}),
      };
      await apiFetch(
        editing ? `/reality/gallery/${editing.id}` : '/reality/gallery',
        { method: editing ? 'PATCH' : 'POST', body: JSON.stringify(data) }
      );
      setDirty(false);
      setEditing(null);
      setForm(empty);
      setMessage('Dokumentasi tersimpan.');
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
      <h1 className="text-2xl font-bold">Galeri Suasana Warkop</h1>
      <p className="text-sm text-[#b5bdca]">
        Simpan dokumentasi beserta sumbernya. Publikasi memerlukan foto lokasi,
        sumber primer, tanggal pengambilan, dan verifikasi dalam 90 hari
        terakhir.
      </p>
      {resource.loading && <p role="status">Memuat dokumentasi…</p>}
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
        <p>Belum ada dokumentasi tersimpan.</p>
      )}
      <ul className="space-y-3">
        {resource.rows.map((row) => (
          <li
            key={row.id}
            className="rounded-xl border border-white/10 p-4 flex flex-wrap justify-between gap-3"
          >
            <div>
              <h2 className="font-bold">{row.title}</h2>
              <p className="text-sm text-[#b5bdca]">
                {row.provenance} •{' '}
                {row.isVerified
                  ? 'Terverifikasi; publikasi mengikuti masa berlaku bukti'
                  : 'Draft privat'}
              </p>
            </div>
            <button className="px-4 py-2 underline" onClick={() => edit(row)}>
              Edit {row.title}
            </button>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(event) => void save(event)}
        className="rounded-xl border border-white/10 p-4 sm:p-6 space-y-4"
      >
        <h2 className="text-lg font-bold">
          {editing ? 'Edit Dokumentasi' : 'Tambah Dokumentasi'}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="space-y-1 text-sm">
            Judul Foto
            <input
              required
              maxLength={160}
              className={inputClass}
              value={form.title}
              onChange={(event) => change('title', event.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            URL Foto (HTTPS)
            <input
              required
              type="url"
              className={inputClass}
              value={form.imageUrl}
              onChange={(event) => change('imageUrl', event.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            Cabang
            <select
              className={inputClass}
              value={form.branchId}
              onChange={(event) => change('branchId', event.target.value)}
            >
              <option value="">Tidak spesifik</option>
              <option value="jetis-kulon">Jetis Kulon</option>
              <option value="prapen">Prapen</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            Klasifikasi Aset
            <select
              className={inputClass}
              value={form.provenance}
              onChange={(event) => change('provenance', event.target.value)}
            >
              {[
                'UNVERIFIED',
                'VERIFIED_VENUE_PHOTO',
                'VERIFIED_BRANCH_PHOTO',
                'BRAND_ASSET',
                'PLACEHOLDER',
              ].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            URL Sumber
            <input
              type="url"
              className={inputClass}
              value={form.sourceUrl}
              onChange={(event) => change('sourceUrl', event.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            Jenis Sumber
            <select
              className={inputClass}
              value={form.sourceType}
              onChange={(event) => change('sourceType', event.target.value)}
            >
              <option value="">Belum diketahui</option>
              <option value="PRIMARY_OPERATOR">Operator/Pemilik</option>
              <option value="DIRECT_PHYSICAL_AUDIT">
                Dokumentasi langsung di lokasi
              </option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            Tanggal Pengambilan
            <input
              type="date"
              className={inputClass}
              value={form.capturedAt}
              onChange={(event) => change('capturedAt', event.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            Tanggal Verifikasi
            <input
              type="date"
              className={inputClass}
              value={form.lastVerifiedAt}
              onChange={(event) => change('lastVerifiedAt', event.target.value)}
            />
          </label>
        </div>
        <label className="block space-y-1 text-sm">
          Keterangan Foto
          <textarea
            maxLength={1000}
            className={inputClass}
            value={form.caption}
            onChange={(event) => change('caption', event.target.value)}
          />
        </label>
        <label className="flex gap-3 items-center py-2">
          <input
            type="checkbox"
            checked={form.isVerified}
            onChange={(event) => change('isVerified', event.target.checked)}
          />
          Foto lokasi dan bukti telah diverifikasi untuk publikasi
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
          {saving ? 'Menyimpan…' : 'Simpan Dokumentasi'}
        </button>
      </form>
    </div>
  );
}
