'use client';

import React from 'react';
import {
  Phone,
  MapPin,
  Clock,
  Navigation,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { VERIFIED_BRANCHES } from '@warkop-yareh/types';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-canvas-obsidian text-on-surface pb-20 font-body">
      {/* Header Section */}
      <section className="relative border-b border-border-subtle bg-surface-secondary/40 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-card px-3.5 py-1 font-mono text-xs text-accent-amber">
            <Phone className="h-3.5 w-3.5" />
            <span>Kontak & Lokasi</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
            Hubungi Warkop Ya&apos;reh
          </h1>
          <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto">
            Informasi alamat resmi, nomor kontak, dan panduan rute Google Maps menuju outlet Warkop Ya&apos;reh di Surabaya.
          </p>
        </div>
      </section>

      {/* Outlets Directory & Contact Information */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {VERIFIED_BRANCHES.map((branch) => {
            const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(branch.plusCode)}`;

            return (
              <div
                key={branch.id}
                className="rounded-3xl border border-border-subtle bg-surface-card p-7 sm:p-8 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-block rounded-md bg-accent-amber/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-accent-amber">
                        {branch.isMainBranch ? 'Outlet 1' : 'Outlet 2'}
                      </span>
                      <h2 className="font-heading text-xl sm:text-2xl font-bold text-text-primary mt-1">
                        {branch.name}
                      </h2>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--green-500)]/15 px-2.5 py-1 font-mono text-[10px] font-semibold text-[var(--green-500)]">
                      <CheckCircle2 className="h-3 w-3" />
                      24 Jam
                    </span>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm text-text-muted">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 shrink-0 text-accent-amber mt-0.5" />
                      <div>
                        <strong className="text-text-primary block">Alamat Lengkap:</strong>
                        <span>
                          {branch.address.street}, {branch.address.subdistrict}, {branch.address.district}, {branch.address.city}, Jawa Timur {branch.address.postalCode}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Navigation className="h-4 w-4 shrink-0 text-text-muted mt-0.5" />
                      <div>
                        <strong className="text-text-primary block">Google Maps Plus Code:</strong>
                        <span className="font-mono text-accent-amber">{branch.plusCode}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Clock className="h-4 w-4 shrink-0 text-[var(--green-500)] mt-0.5" />
                      <div>
                        <strong className="text-text-primary block">Jam Operasional:</strong>
                        <span>24 Jam Nonstop (Senin – Minggu)</span>
                      </div>
                    </div>

                    {branch.phone ? (
                      <div className="flex items-start gap-2.5 pt-1">
                        <Phone className="h-4 w-4 shrink-0 text-accent-amber mt-0.5" />
                        <div>
                          <strong className="text-text-primary block">Nomor Telepon:</strong>
                          <a
                            href={`tel:${branch.phone}`}
                            className="font-mono text-sm text-text-primary hover:text-accent-amber font-semibold transition-colors"
                          >
                            {branch.phone}
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5 pt-1">
                        <MessageSquare className="h-4 w-4 shrink-0 text-text-muted mt-0.5" />
                        <div>
                          <strong className="text-text-primary block">Layanan Kontak:</strong>
                          <span className="text-xs text-text-muted">
                            Silakan datang langsung ke outlet 24 jam untuk pemesanan dan pertanyaan.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border-subtle flex flex-wrap gap-3">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-on-primary hover:bg-primary-hover transition-colors"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Buka Rute Google Maps
                  </a>
                  {branch.phone && (
                    <a
                      href={`tel:${branch.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-secondary px-4 py-2.5 text-xs font-semibold text-text-primary hover:border-accent-amber/40 transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5 text-accent-amber" />
                      Panggil Outlet
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
