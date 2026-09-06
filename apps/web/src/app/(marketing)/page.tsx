"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Coffee,
  Briefcase,
  Wifi,
  Thermometer,
  Zap,
  Calendar,
  Award,
  ArrowRight,
  Users,
  CalendarDays,
  Plus,
  Radio,
  Headphones,
  Tv,
} from "lucide-react";

export default function HomePage() {
  const [selectedBranch, setSelectedBranch] = useState<"darmo" | "gubeng">("darmo");

  return (
    <div className="flex flex-col w-full bg-canvas-obsidian text-on-surface overflow-hidden">
      {/* ══════════════════════════════════════════════════════════════
          SECTION 1: MASTER HERO SECTION
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden pb-20 pt-10 md:pt-16">
        {/* Ambient Radial Mesh Layer */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-accent-amber/15 via-brand-coffee/10 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-secondary-container/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-border-subtle shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-amber opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-amber"></span>
              </span>
              <span className="font-mono text-[11px] text-cream-beige uppercase tracking-wider font-semibold">
                Surabaya Flagship • Darmo Sanctuary
              </span>
            </span>
            <span className="hidden sm:inline-block font-mono text-[11px] text-text-muted">
              | 24/7 High-Density Workspace & Artisanal Roastery
            </span>
          </div>

          {/* Main Hero Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Editorial Column */}
            <div className="lg:col-span-6 space-y-6 relative z-10">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.15] font-heading">
                  <span className="inline">Where Specialty Brew </span>
                  <span className="bg-gradient-to-r from-cream-beige via-primary to-accent-amber bg-clip-text text-transparent inline-block">
                    Meets Digital Craft.
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-text-muted max-w-xl leading-relaxed font-body">
                  Surabaya&apos;s 24/7 nexus for artisanal single-origin coffees, gigabit mesh networking, and inspiring coworking spaces engineered for creators, engineers, and night owls.
                </p>
              </div>

              {/* Dual CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/menu"
                  className="group relative inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-gradient-to-r from-brand-coffee via-secondary-container to-accent-amber text-canvas-obsidian font-bold text-base shadow-[0_8px_32px_-4px_rgba(245,158,11,0.35)] hover:shadow-[0_12px_40px_-2px_rgba(245,158,11,0.55)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Coffee className="w-5 h-5 text-current shrink-0" />
                  <span>Order for Pickup / Table</span>
                </Link>
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2.5 px-6 py-4 rounded-xl bg-surface-card/80 hover:bg-surface-container border border-border-subtle hover:border-primary/40 text-text-primary font-semibold text-base backdrop-blur-md transition-all"
                >
                  <Briefcase className="w-5 h-5 text-cream-beige shrink-0" />
                  <span>Book Workspace / VIP</span>
                </Link>
              </div>

              {/* Mini Stats Row */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border-subtle">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                    0.8<span className="text-accent-amber text-xl">ms</span>
                  </p>
                  <p className="font-mono text-[11px] text-text-muted uppercase tracking-wider mt-0.5">
                    WiFi Mesh Latency
                  </p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                    18<span className="text-primary text-xl">h</span>
                  </p>
                  <p className="font-mono text-[11px] text-text-muted uppercase tracking-wider mt-0.5">
                    Cold Drip Extraction
                  </p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                    365<span className="text-accent-amber text-xl">+</span>
                  </p>
                  <p className="font-mono text-[11px] text-text-muted uppercase tracking-wider mt-0.5">
                    Days Nonstop Ops
                  </p>
                </div>
              </div>
            </div>

            {/* Right Asymmetric Image Composition */}
            <div className="lg:col-span-6 relative mt-6 lg:mt-0">
              <div className="relative w-full h-[460px] sm:h-[520px]">
                {/* Main Tech/Coworking Ambient Image */}
                <div className="absolute top-0 right-0 w-[86%] h-[380px] rounded-2xl overflow-hidden shadow-2xl border border-border-subtle bg-surface-card">
                  <Image
                    src="/images/darmo-interior.png"
                    alt="Spacious interior of Warkop Ya'reh featuring tech workers and warm ambient lighting"
                    fill
                    sizes="(min-width: 1024px) 43vw, 86vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas-obsidian/90 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <span className="font-mono text-xs text-cream-beige bg-canvas-obsidian/80 backdrop-blur-md px-3 py-1 rounded-lg border border-border-subtle">
                      Darmo Flagship • Floor 1 Quiet Zone
                    </span>
                    <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30">
                      98% Quiet Index
                    </span>
                  </div>
                </div>

                {/* Overlapping Drink Showcase (Cold Brew Aren Brulee) */}
                <div className="absolute -bottom-4 left-0 w-[65%] sm:w-[56%] h-[240px] rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.8)] border border-accent-amber/30 bg-surface-card group hover:scale-[1.03] transition-transform duration-500">
                  <Image
                    src="/images/cold-brew-aren-brulee.png"
                    alt="Signature Cold Brew Aren Brulee"
                    fill
                    sizes="(min-width: 1024px) 28vw, (min-width: 640px) 56vw, 65vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas-obsidian/95 via-canvas-obsidian/40 to-transparent" />
                  <div className="absolute bottom-3 left-3.5 right-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-accent-amber bg-accent-amber/15 px-2 py-0.5 rounded border border-accent-amber/30 uppercase tracking-wider font-semibold">
                        Signature Drop
                      </span>
                      <span className="font-mono text-xs text-text-primary font-bold">Rp 32.000</span>
                    </div>
                    <p className="font-bold text-sm text-text-primary mt-1">Cold Brew Aren Brulee</p>
                    <p className="text-[11px] text-text-muted truncate">
                      Caramelized torch palm nectar × 18h slow drip
                    </p>
                  </div>
                </div>

                {/* Floating Glass Metric Badges */}
                <div className="absolute top-4 left-0 backdrop-blur-xl bg-surface-secondary/90 border border-border-subtle p-3 rounded-xl shadow-xl flex items-center gap-2.5">
                  <Coffee className="w-5 h-5 text-accent-amber shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-text-primary">100% Single Origin</p>
                    <p className="font-mono text-[10px] text-text-muted">Sumatra Gayo • Ijen Highland</p>
                  </div>
                </div>

                <div className="absolute top-44 -right-2 backdrop-blur-xl bg-surface-card/90 border border-border-subtle p-3 rounded-xl shadow-xl flex items-center gap-2.5">
                  <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-text-primary">Gigabit Mesh Fiber</p>
                    <p className="font-mono text-[10px] text-emerald-400">99.9% Redundant Uptime</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: LIVE SANCTUARY FOOTFALL & TELEMETRY
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 w-full py-12 bg-surface-secondary border-y border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="relative z-10">
              <div className="flex items-center gap-2 font-mono text-xs text-accent-amber uppercase tracking-wider mb-1">
                <Radio className="w-4 h-4 text-accent-amber shrink-0" />
                <span>Live Operational Telemetry</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight font-heading">
                Real-Time Sanctuary Status
              </h2>
            </div>
            {/* Branch Switcher */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-canvas-obsidian border border-border-subtle self-start md:self-auto">
              <button
                onClick={() => setSelectedBranch("darmo")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedBranch === "darmo"
                    ? "bg-brand-coffee text-white shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Darmo Flagship (SBY)
              </button>
              <button
                onClick={() => setSelectedBranch("gubeng")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedBranch === "gubeng"
                    ? "bg-brand-coffee text-white shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Gubeng Sanctuary (SBY)
              </button>
            </div>
          </div>

          {/* Telemetry Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-text-muted mb-3">
                <span className="text-xs font-medium uppercase tracking-wider">Desks Occupancy</span>
                <Briefcase className="w-5 h-5 text-accent-amber shrink-0" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-text-primary font-mono">
                  {selectedBranch === "darmo" ? "42/65" : "31/48"}
                </p>
                <div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-accent-amber h-full rounded-full"
                    style={{ width: selectedBranch === "darmo" ? "64%" : "64%" }}
                  />
                </div>
              </div>
              <span className="text-[11px] text-text-muted mt-3">23 Available seats right now</span>
            </div>

            <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-text-muted mb-3">
                <span className="text-xs font-medium uppercase tracking-wider">Active Barista Queue</span>
                <Coffee className="w-5 h-5 text-primary shrink-0" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-text-primary font-mono">
                  {selectedBranch === "darmo" ? "3.8" : "2.4"}
                  <span className="text-sm font-normal text-text-muted ml-1">mins</span>
                </p>
                <span className="inline-flex items-center gap-1 mt-2 text-[11px] text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Optimal extraction speed
                </span>
              </div>
              <span className="text-[11px] text-text-muted mt-3">3 Baristas on active shift</span>
            </div>

            <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-text-muted mb-3">
                <span className="text-xs font-medium uppercase tracking-wider">Redundant Mesh ISP</span>
                <Wifi className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-emerald-400 font-mono">940</p>
                <p className="text-xs text-text-muted mt-1 font-mono">Mbps Symmetrical Up/Down</p>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono mt-3">0.8ms Jitter Nominal</span>
            </div>

            <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-text-muted mb-3">
                <span className="text-xs font-medium uppercase tracking-wider">Current Ambience</span>
                <Thermometer className="w-5 h-5 text-cream-beige shrink-0" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-text-primary font-mono">22.4°C</p>
                <p className="text-xs text-text-muted mt-1">Quiet Deep Work Mode (Lo-Fi)</p>
              </div>
              <span className="text-[11px] text-cream-beige font-mono mt-3">Air Filter AQI: 12 (Pristine)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3: SPECIALTY ROASTERY & BREW HIGHLIGHTS
          ══════════════════════════════════════════════════════════════ */}
      <section className="w-full py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="font-mono text-xs text-accent-amber uppercase tracking-wider">
                Single Origin & Artisanal Drops
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mt-1 font-heading">
                Curated Coffee & Heritage Eats
              </h2>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent-amber transition-colors"
            >
              <span>Explore Complete 48+ Item Menu</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
          </div>

          {/* Products Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Cold Brew Aren Brulee */}
            <div className="group rounded-2xl bg-surface-card border border-border-subtle overflow-hidden hover:border-accent-amber/40 transition-all">
              <div className="relative h-64 w-full bg-surface-secondary">
                <Image
                  src="/images/cold-brew-aren-brulee.png"
                  alt="Cold Brew Aren Brulee"
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-canvas-obsidian/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-accent-amber uppercase tracking-wider border border-accent-amber/30">
                  Signature Drop
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-text-primary font-heading">Cold Brew Aren Brulee</h3>
                  <span className="font-mono font-bold text-base text-accent-amber">Rp 32.000</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed font-body">
                  Single-origin Sumatra Gayo 18h slow drip with torch-caramelized organic palm sugar and silky sea salt foam.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-cream-beige">Notes: Dark Choco, Brown Butter</span>
                  <Link
                    href="/menu"
                    className="p-2 rounded-xl bg-surface-container hover:bg-brand-coffee text-text-primary transition-colors inline-flex items-center justify-center"
                    aria-label="Order Cold Brew"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 2: Artisan Iced Matcha Pandan Latte */}
            <div className="group rounded-2xl bg-surface-card border border-border-subtle overflow-hidden hover:border-accent-amber/40 transition-all">
              <div className="relative h-64 w-full bg-surface-secondary">
                <Image
                  src="/images/matcha-pandan-latte.png"
                  alt="Iced Matcha Pandan Latte"
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-canvas-obsidian/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider border border-emerald-500/30">
                  Artisanal Pastry Pair
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-text-primary font-heading">Iced Matcha Pandan Latte</h3>
                  <span className="font-mono font-bold text-base text-accent-amber">Rp 35.000</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed font-body">
                  Ceremonial Uji matcha whisked fresh with homemade fragrant Suji-Pandan reduction and creamy oat milk.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-cream-beige">Notes: Umami, Pandan Aroma</span>
                  <Link
                    href="/menu"
                    className="p-2 rounded-xl bg-surface-container hover:bg-brand-coffee text-text-primary transition-colors inline-flex items-center justify-center"
                    aria-label="Order Matcha Latte"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 3: Artisan Toasted Sourdough */}
            <div className="group rounded-2xl bg-surface-card border border-border-subtle overflow-hidden hover:border-accent-amber/40 transition-all">
              <div className="relative h-64 w-full bg-surface-secondary">
                <Image
                  src="/images/artisan-toasted-sourdough.png"
                  alt="Artisan Toasted Sourdough"
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-canvas-obsidian/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-primary uppercase tracking-wider border border-primary/30">
                  Midnight Fuel
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-text-primary font-heading">Artisan Toasted Sourdough</h3>
                  <span className="font-mono font-bold text-base text-accent-amber">Rp 28.000</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed font-body">
                  Fermented 36-hour country sourdough grilled with artisan cultured butter, kaya jam, and soft-boiled omega eggs.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-cream-beige">Heritage Surabaya Pairing</span>
                  <Link
                    href="/menu"
                    className="p-2 rounded-xl bg-surface-container hover:bg-brand-coffee text-text-primary transition-colors inline-flex items-center justify-center"
                    aria-label="Order Sourdough"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4: HIGH-DENSITY COWORKING SANCTUARY
          ══════════════════════════════════════════════════════════════ */}
      <section className="w-full py-20 bg-surface-secondary border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="font-mono text-xs text-accent-amber uppercase tracking-wider">
                Workplace Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight leading-tight font-heading">
                Engineered for 12-Hour Focus Sprints & Hackathons.
              </h2>
              <p className="text-sm sm:text-base text-text-muted leading-relaxed font-body">
                Whether you need acoustic silence for deep code architecture, a high-spec meeting suite for client pitches, or a vibrant coffeehouse buzz for brainstorming, our sanctuary delivers.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-card border border-border-subtle/80">
                  <Headphones className="w-5 h-5 text-accent-amber shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-text-primary font-heading">Acoustic Quiet Pods</h4>
                    <p className="text-xs text-text-muted mt-0.5 font-body">
                      Sub-35dB silent zone with ergonomic Herman Miller seating and dedicated power nodes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-card border border-border-subtle/80">
                  <Tv className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-text-primary font-heading">VIP Boardrooms & Suites</h4>
                    <p className="text-xs text-text-muted mt-0.5 font-body">
                      Seats 10–14 pax with 4K AirPlay presentation display, dedicated barista button, and glass whiteboard.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-card border border-border-subtle/80">
                  <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-text-primary font-heading">Redundant Power & Fiber</h4>
                    <p className="text-xs text-text-muted mt-0.5 font-body">
                      Zero blackouts with online UPS + automatic backup generator and dual-WAN gigabit mesh.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-surface-card hover:bg-surface-container border border-border-subtle hover:border-accent-amber/40 text-text-primary text-sm font-semibold transition-all"
                >
                  <Calendar className="w-4 h-4 text-accent-amber shrink-0" />
                  <span>Reserve Table or Meeting Suite</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="relative w-full h-[480px] rounded-2xl overflow-hidden border border-border-subtle bg-surface-card shadow-2xl">
                <Image
                  src="/images/hero/hero-coffee.png"
                  alt="Warkop Ya'reh Coworking Environment"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-canvas-obsidian via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl bg-canvas-obsidian/85 backdrop-blur-xl border border-border-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-accent-amber font-bold">
                      FLAGSHIP DARMO • TECH FLOOR
                    </span>
                    <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                      Open 24/7
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-body">
                    Over 65 high-density workstation desks equipped with dual international AC sockets, USB-C PD 100W, and low-latency Wi-Fi 6.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5: KAWAN YA'REH GAMIFIED LOYALTY TEASER
          ══════════════════════════════════════════════════════════════ */}
      <section className="w-full py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-coffee/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-surface-card to-surface-secondary border border-border-subtle p-8 sm:p-12 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-amber/15 text-accent-amber text-xs font-mono font-semibold">
                  <Award className="w-4 h-4 text-accent-amber shrink-0" />
                  <span>KAWAN YA&apos;REH LOYALTY PRIVILEGE</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight font-heading">
                  Sip, Code, and Level Up to Obsidian Elite.
                </h2>
                <p className="text-sm sm:text-base text-text-muted max-w-lg leading-relaxed font-body">
                  Earn points on every espresso drop, unlock 1.5x weekend multipliers, complete midnight coding streaks, and redeem artisan single-origin bags.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    href="/loyalty"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-coffee to-secondary-container hover:from-primary hover:to-accent-amber text-text-primary font-bold text-sm shadow-lg shadow-accent-amber/20"
                  >
                    <span>Explore Rewards & Quests</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Link>
                  <span className="font-mono text-xs text-text-muted">
                    Join over 2,400+ registered Surabaya patrons
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center">
                {/* Visual Loyalty Card Mockup */}
                <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-surface-container via-surface-card to-canvas-obsidian border border-accent-amber/30 p-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent-amber/10 blur-2xl rounded-full" />
                  <div className="flex items-center justify-between pb-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                        Membership Sanctuary
                      </span>
                      <span className="text-lg font-extrabold text-text-primary">Kawan Ya&apos;reh</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-accent-amber/20 text-accent-amber font-mono text-xs font-bold uppercase">
                      Gold Artisan
                    </span>
                  </div>
                  <div className="my-4">
                    <p className="font-mono text-xs text-text-muted">Active Points Balance</p>
                    <p className="text-3xl font-extrabold text-accent-amber font-mono mt-0.5">
                      1,450 <span className="text-xs text-primary">PTS</span>
                    </p>
                  </div>
                  <div className="pt-4 border-t border-border-subtle/80 flex items-center justify-between text-xs text-text-muted">
                    <span>Darmo Resident Patron</span>
                    <span className="font-mono text-text-primary">#YR-9821</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 6: SURABAYA COMMUNITY TEASER
          ══════════════════════════════════════════════════════════════ */}
      <section className="w-full py-20 bg-surface-secondary border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="font-mono text-xs text-accent-amber uppercase tracking-wider">
            Surabaya Builders & Creators Network
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight max-w-2xl mx-auto font-heading">
            Where Late-Night Ideas Become High-Growth Reality.
          </h2>
          <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto font-body">
            Connect with software engineers, indie makers, UI/UX designers, and coffee connoisseurs across Surabaya.
          </p>
          <div className="pt-4 flex flex-wrap justify-center items-center gap-4">
            <Link
              href="/community"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-surface-card hover:bg-surface-container border border-border-subtle hover:border-accent-amber/40 text-text-primary font-semibold text-sm transition-all"
            >
              <Users className="w-4 h-4 text-accent-amber shrink-0" />
              <span>Join Community Space</span>
            </Link>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-coffee to-secondary-container text-canvas-obsidian font-bold text-sm shadow-md transition-all"
            >
              <CalendarDays className="w-4 h-4 shrink-0" />
              <span>View Upcoming Meetups</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
