'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import { Button } from '@warkop-yareh/ui';
import { DataState, LoadingState } from '@/components/data-state';
import { SectionHeader } from '@/components/shared/section-header';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAuthStore } from '@/stores/auth.store';
import {
  listEvents,
  registerForEvent,
  type EventCategory,
  type PublicEvent,
} from '@/features/public/public.api';

const CATEGORIES: Array<{ value: EventCategory | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Semua' },
  { value: 'TECH', label: 'Teknologi' },
  { value: 'MUSIC', label: 'Musik' },
  { value: 'BUSINESS', label: 'Bisnis' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'ART', label: 'Seni' },
  { value: 'FOOD', label: 'Kuliner' },
  { value: 'COMMUNITY', label: 'Komunitas' },
];

const FALLBACK_IMAGE = '/images/darmo-interior.png';

export default function EventsPage() {
  const [category, setCategory] = useState<EventCategory | 'ALL'>('ALL');
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const events = useQuery({
    queryKey: ['public-events', category],
    queryFn: () => listEvents(category === 'ALL' ? {} : { category }),
    retry: 1,
  });

  return (
    <div className="relative min-h-screen bg-background pb-24">
      <section className="relative overflow-hidden border-b border-border-subtle bg-surface-secondary pb-12 pt-24"><div className="absolute inset-0 bg-mesh" /><div className="relative mx-auto max-w-7xl px-4 sm:px-6"><SectionHeader badge="Events" title="Events & Kegiatan" description="Agenda yang tampil berasal dari event service, lengkap dengan kapasitas terkini dan cabang penyelenggara." /></div></section>
      <main className="mx-auto max-w-7xl space-y-8 px-4 pt-8 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-2" aria-label="Filter kategori event">{CATEGORIES.map((item) => <button key={item.value} type="button" aria-pressed={category === item.value} onClick={() => setCategory(item.value)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${category === item.value ? 'bg-primary-container text-on-primary-container' : 'border border-border-subtle bg-surface-card text-text-muted'}`}>{item.label}</button>)}</div>
        {events.isPending ? <LoadingState label="Memuat agenda terbaru…" /> : events.isError ? <DataState title="Agenda belum dapat dimuat" detail={getApiErrorMessage(events.error)} retry={() => void events.refetch()} /> : events.data.length === 0 ? <DataState title="Belum ada event pada kategori ini" detail="Coba kategori lain atau kembali lagi nanti." /> : <div className="grid gap-6 lg:grid-cols-2">{events.data.map((event) => <EventCard key={event.id} event={event} authenticated={authenticated} onRegistered={() => void events.refetch()} />)}</div>}
      </main>
    </div>
  );
}

function EventCard({ event, authenticated, onRegistered }: { event: PublicEvent; authenticated: boolean; onRegistered: () => void }) {
  const [message, setMessage] = useState<string | null>(null);
  const registration = useMutation({
    mutationFn: () => registerForEvent(event.id),
    onSuccess: () => { setMessage('Registrasi berhasil tersimpan.'); onRegistered(); },
    onError: (error) => setMessage(getApiErrorMessage(error)),
  });
  const count = event._count?.registrations ?? event.registered;
  const full = count >= event.capacity;
  return (
    <article className="overflow-hidden rounded-3xl border border-border-subtle bg-surface-card shadow-sm"><div className="relative h-56"><Image src={event.image || FALLBACK_IMAGE} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" /><span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white">{event.category}</span></div><div className="space-y-5 p-6"><div><h2 className="text-xl font-bold text-text-primary">{event.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-text-muted">{event.description}</p></div><dl className="grid gap-3 text-sm sm:grid-cols-2"><div className="flex gap-2"><CalendarDays className="h-4 w-4 text-primary" /><span>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(event.date))}</span></div><div className="flex gap-2"><Clock className="h-4 w-4 text-primary" /><span>{event.startTime}–{event.endTime}</span></div><div className="flex gap-2"><MapPin className="h-4 w-4 text-primary" /><span>{event.branch?.name ?? event.location}</span></div><div className="flex gap-2"><Users className="h-4 w-4 text-primary" /><span>{count}/{event.capacity} peserta</span></div></dl><div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4"><div><p className="font-bold text-primary">{event.isFree ? 'Gratis' : `Rp ${event.price.toLocaleString('id-ID')}`}</p>{message ? <p role="status" className="mt-1 text-xs text-text-muted">{message}</p> : null}</div><div className="flex gap-2"><Button asChild variant="secondary"><Link href={`/events/${event.id}`}>Detail</Link></Button>{authenticated ? <Button disabled={registration.isPending || full || !event.isFree} onClick={() => registration.mutate()}>{registration.isPending ? 'Mendaftar…' : full ? 'Penuh' : event.isFree ? 'Daftar' : 'Pembayaran belum tersedia'}</Button> : <Button asChild><Link href={`/login?redirect_url=${encodeURIComponent(`/events/${event.id}`)}`}>Masuk untuk daftar</Link></Button>}</div></div></div></article>
  );
}
