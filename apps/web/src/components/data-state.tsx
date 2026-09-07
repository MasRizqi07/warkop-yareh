'use client';

import Link from 'next/link';
import { Button } from '@warkop-yareh/ui';

export function DataState({ title, detail, retry, loginPath }: { title: string; detail?: string; retry?: () => void; loginPath?: string }) {
  return <section className="rounded-2xl border border-border-subtle bg-surface-card p-6 text-text-primary" aria-live="polite">
    <h2 className="font-semibold">{title}</h2>
    {detail && <p className="mt-2 break-words text-sm text-text-muted">{detail}</p>}
    {retry && <Button type="button" className="mt-4" onClick={retry}>Coba lagi</Button>}
    {loginPath && <Link className="mt-4 inline-flex min-h-11 items-center text-accent-amber underline" href={`/login?returnTo=${encodeURIComponent(loginPath)}`}>Masuk ke akun</Link>}
  </section>;
}

export function LoadingState({ label = 'Memuat data...' }: { label?: string }) {
  return <section role="status" className="space-y-4 rounded-2xl border border-border-subtle bg-surface-card p-6">
    <span className="text-sm text-text-muted">{label}</span>
    {[0, 1, 2].map((row) => <div key={row} className="h-12 animate-pulse rounded-xl bg-surface-container motion-reduce:animate-none" />)}
  </section>;
}
