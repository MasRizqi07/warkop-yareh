'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CountUp } from '@warkop-yareh/ui';
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Coffee,
  Laptop,
  MapPin,
  Star,
  Ticket,
  Users,
  Wifi,
  Zap,
} from 'lucide-react';
import { useActiveBranch, useCatalog } from '@/features/catalog/catalog.hooks';
import { useBranchStore, useCartStore, type FulfillmentType } from '@/stores';
import { useAppStore } from '@/store/useAppStore';
import { soundEffects } from '@/lib/audioAlerts';

export default function HomePage() {
  const branches = useActiveBranch();
  const { activeBranch } = branches;
  const catalog = useCatalog(activeBranch?.id);
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const { events, toggleEventRsvp } = useAppStore();

  const [activeFulfillment, setActiveFulfillment] = useState<FulfillmentType>('dine-in');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedZoneBranch, setSelectedZoneBranch] = useState<'darmo' | 'gubeng'>('darmo');

  const products = catalog.data?.products ?? [];

  const handleQuickAdd = (product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
  }) => {
    addItem(
      {
        id: product.id,
        name: product.name,
        description: '',
        price: product.price,
        image: product.image,
        category: product.category || 'signature',
        tags: [],
        isPopular: true,
        isNew: false,
        rating: 4.9,
        reviewCount: 120,
        preparationTime: 5,
        branchAvailability: ['darmo', 'gubeng'],
      },
      1
    );
    soundEffects.playSuccessChime();
    setCartOpen(true);
  };

  const handleRsvp = (eventId: string) => {
    toggleEventRsvp(eventId);
    soundEffects.playSuccessChime();
  };

  return (
    <main className="w-full bg-canvas-obsidian text-on-surface antialiased overflow-hidden min-h-screen">
      {/* ══════════════════════════════════════════
          SECTION 1: HERO SECTION
          ══════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden pb-20 pt-8 sm:pt-12 md:pb-28">
        {/* Ambient Radial Mesh Layer */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[650px] w-[1050px] -translate-x-1/2 rounded-full bg-gradient-to-b from-accent-amber/20 via-brand-coffee/15 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute top-1/4 right-0 h-[500px] w-[500px] rounded-full bg-secondary-container/10 blur-[130px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Meta Ribbon */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-6 flex-wrap"
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-card border border-border-subtle shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-amber opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-amber" />
              </span>
              <span className="font-mono text-xs text-cream-beige uppercase tracking-wider font-medium">
                {activeBranch ? `${activeBranch.name} • Surabaya Flagship` : 'Darmo Sanctuary • Surabaya Flagship'}
              </span>
            </span>
            <span className="hidden sm:inline-block font-mono text-xs text-text-muted">
              | 24/7 High-Density Workspace &amp; Artisanal Roastery
            </span>
          </motion.div>

          {/* Main Hero Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Editorial Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 space-y-7"
            >
              <div className="space-y-4">
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.1]">
                  Where Specialty Brew{' '}
                  <span className="bg-gradient-to-r from-cream-beige via-primary to-accent-amber bg-clip-text text-transparent">
                    Meets Digital Craft.
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-text-muted max-w-xl leading-relaxed">
                  Surabaya&apos;s 24/7 nexus for artisanal single-origin coffees, gigabit mesh networking, and inspiring coworking spaces engineered for creators, engineers, and night owls.
                </p>
              </div>

              {/* Dual CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#menu-highlights"
                  className="group relative inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-brand-coffee via-secondary-container to-accent-amber text-canvas-obsidian font-heading text-base font-bold shadow-[0_8px_32px_-4px_rgba(245,158,11,0.35)] hover:shadow-[0_12px_40px_-2px_rgba(245,158,11,0.55)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Coffee className="w-5 h-5 text-canvas-obsidian" />
                  <span>Order for Pickup / Table</span>
                </a>
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-surface-card/80 hover:bg-surface-container border border-border-subtle hover:border-primary/40 text-text-primary font-heading text-base font-semibold backdrop-blur-md transition-all hover:scale-[1.02]"
                >
                  <Laptop className="w-5 h-5 text-cream-beige" />
                  <span>Book Workspace / VIP</span>
                </Link>
              </div>

              {/* Mini Stats Row with CountUp */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border-subtle/50">
                <div>
                  <p className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                    0.8<span className="text-accent-amber">ms</span>
                  </p>
                  <p className="font-mono text-[11px] text-text-muted uppercase tracking-wider mt-1">WiFi Mesh Latency</p>
                </div>
                <div>
                  <p className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                    18<span className="text-primary">h</span>
                  </p>
                  <p className="font-mono text-[11px] text-text-muted uppercase tracking-wider mt-1">Cold Drip Extraction</p>
                </div>
                <div>
                  <p className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                    365<span className="text-accent-amber">+</span>
                  </p>
                  <p className="font-mono text-[11px] text-text-muted uppercase tracking-wider mt-1">Days Nonstop Ops</p>
                </div>
              </div>
            </motion.div>

            {/* Right Asymmetric Image Composition */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 relative mt-4 lg:mt-0"
            >
              <div className="relative w-full h-[460px] sm:h-[520px]">
                {/* Main Tech/Coworking Ambient Image */}
                <div className="absolute top-0 right-0 w-[86%] h-[350px] sm:h-[390px] rounded-3xl overflow-hidden shadow-2xl border border-border-subtle bg-surface-card">
                  <Image
                    src="/images/darmo-interior.png"
                    alt="Interior Warkop Ya'reh Darmo Surabaya"
                    fill
                    priority
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 550px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas-obsidian/90 via-canvas-obsidian/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-cream-beige bg-canvas-obsidian/80 backdrop-blur-md px-3 py-1 rounded-lg border border-border-subtle">
                      Darmo Flagship • Floor 1 Quiet Zone
                    </span>
                    <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      98% Quiet Index
                    </span>
                  </div>
                </div>

                {/* Overlapping Drink Showcase (Cold Brew Aren Brulee) */}
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.3 }}
                  className="absolute -bottom-4 left-0 w-[62%] sm:w-[54%] h-[230px] sm:h-[260px] rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.85)] border border-accent-amber/40 bg-surface-card"
                >
                  <Image
                    src="/images/cold-brew-aren-brulee.png"
                    alt="Cold Brew Aren Brulee Warkop Ya'reh"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 80vw, 300px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas-obsidian/95 via-canvas-obsidian/30 to-transparent" />
                  <div className="absolute bottom-3.5 left-3.5 right-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-accent-amber bg-accent-amber/20 px-2 py-0.5 rounded border border-accent-amber/40 uppercase tracking-wider font-bold">
                        Signature Drop
                      </span>
                      <span className="font-mono text-xs text-text-primary font-bold">Rp 32.000</span>
                    </div>
                    <p className="font-heading text-sm text-text-primary font-bold mt-1">Cold Brew Aren Brulee</p>
                    <p className="text-[11px] text-text-muted truncate">Caramelized torch palm nectar × 18h slow drip</p>
                  </div>
                </motion.div>

                {/* Floating Glass Metric Badges */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-6 left-0 sm:-left-4 backdrop-blur-xl bg-surface-secondary/90 border border-border-subtle p-3 rounded-2xl shadow-2xl flex items-center gap-2.5"
                >
                  <Coffee className="w-5 h-5 text-accent-amber" />
                  <div>
                    <p className="text-xs text-text-primary font-bold">100% Single Origin</p>
                    <p className="font-mono text-[10px] text-text-muted">Gayo • Ijen Highland</p>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute top-44 -right-2 sm:-right-4 backdrop-blur-xl bg-surface-card/90 border border-border-subtle p-3 rounded-2xl shadow-2xl flex items-center gap-2.5"
                >
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs text-text-primary font-bold">Gigabit Mesh Fiber</p>
                    <p className="font-mono text-[10px] text-emerald-400">99.9% Redundant Uptime</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2: QUICK OMNICHANNEL SELECTOR
          ══════════════════════════════════════════ */}
      <section className="w-full py-4 border-y border-border-subtle bg-surface-secondary/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-text-muted font-medium">
                Pemesanan Cepat:
              </span>
            </div>
            <span className="text-sm font-semibold text-text-primary">
              {activeBranch?.name ?? 'Darmo Flagship Surabaya'}
            </span>
          </div>

          {/* Fulfillment Switcher Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-canvas-obsidian border border-border-subtle overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveFulfillment('dine-in')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFulfillment === 'dine-in'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <span>Dine-In QR (Meja #14)</span>
            </button>
            <button
              onClick={() => setActiveFulfillment('pickup')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFulfillment === 'pickup'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <span>Takeaway Express</span>
            </button>
            <button
              onClick={() => setActiveFulfillment('drive-thru')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFulfillment === 'drive-thru'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <span>Drive-Thru Slot</span>
            </button>
            <button
              onClick={() => setActiveFulfillment('delivery')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFulfillment === 'delivery'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <span>Priority Delivery</span>
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3: SIGNATURE MENU HIGHLIGHTS
          ══════════════════════════════════════════ */}
      <section id="menu-highlights" className="w-full py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-accent-amber uppercase tracking-widest mb-1.5">
                <Coffee className="w-4 h-4" />
                <span>Specialty Craft Roastery</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary">
                Signature Menu Highlights
              </h2>
              <p className="text-sm text-text-muted mt-1 max-w-lg">
                Racikan kopi spesial, single-origin manual brew, eliksir non-kopi, dan roti artisanal sourdough segar.
              </p>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-subtle hover:border-accent-amber/50 bg-surface-card text-xs font-semibold text-text-primary transition-all hover:scale-105"
            >
              <span>Buka Katalog Lengkap (42 Menu)</span>
              <ArrowRight className="w-4 h-4 text-accent-amber" />
            </Link>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'all', label: 'All Creations', count: products.length || 42 },
              { id: 'signature', label: 'Signature Coffee', count: 8 },
              { id: 'manual-brew', label: 'Manual Brew (V60)', count: 6 },
              { id: 'non-coffee', label: 'Non-Coffee & Elixirs', count: 7 },
              { id: 'bakery', label: 'Artisanal Bakery', count: 9 },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-accent-amber text-canvas-obsidian shadow-md'
                    : 'bg-surface-secondary text-text-muted hover:text-text-primary hover:bg-surface-card border border-border-subtle'
                }`}
              >
                <span>{cat.label}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-canvas-obsidian/20 font-mono text-[10px]">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Cold Brew Aren Brulee */}
            <motion.article
              whileHover={{ y: -6 }}
              className="group rounded-2xl border border-border-subtle bg-surface-card overflow-hidden flex flex-col justify-between shadow-xl transition-all hover:border-accent-amber/40"
            >
              <div className="relative aspect-[4/3] w-full bg-surface-secondary overflow-hidden">
                <Image
                  src="/images/cold-brew-aren-brulee.png"
                  alt="Cold Brew Aren Brulee"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-canvas-obsidian/85 text-accent-amber border border-border-subtle backdrop-blur-md">
                  18h Cold Drip
                </span>
                <span className="absolute bottom-3 right-3 font-mono text-xs font-bold text-text-primary bg-canvas-obsidian/80 px-2.5 py-1 rounded-md backdrop-blur-sm">
                  ⭐ 4.9 (420+)
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-heading font-bold text-base text-text-primary group-hover:text-primary transition-colors">
                    Cold Brew Aren Brulee
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                    Kopi cold brew 18 jam dengan gula aren organik caramelized flame torch dan busa susu lembut.
                  </p>
                </div>
                <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm font-bold text-accent-amber">Rp 32.000</span>
                    <span className="block font-mono text-[10px] text-text-muted">Ijen Highland Blend</span>
                  </div>
                  <button
                    onClick={() =>
                      handleQuickAdd({
                        id: 'cb-aren-brulee',
                        name: 'Cold Brew Aren Brulee',
                        price: 32000,
                        image: '/images/cold-brew-aren-brulee.png',
                        category: 'coffee',
                      })
                    }
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-coffee to-secondary-container text-text-primary text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>+ Pesan</span>
                  </button>
                </div>
              </div>
            </motion.article>

            {/* Card 2: Artisan Toasted Sourdough */}
            <motion.article
              whileHover={{ y: -6 }}
              className="group rounded-2xl border border-border-subtle bg-surface-card overflow-hidden flex flex-col justify-between shadow-xl transition-all hover:border-accent-amber/40"
            >
              <div className="relative aspect-[4/3] w-full bg-surface-secondary overflow-hidden">
                <Image
                  src="/images/artisan-toasted-sourdough.png"
                  alt="Artisan Toasted Sourdough"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-canvas-obsidian/85 text-cream-beige border border-border-subtle backdrop-blur-md">
                  Fresh Bakery
                </span>
                <span className="absolute bottom-3 right-3 font-mono text-xs font-bold text-text-primary bg-canvas-obsidian/80 px-2.5 py-1 rounded-md backdrop-blur-sm">
                  ⭐ 4.8 (185)
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-heading font-bold text-base text-text-primary group-hover:text-primary transition-colors">
                    Artisan Toasted Sourdough
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                    Roti sourdough fermentasi 36 jam dipanggang renyah dengan cultured butter dan taburan sea salt.
                  </p>
                </div>
                <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm font-bold text-accent-amber">Rp 28.000</span>
                    <span className="block font-mono text-[10px] text-text-muted">Warm Kitchen</span>
                  </div>
                  <button
                    onClick={() =>
                      handleQuickAdd({
                        id: 'sourdough-toast',
                        name: 'Artisan Toasted Sourdough',
                        price: 28000,
                        image: '/images/artisan-toasted-sourdough.png',
                        category: 'bakery',
                      })
                    }
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-coffee to-secondary-container text-text-primary text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>+ Pesan</span>
                  </button>
                </div>
              </div>
            </motion.article>

            {/* Card 3: Artisan Iced Matcha Pandan Latte */}
            <motion.article
              whileHover={{ y: -6 }}
              className="group rounded-2xl border border-border-subtle bg-surface-card overflow-hidden flex flex-col justify-between shadow-xl transition-all hover:border-accent-amber/40"
            >
              <div className="relative aspect-[4/3] w-full bg-surface-secondary overflow-hidden">
                <Image
                  src="/images/matcha-pandan-latte.png"
                  alt="Artisan Iced Matcha Pandan Latte"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-canvas-obsidian/85 text-emerald-400 border border-border-subtle backdrop-blur-md">
                  Ceremonial Grade
                </span>
                <span className="absolute bottom-3 right-3 font-mono text-xs font-bold text-text-primary bg-canvas-obsidian/80 px-2.5 py-1 rounded-md backdrop-blur-sm">
                  ⭐ 4.9 (310)
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-heading font-bold text-base text-text-primary group-hover:text-primary transition-colors">
                    Iced Matcha Pandan Latte
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                    Uji matcha grade seremonial Jepang dipadukan dengan infusi pandan wangi alami Jawa Timur.
                  </p>
                </div>
                <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm font-bold text-accent-amber">Rp 35.000</span>
                    <span className="block font-mono text-[10px] text-text-muted">Plant-Based Friendly</span>
                  </div>
                  <button
                    onClick={() =>
                      handleQuickAdd({
                        id: 'matcha-pandan',
                        name: 'Iced Matcha Pandan Latte',
                        price: 35000,
                        image: '/images/matcha-pandan-latte.png',
                        category: 'non-coffee',
                      })
                    }
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-coffee to-secondary-container text-text-primary text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>+ Pesan</span>
                  </button>
                </div>
              </div>
            </motion.article>

            {/* Card 4: Single Origin Flores Bajawa V60 */}
            <motion.article
              whileHover={{ y: -6 }}
              className="group rounded-2xl border border-border-subtle bg-surface-card overflow-hidden flex flex-col justify-between shadow-xl transition-all hover:border-accent-amber/40"
            >
              <div className="relative aspect-[4/3] w-full bg-surface-secondary overflow-hidden">
                <Image
                  src="/images/cold-brew-aren-brulee.png"
                  alt="Single Origin Flores Bajawa V60"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-canvas-obsidian/85 text-primary border border-border-subtle backdrop-blur-md">
                  Single Origin
                </span>
                <span className="absolute bottom-3 right-3 font-mono text-xs font-bold text-text-primary bg-canvas-obsidian/80 px-2.5 py-1 rounded-md backdrop-blur-sm">
                  ⭐ 5.0 (98)
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-heading font-bold text-base text-text-primary group-hover:text-primary transition-colors">
                    Flores Bajawa Pour-Over
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                    Seduhan manual V60 beraroma bunga melati, milk chocolate note, dan keasaman sitrun yang bersih.
                  </p>
                </div>
                <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm font-bold text-accent-amber">Rp 30.000</span>
                    <span className="block font-mono text-[10px] text-text-muted">Barista Filter Roast</span>
                  </div>
                  <button
                    onClick={() =>
                      handleQuickAdd({
                        id: 'flores-v60',
                        name: 'Flores Bajawa Pour-Over',
                        price: 30000,
                        image: '/images/cold-brew-aren-brulee.png',
                        category: 'coffee',
                      })
                    }
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-coffee to-secondary-container text-text-primary text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>+ Pesan</span>
                  </button>
                </div>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4: COWORKING & RESERVATION SHOWCASE
          ══════════════════════════════════════════ */}
      <section id="coworking" className="w-full py-20 bg-surface-secondary/40 border-t border-border-subtle relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-accent-amber uppercase tracking-widest mb-1.5">
                <Laptop className="w-4 h-4" />
                <span>Deep Work &amp; High Density Space</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary">
                Coworking &amp; VIP Sanctuary
              </h2>
              <p className="text-sm text-text-muted mt-1 max-w-xl leading-relaxed">
                Didesain khusus untuk software engineer, startup founder, dan digital nomad dengan koneksi internet serat optik redundan 350 Mbps.
              </p>
            </div>

            {/* Branch Switcher */}
            <div className="flex items-center gap-2 bg-surface-card p-1.5 rounded-2xl border border-border-subtle">
              <button
                onClick={() => setSelectedZoneBranch('darmo')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedZoneBranch === 'darmo'
                    ? 'bg-primary-container text-on-primary-container shadow-md'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Darmo Flagship (42/65 Meja)
              </button>
              <button
                onClick={() => setSelectedZoneBranch('gubeng')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedZoneBranch === 'gubeng'
                    ? 'bg-primary-container text-on-primary-container shadow-md'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Gubeng 24H (28/45 Meja)
              </button>
            </div>
          </div>

          {/* Pods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Zone 1 */}
            <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 flex flex-col justify-between space-y-5 hover:border-primary/40 transition-all shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-accent-amber uppercase tracking-wider bg-accent-amber/15 px-2.5 py-1 rounded-md font-bold">
                    Solo Focus Pod
                  </span>
                  <span className="font-mono text-xs text-emerald-400">12 Pods Tersedia</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-text-primary">Acoustic Solo Booth</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Bilik kedap suara dengan kursi ergonomis Herman Miller, meja kayu jati solid, 4x universal AC outlet, dan fast WiFi.
                </p>
                <div className="space-y-2 pt-2 border-t border-border-subtle text-xs text-text-muted font-mono">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-3.5 h-3.5 text-accent-amber" />
                    <span>Dedicated 150 Mbps VLAN</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coffee className="w-3.5 h-3.5 text-accent-amber" />
                    <span>Free Refill Single Origin Cold Brew</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
                <div>
                  <span className="font-mono text-base font-bold text-accent-amber">Rp 25.000</span>
                  <span className="text-xs text-text-muted"> / jam</span>
                </div>
                <Link
                  href="/booking"
                  className="px-4 py-2 rounded-xl bg-surface-secondary hover:bg-surface-container-high text-xs font-semibold text-text-primary transition-all border border-border-subtle hover:border-accent-amber/40"
                >
                  Pesan Meja
                </Link>
              </div>
            </div>

            {/* Zone 2 */}
            <div className="rounded-2xl border border-accent-amber/40 bg-surface-card p-6 flex flex-col justify-between space-y-5 shadow-2xl relative">
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-accent-amber text-canvas-obsidian font-mono text-[10px] font-bold uppercase tracking-wider shadow-md">
                Paling Diminati
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-accent-amber uppercase tracking-wider bg-accent-amber/15 px-2.5 py-1 rounded-md font-bold">
                    Collab Pod (2-4 Pax)
                  </span>
                  <span className="font-mono text-xs text-emerald-400">4 Pods Tersedia</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-text-primary">Sprint Collaboration Pod</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Ruang kolaborasi semi-privat untuk coding pair, meeting investor, atau brain dump sprint tim dilengkapi digital monitor.
                </p>
                <div className="space-y-2 pt-2 border-t border-border-subtle text-xs text-text-muted font-mono">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-3.5 h-3.5 text-accent-amber" />
                    <span>4K 32-inch External Display &amp; Whiteboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coffee className="w-3.5 h-3.5 text-accent-amber" />
                    <span>Carafe Cold Brew + Artisan Snacks</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
                <div>
                  <span className="font-mono text-base font-bold text-accent-amber">Rp 85.000</span>
                  <span className="text-xs text-text-muted"> / jam (tim)</span>
                </div>
                <Link
                  href="/booking"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-coffee to-secondary-container text-xs font-semibold text-text-primary transition-all shadow-md hover:scale-105"
                >
                  Pesan Meja
                </Link>
              </div>
            </div>

            {/* Zone 3 */}
            <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 flex flex-col justify-between space-y-5 hover:border-primary/40 transition-all shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-cream-beige uppercase tracking-wider bg-surface-secondary px-2.5 py-1 rounded-md font-bold">
                    VIP Executive (6-10 Pax)
                  </span>
                  <span className="font-mono text-xs text-accent-amber">Reservasi 24h</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-text-primary">Executive Glass Studio</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Ruang rapat ber-AC eksklusif dengan proyektor 4K, sistem mic podcast Shure, layanan barista pribadi, dan privasi penuh.
                </p>
                <div className="space-y-2 pt-2 border-t border-border-subtle text-xs text-text-muted font-mono">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-accent-amber" />
                    <span>Private Gigabit Fiber LAN Port</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-accent-amber" />
                    <span>Dedicated Barista Butler Service</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
                <div>
                  <span className="font-mono text-base font-bold text-accent-amber">Rp 250.000</span>
                  <span className="text-xs text-text-muted"> / 2 jam</span>
                </div>
                <Link
                  href="/booking"
                  className="px-4 py-2 rounded-xl bg-surface-secondary hover:bg-surface-container-high text-xs font-semibold text-text-primary transition-all border border-border-subtle hover:border-accent-amber/40"
                >
                  Pesan Meja
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5: GAMIFIED LOYALTY ECOSYSTEM
          ══════════════════════════════════════════ */}
      <section className="w-full py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: 3D Holographic Card Visual */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div
                whileHover={{ rotateY: 8, rotateX: -6, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative w-full max-w-sm aspect-[1.58/1] rounded-3xl p-6 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-accent-amber/40 bg-gradient-to-br from-surface-card via-[#1e1c17] to-canvas-obsidian text-text-primary flex flex-col justify-between"
              >
                {/* Metallic Gold Aura */}
                <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-accent-amber/25 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-brand-coffee/30 blur-2xl" />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent-amber/20 border border-accent-amber/50 flex items-center justify-center text-accent-amber font-heading font-black">
                      Y
                    </div>
                    <div>
                      <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary block leading-none">
                        Warkop Ya&apos;reh
                      </span>
                      <span className="font-mono text-[9px] text-accent-amber uppercase tracking-widest">
                        Sanctuary Guild Pass
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-accent-amber font-bold border border-accent-amber/40 bg-accent-amber/10 px-2 py-0.5 rounded-full">
                    GOLD PECINTA
                  </span>
                </div>

                <div className="relative z-10 my-auto">
                  <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider block">
                    Available Points
                  </span>
                  <p className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mt-0.5">
                    1,450 <span className="font-mono text-xs text-accent-amber">YR PTS</span>
                  </p>
                </div>

                <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] font-mono text-text-muted">
                  <span>Reyhan Arisandi</span>
                  <span>#YR-2024-8921</span>
                </div>
              </motion.div>
            </div>

            {/* Right: Loyalty Explanations */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs text-accent-amber uppercase tracking-widest">
                  <Award className="w-4 h-4" />
                  <span>Kawan Ya&apos;reh Club Ecosystem</span>
                </div>
                <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary">
                  Sip, Earn &amp; Unlock Sanctuary Perks
                </h2>
                <p className="text-sm text-text-muted leading-relaxed">
                  Setiap tegukan bernilai poin. Kumpulkan poin dari transaksi minuman, sewa meja, atau tantangan komunitas harian untuk ditukar dengan reward eksklusif.
                </p>
              </div>

              {/* Tier Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-surface-card border border-border-subtle">
                  <span className="font-mono text-[10px] text-text-muted uppercase block">Tier 1</span>
                  <h4 className="font-heading text-sm font-bold text-text-primary mt-1">Penikmat</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">0 - 199 Poin</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-card border border-accent-amber/50 shadow-md">
                  <span className="font-mono text-[10px] text-accent-amber uppercase font-bold block">Tier 2 (Active)</span>
                  <h4 className="font-heading text-sm font-bold text-accent-amber mt-1">Pecinta</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">200 - 499 Poin</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-card border border-border-subtle">
                  <span className="font-mono text-[10px] text-text-muted uppercase block">Tier 3</span>
                  <h4 className="font-heading text-sm font-bold text-text-primary mt-1">Pendekar</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">500 - 999 Poin</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-card border border-border-subtle">
                  <span className="font-mono text-[10px] text-text-muted uppercase block">Tier 4</span>
                  <h4 className="font-heading text-sm font-bold text-cream-beige mt-1">Sultan</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">1000+ Poin</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/loyalty"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-coffee to-secondary-container text-xs font-bold text-text-primary shadow-md hover:scale-105 transition-all"
                >
                  Buka Portal Loyalty
                </Link>
                <span className="font-mono text-xs text-text-muted">
                  🔥 7-Day Brew Streak Aktif (+100 Bonus Pts Menanti)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 6: COMMUNITY & TECH EVENTS TICKER
          ══════════════════════════════════════════ */}
      <section className="w-full py-20 bg-surface-secondary/50 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-accent-amber uppercase tracking-widest mb-1.5">
                <Users className="w-4 h-4" />
                <span>Surabaya Guild of Builders &amp; Brewers</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary">
                Community Gatherings &amp; Meetups
              </h2>
              <p className="text-sm text-text-muted mt-1 max-w-lg">
                Temui sesama developer, designer, dan penggiat kopi di Surabaya dalam sesi workshop tatap muka.
              </p>
            </div>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 text-xs font-semibold text-accent-amber hover:underline"
            >
              Lihat Kalender Komunitas Lengkap <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.slice(0, 3).map((ev) => (
              <div
                key={ev.id}
                className="rounded-2xl border border-border-subtle bg-surface-card overflow-hidden flex flex-col justify-between hover:border-primary/40 transition-all shadow-lg"
              >
                <div className="relative h-44 w-full bg-surface-secondary">
                  <Image
                    src={ev.image}
                    alt={ev.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 350px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas-obsidian via-canvas-obsidian/30 to-transparent" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-canvas-obsidian/80 text-accent-amber border border-border-subtle backdrop-blur-md">
                    {ev.category}
                  </span>
                  <span className="absolute bottom-3 left-3 font-mono text-xs text-cream-beige bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                    {ev.spotsLeft} Kursi Tersisa
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-heading font-bold text-base text-text-primary line-clamp-2">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-accent-amber mt-1 font-medium">
                      Speaker: {ev.speaker}
                    </p>
                    <p className="text-[11px] text-text-muted">{ev.speakerRole}</p>
                    <div className="mt-3 pt-3 border-t border-border-subtle text-xs text-text-muted font-mono space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-text-muted" />
                        <span>{ev.date} • {ev.time} WIB</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-text-muted" />
                        <span>{ev.branchName}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRsvp(ev.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      ev.isAttending
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                        : 'bg-primary-container text-on-primary-container hover:opacity-90 shadow-sm'
                    }`}
                  >
                    {ev.isAttending ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Sudah RSVP (Hadir)</span>
                      </>
                    ) : (
                      <>
                        <Ticket className="w-4 h-4" />
                        <span>RSVP Sekarang ({ev.price === 0 ? 'Gratis' : `Rp ${ev.price.toLocaleString('id-ID')}`})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 7: CUSTOMER TESTIMONIALS & REVIEWS
          ══════════════════════════════════════════ */}
      <section className="w-full py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-border-subtle font-mono text-xs text-accent-amber">
              <Star className="w-3.5 h-3.5 fill-accent-amber text-accent-amber" />
              <span>4.9 / 5.0 on Google Maps (2,400+ Ulasan)</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary">
              Kata Patron &amp; Komunitas Warkop Ya&apos;reh
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-border-subtle bg-surface-card space-y-4">
              <div className="flex items-center gap-1 text-accent-amber">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent-amber text-accent-amber" />
                ))}
              </div>
              <p className="text-sm text-text-muted leading-relaxed italic">
                &ldquo;Cold Brew Aren Brulee mereka bener-bener gak ada tandingannya di Surabaya. WiFi gigabitnya stabil banget buat deploy production pas midnight sprint.&rdquo;
              </p>
              <div className="pt-3 border-t border-border-subtle flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-coffee/30 flex items-center justify-center font-bold text-accent-amber">
                  DH
                </div>
                <div>
                  <h4 className="font-heading text-sm font-bold text-text-primary">Dimas Hendrawan</h4>
                  <p className="font-mono text-[11px] text-text-muted">Tech Lead • Surabaya Startup Guild</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border-subtle bg-surface-card space-y-4">
              <div className="flex items-center gap-1 text-accent-amber">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent-amber text-accent-amber" />
                ))}
              </div>
              <p className="text-sm text-text-muted leading-relaxed italic">
                &ldquo;Tempat paling kondusif buat fokus seharian. Suasananya tenang, stopkontak melimpah di setiap meja, dan makanannya artisanal berkualitas tinggi.&rdquo;
              </p>
              <div className="pt-3 border-t border-border-subtle flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-coffee/30 flex items-center justify-center font-bold text-accent-amber">
                  SK
                </div>
                <div>
                  <h4 className="font-heading text-sm font-bold text-text-primary">Siti Khadijah</h4>
                  <p className="font-mono text-[11px] text-text-muted">Product Designer • Remote Nomad</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border-subtle bg-surface-card space-y-4">
              <div className="flex items-center gap-1 text-accent-amber">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent-amber text-accent-amber" />
                ))}
              </div>
              <p className="text-sm text-text-muted leading-relaxed italic">
                &ldquo;Sistem pesan QRIS di mejanya cepet banget, pesanan langsung dianter barista tanpa ribet ngantri ke kasir. Sourdough toastnya wajib coba!&rdquo;
              </p>
              <div className="pt-3 border-t border-border-subtle flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-coffee/30 flex items-center justify-center font-bold text-accent-amber">
                  BP
                </div>
                <div>
                  <h4 className="font-heading text-sm font-bold text-text-primary">Bagus Pratama</h4>
                  <p className="font-mono text-[11px] text-text-muted">Creative Director • Brand Agency</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 8: COMPREHENSIVE EDITORIAL FOOTER
          ══════════════════════════════════════════ */}
      <footer className="w-full pt-16 pb-28 sm:pb-16 bg-canvas-obsidian border-t border-border-subtle text-text-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-amber to-brand-coffee flex items-center justify-center font-heading font-black text-canvas-obsidian text-lg">
                  Y
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-text-primary tracking-wide">
                    Warkop Ya&apos;reh
                  </h3>
                  <p className="font-mono text-[10px] text-accent-amber uppercase tracking-wider">Surabaya 1998</p>
                </div>
              </div>
              <p className="text-xs text-text-muted leading-relaxed max-w-sm">
                Sanctuary kopi specialty, ruang kerja berkepadatan tinggi, dan episentrum kolaborasi teknologi modern di Surabaya.
              </p>
              <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Outlets Operational 24 Hours</span>
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-text-primary">Eksplorasi</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/menu" className="hover:text-text-primary transition-colors">Menu Roastery</Link></li>
                <li><Link href="/booking" className="hover:text-text-primary transition-colors">Workspace &amp; VIP</Link></li>
                <li><Link href="/community" className="hover:text-text-primary transition-colors">Community Hub</Link></li>
                <li><Link href="/loyalty" className="hover:text-text-primary transition-colors">Kawan Ya&apos;reh</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-text-primary">Lokasi Cabang</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="font-semibold text-text-primary">Darmo Flagship Sanctuary</p>
                  <p className="text-text-muted">Jl. Raya Darmo No. 42, Surabaya</p>
                  <p className="font-mono text-[11px] text-accent-amber">Open 24/7 • Gigabit Mesh</p>
                </div>
                <div className="pt-2">
                  <p className="font-semibold text-text-primary">Gubeng Roastery &amp; Lab</p>
                  <p className="text-text-muted">Jl. Pemuda No. 18, Gubeng, Surabaya</p>
                  <p className="font-mono text-[11px] text-accent-amber">Open 24/7 • Meeting Suites</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-text-primary">Warkop Bulletin</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Dapatkan info drop beans batch terbatas dan jadwal meetup bulanan.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); soundEffects.playSuccessChime(); }} className="flex gap-2">
                <input
                  type="email"
                  placeholder="email@domain.com"
                  className="flex-1 bg-surface-secondary border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-amber/50"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-primary-container text-on-primary-container text-xs font-bold hover:opacity-90 transition-all"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          <div className="pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-text-muted">
            <p>&copy; 1998 - 2026 Warkop Ya&apos;reh Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:text-text-primary transition-colors">About Story</Link>
              <Link href="/orders" className="hover:text-text-primary transition-colors">Digital Receipt</Link>
              <span className="text-accent-amber font-semibold">Surabaya, Indonesia</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
