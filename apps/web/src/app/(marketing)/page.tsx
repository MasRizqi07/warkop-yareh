'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AuroraBackground, CountUp } from '@warkop-yareh/ui';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  Calendar,
  Clock3,
  Coffee,
  MapPin,
  PackageCheck,
  Star,
  Users,
} from 'lucide-react';
import { DataState, LoadingState } from '@/components/data-state';
import { useActiveBranch, useCatalog } from '@/features/catalog/catalog.hooks';
import { useBranchStore, useCartStore } from '@/stores';
import { listVerifiedReviews } from '@/features/public/public.api';
import { getApiErrorMessage } from '@/lib/api-error';

const rupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

export default function HomePage() {
  const branches = useActiveBranch();
  const { activeBranch } = branches;
  const catalog = useCatalog(activeBranch?.id);
  const reviews = useQuery({
    queryKey: ['verified-reviews', activeBranch?.id ?? 'none'],
    queryFn: () => listVerifiedReviews(activeBranch!.id),
    enabled: Boolean(activeBranch?.id),
    staleTime: 60_000,
    retry: 1,
  });
  const setActiveBranchId = useBranchStore((state) => state.setActiveBranchId);
  const clearCart = useCartStore((state) => state.clearCart);

  const products = catalog.data?.products ?? [];
  const featuredProducts = [...products]
    .sort((left, right) => Number(right.isPopular) - Number(left.isPopular))
    .slice(0, 3);
  const metrics = [
    {
      label: 'Cabang aktif',
      value: branches.data?.length ?? 0,
      icon: Building2,
    },
    {
      label: 'Menu tersedia',
      value: products.length,
      icon: Coffee,
    },
    {
      label: 'Kategori menu',
      value: catalog.data?.categories.length ?? 0,
      icon: PackageCheck,
    },
    {
      label: 'Kapasitas terdaftar',
      value: activeBranch?.capacity ?? 0,
      icon: Users,
    },
  ];

  const selectBranch = (branchId: string) => {
    if (branchId !== activeBranch?.id) clearCart();
    setActiveBranchId(branchId);
  };

  return (
    <main className="overflow-hidden bg-canvas-obsidian text-on-surface">
      <section className="relative border-b border-border-subtle pb-20 pt-12 sm:pt-20">
        <AuroraBackground />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-accent-amber/15 via-brand-coffee/10 to-transparent blur-3xl" />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="space-y-7 lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-card px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-cream-beige">
              <MapPin className="h-3.5 w-3.5 text-accent-amber" />
              {activeBranch?.name ?? 'Memuat cabang…'}
            </div>
            <div className="space-y-4">
              <h1 className="font-heading text-4xl font-extrabold leading-[1.12] tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
                Specialty coffee, workspace, dan komunitas dalam satu tempat.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">
                Pilih cabang, lihat menu yang benar-benar tersedia, lalu pesan
                atau reservasi melalui alur digital Warkop Ya&apos;reh.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/menu"
                className="primary-cta-motion inline-flex items-center gap-2 rounded-xl bg-primary-container px-6 py-3.5 font-semibold text-on-primary-container"
              >
                <Coffee className="h-5 w-5" /> Lihat menu cabang
              </Link>
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-6 py-3.5 font-semibold text-text-primary transition-colors hover:border-primary/40"
              >
                <Calendar className="h-5 w-5 text-accent-amber" /> Reservasi
                workspace
              </Link>
            </div>
            {activeBranch && (
              <div className="grid gap-3 border-t border-border-subtle pt-6 text-sm sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 text-accent-amber" />
                  <div>
                    <p className="font-semibold text-text-primary">
                      Jam operasional
                    </p>
                    <p className="mt-1 text-text-muted">
                      Hari kerja {activeBranch.weekdayHours}
                      <br />
                      Akhir pekan {activeBranch.weekendHours}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-accent-amber" />
                  <div>
                    <p className="font-semibold text-text-primary">Alamat</p>
                    <p className="mt-1 text-text-muted">
                      {activeBranch.address}, {activeBranch.city}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative lg:col-span-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border-subtle bg-surface-card shadow-2xl">
              <Image
                src="/images/darmo-interior.png"
                alt="Interior dan area kerja Warkop Ya'reh"
                fill
                priority
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-canvas-obsidian/90 via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/10 bg-canvas-obsidian/75 p-4 backdrop-blur-xl">
                <p className="font-mono text-xs uppercase tracking-wider text-accent-amber">
                  Pilih cabang aktif
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(branches.data ?? []).map((branch) => (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => selectBranch(branch.id)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                        branch.id === activeBranch?.id
                          ? 'bg-accent-amber text-on-secondary'
                          : 'bg-surface-card text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {branch.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border-subtle bg-surface-secondary py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-7">
            <p className="font-mono text-xs uppercase tracking-widest text-accent-amber">
              Data katalog saat ini
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-text-primary">
              Informasi cabang dan menu tersimpan
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-text-muted">
              Ini adalah data operasional yang diterbitkan melalui API, bukan
              klaim okupansi atau telemetry real-time.
            </p>
          </div>

          {branches.isError || catalog.isError ? (
            <DataState
              title="Informasi cabang belum dapat dimuat"
              detail="Coba kembali untuk mengambil katalog terbaru."
              retry={() => {
                void branches.refetch();
                void catalog.refetch();
              }}
            />
          ) : branches.isPending || (activeBranch && catalog.isPending) ? (
            <LoadingState label="Memuat informasi cabang…" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map(({ label, value, icon: Icon }) => (
                <article
                  key={label}
                  className="delight-card rounded-2xl border border-border-subtle bg-surface-card p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      {label}
                    </p>
                    <Icon className="h-5 w-5 text-accent-amber" />
                  </div>
                  <p className="mt-4 font-mono text-3xl font-extrabold text-text-primary">
                    <CountUp value={value} />
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-accent-amber">
                {activeBranch?.name ?? 'Cabang pilihan'}
              </p>
              <h2 className="mt-1 font-heading text-3xl font-bold text-text-primary">
                Menu pilihan yang tersedia
              </h2>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent-amber"
            >
              Lihat katalog lengkap <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {catalog.isPending ? (
            <LoadingState label="Memuat menu pilihan…" />
          ) : featuredProducts.length === 0 ? (
            <DataState
              title="Belum ada menu tersedia untuk cabang ini"
              retry={() => void catalog.refetch()}
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {featuredProducts.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-border-subtle bg-surface-card"
                >
                  <div className="relative aspect-[4/3] bg-surface-secondary">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {(product.isPopular || product.isNew) && (
                      <span className="absolute left-3 top-3 rounded-full bg-canvas-obsidian/85 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-accent-amber backdrop-blur">
                        {product.isPopular ? 'Popular' : 'Baru'}
                      </span>
                    )}
                  </div>
                  <div className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-heading font-bold text-text-primary">
                        {product.name}
                      </h3>
                      <span className="shrink-0 font-mono text-sm font-bold text-accent-amber">
                        {rupiah(product.price)}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm leading-relaxed text-text-muted">
                      {product.description}
                    </p>
                    <p className="font-mono text-xs text-text-muted">
                      Estimasi persiapan {product.preparationTime} menit
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-border-subtle bg-surface-secondary py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-3xl border border-border-subtle bg-surface-card p-7">
            <Briefcase className="h-8 w-8 text-accent-amber" />
            <h2 className="mt-5 font-heading text-2xl font-bold text-text-primary">
              Workspace dan reservasi
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              Lihat tipe ruang, slot, harga, dan kapasitas yang tersedia pada
              alur reservasi sebelum membuat booking.
            </p>
            <Link
              href="/booking"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-accent-amber"
            >
              Periksa ketersediaan <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
          <article className="rounded-3xl border border-border-subtle bg-surface-card p-7">
            <Award className="h-8 w-8 text-accent-amber" />
            <h2 className="mt-5 font-heading text-2xl font-bold text-text-primary">
              Loyalty yang transparan
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              Masuk untuk melihat saldo poin, tier, dan riwayat transaksi yang
              tercatat pada akunmu.
            </p>
            <Link
              href="/loyalty"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-accent-amber"
            >
              Buka loyalty <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-widest text-accent-amber">
              Ulasan terverifikasi
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-text-primary">
              Pengalaman pelanggan pada cabang ini
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              Hanya ulasan yang ditandai terverifikasi oleh layanan konten yang
              ditampilkan.
            </p>
          </div>
          {!activeBranch ? (
            <DataState title="Pilih cabang untuk melihat ulasan" />
          ) : reviews.isPending ? (
            <LoadingState label="Memuat ulasan…" />
          ) : reviews.isError ? (
            <DataState
              title="Ulasan belum dapat dimuat"
              detail={getApiErrorMessage(reviews.error)}
              retry={() => void reviews.refetch()}
            />
          ) : !reviews.data.length ? (
            <DataState
              title="Belum ada ulasan terverifikasi"
              detail="Ulasan baru akan tampil setelah melewati proses verifikasi."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reviews.data.slice(0, 6).map((review) => (
                <article
                  key={review.id}
                  className="rounded-2xl border border-border-subtle bg-surface-card p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="flex"
                      aria-label={`${review.rating} dari 5 bintang`}
                    >
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          aria-hidden="true"
                          className={`h-4 w-4 ${index < review.rating ? 'fill-accent-amber text-accent-amber' : 'text-border-subtle'}`}
                        />
                      ))}
                    </div>
                    <time
                      dateTime={review.createdAt}
                      className="text-xs text-text-muted"
                    >
                      {new Intl.DateTimeFormat('id-ID', {
                        dateStyle: 'medium',
                      }).format(new Date(review.createdAt))}
                    </time>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-text-secondary">
                    {review.comment}
                  </p>
                  <footer className="mt-5 border-t border-border-subtle pt-4">
                    <p className="font-semibold">{review.user.name}</p>
                    {review.product && (
                      <p className="mt-1 text-xs text-text-muted">
                        Pesanan: {review.product.name}
                      </p>
                    )}
                  </footer>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
