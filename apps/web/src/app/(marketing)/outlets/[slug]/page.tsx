import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MapPin,
  Clock,
  Navigation,
  CheckCircle2,
  Phone,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { VERIFIED_BRANCHES } from '@warkop-yareh/types';

export function generateStaticParams() {
  return VERIFIED_BRANCHES.map((b) => ({ slug: b.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function OutletDetailPage({ params }: Props) {
  const { slug } = await params;
  const branch = VERIFIED_BRANCHES.find((b) => b.slug === slug);

  if (!branch) {
    notFound();
  }

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(branch.plusCode)}`;

  return (
    <div className="min-h-screen bg-canvas-obsidian text-on-surface pb-20 font-body">
      {/* Top Breadcrumb Header */}
      <section className="relative border-b border-border-subtle bg-surface-secondary/40 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-4">
          <Link
            href="/outlets"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-amber hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Daftar Cabang
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-block rounded-md bg-accent-amber/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-accent-amber">
              {branch.isMainBranch ? 'Outlet 1 - Wonokromo' : 'Outlet 2 - Tenggilis Mejoyo'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--green-500)]/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--green-500)]">
              <CheckCircle2 className="h-3 w-3" />
              Buka 24 Jam
            </span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
            {branch.name}
          </h1>

          <p className="text-sm sm:text-base text-text-muted">
            {branch.address.street}, {branch.address.subdistrict}, {branch.address.district}, {branch.address.city}
          </p>
        </div>
      </section>

      {/* Main Details */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Core Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 space-y-3">
            <div className="flex items-center gap-2 text-accent-amber font-heading font-bold text-base">
              <Clock className="h-5 w-5" />
              <span>Jam Operasional</span>
            </div>
            <p className="text-sm text-text-primary font-semibold">
              24 Jam Nonstop Setiap Hari
            </p>
            <p className="text-xs text-text-muted">
              Melayani hari kerja maupun akhir pekan tanpa jeda tutup.
            </p>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 space-y-3">
            <div className="flex items-center gap-2 text-[var(--green-500)] font-heading font-bold text-base">
              <CheckCircle2 className="h-5 w-5" />
              <span>Layanan Tersedia</span>
            </div>
            <p className="text-sm text-text-primary font-semibold">
              Dine-in (Makan di Tempat) & Takeaway (Bawa Pulang)
            </p>
            <p className="text-xs text-text-muted">
              Area duduk santai terbuka untuk menikmati kopi dan makanan di tempat.
            </p>
          </div>
        </div>

        {/* Address & Navigation Card */}
        <div className="rounded-3xl border border-border-subtle bg-surface-card p-8 space-y-6">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-text-primary">
            Alamat & Navigasi
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-text-muted leading-relaxed">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-accent-amber mt-0.5" />
              <div>
                <strong className="text-text-primary block text-sm">Alamat Lengkap:</strong>
                <span>
                  {branch.address.street}, Kelurahan {branch.address.subdistrict}, {branch.address.district}, Kota {branch.address.city}, {branch.address.province} {branch.address.postalCode}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Navigation className="h-5 w-5 shrink-0 text-text-muted mt-0.5" />
              <div>
                <strong className="text-text-primary block text-sm">Google Maps Plus Code:</strong>
                <span className="font-mono text-accent-amber text-sm font-semibold">{branch.plusCode}</span>
              </div>
            </div>

            {branch.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 shrink-0 text-accent-amber mt-0.5" />
                <div>
                  <strong className="text-text-primary block text-sm">Nomor Telepon:</strong>
                  <a href={`tel:${branch.phone}`} className="font-mono text-sm text-text-primary hover:text-accent-amber font-semibold">
                    {branch.phone}
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border-subtle flex flex-wrap gap-3">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs sm:text-sm font-semibold text-on-primary hover:bg-primary-hover transition-colors"
            >
              <Navigation className="h-4 w-4" />
              Petunjuk Arah Google Maps
            </a>
            {branch.phone && (
              <a
                href={`tel:${branch.phone}`}
                className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-secondary px-5 py-3 text-xs sm:text-sm font-semibold text-text-primary hover:border-accent-amber/40 transition-colors"
              >
                <Phone className="h-4 w-4 text-accent-amber" />
                Telepon Outlet
              </a>
            )}
          </div>
        </div>

        {/* Price & Menu Notice */}
        <div className="rounded-2xl border border-border-subtle bg-surface-secondary/40 p-6 flex items-start gap-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-accent-amber mt-0.5" />
          <div className="text-xs sm:text-sm text-text-muted space-y-1">
            <div className="font-semibold text-text-primary">Perkiraan Pengeluaran</div>
            <p>
              Rata-rata pengunjung di listing publik mencatat pengeluaran berkisar <strong>Rp1–25.000 per orang</strong>. Menu lengkap dan harga satuan resmi sedang diverifikasi langsung di outlet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
