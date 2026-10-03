'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface VenuePhoto {
  id: string;
  title: string;
  caption: string | null;
  imageUrl: string;
  provenance: string;
}

export default function GalleryPage() {
  const gallery = useQuery({
    queryKey: ['verified-venue-gallery'],
    enabled: Boolean(process.env.NEXT_PUBLIC_API_URL),
    retry: false,
    queryFn: async () => {
      const response = await api.get<{ data: VenuePhoto[] }>(
        '/reality/gallery/public'
      );
      if (!Array.isArray(response.data.data))
        throw new Error('Dokumentasi belum dapat dimuat');
      return response.data.data.filter(
        (asset) =>
          typeof asset.imageUrl === 'string' &&
          asset.imageUrl.startsWith('https://') &&
          ['VERIFIED_VENUE_PHOTO', 'VERIFIED_BRANCH_PHOTO'].includes(
            asset.provenance
          )
      );
    },
  });
  const photos = gallery.data ?? [];
  return (
    <div className="min-h-screen bg-canvas-obsidian text-on-surface pb-20">
      <section className="border-b border-border-subtle py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-4">
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold">
            Galeri Warkop Ya&apos;reh
          </h1>
          <p className="text-sm sm:text-base text-text-muted">
            Dokumentasi outlet Jetis Kulon dan Prapen ditampilkan setelah sumber
            foto diverifikasi.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-8">
        {gallery.isFetching && <p role="status">Memuat dokumentasi…</p>}
        {gallery.isError ? (
          <div
            role="alert"
            className="rounded-2xl border border-border-subtle p-6 space-y-3"
          >
            <p>
              Dokumentasi belum dapat dimuat. Silakan coba lagi atau lihat
              alamat outlet.
            </p>
            <button
              onClick={() => void gallery.refetch()}
              className="inline-block py-3 font-semibold text-accent-amber"
            >
              Coba lagi
            </button>
          </div>
        ) : !photos.length && !gallery.isFetching ? (
          <section className="rounded-2xl border border-border-subtle bg-surface-card p-6 sm:p-8 space-y-3">
            <h2 className="font-heading text-xl font-bold">
              Foto outlet belum tersedia untuk ditampilkan
            </h2>
            <p className="text-sm text-text-muted">
              Belum ada foto lokasi terverifikasi yang dipublikasikan di halaman
              ini. Foto stok, ilustrasi, dan gambar AI tidak ditampilkan sebagai
              dokumentasi outlet.
            </p>
          </section>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {photos.map((asset) => (
              <figure
                key={asset.id}
                className="rounded-2xl border border-border-subtle overflow-hidden"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={asset.imageUrl}
                    alt={asset.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <figcaption className="p-4 space-y-2">
                  <h2 className="font-heading font-bold">{asset.title}</h2>
                  {asset.caption && (
                    <p className="text-sm text-text-muted">{asset.caption}</p>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
        <Link
          href="/outlets"
          className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary"
        >
          Lihat Alamat &amp; Lokasi Outlet
        </Link>
      </div>
    </div>
  );
}
