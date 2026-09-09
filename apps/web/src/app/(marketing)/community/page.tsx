'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Users } from 'lucide-react';
import { DataState, LoadingState } from '@/components/data-state';
import { SectionHeader } from '@/components/shared/section-header';
import { getApiErrorMessage } from '@/lib/api-error';
import { listCommunityGroups } from '@/features/public/public.api';

export default function CommunityPage() {
  const [category, setCategory] = useState('ALL');
  const groups = useQuery({ queryKey: ['community-groups'], queryFn: () => listCommunityGroups(), retry: 1 });
  const categories = useMemo(() => ['ALL', ...new Set((groups.data ?? []).map((group) => group.category))], [groups.data]);
  const filtered = (groups.data ?? []).filter((group) => category === 'ALL' || group.category === category);
  return <div className="relative min-h-screen bg-background pb-24"><section className="relative overflow-hidden border-b border-border-subtle bg-surface-secondary pb-12 pt-24"><div className="absolute inset-0 bg-mesh" /><div className="relative mx-auto max-w-7xl px-4 sm:px-6"><SectionHeader badge="Community" title="Ruang Temu Komunitas" description="Grup dan aktivitas yang tampil berasal dari community service. Bergabunglah untuk membuat post pada lingkaran yang relevan." /></div></section><main className="mx-auto max-w-7xl space-y-8 px-4 pt-8 sm:px-6"><div className="flex items-center justify-between gap-4"><div className="flex gap-2 overflow-x-auto pb-2">{categories.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${category === item ? 'bg-primary-container text-on-primary-container' : 'border border-border-subtle bg-surface-card text-text-muted'}`}>{item === 'ALL' ? 'Semua grup' : item}</button>)}</div><Link href="/events" className="shrink-0 text-sm font-bold text-primary">Lihat event →</Link></div>{groups.isPending ? <LoadingState label="Memuat komunitas…" /> : groups.isError ? <DataState title="Komunitas belum dapat dimuat" detail={getApiErrorMessage(groups.error)} retry={() => void groups.refetch()} /> : filtered.length === 0 ? <DataState title="Belum ada grup" detail="Coba kategori lain atau kembali lagi nanti." /> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.map((group) => <article key={group.id} className="overflow-hidden rounded-3xl border border-border-subtle bg-surface-card"><div className="relative h-44"><Image src={group.image || '/images/darmo-interior.png'} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" /><p className="absolute bottom-4 left-4 text-xs font-bold uppercase tracking-wider text-amber-300">{group.category}</p></div><div className="space-y-4 p-5"><h2 className="text-xl font-bold text-text-primary">{group.name}</h2><p className="line-clamp-3 min-h-18 text-sm leading-6 text-text-muted">{group.description}</p><div className="flex gap-4 text-xs text-text-muted"><span className="flex items-center gap-1"><Users className="h-4 w-4" />{group._count.memberships} anggota</span><span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" />{group._count.posts} post</span></div><Link href={`/community/groups/${group.id}`} className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container">Buka komunitas</Link></div></article>)}</div>}</main></div>;
}
