'use client';
import Link from 'next/link';

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-16 space-y-6">
      <h1 className="font-heading text-3xl font-bold">
        Halaman belum dapat dimuat
      </h1>
      <p className="text-text-muted">
        Silakan coba lagi atau kembali ke beranda.
      </p>
      <button
        className="rounded-lg bg-primary px-5 py-3 text-on-primary"
        onClick={() => retry()}
      >
        Coba lagi
      </button>
      <Link className="inline-block px-5 py-3 text-accent-amber" href="/">
        Kembali ke Beranda
      </Link>
    </main>
  );
}
