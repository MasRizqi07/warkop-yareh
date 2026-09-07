'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Award,
  Coffee,
  Globe,
  Heart,
  Laptop,
  Lightbulb,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
  Zap,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-canvas-obsidian pb-24 text-on-surface">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-mesh opacity-40" />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border-subtle bg-surface-secondary/60 py-24">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-accent-amber/15 text-accent-amber border border-accent-amber/30">
              Sanctuary Heritage • Surabaya 1998
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-text-primary">
              The Coffee Sanctuary{' '}
              <span className="bg-gradient-to-r from-cream-beige via-primary to-accent-amber bg-clip-text text-transparent">
                Ecosystem.
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-sm sm:text-base text-text-muted leading-relaxed">
              Dari warung kopi legendaris di sudut Wonokromo hingga menjadi episentrum digital coworking dan specialty roastery beroperasi 24 jam nonstop untuk para kreator Surabaya.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Philosophy Split */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group relative aspect-video w-full overflow-hidden rounded-3xl border border-border-subtle bg-surface-card lg:aspect-square shadow-2xl"
            >
              <Image
                alt="Warkop Ya'reh Interior Sanctuary"
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                src="/images/darmo-interior.png"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-canvas-obsidian via-canvas-obsidian/30 to-transparent p-8 flex flex-col justify-end">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent-amber">
                  Darmo Flagship • Surabaya
                </span>
                <h3 className="mt-1 font-heading text-xl font-bold text-text-primary">
                  The Third Space for Surabaya&apos;s Next Generation
                </h3>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="font-mono text-xs text-accent-amber uppercase tracking-widest">
                  Our Philosophy
                </span>
                <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary">
                  Harmoni Kopi Tradisi dan Presisi Digital
                </h2>
              </div>
              <div className="space-y-4 text-sm text-text-muted leading-relaxed">
                <p>
                  Warkop Ya&apos;reh lahir dari keyakinan bahwa warung kopi di Jawa Timur bukan sekadar tempat mengonsumsi kafein, melainkan ruang ketiga sakral di mana ide-ide besar lahir, diskusi malam mengalir bebas, dan kesetaraan terjalin di meja kayu.
                </p>
                <p>
                  Kami mentransformasi ritual warkop tradisional dengan teknologi mutakhir: koneksi mesh fiber optik berlatensi rendah, sistem pemesanan QRIS nirsentuh di meja, integrasi Kitchen Display System (KDS), serta biji kopi specialty single-origin Nusantara yang disangrai dengan profil artisan.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
                <div className="p-4 rounded-xl bg-surface-card border border-border-subtle">
                  <Coffee className="w-5 h-5 text-accent-amber mb-2" />
                  <h4 className="font-heading text-sm font-bold text-text-primary">100% Single Origin</h4>
                  <p className="text-xs text-text-muted mt-1">Biji kopi Ijen, Gayo, dan Flores langsung dari petani.</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-card border border-border-subtle">
                  <Wifi className="w-5 h-5 text-emerald-400 mb-2" />
                  <h4 className="font-heading text-sm font-bold text-text-primary">Gigabit Redundant WiFi</h4>
                  <p className="text-xs text-text-muted mt-1">Multi-ISP failover 350 Mbps untuk kelancaran kerja 24/7.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Multi-Zone Architecture Showcase */}
      <section className="py-20 bg-surface-secondary/50 border-y border-border-subtle relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-mono text-xs text-accent-amber uppercase tracking-widest">
              Spatial Architecture
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary">
              Tiga Zona Dirancang untuk Produktivitas
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">
              Setiap lantai dan sudut Warkop Ya&apos;reh dioptimalkan untuk kebutuhan aktivitas yang berbeda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Zone 1 */}
            <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 space-y-4 hover:border-primary/40 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-accent-amber/15 flex items-center justify-center text-accent-amber">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary">
                Indoor Deep Work Zone
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Area hening bebas bising dengan indeks kesunyian 98%. Kursi ergonomis standar Herman Miller, stopkontak terdedikasi di setiap meja, dan pencahayaan hangat yang mereduksi ketegangan mata.
              </p>
              <span className="inline-block font-mono text-[11px] text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/20">
                Lantai 1 • 24 Jam Buka
              </span>
            </div>

            {/* Zone 2 */}
            <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 space-y-4 hover:border-primary/40 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary">
                Outdoor Communal Garden
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Taman terbuka tropis dengan kanopi peneduh alami untuk cangkruk, brainstorming santai, dan sesi diskusi komunitas yang hangat dengan sirkulasi udara segar Surabaya.
              </p>
              <span className="inline-block font-mono text-[11px] text-accent-amber bg-accent-amber/15 px-2.5 py-1 rounded-md border border-accent-amber/30">
                Ground Floor • Smoking Friendly
              </span>
            </div>

            {/* Zone 3 */}
            <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 space-y-4 hover:border-primary/40 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary">
                VIP Meeting &amp; Podcast Suite
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Studio kedap suara ber-AC untuk rapat direksi, pitching venture capital, dan rekaman audio berkualitas studio lengkap dengan layanan barista pribadi.
              </p>
              <span className="inline-block font-mono text-[11px] text-cream-beige bg-surface-secondary px-2.5 py-1 rounded-md border border-border-subtle">
                Lantai 2 • Reservasi Slot
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 text-center relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary">
            Siap Merasakan Pengalaman Sanctuary?
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Kunjungi cabang Darmo Flagship atau Gubeng Roastery kami hari ini. Buka 24 jam nonstop untuk menyambut ritual kreatif Anda.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/menu"
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-coffee via-secondary-container to-accent-amber text-canvas-obsidian font-heading font-bold text-sm shadow-lg hover:scale-105 transition-all"
            >
              Lihat Menu Kopi
            </Link>
            <Link
              href="/booking"
              className="px-7 py-3.5 rounded-xl bg-surface-card hover:bg-surface-secondary border border-border-subtle text-text-primary font-heading font-semibold text-sm transition-all"
            >
              Reservasi Workspace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
