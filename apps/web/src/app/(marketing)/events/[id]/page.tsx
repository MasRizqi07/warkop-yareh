'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import { Button } from '@warkop-yareh/ui';
import { DataState, LoadingState } from '@/components/data-state';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAuthStore } from '@/stores/auth.store';
import { getEvent, registerForEvent } from '@/features/public/public.api';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const event = useQuery({ queryKey: ['event', id], queryFn: () => getEvent(id), retry: 1 });
  const registration = useMutation({ mutationFn: () => registerForEvent(id), onSuccess: () => void event.refetch() });
  if (event.isPending) return <main className="mx-auto min-h-screen max-w-5xl px-4 pb-24 pt-28"><LoadingState label="Memuat event…" /></main>;
  if (event.isError) return <main className="mx-auto min-h-screen max-w-5xl px-4 pb-24 pt-28"><DataState title="Event tidak dapat dimuat" detail={getApiErrorMessage(event.error)} retry={() => void event.refetch()} /></main>;
  const value = event.data;
  const count = value._count?.registrations ?? value.registered;
  return <main className="mx-auto min-h-screen max-w-5xl space-y-7 px-4 pb-24 pt-24 sm:px-6"><Link href="/events" className="text-sm font-semibold text-primary">← Semua event</Link><div className="overflow-hidden rounded-3xl border border-border-subtle bg-surface-card"><div className="relative h-72 sm:h-96"><Image src={value.image || '/images/darmo-interior.png'} alt="" fill priority sizes="(min-width: 1024px) 900px, 100vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" /><div className="absolute bottom-6 left-6 right-6 text-white"><p className="text-xs font-bold uppercase tracking-wider text-amber-300">{value.category} · {value.status}</p><h1 className="mt-2 text-3xl font-bold sm:text-5xl">{value.title}</h1></div></div><div className="grid gap-8 p-6 lg:grid-cols-[1fr_280px] lg:p-9"><article><p className="whitespace-pre-wrap text-sm leading-7 text-text-muted">{value.longDescription || value.description}</p></article><aside className="space-y-4 rounded-2xl border border-border-subtle bg-surface-secondary p-5"><p className="flex gap-2 text-sm"><CalendarDays className="h-4 w-4 text-primary" />{new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(value.date))}</p><p className="flex gap-2 text-sm"><Clock className="h-4 w-4 text-primary" />{value.startTime}–{value.endTime}</p><p className="flex gap-2 text-sm"><MapPin className="h-4 w-4 text-primary" />{value.branch?.name ?? value.location}</p><p className="flex gap-2 text-sm"><Users className="h-4 w-4 text-primary" />{count}/{value.capacity} peserta</p><p className="text-xl font-bold text-primary">{value.isFree ? 'Gratis' : `Rp ${value.price.toLocaleString('id-ID')}`}</p>{registration.isError ? <p role="alert" className="text-sm text-red-500">{getApiErrorMessage(registration.error)}</p> : null}{registration.isSuccess ? <p role="status" className="text-sm text-emerald-500">Registrasi berhasil tersimpan.</p> : null}{authenticated ? <Button className="w-full" disabled={registration.isPending || count >= value.capacity || !value.isFree} onClick={() => registration.mutate()}>{registration.isPending ? 'Mendaftar…' : count >= value.capacity ? 'Kapasitas penuh' : value.isFree ? 'Daftar event' : 'Pembayaran belum tersedia'}</Button> : <Button className="w-full" asChild><Link href={`/login?redirect_url=${encodeURIComponent(`/events/${id}`)}`}>Masuk untuk daftar</Link></Button>}</aside></div></div></main>;
}
