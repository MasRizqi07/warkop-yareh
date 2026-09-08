'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { DataState, LoadingState } from '@/components/data-state';
import { getApiErrorMessage } from '@/lib/api-error';
import { getBlogPost } from '@/features/public/public.api';

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = useQuery({ queryKey: ['blog-post', slug], queryFn: () => getBlogPost(slug), retry: 1 });
  if (post.isPending) return <main className="mx-auto min-h-screen max-w-4xl px-4 pb-24 pt-28"><LoadingState label="Memuat artikel…" /></main>;
  if (post.isError) return <main className="mx-auto min-h-screen max-w-4xl px-4 pb-24 pt-28"><DataState title="Artikel tidak dapat dimuat" detail={getApiErrorMessage(post.error)} retry={() => void post.refetch()} /></main>;
  const value = post.data;
  return <main className="mx-auto min-h-screen max-w-4xl space-y-7 px-4 pb-24 pt-24 sm:px-6"><Link href="/blog" className="text-sm font-semibold text-primary">← Semua artikel</Link><article className="overflow-hidden rounded-3xl border border-border-subtle bg-surface-card"><div className="relative h-72 sm:h-96"><Image src={value.image || '/images/hero/hero-coffee.png'} alt="" fill priority sizes="(min-width: 900px) 850px, 100vw" className="object-cover" /></div><div className="p-6 sm:p-10"><p className="text-xs font-bold uppercase tracking-wider text-primary">{value.category}</p><h1 className="mt-3 text-3xl font-bold leading-tight text-text-primary sm:text-5xl">{value.title}</h1><div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-text-muted"><span>{value.authorName}{value.authorRole ? ` · ${value.authorRole}` : ''}</span><span>·</span><span className="flex items-center gap-1"><Clock className="h-4 w-4" />{value.readTime} menit</span><span>·</span><time>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(value.publishedAt))}</time></div><p className="mt-7 border-l-2 border-primary pl-4 text-lg leading-8 text-text-muted">{value.excerpt}</p><div className="mt-8 space-y-5 text-base leading-8 text-text-primary">{value.content.split(/\n{2,}/).filter(Boolean).map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`} className="whitespace-pre-wrap">{paragraph}</p>)}</div>{value.tags.length ? <div className="mt-9 flex flex-wrap gap-2 border-t border-border-subtle pt-6">{value.tags.map((tag) => <span key={tag} className="rounded-full bg-surface-secondary px-3 py-1 text-xs text-text-muted">#{tag}</span>)}</div> : null}</div></article></main>;
}
