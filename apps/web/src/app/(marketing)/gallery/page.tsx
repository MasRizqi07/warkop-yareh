'use client';

import React from 'react';
import Link from 'next/link';
import {
  Image as ImageIcon,
  MapPin,
  Coffee,
  AlertCircle,
} from 'lucide-react';

export default function GalleryPage() {
  const scenes = [
    {
      title: 'Cangkrukan Malam Surabaya',
      location: 'Jetis Kulon & Prapen',
      description: 'Momen kebersamaan warga, mahasiswa, dan komunitas menikmati obrolan santai larut malam dengan secangkir kopi panas.',
      tag: 'Suasana Malam',
    },
    {
      title: 'Konter Barista & Seduhan Cepat',
      location: 'Area Layanan Terbuka',
      description: 'Aktivitas peracikan kopi khas warkop, es teh manis, dan aneka minuman segar yang disajikan dengan cepat dan hangat.',
      tag: 'Layanan Terbuka',
    },
    {
      title: 'Sudut Santai & Istirahat',
      location: 'Area Duduk Warkop',
      description: 'Ruang terbuka bersahaja yang nyaman untuk melepas lelah setelah beraktivitas seharian di Kota Surabaya.',
      tag: 'Area Duduk',
    },
    {
      title: 'Sajian Camilan & Hidangan Hangat',
      location: 'Dapur Cepat Saji',
      description: 'Mie instan warkop, aneka gorengan hangat, dan kudapan pendamping cangkrukan yang selalu siap kapan saja.',
      tag: 'Sajian Warkop',
    },
    {
      title: 'Operasional 24 Jam Nonstop',
      location: 'Wonokromo & Prapen',
      description: 'Penerangan hangat yang menyambut siapa pun yang melintas atau membutuhkan tempat singgah di tengah malam.',
      tag: '24 Jam Nonstop',
    },
    {
      title: 'Kebersamaan Komunitas Lokal',
      location: 'Meja Komunal',
      description: 'Interaksi hangat antarpengunjung dalam suasana egaliter khas budaya warkop Jawa Timur.',
      tag: 'Cangkrukan',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas-obsidian text-on-surface pb-20 font-body">
      {/* Header Section */}
      <section className="relative border-b border-border-subtle bg-surface-secondary/40 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-card px-3.5 py-1 font-mono text-xs text-accent-amber">
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Dokumentasi Ambiance</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
            Galeri Suasana Warkop
          </h1>
          <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto">
            Gambaran suasana nyata cangkrukan, kebersamaan, dan operasional 24 jam Warkop Ya&apos;reh di Surabaya.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Verification policy notice */}
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 flex items-start gap-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-accent-amber mt-0.5" />
          <div className="text-xs sm:text-sm text-text-muted space-y-1">
            <div className="font-semibold text-text-primary">Komitmen Dokumentasi Autentik</div>
            <p>
              Kami mengutamakan kejujuran visual. Halaman galeri ini menampilkan kurasi suasana riil warkop tanpa foto stok atau rekayasa buatan. Foto resolusi tinggi langsung dari lokasi fisik Jetis Kulon dan Prapen sedang diperbarui berkala.
            </p>
          </div>
        </div>

        {/* Atmosphere Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenes.map((scene, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-border-subtle bg-surface-card p-6 flex flex-col justify-between space-y-6 hover:border-accent-amber/30 transition-all hover:shadow-lg"
            >
              <div className="space-y-3">
                <span className="inline-block rounded-md bg-accent-amber/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-accent-amber uppercase tracking-wider">
                  {scene.tag}
                </span>
                <h3 className="font-heading text-lg font-bold text-text-primary">
                  {scene.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  {scene.description}
                </p>
              </div>

              <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-text-muted">
                <span className="flex items-center gap-1 text-accent-amber">
                  <MapPin className="h-3 w-3" />
                  {scene.location}
                </span>
                <span>24 Jam</span>
              </div>
            </div>
          ))}
        </div>

        {/* Visit CTA */}
        <div className="rounded-3xl border border-border-subtle bg-surface-secondary/40 p-8 text-center space-y-4">
          <Coffee className="h-8 w-8 text-accent-amber mx-auto" />
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-text-primary">
            Rasakan Langsung Suasananya
          </h3>
          <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto">
            Kunjungi outlet Jetis Kulon atau Prapen kapan saja Anda berada di Surabaya. Buka 24 jam nonstop setiap hari.
          </p>
          <div className="pt-2">
            <Link
              href="/outlets"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs sm:text-sm font-semibold text-on-primary hover:bg-primary-hover transition-colors"
            >
              <MapPin className="h-4 w-4" />
              Lihat Alamat & Lokasi Outlet
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

