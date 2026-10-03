'use client';
import Link from 'next/link';

export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="id">
      <body>
        <main
          style={{
            maxWidth: 720,
            margin: '4rem auto',
            padding: '1rem',
            fontFamily: 'sans-serif',
          }}
        >
          <h1>Situs belum dapat dimuat</h1>
          <p>Silakan coba lagi atau kembali ke beranda.</p>
          <button onClick={() => retry()}>Coba lagi</button>{' '}
          <Link href="/">Kembali ke Beranda</Link>
        </main>
      </body>
    </html>
  );
}
