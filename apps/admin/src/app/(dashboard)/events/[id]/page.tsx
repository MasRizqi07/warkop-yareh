'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useParams } from 'next/navigation';
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
  getEvent,
  getEventRegistrations,
  updateEvent,
  updateEventRegistration,
  type EventRegistrationRecord,
} from '@/lib/management-api';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const resource = useAsyncResource(async () => {
    const [event, registrations] = await Promise.all([
      getEvent(id),
      getEventRegistrations(id),
    ]);
    return { event, registrations };
  }, id);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    capacity: '',
    price: '',
  });
  const [saving, setSaving] = useState(false);
  const [busyRegistration, setBusyRegistration] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    tone: 'success' | 'error';
    text: string;
  } | null>(null);

  const eventVersion =
    resource.data?.event.updatedAt ?? resource.data?.event.id;
  const [formVersion, setFormVersion] = useState<string | undefined>();
  if (resource.data?.event && formVersion !== eventVersion) {
    const event = resource.data.event;
    setFormVersion(eventVersion);
    setForm({
      title: event.title,
      description: event.description,
      date: event.date.slice(0, 10),
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      capacity: String(event.capacity),
      price: String(event.price),
    });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      await updateEvent(id, {
        ...form,
        capacity: Number(form.capacity),
        price: Number(form.price),
      });
      setNotice({
        tone: 'success',
        text: 'Perubahan event berhasil disimpan.',
      });
      await resource.reload();
    } catch (reason) {
      setNotice({
        tone: 'error',
        text:
          reason instanceof Error ? reason.message : 'Event gagal diperbarui.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function setRegistrationStatus(
    registration: EventRegistrationRecord,
    status: EventRegistrationRecord['status']
  ) {
    setBusyRegistration(registration.id);
    setNotice(null);
    try {
      await updateEventRegistration(id, registration.id, status);
      setNotice({
        tone: 'success',
        text: `Status ${registration.user.name} menjadi ${status}.`,
      });
      await resource.reload();
    } catch (reason) {
      setNotice({
        tone: 'error',
        text:
          reason instanceof Error
            ? reason.message
            : 'Registrasi gagal diperbarui.',
      });
    } finally {
      setBusyRegistration(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7 p-5 sm:p-8">
      <PageHeading
        eyebrow="Event operations"
        title={resource.data?.event.title ?? 'Detail event'}
        description="Perubahan disimpan ke API dan daftar peserta selalu dimuat ulang dari database."
        actions={
          <Link href="/events" className={secondaryButtonClass}>
            Kembali
          </Link>
        }
      />
      {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
      <DataPanel
        loading={resource.loading}
        error={resource.error}
        empty={!resource.data}
        onRetry={() => void resource.reload()}
      >
        {resource.data ? (
          <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
            <form
              onSubmit={save}
              className="grid content-start gap-4 rounded-2xl border border-border-subtle bg-surface-card p-5 sm:grid-cols-2"
            >
              <h2 className="text-lg font-bold sm:col-span-2">
                Informasi event
              </h2>
              <label className="text-sm font-semibold sm:col-span-2">
                Judul
                <input
                  required
                  minLength={3}
                  maxLength={160}
                  className={`${fieldClass} mt-2`}
                  value={form.title}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      title: event.target.value,
                    }))
                  }
                />
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
              <label className="text-sm font-semibold">
                Lokasi
                <input
                  maxLength={250}
                  className={`${fieldClass} mt-2`}
                  value={form.location}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      location: event.target.value,
                    }))
                  }
                />
              </label>
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
                    setForm((value) => ({
                      ...value,
                      capacity: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm font-semibold">
                Harga
                <input
                  required
                  type="number"
                  min={0}
                  max={0}
                  step={1}
                  className={`${fieldClass} mt-2`}
                  value={form.price}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      price: event.target.value,
                    }))
                  }
                />
                <span className="mt-2 block text-xs font-normal text-text-secondary">
                  Saat ini hanya event gratis yang dapat didaftarkan. Event lama
                  berbayar harus diubah ke Rp0 sebelum disimpan.
                </span>
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Deskripsi
                <textarea
                  rows={5}
                  maxLength={5000}
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
              <button
                disabled={saving}
                className={`${primaryButtonClass} sm:col-span-2`}
              >
                {saving ? 'Menyimpan…' : 'Simpan perubahan'}
              </button>
            </form>

            <section className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-card">
              <div className="border-b border-border-subtle p-5">
                <h2 className="text-lg font-bold">
                  Peserta ({resource.data.registrations.length})
                </h2>
                <p className="text-sm text-text-secondary">
                  Kapasitas {resource.data.event.capacity} orang
                </p>
              </div>
              {resource.data.registrations.length === 0 ? (
                <p className="p-8 text-center text-sm text-text-secondary">
                  Belum ada peserta.
                </p>
              ) : (
                <ul className="divide-y divide-border-subtle">
                  {resource.data.registrations.map((registration) => (
                    <li key={registration.id} className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">
                            {registration.user.name}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {registration.user.email}
                          </p>
                        </div>
                        <span className="rounded-full border border-border-subtle px-2 py-1 text-xs font-bold">
                          {registration.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(
                          [
                            'REGISTERED',
                            'WAITLISTED',
                            'ATTENDED',
                            'CANCELLED',
                          ] as const
                        )
                          .filter((status) => status !== registration.status)
                          .map((status) => (
                            <button
                              key={status}
                              type="button"
                              disabled={busyRegistration === registration.id}
                              onClick={() =>
                                void setRegistrationStatus(registration, status)
                              }
                              className={secondaryButtonClass}
                            >
                              {status}
                            </button>
                          ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}
      </DataPanel>
    </div>
  );
}
