'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  DataPanel,
  Notice,
  PageHeading,
  fieldClass,
  formatRupiah,
  primaryButtonClass,
  secondaryButtonClass,
  useAsyncResource,
} from '@/components/management/page-kit';
import { createEvent, getEvents, updateEvent } from '@/lib/management-api';
import { getOperationalBranchScope } from '@/lib/operations-api';

const EMPTY_FORM = {
  title: '',
  description: '',
  branchId: '',
  date: '',
  startTime: '18:00',
  endTime: '20:00',
  location: '',
  capacity: '30',
  category: 'COMMUNITY' as const,
};

async function loadEvents() {
  const scope = await getOperationalBranchScope();
  const events = await getEvents(
    scope.canViewAllBranches ? undefined : (scope.user.branchId ?? undefined)
  );
  return { scope, events: events.data };
}

export default function EventsPage() {
  const resource = useAsyncResource(loadEvents);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    tone: 'success' | 'error';
    text: string;
  } | null>(null);

  function startCreate() {
    setForm({
      ...EMPTY_FORM,
      branchId:
        resource.data?.scope.user.branchId ??
        resource.data?.scope.branches[0]?.id ??
        '',
    });
    setNotice(null);
    setShowForm(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyId('create');
    setNotice(null);
    try {
      await createEvent({
        ...form,
        capacity: Number(form.capacity),
        price: 0,
      });
      setShowForm(false);
      setNotice({
        tone: 'success',
        text: 'Event berhasil dibuat dan tersimpan.',
      });
      await resource.reload();
    } catch (reason) {
      setNotice({
        tone: 'error',
        text: reason instanceof Error ? reason.message : 'Event gagal dibuat.',
      });
    } finally {
      setBusyId(null);
    }
  }

  async function changeStatus(id: string, status: 'UPCOMING' | 'CANCELLED') {
    setBusyId(id);
    setNotice(null);
    try {
      await updateEvent(id, { status });
      setNotice({
        tone: 'success',
        text: `Status event diperbarui menjadi ${status}.`,
      });
      await resource.reload();
    } catch (reason) {
      setNotice({
        tone: 'error',
        text:
          reason instanceof Error
            ? reason.message
            : 'Status event gagal diperbarui.',
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 p-5 sm:p-8">
      <PageHeading
        eyebrow="Community program"
        title="Event & meetup"
        description="Buat dan kelola event nyata per cabang, termasuk kapasitas dan registrasi peserta."
        actions={
          <button
            type="button"
            onClick={startCreate}
            className={primaryButtonClass}
          >
            <Plus className="mr-2 h-4 w-4" />
            Event baru
          </button>
        }
      />
      {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
      {showForm ? (
        <form
          onSubmit={submit}
          className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-5 md:grid-cols-2"
        >
          <label className="text-sm font-semibold">
            Judul
            <input
              required
              minLength={3}
              maxLength={160}
              className={`${fieldClass} mt-2`}
              value={form.title}
              onChange={(event) =>
                setForm((value) => ({ ...value, title: event.target.value }))
              }
            />
          </label>
          <label className="text-sm font-semibold">
            Cabang
            <select
              required
              className={`${fieldClass} mt-2`}
              value={form.branchId}
              onChange={(event) =>
                setForm((value) => ({ ...value, branchId: event.target.value }))
              }
            >
              {resource.data?.scope.branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Tanggal
            <input
              required
              type="date"
              className={`${fieldClass} mt-2`}
              value={form.date}
              onChange={(event) =>
                setForm((value) => ({ ...value, date: event.target.value }))
              }
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-semibold">
              Mulai
              <input
                required
                type="time"
                className={`${fieldClass} mt-2`}
                value={form.startTime}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    startTime: event.target.value,
                  }))
                }
              />
            </label>
            <label className="text-sm font-semibold">
              Selesai
              <input
                required
                type="time"
                className={`${fieldClass} mt-2`}
                value={form.endTime}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    endTime: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <label className="text-sm font-semibold">
            Lokasi
            <input
              maxLength={250}
              className={`${fieldClass} mt-2`}
              value={form.location}
              onChange={(event) =>
                setForm((value) => ({ ...value, location: event.target.value }))
              }
            />
          </label>
          <label className="text-sm font-semibold">
            Kategori
            <select
              className={`${fieldClass} mt-2`}
              value={form.category}
              onChange={(event) =>
                setForm((value) => ({
                  ...value,
                  category: event.target.value as typeof value.category,
                }))
              }
            >
              {[
                'WORKSHOP',
                'MUSIC',
                'COMMUNITY',
                'BUSINESS',
                'ART',
                'TECH',
                'FOOD',
              ].map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Kapasitas
            <input
              required
              type="number"
              min={1}
              max={10_000}
              className={`${fieldClass} mt-2`}
              value={form.capacity}
              onChange={(event) =>
                setForm((value) => ({ ...value, capacity: event.target.value }))
              }
            />
          </label>
          <div className="rounded-xl border border-border-subtle bg-surface-secondary p-4 text-sm">
            <p className="font-semibold">Biaya event</p>
            <p className="mt-2 text-text-secondary">
              Gratis. Event berbayar baru dapat diaktifkan setelah alur
              pembayaran event tersedia.
            </p>
          </div>
          <label className="text-sm font-semibold md:col-span-2">
            Deskripsi
            <textarea
              maxLength={5000}
              rows={4}
              className={`${fieldClass} mt-2`}
              value={form.description}
              onChange={(event) =>
                setForm((value) => ({
                  ...value,
                  description: event.target.value,
                }))
              }
            />
          </label>
          <div className="flex gap-3 md:col-span-2">
            <button
              disabled={busyId === 'create'}
              className={primaryButtonClass}
            >
              {busyId === 'create' ? 'Menyimpan…' : 'Simpan event'}
            </button>
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() => setShowForm(false)}
            >
              Batal
            </button>
          </div>
        </form>
      ) : null}

      <DataPanel
        loading={resource.loading}
        error={resource.error}
        empty={(resource.data?.events.length ?? 0) === 0}
        onRetry={() => void resource.reload()}
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {resource.data?.events.map((event) => {
            const count = event._count?.registrations ?? event.registered;
            return (
              <article
                key={event.id}
                className="rounded-2xl border border-border-subtle bg-surface-card p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-accent">
                      {event.category} · {event.status}
                    </p>
                    <h2 className="mt-2 text-xl font-bold">{event.title}</h2>
                  </div>
                  <p className="font-bold">
                    {event.isFree ? 'Gratis' : formatRupiah(event.price)}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  {event.description || 'Belum ada deskripsi.'}
                </p>
                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-text-secondary">Tanggal</dt>
                    <dd className="font-semibold">
                      {new Intl.DateTimeFormat('id-ID', {
                        dateStyle: 'long',
                        timeZone: 'UTC',
                      }).format(new Date(event.date))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">Waktu</dt>
                    <dd className="font-semibold">
                      {event.startTime}–{event.endTime}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">Lokasi</dt>
                    <dd className="font-semibold">{event.location}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">Peserta</dt>
                    <dd className="font-semibold">
                      {count}/{event.capacity}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-border-subtle pt-4">
                  <Link
                    href={`/events/${event.id}`}
                    className={secondaryButtonClass}
                  >
                    Detail & peserta
                  </Link>
                  {event.status === 'CANCELLED' ? (
                    <button
                      disabled={busyId === event.id}
                      type="button"
                      className={secondaryButtonClass}
                      onClick={() => void changeStatus(event.id, 'UPCOMING')}
                    >
                      Aktifkan
                    </button>
                  ) : (
                    <button
                      disabled={busyId === event.id}
                      type="button"
                      className={secondaryButtonClass}
                      onClick={() => void changeStatus(event.id, 'CANCELLED')}
                    >
                      Batalkan
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </DataPanel>
    </div>
  );
}
