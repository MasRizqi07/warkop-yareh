'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, MessageSquare, Search, Send, UserPlus, Users } from 'lucide-react';
import { Button } from '@warkop-yareh/ui';
import { DataState, LoadingState } from '@/components/data-state';
import {
  createCommunityPost,
  getCommunityGroup,
  getCommunityMembership,
  joinCommunityGroup,
  listCommunityPosts,
} from '@/features/public/public.api';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAuthStore } from '@/stores/auth.store';

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Jakarta',
});

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function CommunityGroupDetailPage() {
  const params = useParams<{ id: string }>();
  const groupId = Array.isArray(params.id) ? params.id[0] : params.id;
  const queryClient = useQueryClient();
  const initialized = useAuthStore((state) => state.isInitialized);
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const [search, setSearch] = useState('');
  const [content, setContent] = useState('');

  const group = useQuery({
    queryKey: ['community-group', groupId],
    queryFn: () => getCommunityGroup(groupId),
    enabled: Boolean(groupId),
    retry: 1,
  });
  const posts = useQuery({
    queryKey: ['community-posts', group.data?.id],
    queryFn: () => listCommunityPosts(group.data!.id),
    enabled: Boolean(group.data?.id),
    retry: 1,
  });
  const membership = useQuery({
    queryKey: ['community-membership', group.data?.id],
    queryFn: () => getCommunityMembership(group.data!.id),
    enabled: initialized && authenticated && Boolean(group.data?.id),
    retry: false,
  });

  const join = useMutation({
    mutationFn: () => joinCommunityGroup(group.data!.id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['community-group', groupId] }),
        queryClient.invalidateQueries({ queryKey: ['community-groups'] }),
        queryClient.invalidateQueries({ queryKey: ['community-membership', group.data?.id] }),
      ]);
    },
  });
  const publish = useMutation({
    mutationFn: () => createCommunityPost(group.data!.id, content.trim()),
    onSuccess: async () => {
      setContent('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['community-posts', group.data?.id] }),
        queryClient.invalidateQueries({ queryKey: ['community-group', groupId] }),
        queryClient.invalidateQueries({ queryKey: ['community-groups'] }),
      ]);
    },
  });

  const filteredPosts = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('id-ID');
    if (!needle) return posts.data ?? [];
    return (posts.data ?? []).filter(
      (post) =>
        post.content.toLocaleLowerCase('id-ID').includes(needle) ||
        post.author.name.toLocaleLowerCase('id-ID').includes(needle),
    );
  }, [posts.data, search]);

  if (group.isPending) {
    return <main className="mx-auto min-h-screen max-w-7xl px-4 pb-24 pt-24"><LoadingState label="Memuat komunitas…" /></main>;
  }
  if (group.isError || !group.data) {
    return <main className="mx-auto min-h-screen max-w-7xl px-4 pb-24 pt-24"><DataState title="Komunitas belum dapat dibuka" detail={getApiErrorMessage(group.error)} retry={() => void group.refetch()} /></main>;
  }

  const currentGroup = group.data;
  const isMember = Boolean(membership.data);
  const returnPath = `/community/groups/${encodeURIComponent(groupId)}`;

  return (
    <main className="min-h-screen bg-background pb-28 text-text-primary">
      <section className="relative overflow-hidden border-b border-border-subtle bg-surface-secondary pt-20">
        {currentGroup.image && <Image src={currentGroup.image} alt="" fill priority sizes="100vw" className="object-cover opacity-20" />}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/75 to-background" />
        <div className="relative mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6">
          <Link href="/community" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-text-muted hover:text-primary"><ArrowLeft className="h-4 w-4" />Semua komunitas</Link>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-accent-amber">{currentGroup.category}</p>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">{currentGroup.name}</h1>
              <p className="mt-4 max-w-2xl leading-7 text-text-muted">{currentGroup.description}</p>
              <div className="mt-5 flex flex-wrap gap-4 text-sm text-text-muted">
                <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-accent-amber" />{currentGroup._count.memberships} anggota</span>
                <span className="inline-flex items-center gap-2"><MessageSquare className="h-4 w-4 text-accent-amber" />{currentGroup._count.posts} post</span>
              </div>
              {currentGroup.tags.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{currentGroup.tags.map((tag) => <span key={tag} className="rounded-full border border-border-subtle bg-surface-card/80 px-3 py-1 text-xs text-text-muted">{tag}</span>)}</div>}
            </div>
            <div className="flex flex-wrap gap-3">
              {!initialized ? <Button disabled>Memulihkan sesi…</Button> : !authenticated ? <Link href={`/login?returnTo=${encodeURIComponent(returnPath)}`} className="inline-flex min-h-11 items-center rounded-xl bg-primary-container px-5 py-3 text-sm font-bold text-on-primary-container">Masuk untuk bergabung</Link> : membership.isPending ? <Button disabled>Memeriksa keanggotaan…</Button> : isMember ? <span className="inline-flex min-h-11 items-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-400">Anggota · {membership.data?.role}</span> : <Button disabled={join.isPending} onClick={() => join.mutate()}><UserPlus className="h-4 w-4" />{join.isPending ? 'Memproses…' : 'Gabung komunitas'}</Button>}
              <Link href="/booking" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-5 py-3 text-sm font-bold"><CalendarDays className="h-4 w-4" />Pesan ruang temu</Link>
            </div>
          </div>
          {join.isError && <DataState title="Belum dapat bergabung" detail={getApiErrorMessage(join.error)} />}
          {membership.isError && authenticated && <DataState title="Status keanggotaan belum dapat dimuat" detail={getApiErrorMessage(membership.error)} retry={() => void membership.refetch()} />}
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl items-start gap-8 px-4 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 space-y-5" aria-labelledby="discussion-heading">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div><h2 id="discussion-heading" className="text-2xl font-bold">Diskusi terbaru</h2><p className="mt-1 text-sm text-text-muted">Post berasal dari layanan komunitas dan diurutkan dari yang terbaru.</p></div>
            <label className="relative block sm:w-72"><span className="sr-only">Cari diskusi</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari isi atau penulis…" className="min-h-11 w-full rounded-xl border border-border-subtle bg-surface-card py-2 pl-10 pr-3 text-sm outline-none focus:border-accent-amber" /></label>
          </div>

          {posts.isPending ? <LoadingState label="Memuat diskusi…" /> : posts.isError ? <DataState title="Diskusi belum dapat dimuat" detail={getApiErrorMessage(posts.error)} retry={() => void posts.refetch()} /> : filteredPosts.length === 0 ? <DataState title={search ? 'Diskusi tidak ditemukan' : 'Belum ada diskusi'} detail={search ? 'Coba kata kunci lain.' : 'Jadilah anggota pertama yang membuka percakapan.'} /> : <div className="space-y-4">{filteredPosts.map((post) => <article key={post.id} className="rounded-2xl border border-border-subtle bg-surface-card p-5 sm:p-6"><header className="mb-4 flex items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-container text-sm font-bold text-on-primary-container">{post.author.avatar ? <Image src={post.author.avatar} alt="" width={44} height={44} className="h-full w-full object-cover" /> : initials(post.author.name)}</div><div className="min-w-0"><p className="truncate font-semibold">{post.author.name}</p><time dateTime={post.createdAt} className="text-xs text-text-muted">{dateFormatter.format(new Date(post.createdAt))} WIB</time></div></header><p className="whitespace-pre-wrap break-words text-sm leading-7 text-text-secondary">{post.content}</p>{(post.likes > 0 || post.comments > 0) && <footer className="mt-5 flex gap-5 border-t border-border-subtle pt-4 text-xs text-text-muted"><span>{post.likes} suka</span><span>{post.comments} komentar</span></footer>}</article>)}</div>}
        </section>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <form onSubmit={(event) => { event.preventDefault(); if (content.trim()) publish.mutate(); }} className="space-y-4 rounded-2xl border border-border-subtle bg-surface-card p-5">
            <div><h2 className="font-bold">Buat post</h2><p className="mt-1 text-xs leading-5 text-text-muted">Hanya anggota terautentikasi yang dapat menerbitkan post.</p></div>
            {!initialized ? <LoadingState label="Memulihkan sesi…" /> : !authenticated ? <DataState title="Masuk untuk menulis" loginPath={returnPath} /> : !isMember ? <DataState title="Bergabung dahulu" detail="Setelah bergabung, formulir diskusi akan aktif." /> : <><label htmlFor="community-post" className="text-sm font-semibold">Isi diskusi</label><textarea id="community-post" rows={7} minLength={1} maxLength={5000} required value={content} onChange={(event) => setContent(event.target.value)} disabled={publish.isPending} placeholder="Bagikan pertanyaan, ide, atau informasi yang relevan…" className="w-full resize-y rounded-xl border border-border-subtle bg-surface-secondary p-3 text-sm leading-6 outline-none focus:border-accent-amber" /><div className="flex items-center justify-between gap-3 text-xs text-text-muted"><span>{content.length}/5000</span><Button type="submit" disabled={publish.isPending || !content.trim()}><Send className="h-4 w-4" />{publish.isPending ? 'Mengirim…' : 'Terbitkan'}</Button></div></>}
            {publish.isError && <DataState title="Post belum diterbitkan" detail={getApiErrorMessage(publish.error)} />}
            {publish.isSuccess && <p role="status" className="text-sm font-semibold text-emerald-400">Post berhasil diterbitkan.</p>}
          </form>
        </aside>
      </div>
    </main>
  );
}
