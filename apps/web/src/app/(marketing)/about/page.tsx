'use client';

import React from 'react';
import Link from 'next/link';
import {
  Clock,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Phone,
  Navigation,
} from 'lucide-react';
import { VERIFIED_BRANCHES } from '@warkop-yareh/types';

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-canvas-obsidian pb-20 font-body text-on-surface">
      {/* Header Section */}
      <section className="relative border-b border-border-subtle bg-surface-secondary/40 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-card px-3.5 py-1 font-mono text-xs text-accent-amber">
            <Coffee className="h-3.5 w-3.5" />
            <span>Profil Resmi</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
            Tentang Warkop Ya&apos;reh
          </h1>
          <p className="text-sm sm:text-base text-accent-amber font-medium">
            Kedai Kopi Lokal 24 Jam di Surabaya
          </p>
        </div>
      </section>

      {/* Core Factual Description */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="rounded-3xl border border-border-subtle bg-surface-card p-8 sm:p-10 space-y-6">
            <h2 className="font-heading text-2xl font-bold text-text-primary">
              Informasi Umum
            </h2>
            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-text-muted">
              <p>
                <strong>Warkop Ya&apos;reh</strong> merupakan kedai kopi lokal di Surabaya dengan outlet yang saat ini teridentifikasi di <strong>Jetis Kulon</strong> (Kec. Wonokromo) dan <strong>Prapen</strong> (Kec. Tenggilis Mejoyo).
              </p>
              <p>
                Kami hadir melayani warga, pelajar, mahasiswa, pekerja, dan komunitas Surabaya selama <strong>24 jam setiap hari</strong> untuk ngopi, menikmati sajian warkop, dan beristirahat santai.
              </p>
            </div>

            <div className="border-t border-border-subtle pt-6">
              <div className="flex items-start gap-3 rounded-2xl bg-surface-secondary/80 p-4 border border-border-subtle">
                <AlertCircle className="h-5 w-5 shrink-0 text-accent-amber mt-0.5" />
                <div className="text-xs sm:text-sm text-text-muted space-y-1">
                  <div className="font-semibold text-text-primary">Transparansi Data & Kisaran Harga</div>
                  <p>
                    Berdasarkan informasi listing publik Google Maps, kisaran pengeluaran pengunjung adalah <strong>Rp1–25.000 per orang</strong>. Informasi menu lengkap dan harga resmi per item saat ini dalam proses verifikasi langsung dari outlet.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 space-y-3">
              <div className="flex items-center gap-2 text-accent-amber font-heading font-bold text-base">
                <Clock className="h-5 w-5" />
                <span>Operasional Nonstop</span>
              </div>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Kedua cabang Warkop Ya&apos;reh buka 24 jam setiap hari (Senin s/d Minggu), siap melayani pengunjung kapan pun dibutuhkan.
              </p>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 space-y-3">
              <div className="flex items-center gap-2 text-[var(--green-500)] font-heading font-bold text-base">
                <CheckCircle2 className="h-5 w-5" />
                <span>Format Layanan</span>
              </div>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Menyediakan layanan makan & minum di tempat (dine-in) dengan area duduk terbuka yang santai serta pesanan bawa pulang (takeaway).
              </p>
            </div>
          </div>

          {/* Verified Outlets Section */}
          <div className="space-y-6 pt-4">
            <div className="space-y-1">
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-text-primary">
                Cabang yang Terverifikasi
              </h3>
              <p className="text-xs sm:text-sm text-text-muted">
                Dua lokasi resmi Warkop Ya&apos;reh di Kota Surabaya
              </p>
            </div>

            <div className="space-y-4">
              {VERIFIED_BRANCHES.map((branch) => {
                const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(branch.plusCode)}`;
                return (
                  <div
                    key={branch.id}
                    className="rounded-2xl border border-border-subtle bg-surface-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-base text-text-primary">
                          {branch.name}
                        </span>
                        <span className="rounded bg-[var(--green-500)]/15 px-2 py-0.5 font-mono text-[10px] text-[var(--green-500)]">
                          24 Jam
                        </span>
                      </div>
                      <p className="text-xs text-text-muted">
                        {branch.address.street}, {branch.address.subdistrict}, {branch.address.city}
                      </p>
                      <p className="font-mono text-xs text-accent-amber">
                        Plus Code: {branch.plusCode}
                      </p>
                      {branch.phone && (
                        <p className="text-xs text-text-muted flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-accent-amber" />
                          <span>{branch.phone}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-on-primary hover:bg-primary-hover transition-colors"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        Peta
                      </a>
                      <Link
                        href={`/outlets/${branch.slug}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-border-subtle bg-surface-secondary px-3.5 py-2 text-xs font-semibold text-text-primary hover:border-accent-amber/40 transition-colors"
                      >
                        Detail
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
