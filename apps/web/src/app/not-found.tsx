import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-16 space-y-6">
      <h1 className="font-heading text-3xl font-bold">
        Halaman tidak ditemukan
      </h1>
      <p className="text-text-muted">
        Alamat halaman ini belum tersedia. Anda dapat kembali ke beranda atau
        melihat alamat outlet.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link href="/" className="py-3 text-accent-amber">
          Kembali ke Beranda
        </Link>
        <Link href="/outlets" className="py-3 text-accent-amber">
          Lihat Cabang
        </Link>
      </div>
    </main>
  );
}
