"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const [selectedBranch, setSelectedBranch] = useState<"darmo" | "gubeng">("darmo");

  return (
    <div className="flex flex-col w-full bg-[#0a0a0c] text-[#e5e1e4] overflow-hidden">
      {/* ══════════════════════════════════════════════════════════════
          SECTION 1: MASTER HERO SECTION
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden pb-20 pt-10 md:pt-16">
        {/* Ambient Radial Mesh Layer */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#f59e0b]/15 via-[#9c6b3a]/10 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#ee9800]/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181c] border border-white/[0.08] shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f59e0b] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f59e0b]"></span>
              </span>
              <span className="font-mono text-[11px] text-[#e8c47a] uppercase tracking-wider font-semibold">
                Surabaya Flagship • Darmo Sanctuary
              </span>
            </span>
            <span className="hidden sm:inline-block font-mono text-[11px] text-[#94a3b8]">
              | 24/7 High-Density Workspace & Artisanal Roastery
            </span>
          </div>

          {/* Main Hero Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Editorial Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#f8fafc] leading-[1.1] font-sans">
                  Where Specialty Brew{" "}
                  <span className="bg-gradient-to-r from-[#e8c47a] via-[#f7bb82] to-[#f59e0b] bg-clip-text text-transparent">
                    Meets Digital Craft.
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-[#94a3b8] max-w-xl leading-relaxed">
                  Surabaya&apos;s 24/7 nexus for artisanal single-origin coffees, gigabit mesh networking, and inspiring coworking spaces engineered for creators, engineers, and night owls.
                </p>
              </div>

              {/* Dual CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/menu"
                  className="group relative inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-[#9c6b3a] via-[#ee9800] to-[#f59e0b] text-[#0a0a0c] font-bold text-base shadow-[0_8px_32px_-4px_rgba(245,158,11,0.35)] hover:shadow-[0_12px_40px_-2px_rgba(245,158,11,0.55)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[20px]">local_cafe</span>
                  <span>Order for Pickup / Table</span>
                </Link>
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-[#18181c]/80 hover:bg-[#201f21] border border-white/[0.08] hover:border-[#f7bb82]/40 text-[#f8fafc] font-semibold text-base backdrop-blur-md transition-all"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#e8c47a]">desk</span>
                  <span>Book Workspace / VIP</span>
                </Link>
              </div>

              {/* Mini Stats Row */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/[0.08]">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#f8fafc] tracking-tight">
                    0.8<span className="text-[#f59e0b] text-xl">ms</span>
                  </p>
                  <p className="font-mono text-[11px] text-[#94a3b8] uppercase tracking-wider mt-0.5">
                    WiFi Mesh Latency
                  </p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#f8fafc] tracking-tight">
                    18<span className="text-[#f7bb82] text-xl">h</span>
                  </p>
                  <p className="font-mono text-[11px] text-[#94a3b8] uppercase tracking-wider mt-0.5">
                    Cold Drip Extraction
                  </p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#f8fafc] tracking-tight">
                    365<span className="text-[#f59e0b] text-xl">+</span>
                  </p>
                  <p className="font-mono text-[11px] text-[#94a3b8] uppercase tracking-wider mt-0.5">
                    Days Nonstop Ops
                  </p>
                </div>
              </div>
            </div>

            {/* Right Asymmetric Image Composition */}
            <div className="lg:col-span-6 relative mt-6 lg:mt-0">
              <div className="relative w-full h-[460px] sm:h-[520px]">
                {/* Main Tech/Coworking Ambient Image */}
                <div className="absolute top-0 right-0 w-[86%] h-[380px] rounded-2xl overflow-hidden shadow-2xl border border-white/[0.08] bg-[#18181c]">
                  <Image
                    src="/images/darmo-interior.png"
                    alt="Spacious interior of Warkop Ya'reh featuring tech workers and warm ambient lighting"
                    fill
                    sizes="(min-width: 1024px) 43vw, 86vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c]/90 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <span className="font-mono text-xs text-[#e8c47a] bg-[#0a0a0c]/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/[0.08]">
                      Darmo Flagship • Floor 1 Quiet Zone
                    </span>
                    <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30">
                      98% Quiet Index
                    </span>
                  </div>
                </div>

                {/* Overlapping Drink Showcase (Cold Brew Aren Brulee) */}
                <div className="absolute -bottom-4 left-0 w-[65%] sm:w-[56%] h-[240px] rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.8)] border border-[#f59e0b]/30 bg-[#18181c] group hover:scale-[1.03] transition-transform duration-500">
                  <Image
                    src="/images/cold-brew-aren-brulee.png"
                    alt="Signature Cold Brew Aren Brulee"
                    fill
                    sizes="(min-width: 1024px) 28vw, (min-width: 640px) 56vw, 65vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c]/95 via-[#0a0a0c]/40 to-transparent" />
                  <div className="absolute bottom-3 left-3.5 right-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#f59e0b] bg-[#f59e0b]/15 px-2 py-0.5 rounded border border-[#f59e0b]/30 uppercase tracking-wider font-semibold">
                        Signature Drop
                      </span>
                      <span className="font-mono text-xs text-[#f8fafc] font-bold">Rp 32.000</span>
                    </div>
                    <p className="font-bold text-sm text-[#f8fafc] mt-1">Cold Brew Aren Brulee</p>
                    <p className="text-[11px] text-[#94a3b8] truncate">
                      Caramelized torch palm nectar × 18h slow drip
                    </p>
                  </div>
                </div>

                {/* Floating Glass Metric Badges */}
                <div className="absolute top-4 left-0 backdrop-blur-xl bg-[#111114]/90 border border-white/[0.08] p-3 rounded-xl shadow-xl flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#f59e0b] text-[20px]">
                    local_cafe
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#f8fafc]">100% Single Origin</p>
                    <p className="font-mono text-[10px] text-[#94a3b8]">Sumatra Gayo • Ijen Highland</p>
                  </div>
                </div>

                <div className="absolute top-44 -right-2 backdrop-blur-xl bg-[#18181c]/90 border border-white/[0.08] p-3 rounded-xl shadow-xl flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-emerald-400 text-[20px]">bolt</span>
                  <div>
                    <p className="text-xs font-bold text-[#f8fafc]">Gigabit Mesh Fiber</p>
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
      <section className="w-full py-12 bg-[#111114] border-y border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-[#f59e0b] uppercase tracking-wider mb-1">
                <span className="material-symbols-outlined text-[16px]">sensors</span>
                <span>Live Operational Telemetry</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#f8fafc] tracking-tight">
                Real-Time Sanctuary Status
              </h2>
            </div>
            {/* Branch Switcher */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0a0a0c] border border-white/[0.08] self-start md:self-auto">
              <button
                onClick={() => setSelectedBranch("darmo")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedBranch === "darmo"
                    ? "bg-[#9c6b3a] text-white shadow-sm"
                    : "text-[#94a3b8] hover:text-[#f8fafc]"
                }`}
              >
                Darmo Flagship (SBY)
              </button>
              <button
                onClick={() => setSelectedBranch("gubeng")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedBranch === "gubeng"
                    ? "bg-[#9c6b3a] text-white shadow-sm"
                    : "text-[#94a3b8] hover:text-[#f8fafc]"
                }`}
              >
                Gubeng Sanctuary (SBY)
              </button>
            </div>
          </div>

          {/* Telemetry Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#18181c] border border-white/[0.06] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#94a3b8] mb-3">
                <span className="text-xs font-medium uppercase tracking-wider">Desks Occupancy</span>
                <span className="material-symbols-outlined text-[#f59e0b] text-[20px]">desk</span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#f8fafc] font-mono">
                  {selectedBranch === "darmo" ? "42/65" : "31/48"}
                </p>
                <div className="w-full bg-[#201f21] h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#f7bb82] to-[#f59e0b] h-full rounded-full"
                    style={{ width: selectedBranch === "darmo" ? "64%" : "64%" }}
                  />
                </div>
              </div>
              <span className="text-[11px] text-[#94a3b8] mt-3">23 Available seats right now</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#18181c] border border-white/[0.06] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#94a3b8] mb-3">
                <span className="text-xs font-medium uppercase tracking-wider">Active Barista Queue</span>
                <span className="material-symbols-outlined text-[#f7bb82] text-[20px]">coffee_maker</span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#f8fafc] font-mono">
                  {selectedBranch === "darmo" ? "3.8" : "2.4"}
                  <span className="text-sm font-normal text-[#94a3b8] ml-1">mins</span>
                </p>
                <span className="inline-flex items-center gap-1 mt-2 text-[11px] text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Optimal extraction speed
                </span>
              </div>
              <span className="text-[11px] text-[#94a3b8] mt-3">3 Baristas on active shift</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#18181c] border border-white/[0.06] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#94a3b8] mb-3">
                <span className="text-xs font-medium uppercase tracking-wider">Redundant Mesh ISP</span>
                <span className="material-symbols-outlined text-emerald-400 text-[20px]">router</span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-emerald-400 font-mono">940</p>
                <p className="text-xs text-[#94a3b8] mt-1 font-mono">Mbps Symmetrical Up/Down</p>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono mt-3">0.8ms Jitter Nominal</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#18181c] border border-white/[0.06] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#94a3b8] mb-3">
                <span className="text-xs font-medium uppercase tracking-wider">Current Ambience</span>
                <span className="material-symbols-outlined text-[#e8c47a] text-[20px]">thermostat</span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#f8fafc] font-mono">22.4°C</p>
                <p className="text-xs text-[#94a3b8] mt-1">Quiet Deep Work Mode (Lo-Fi)</p>
              </div>
              <span className="text-[11px] text-[#e8c47a] font-mono mt-3">Air Filter AQI: 12 (Pristine)</span>
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
              <span className="font-mono text-xs text-[#f59e0b] uppercase tracking-wider">
                Single Origin & Artisanal Drops
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#f8fafc] tracking-tight mt-1">
                Curated Coffee & Heritage Eats
              </h2>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#f7bb82] hover:text-[#f59e0b] transition-colors"
            >
              <span>Explore Complete 48+ Item Menu</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          {/* Products Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Cold Brew Aren Brulee */}
            <div className="group rounded-2xl bg-[#18181c] border border-white/[0.08] overflow-hidden hover:border-[#f59e0b]/40 transition-all">
              <div className="relative h-64 w-full bg-[#111114]">
                <Image
                  src="/images/cold-brew-aren-brulee.png"
                  alt="Cold Brew Aren Brulee"
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#0a0a0c]/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-[#f59e0b] uppercase tracking-wider border border-[#f59e0b]/30">
                  Signature Drop
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-[#f8fafc]">Cold Brew Aren Brulee</h3>
                  <span className="font-mono font-bold text-base text-[#f59e0b]">Rp 32.000</span>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Single-origin Sumatra Gayo 18h slow drip with torch-caramelized organic palm sugar and silky sea salt foam.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-[#e8c47a]">Notes: Dark Choco, Brown Butter</span>
                  <Link
                    href="/menu"
                    className="p-2 rounded-xl bg-[#201f21] hover:bg-[#9c6b3a] text-[#f8fafc] transition-colors"
                    aria-label="Order Cold Brew"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 2: Artisan Iced Matcha Pandan Latte */}
            <div className="group rounded-2xl bg-[#18181c] border border-white/[0.08] overflow-hidden hover:border-[#f59e0b]/40 transition-all">
              <div className="relative h-64 w-full bg-[#111114]">
                <Image
                  src="/images/matcha-pandan-latte.png"
                  alt="Iced Matcha Pandan Latte"
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#0a0a0c]/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider border border-emerald-500/30">
                  Artisanal Pastry Pair
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-[#f8fafc]">Iced Matcha Pandan Latte</h3>
                  <span className="font-mono font-bold text-base text-[#f59e0b]">Rp 35.000</span>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Ceremonial Uji matcha whisked fresh with homemade fragrant Suji-Pandan reduction and creamy oat milk.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-[#e8c47a]">Notes: Umami, Pandan Aroma</span>
                  <Link
                    href="/menu"
                    className="p-2 rounded-xl bg-[#201f21] hover:bg-[#9c6b3a] text-[#f8fafc] transition-colors"
                    aria-label="Order Matcha Latte"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 3: Artisan Toasted Sourdough */}
            <div className="group rounded-2xl bg-[#18181c] border border-white/[0.08] overflow-hidden hover:border-[#f59e0b]/40 transition-all">
              <div className="relative h-64 w-full bg-[#111114]">
                <Image
                  src="/images/artisan-toasted-sourdough.png"
                  alt="Artisan Toasted Sourdough"
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#0a0a0c]/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-[#f7bb82] uppercase tracking-wider border border-[#f7bb82]/30">
                  Midnight Fuel
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-[#f8fafc]">Artisan Toasted Sourdough</h3>
                  <span className="font-mono font-bold text-base text-[#f59e0b]">Rp 28.000</span>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Fermented 36-hour country sourdough grilled with artisan cultured butter, kaya jam, and soft-boiled omega eggs.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-[#e8c47a]">Heritage Surabaya Pairing</span>
                  <Link
                    href="/menu"
                    className="p-2 rounded-xl bg-[#201f21] hover:bg-[#9c6b3a] text-[#f8fafc] transition-colors"
                    aria-label="Order Sourdough"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
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
      <section className="w-full py-20 bg-[#111114] border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="font-mono text-xs text-[#f59e0b] uppercase tracking-wider">
                Workplace Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#f8fafc] tracking-tight leading-tight">
                Engineered for 12-Hour Focus Sprints & Hackathons.
              </h2>
              <p className="text-sm sm:text-base text-[#94a3b8] leading-relaxed">
                Whether you need acoustic silence for deep code architecture, a high-spec meeting suite for client pitches, or a vibrant coffeehouse buzz for brainstorming, our sanctuary delivers.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#18181c] border border-white/[0.06]">
                  <span className="material-symbols-outlined text-[#f59e0b] text-[22px] mt-0.5">
                    headphones
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#f8fafc]">Acoustic Quiet Pods</h4>
                    <p className="text-xs text-[#94a3b8] mt-0.5">
                      Sub-35dB silent zone with ergonomic Herman Miller seating and dedicated power nodes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#18181c] border border-white/[0.06]">
                  <span className="material-symbols-outlined text-[#f7bb82] text-[22px] mt-0.5">
                    tv
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#f8fafc]">VIP Boardrooms & Suites</h4>
                    <p className="text-xs text-[#94a3b8] mt-0.5">
                      Seats 10–14 pax with 4K AirPlay presentation display, dedicated barista button, and glass whiteboard.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#18181c] border border-white/[0.06]">
                  <span className="material-symbols-outlined text-emerald-400 text-[22px] mt-0.5">
                    electric_bolt
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#f8fafc]">Redundant Power & Fiber</h4>
                    <p className="text-xs text-[#94a3b8] mt-0.5">
                      Zero blackouts with online UPS + automatic backup generator and dual-WAN gigabit mesh.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#18181c] hover:bg-[#201f21] border border-white/[0.08] hover:border-[#f59e0b]/40 text-[#f8fafc] text-sm font-semibold transition-all"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#f59e0b]">
                    calendar_month
                  </span>
                  <span>Reserve Table or Meeting Suite</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="relative w-full h-[480px] rounded-2xl overflow-hidden border border-white/[0.08] bg-[#18181c] shadow-2xl">
                <Image
                  src="/images/hero/hero-coffee.png"
                  alt="Warkop Ya'reh Coworking Environment"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl bg-[#0a0a0c]/85 backdrop-blur-xl border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-[#f59e0b] font-bold">
                      FLAGSHIP DARMO • TECH FLOOR
                    </span>
                    <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                      Open 24/7
                    </span>
                  </div>
                  <p className="text-xs text-[#d5c3b6]">
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#9c6b3a]/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-[#18181c] to-[#111114] border border-white/[0.08] p-8 sm:p-12 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] text-xs font-mono font-semibold">
                  <span className="material-symbols-outlined text-[16px]">military_tech</span>
                  <span>KAWAN YA&apos;REH LOYALTY PRIVILEGE</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#f8fafc] tracking-tight">
                  Sip, Code, and Level Up to Obsidian Elite.
                </h2>
                <p className="text-sm sm:text-base text-[#94a3b8] max-w-lg leading-relaxed">
                  Earn points on every espresso drop, unlock 1.5x weekend multipliers, complete midnight coding streaks, and redeem artisan single-origin bags.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    href="/loyalty"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#ee9800] hover:from-[#b57d44] hover:to-[#f59e0b] text-[#f8fafc] font-bold text-sm shadow-lg shadow-[#f59e0b]/20"
                  >
                    <span>Explore Rewards & Quests</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                  <span className="font-mono text-xs text-[#94a3b8]">
                    Join over 2,400+ registered Surabaya patrons
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center">
                {/* Visual Loyalty Card Mockup */}
                <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-[#201f21] via-[#18181c] to-[#0a0a0c] border border-[#f59e0b]/30 p-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#f59e0b]/10 blur-2xl rounded-full" />
                  <div className="flex items-center justify-between pb-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-[#94a3b8] uppercase tracking-widest">
                        Membership Sanctuary
                      </span>
                      <span className="text-lg font-extrabold text-[#f8fafc]">Kawan Ya&apos;reh</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-[#f59e0b]/20 text-[#f59e0b] font-mono text-xs font-bold uppercase">
                      Gold Artisan
                    </span>
                  </div>
                  <div className="my-4">
                    <p className="font-mono text-xs text-[#94a3b8]">Active Points Balance</p>
                    <p className="text-3xl font-extrabold text-[#f59e0b] font-mono mt-0.5">
                      1,450 <span className="text-xs text-[#f7bb82]">PTS</span>
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#94a3b8]">
                    <span>Darmo Resident Patron</span>
                    <span className="font-mono text-[#f8fafc]">#YR-9821</span>
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
      <section className="w-full py-20 bg-[#111114] border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="font-mono text-xs text-[#f59e0b] uppercase tracking-wider">
            Surabaya Builders & Creators Network
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#f8fafc] tracking-tight max-w-2xl mx-auto">
            Where Late-Night Ideas Become High-Growth Reality.
          </h2>
          <p className="text-sm sm:text-base text-[#94a3b8] max-w-xl mx-auto">
            Connect with software engineers, indie makers, UI/UX designers, and coffee connoisseurs across Surabaya.
          </p>
          <div className="pt-4 flex flex-wrap justify-center items-center gap-4">
            <Link
              href="/community"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#18181c] hover:bg-[#201f21] border border-white/[0.08] hover:border-[#f59e0b]/40 text-[#f8fafc] font-semibold text-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px] text-[#f59e0b]">groups</span>
              <span>Join Community Space</span>
            </Link>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#ee9800] text-[#0a0a0c] font-bold text-sm shadow-md transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">event</span>
              <span>View Upcoming Meetups</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
