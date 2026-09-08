'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock, Search } from 'lucide-react';
import { DataState, LoadingState } from '@/components/data-state';
import { SectionHeader } from '@/components/shared/section-header';
import { getApiErrorMessage } from '@/lib/api-error';
import { listBlogPosts } from '@/features/public/public.api';

const FALLBACK_IMAGES: Record<string, string> = {
  'Coffee Guide': '/images/cold-brew-aren-brulee.png',
  Community: '/images/artisan-toasted-sourdough.png',
  default: '/images/hero/hero-coffee.png',
};

export default function BlogPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const posts = useQuery({ queryKey: ['published-blog-posts'], queryFn: () => listBlogPosts(), retry: 1 });
  const categories = useMemo(() => ['ALL', ...new Set((posts.data ?? []).map((post) => post.category))], [posts.data]);
  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('id-ID');
    return (posts.data ?? []).filter((post) =>
      (category === 'ALL' || post.category === category) &&
      (!needle || post.title.toLocaleLowerCase('id-ID').includes(needle) || post.excerpt.toLocaleLowerCase('id-ID').includes(needle)),
    );
  }, [category, posts.data, search]);

  return <div className="relative min-h-screen bg-canvas-obsidian pb-24 text-on-surface"><section className="relative overflow-hidden border-b border-border-subtle bg-surface-secondary pb-12 pt-24"><div className="absolute inset-0 bg-mesh" /><div className="relative mx-auto max-w-7xl space-y-6 px-4 sm:px-6"><SectionHeader badge="Journal" title="Stories & Insights" description="Artikel yang sudah diterbitkan oleh content service—tanpa kartu dummy atau tautan kosong." /><label className="relative mx-auto block max-w-lg"><span className="sr-only">Cari artikel</span><Search className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} maxLength={160} className="w-full rounded-2xl border border-border-subtle bg-surface-card py-3 pl-11 pr-4 text-sm outline-none focus:border-primary" placeholder="Cari judul atau ringkasan…" /></label></div></section><main className="mx-auto max-w-7xl space-y-8 px-4 pt-8 sm:px-6"><nav className="flex gap-2 overflow-x-auto pb-2" aria-label="Kategori artikel">{categories.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${category === item ? 'bg-primary-container text-on-primary-container' : 'border border-border-subtle bg-surface-card text-text-muted'}`}>{item === 'ALL' ? 'Semua artikel' : item}</button>)}</nav>{posts.isPending ? <LoadingState label="Memuat jurnal…" /> : posts.isError ? <DataState title="Jurnal belum dapat dimuat" detail={getApiErrorMessage(posts.error)} retry={() => void posts.refetch()} /> : filtered.length === 0 ? <DataState title="Artikel tidak ditemukan" detail="Ubah pencarian atau kategori." /> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.map((post, index) => <article key={post.id} className="group overflow-hidden rounded-2xl border border-border-subtle bg-surface-card"><div className="relative h-52"><Image src={post.image || FALLBACK_IMAGES[post.category] || FALLBACK_IMAGES.default} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" priority={index < 3} /></div><div className="space-y-4 p-6"><div className="flex items-center justify-between gap-3 text-xs text-text-muted"><span className="font-bold uppercase tracking-wider text-primary">{post.category}</span><span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{post.readTime} menit</span></div><h2 className="text-lg font-bold text-text-primary"><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2><p className="line-clamp-3 text-sm leading-6 text-text-muted">{post.excerpt}</p><div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-4"><div><p className="text-sm font-semibold">{post.authorName}</p><p className="text-xs text-text-muted">{new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(post.publishedAt))}</p></div><Link href={`/blog/${post.slug}`} className="flex items-center gap-1 text-xs font-bold text-primary">Baca <ArrowRight className="h-4 w-4" /></Link></div></div></article>)}</div>}</main></div>;
}
