'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Coffee,
  ShoppingBag,
  Phone,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Users,
  Compass,
} from 'lucide-react';
import { VERIFIED_BRANCHES } from '@warkop-yareh/types';
import { useBranchStore } from '@/stores';

export default function HomePage() {
  const activeBranchId = useBranchStore((state) => state.activeBranchId);

  return (
    <main className="overflow-hidden bg-canvas-obsidian text-on-surface">
      {/* 1. Hero Section */}
      <section className="relative border-b border-border-subtle pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[550px] w-[950px] -translate-x-1/2 rounded-full bg-gradient-to-b from-accent-amber/15 via-brand-coffee/10 to-transparent blur-3xl" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="max-w-3xl mx-auto sm:mx-0 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-card px-3.5 py-1.5 font-mono text-xs text-cream-beige shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[var(--green-500)] animate-pulse" />
              <span>Buka 24 Jam di Surabaya (Jetis Kulon & Prapen)</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary leading-[1.08]">
              Warkop Ya&apos;reh
            </h1>

            <p className="text-xl sm:text-2xl font-medium text-accent-amber">
              Ngopi, Makan, Nongkrong. 24 Jam.
            </p>

            <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-2xl">
              Kedai kopi lokal Surabaya yang hadir melayani warga, pekerja, dan komunitas selama 24 jam nonstop di Wonokromo dan Tenggilis Mejoyo. Tempat santai untuk cangkrukan kapan saja.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 justify-center sm:justify-start">
              <a
                href="#outlets"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-on-primary shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:scale-[1.02]"
              >
                <MapPin className="h-4 w-4" />
                Lihat Lokasi Outlet
              </a>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-6 py-3.5 text-sm font-semibold text-text-primary transition-all hover:border-accent-amber/40 hover:bg-surface-secondary"
              >
                <Coffee className="h-4 w-4 text-accent-amber" />
                Status Menu & Harga
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Business Identity & Context */}
      <section className="border-b border-border-subtle bg-surface-secondary/40 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2.5 rounded-2xl border border-border-subtle bg-surface-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-amber/10 text-accent-amber">
                <Coffee className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary">
                Warkop Khas Surabaya
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Suasana cangkrukan santai dengan aneka seduhan kopi, minuman segar, serta camilan dan makanan warkop yang terjangkau.
              </p>
            </div>

            <div className="space-y-2.5 rounded-2xl border border-border-subtle bg-surface-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--green-500)]/10 text-[var(--green-500)]">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary">
                Operasional 24 Jam Nonstop
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Siang ataupun malam, kedua cabang kami siap menyambut Anda yang butuh tempat istirahat, ngobrol santai, atau bekerja.
              </p>
            </div>

            <div className="space-y-2.5 rounded-2xl border border-border-subtle bg-surface-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary">
                Dua Cabang Terverifikasi
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Outlet 1 berlokasi di Jl. Raya Jetis Kulon (Wonokromo) dan Outlet 2 di Jl. Raya Prapen (Tenggilis Mejoyo).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 24-Hour Dependability Callout */}
      <section className="border-b border-border-subtle py-16 bg-canvas-obsidian">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/10 via-surface-card to-canvas-obsidian p-8 sm:p-12 relative overflow-hidden">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent-amber/20 px-3 py-1 font-mono text-xs font-semibold text-accent-amber">
                <Clock className="h-3.5 w-3.5" />
                Selalu Terbuka Setiap Hari
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text-primary">
                Kapan Pun Anda Butuh Kopi, Kami Buka.
              </h2>
              <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                Tidak perlu khawatir mencari tempat singgah larut malam di Surabaya. Warkop Ya&apos;reh beroperasi penuh 24 jam setiap hari di Jetis Kulon maupun Prapen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Service Formats */}
      <section className="border-b border-border-subtle py-14 bg-surface-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary">
              Layanan yang Tersedia
            </h2>
            <p className="text-sm text-text-muted">
              Format layanan terverifikasi langsung di outlet kami
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="flex items-start gap-4 rounded-2xl border border-border-subtle bg-surface-card p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-amber/15 text-accent-amber">
                <Users className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading text-base font-bold text-text-primary">
                  Makan & Minum di Tempat (Dine-in)
                </h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Ruang santai terbuka untuk duduk ngopi bersama teman, rekan kerja, maupun menikmati waktu sendiri.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-border-subtle bg-surface-card p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading text-base font-bold text-text-primary">
                  Bawa Pulang (Takeaway)
                </h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Pesan langsung di konter untuk dibawa pulang dalam kemasan praktis dan siap dinikmati di jalan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Menu & Price Notice */}
      <section className="border-b border-border-subtle py-14 bg-canvas-obsidian">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-md bg-accent-amber/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-accent-amber">
                <AlertCircle className="h-3.5 w-3.5" />
                Informasi Pengeluaran Publik
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-text-primary">
                Kisaran Pengeluaran: Rp1–25.000 per orang
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Berdasarkan data listing publik, rata-rata pengunjung menghabiskan Rp1–25.000 per kunjungan. Daftar menu lengkap beserta harga resmi per item sedang dalam proses verifikasi langsung dari outlet.
              </p>
            </div>
            <Link
              href="/menu"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-surface-secondary border border-border-subtle px-5 py-3 text-xs sm:text-sm font-semibold text-text-primary hover:border-accent-amber/40 transition-colors"
            >
              Lihat Detail Menu
              <ExternalLink className="h-4 w-4 text-accent-amber" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Outlets Directory Preview */}
      <section id="outlets" className="border-b border-border-subtle py-16 sm:py-20 bg-surface-secondary/40 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-card px-3 py-1 font-mono text-xs text-accent-amber">
              <MapPin className="h-3.5 w-3.5" />
              Daftar Cabang Resmi
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary">
              Kunjungi Outlet Kami di Surabaya
            </h2>
            <p className="text-sm text-text-muted">
              Pilih outlet terdekat dan dapatkan rute petunjuk arah langsung
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {VERIFIED_BRANCHES.map((branch) => {
              const isSelected = branch.id === activeBranchId;
              const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(branch.plusCode)}`;

              return (
                <div
                  key={branch.id}
                  className={`rounded-3xl border transition-all p-7 sm:p-8 flex flex-col justify-between ${
                    isSelected
                      ? 'border-accent-amber/50 bg-surface-card shadow-xl ring-1 ring-accent-amber/30'
                      : 'border-border-subtle bg-surface-card hover:border-accent-amber/30'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-block rounded-md bg-accent-amber/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-accent-amber">
                          {branch.isMainBranch ? 'Outlet 1' : 'Outlet 2'}
                        </span>
                        <h3 className="font-heading text-xl sm:text-2xl font-bold text-text-primary mt-1">
                          {branch.name}
                        </h3>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--green-500)]/15 px-2.5 py-1 font-mono text-[10px] font-semibold text-[var(--green-500)]">
                        <CheckCircle2 className="h-3 w-3" />
                        24 Jam
                      </span>
                    </div>

                    <div className="space-y-2 text-xs sm:text-sm text-text-muted">
                      <p className="flex items-start gap-2.5">
                        <MapPin className="h-4 w-4 shrink-0 text-accent-amber mt-0.5" />
                        <span>
                          {branch.address.street}, {branch.address.subdistrict}, {branch.address.district}, {branch.address.city} {branch.address.postalCode}
                        </span>
                      </p>

                      <p className="flex items-center gap-2.5 font-mono text-xs">
                        <Navigation className="h-4 w-4 shrink-0 text-text-muted" />
                        <span>Plus Code: <strong className="text-text-primary">{branch.plusCode}</strong></span>
                      </p>

                      {branch.phone && (
                        <p className="flex items-center gap-2.5">
                          <Phone className="h-4 w-4 shrink-0 text-accent-amber" />
                          <a
                            href={`tel:${branch.phone}`}
                            className="text-text-primary hover:text-accent-amber transition-colors font-mono"
                          >
                            {branch.phone}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-border-subtle flex flex-wrap items-center gap-3">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-on-primary hover:bg-primary-hover transition-colors"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      Petunjuk Arah Google Maps
                    </a>
                    <Link
                      href={`/outlets/${branch.slug}`}
                      className="inline-flex items-center gap-1 rounded-xl border border-border-subtle bg-surface-secondary px-4 py-2.5 text-xs font-semibold text-text-primary hover:border-accent-amber/40 transition-colors"
                    >
                      Detail Outlet
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Real Atmosphere Gallery Preview */}
      <section className="border-b border-border-subtle py-16 bg-canvas-obsidian">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-accent-amber">
                Dokumentasi Suasana
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary">
                Suasana Cangkrukan Warkop
              </h2>
            </div>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-accent-amber hover:underline"
            >
              Buka Galeri Lengkap →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 flex flex-col justify-between h-48">
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-accent-amber uppercase tracking-wider">Suasana Malam</span>
                <h4 className="font-heading font-bold text-text-primary text-base">Cangkrukan Santai</h4>
                <p className="text-xs text-text-muted">Tempat berkumpul warga dan mahasiswa menikmati obrolan malam dengan segelas kopi.</p>
              </div>
              <div className="text-[11px] font-mono text-text-muted">Jetis Kulon & Prapen</div>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 flex flex-col justify-between h-48">
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-accent-amber uppercase tracking-wider">Layanan Terbuka</span>
                <h4 className="font-heading font-bold text-text-primary text-base">Seduhan Cepat di Konter</h4>
                <p className="text-xs text-text-muted">Pelayanan sigap untuk pesanan kopi panas, es kopi, dan hidangan cepat saji.</p>
              </div>
              <div className="text-[11px] font-mono text-text-muted">Dine-in & Takeaway</div>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 flex flex-col justify-between h-48">
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-accent-amber uppercase tracking-wider">Kenyamanan</span>
                <h4 className="font-heading font-bold text-text-primary text-base">Ruang Duduk Terbuka</h4>
                <p className="text-xs text-text-muted">Area duduk warkop yang ramah dan bersahaja, nyaman untuk beristirahat di setiap jam.</p>
              </div>
              <div className="text-[11px] font-mono text-text-muted">Buka 24 Jam Nonstop</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Customer Sentiment Signals */}
      <section className="border-b border-border-subtle py-14 bg-surface-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-text-primary mb-3">
            Mengapa Pelanggan Memilih Warkop Ya&apos;reh?
          </h3>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-8">
            Catatan kepuasan umum pengunjung dari listing publik
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="rounded-xl border border-border-subtle bg-surface-card p-4 space-y-1.5">
              <div className="font-semibold text-text-primary text-xs sm:text-sm">Akses 24 Jam</div>
              <p className="text-[11px] text-text-muted leading-normal">Mudah dikunjungi sewaktu-waktu saat malam hari maupun dini hari.</p>
            </div>
            <div className="rounded-xl border border-border-subtle bg-surface-card p-4 space-y-1.5">
              <div className="font-semibold text-text-primary text-xs sm:text-sm">Harga Bersahabat</div>
              <p className="text-[11px] text-text-muted leading-normal">Pengeluaran ramah di kantong cocok untuk semua kalangan.</p>
            </div>
            <div className="rounded-xl border border-border-subtle bg-surface-card p-4 space-y-1.5">
              <div className="font-semibold text-text-primary text-xs sm:text-sm">Lokasi Strategis</div>
              <p className="text-[11px] text-text-muted leading-normal">Terletak di jalan raya utama Wonokromo dan Prapen yang mudah dijangkau.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Direct Google Maps Navigation */}
      <section className="border-b border-border-subtle py-14 bg-canvas-obsidian">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border-subtle bg-surface-card p-8 text-center max-w-3xl mx-auto space-y-4">
            <Navigation className="h-8 w-8 text-accent-amber mx-auto" />
            <h3 className="font-heading text-2xl font-bold text-text-primary">
              Buka Peta & Petunjuk Arah
            </h3>
            <p className="text-xs sm:text-sm text-text-muted max-w-lg mx-auto">
              Gunakan Google Maps dengan Plus Code resmi untuk navigasi presisi menuju cabang Warkop Ya&apos;reh pilihan Anda:
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <a
                href="https://maps.google.com/?q=MPVJ%2B2G+Wonokromo,+Surabaya"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-surface-secondary border border-border-subtle px-4 py-2.5 text-xs font-semibold text-text-primary hover:border-accent-amber/40 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 text-accent-amber" />
                Google Maps Jetis Kulon (MPVJ+2G)
              </a>
              <a
                href="https://maps.google.com/?q=MQM3%2BXJ+Prapen,+Surabaya"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-surface-secondary border border-border-subtle px-4 py-2.5 text-xs font-semibold text-text-primary hover:border-accent-amber/40 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 text-accent-amber" />
                Google Maps Prapen (MQM3+XJ)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Contact CTA */}
      <section className="py-16 bg-surface-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center max-w-xl mx-auto space-y-4">
          <h3 className="font-heading text-2xl font-bold text-text-primary">
            Ada Pertanyaan Seputar Outlet?
          </h3>
          <p className="text-xs sm:text-sm text-text-muted">
            Hubungi kontak resmi outlet Prapen atau kunjungi halaman kontak untuk informasi lengkap.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <a
              href="tel:0821-3735-4606"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs sm:text-sm font-semibold text-on-primary hover:bg-primary-hover transition-colors"
            >
              <Phone className="h-4 w-4" />
              Telepon Prapen: 0821-3735-4606
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-5 py-3 text-xs sm:text-sm font-semibold text-text-primary hover:border-accent-amber/40 transition-colors"
            >
              Halaman Kontak Lengkap
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
