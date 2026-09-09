'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { Button } from '@warkop-yareh/ui';
import { Input } from '@warkop-yareh/ui';
import { SectionHeader } from '@/components/shared/section-header';
import { DataState, LoadingState } from '@/components/data-state';
import { getBranches } from '@/features/catalog/catalog.api';
import { getApiErrorMessage } from '@/lib/api-error';
import { SITE } from '@/lib/constants';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: getBranches,
    staleTime: 5 * 60_000,
    retry: 1,
  });
  const contactChannel = SITE.whatsapp
    ? 'WhatsApp'
    : SITE.email
      ? 'email'
      : null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!contactChannel) return;
    const body = [
      "Halo Warkop Ya'reh, saya ingin menghubungi tim:",
      `Nama: ${name.trim()}`,
      `Email: ${email.trim()}`,
      `Subjek: ${subject.trim()}`,
      '',
      message.trim(),
    ].join('\n');
    if (SITE.whatsapp) {
      window.open(
        `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(body)}`,
        '_blank',
        'noopener,noreferrer'
      );
      return;
    }
    window.location.assign(
      `mailto:${SITE.email}?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(body)}`
    );
  };

  const quickContacts = [
    SITE.phone
      ? {
          label: 'Telepon',
          value: SITE.phone,
          href: `tel:${SITE.phone}`,
          icon: Phone,
        }
      : null,
    SITE.email
      ? {
          label: 'Email',
          value: SITE.email,
          href: `mailto:${SITE.email}`,
          icon: Mail,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <main className="min-h-screen bg-background pb-24 text-text-primary">
      <section className="relative overflow-hidden border-b border-border-subtle bg-surface-secondary pb-12 pt-24">
        <div className="absolute inset-0 bg-mesh" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            badge="Contact"
            title="Hubungi Kami"
            description="Pilih kanal yang sudah dikonfigurasi atau lihat lokasi cabang aktif yang diterbitkan oleh API."
          />
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl items-start gap-8 px-4 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-3xl border border-border-subtle bg-surface-card p-6 sm:p-8">
          <h2 className="text-xl font-bold">Siapkan pesan</h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Formulir ini membuka {contactChannel ?? 'kanal kontak'} dengan draf
            pesan. Pesan baru terkirim setelah kamu mengonfirmasi pada aplikasi
            tujuan.
          </p>
          {!contactChannel && (
            <div className="mt-5">
              <DataState
                title="Kanal kontak belum dikonfigurasi"
                detail="Administrator perlu mengisi NEXT_PUBLIC_WHATSAPP_NUMBER atau NEXT_PUBLIC_CONTACT_EMAIL saat deployment."
              />
            </div>
          )}
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label
                className="space-y-2 text-sm font-semibold"
                htmlFor="contact-name"
              >
                Nama
                <Input
                  id="contact-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={100}
                  required
                  autoComplete="name"
                />
              </label>
              <label
                className="space-y-2 text-sm font-semibold"
                htmlFor="contact-email"
              >
                Email
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  maxLength={254}
                  required
                  autoComplete="email"
                />
              </label>
            </div>
            <label
              className="block space-y-2 text-sm font-semibold"
              htmlFor="contact-subject"
            >
              Subjek
              <Input
                id="contact-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                minLength={3}
                maxLength={120}
                required
              />
            </label>
            <label
              className="block space-y-2 text-sm font-semibold"
              htmlFor="contact-message"
            >
              Pesan
              <textarea
                id="contact-message"
                rows={7}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                minLength={10}
                maxLength={1500}
                required
                className="w-full resize-y rounded-xl border border-border-subtle bg-surface-secondary p-3 text-sm leading-6 outline-none focus:border-primary"
              />
            </label>
            <Button type="submit" size="lg" disabled={!contactChannel}>
              <Send className="mr-1.5 h-4 w-4" />
              Lanjutkan di {contactChannel ?? 'kanal kontak'}
            </Button>
          </form>
        </section>

        <aside className="space-y-5">
          <section className="space-y-4 rounded-3xl border border-border-subtle bg-surface-card p-6">
            <h2 className="font-bold">Kontak resmi</h2>
            {quickContacts.length ? (
              quickContacts.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex min-h-12 items-center gap-3 rounded-xl border border-border-subtle bg-surface-secondary p-3"
                >
                  <item.icon className="h-5 w-5 text-accent-amber" />
                  <span>
                    <span className="block text-xs text-text-muted">
                      {item.label}
                    </span>
                    <strong className="break-all text-sm">{item.value}</strong>
                  </span>
                </a>
              ))
            ) : (
              <p className="text-sm leading-6 text-text-muted">
                Belum ada nomor telepon atau email yang dikonfigurasi.
              </p>
            )}
            {SITE.whatsapp && (
              <a
                href={`https://wa.me/${SITE.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center gap-3 rounded-xl bg-primary-container p-3 font-bold text-on-primary-container"
              >
                <MessageCircle className="h-5 w-5" />
                Buka WhatsApp resmi
              </a>
            )}
          </section>
          <section className="space-y-4 rounded-3xl border border-border-subtle bg-surface-card p-6">
            <h2 className="flex items-center gap-2 font-bold">
              <MapPin className="h-5 w-5 text-accent-amber" />
              Cabang aktif
            </h2>
            {branches.isPending ? (
              <LoadingState label="Memuat cabang…" />
            ) : branches.isError ? (
              <DataState
                title="Cabang belum dapat dimuat"
                detail={getApiErrorMessage(branches.error)}
                retry={() => void branches.refetch()}
              />
            ) : !branches.data.length ? (
              <DataState title="Belum ada cabang aktif" />
            ) : (
              <div className="space-y-3">
                {branches.data.map((branch) => (
                  <article
                    key={branch.id}
                    className="rounded-xl border border-border-subtle bg-surface-secondary p-4"
                  >
                    <h3 className="font-semibold">{branch.name}</h3>
                    <p className="mt-1 text-xs leading-5 text-text-muted">
                      {branch.address}, {branch.city}
                    </p>
                    <p className="mt-3 flex items-center gap-2 text-xs text-text-muted">
                      <Clock className="h-4 w-4" />
                      Hari kerja {branch.weekdayHours} · akhir pekan{' '}
                      {branch.weekendHours}
                    </p>
                    {branch.phone && (
                      <a
                        href={`tel:${branch.phone}`}
                        className="mt-3 inline-flex text-xs font-semibold text-primary"
                      >
                        {branch.phone}
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
