"use client";

import React, { useState } from "react";

type BranchScope = "consolidated" | "darmo" | "gubeng";

export default function ExecutiveOperationsAnalyticsPage() {
  const [period, setPeriod] = useState<"today" | "7d" | "mtd" | "custom">("7d");
  const [selectedBranch, setSelectedBranch] = useState<BranchScope>("consolidated");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f8fafc] font-sans">
      {/* ══════════════════════════════════════════════════════════════
          TOP OPERATIONAL AUDIT BANNER
          ══════════════════════════════════════════════════════════════ */}
      <div className="bg-[#111114] border-b border-white/[0.06] px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
              AUDIT ENGINE ACTIVE
            </span>
            <span className="text-[#94a3b8] hidden sm:inline text-[11px]">
              Telemetry sync: Node-ID #SBY-DRM-01 &amp; #SBY-GBG-02 consolidated
            </span>
          </div>
          <div className="flex items-center gap-4 text-[#94a3b8] text-[11px]">
            <span>
              Dual-WAN Gigabit Fiber: <strong className="text-[#f7bb82]">940 Mbps (Nominal)</strong>
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">
              Shift Manager: <strong className="text-white">Agung W. (Darmo 24H)</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ══════════════════════════════════════════════════════════════
            HEADER & INTERACTIVE COMMAND TOOLBAR
            ══════════════════════════════════════════════════════════════ */}
        <section className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">monitoring</span>
                <span>Executive Intelligence • Real-Time Audit</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f8fafc] tracking-tight">
                Enterprise Operations &amp; Revenue Analytics
              </h1>
              <p className="text-sm text-[#94a3b8] max-w-3xl">
                Consolidated operational telemetry, bean extraction yield, and patron footfall across Darmo Flagship
                &amp; Gubeng 24H sanctuaries.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Refresh Feed */}
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#18181c] border border-white/[0.08] hover:bg-[#201f21] transition-colors text-white text-xs font-bold shadow-sm"
              >
                <span
                  className={`material-symbols-outlined text-[18px] text-[#f59e0b] ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                >
                  sync
                </span>
                <span>Refresh Feed</span>
              </button>

              {/* Export Ledger */}
              <div className="relative inline-block text-left">
                <button
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9c6b3a] hover:bg-[#825426] text-white text-xs font-bold transition-all shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Export Ledger</span>
                  <span className="material-symbols-outlined text-[14px]">expand_more</span>
                </button>

                {exportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#18181c] border border-white/[0.08] shadow-2xl p-1.5 z-30 space-y-1">
                    <button
                      onClick={() => {
                        setExportMenuOpen(false);
                        alert("Exporting CSV Financial Raw...");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left text-white hover:bg-[#201f21]"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#f59e0b]">description</span> CSV
                      Financial Raw
                    </button>
                    <button
                      onClick={() => {
                        setExportMenuOpen(false);
                        alert("Exporting Executive PDF Summary...");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left text-white hover:bg-[#201f21]"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#f7bb82]">picture_as_pdf</span>{" "}
                      Executive PDF Summary
                    </button>
                    <button
                      onClick={() => {
                        setExportMenuOpen(false);
                        alert("Exporting JSON Telemetry Stream...");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left text-white hover:bg-[#201f21]"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#ffb95f]">database</span> JSON
                      Telemetry Stream
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Segmented Controls & Context Bar */}
          <div className="p-2 rounded-xl bg-[#18181c] border border-white/[0.08] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Date Segmented Pills */}
            <div className="flex items-center p-1 rounded-lg bg-[#0a0a0c] gap-1 overflow-x-auto">
              {(["today", "7d", "mtd", "custom"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                    period === p
                      ? "bg-[#201f21] text-[#f59e0b] shadow-sm border border-white/[0.06]"
                      : "text-[#94a3b8] hover:text-white"
                  }`}
                >
                  {p === "today" ? "Today" : p === "7d" ? "Last 7 Days" : p === "mtd" ? "Month to Date" : "Custom Range"}
                </button>
              ))}
            </div>

            {/* Branch Selector & Real-Time Pulse */}
            <div className="flex flex-wrap items-center gap-4 justify-between md:justify-end px-2">
              <div className="flex items-center gap-2 bg-[#111114] border border-white/[0.06] px-3 py-1.5 rounded-lg">
                <span className="material-symbols-outlined text-[16px] text-[#f7bb82]">storefront</span>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value as BranchScope)}
                  className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                >
                  <option className="bg-[#18181c] text-white" value="consolidated">
                    All Sanctuaries (Consolidated)
                  </option>
                  <option className="bg-[#18181c] text-white" value="darmo">
                    Darmo Flagship (Central 24H)
                  </option>
                  <option className="bg-[#18181c] text-white" value="gubeng">
                    Gubeng Annex (Creative Hub)
                  </option>
                </select>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] text-[#94a3b8]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f59e0b] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f59e0b]" />
                </span>
                <span>Live Engine • Synced 12s ago</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            EXECUTIVE KPI GRID (4 Columns)
            ══════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Gross Revenue */}
          <div className="bg-[#18181c] border border-white/[0.08] rounded-2xl p-5 shadow-lg space-y-3 hover:border-white/[0.14] transition-all">
            <div className="flex items-start justify-between">
              <span className="text-xs text-[#94a3b8] uppercase tracking-wider font-semibold">Gross Revenue</span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-full bg-[#111114] text-[#f7bb82]">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> +14.2%
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#f8fafc] tracking-tight">Rp 48.250.000</div>
              <div className="font-mono text-xs text-[#94a3b8] mt-1">
                Daily target: <span className="text-white font-semibold">Rp 45.000.000</span>{" "}
                <span className="text-[#f59e0b]">(107.2%)</span>
              </div>
            </div>
            {/* Sparkline SVG */}
            <div className="pt-2">
              <svg className="w-full h-10 overflow-visible" preserveAspectRatio="none" viewBox="0 0 160 40">
                <defs>
                  <linearGradient id="gradRev" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M0,32 Q25,28 45,22 T90,26 T130,12 L160,6 L160,40 L0,40 Z" fill="url(#gradRev)" />
                <path
                  d="M0,32 Q25,28 45,22 T90,26 T130,12 L160,6"
                  fill="none"
                  stroke="#f59e0b"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
                <circle cx="160" cy="6" fill="#f59e0b" r="3.5" />
              </svg>
            </div>
          </div>

          {/* KPI 2: Total Orders */}
          <div className="bg-[#18181c] border border-white/[0.08] rounded-2xl p-5 shadow-lg space-y-3 hover:border-white/[0.14] transition-all">
            <div className="flex items-start justify-between">
              <span className="text-xs text-[#94a3b8] uppercase tracking-wider font-semibold">Orders Processed</span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-full bg-[#111114] text-[#f7bb82]">
                <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span> +8.4%
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#f8fafc] tracking-tight">1.280 Orders</div>
              <div className="font-mono text-xs text-[#94a3b8] mt-1">
                Avg Ticket: <span className="text-white font-semibold">Rp 37.695</span> / patron
              </div>
            </div>
            <div className="pt-2">
              <svg className="w-full h-10 overflow-visible" preserveAspectRatio="none" viewBox="0 0 160 40">
                <defs>
                  <linearGradient id="gradOrders" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f7bb82" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#f7bb82" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M0,30 Q30,34 60,20 T110,18 T140,8 L160,10 L160,40 L0,40 Z" fill="url(#gradOrders)" />
                <path
                  d="M0,30 Q30,34 60,20 T110,18 T140,8 L160,10"
                  fill="none"
                  stroke="#f7bb82"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
                <circle cx="160" cy="10" fill="#f7bb82" r="3.5" />
              </svg>
            </div>
          </div>

          {/* KPI 3: Loyalty Retention */}
          <div className="bg-[#18181c] border border-white/[0.08] rounded-2xl p-5 shadow-lg space-y-3 hover:border-white/[0.14] transition-all">
            <div className="flex items-start justify-between">
              <span className="text-xs text-[#94a3b8] uppercase tracking-wider font-semibold">Patron Retention</span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-full bg-[#111114] text-[#f59e0b]">
                <span className="material-symbols-outlined text-[14px]">military_tech</span> Gold +120
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#f8fafc] tracking-tight">68.4% Repeat</div>
              <div className="font-mono text-xs text-[#94a3b8] mt-1">
                Active Patrons: <span className="text-white font-semibold">2,420</span> • 34.2k burn
              </div>
            </div>
            <div className="pt-2">
              <svg className="w-full h-10 overflow-visible" preserveAspectRatio="none" viewBox="0 0 160 40">
                <defs>
                  <linearGradient id="gradLoyalty" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#e6c278" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#e6c278" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M0,25 Q35,28 70,16 T120,20 T150,8 L160,4 L160,40 L0,40 Z" fill="url(#gradLoyalty)" />
                <path
                  d="M0,25 Q35,28 70,16 T120,20 T150,8 L160,4"
                  fill="none"
                  stroke="#e6c278"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
                <circle cx="160" cy="4" fill="#e6c278" r="3.5" />
              </svg>
            </div>
          </div>

          {/* KPI 4: Kitchen SLA Speed */}
          <div className="bg-[#18181c] border border-white/[0.08] rounded-2xl p-5 shadow-lg space-y-3 hover:border-white/[0.14] transition-all">
            <div className="flex items-start justify-between">
              <span className="text-xs text-[#94a3b8] uppercase tracking-wider font-semibold">Brew &amp; Toast SLA</span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-full bg-[#111114] text-emerald-400">
                <span className="material-symbols-outlined text-[14px]">bolt</span> -1.2m Fast
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#f8fafc] tracking-tight">5.8 mins</div>
              <div className="font-mono text-xs text-[#94a3b8] mt-1">
                <span className="text-white font-semibold">94.2%</span> &lt;8 min SLA • Overdue:{" "}
                <span className="text-[#94a3b8]">0.8%</span>
              </div>
            </div>
            <div className="pt-2">
              <svg className="w-full h-10 overflow-visible" preserveAspectRatio="none" viewBox="0 0 160 40">
                <defs>
                  <linearGradient id="gradSLA" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ffb95f" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#ffb95f" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M0,10 Q30,16 65,22 T115,26 T145,30 L160,32 L160,40 L0,40 Z" fill="url(#gradSLA)" />
                <path
                  d="M0,10 Q30,16 65,22 T115,26 T145,30 L160,32"
                  fill="none"
                  stroke="#ffb95f"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
                <circle cx="160" cy="32" fill="#ffb95f" r="3.5" />
              </svg>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            VISUAL STORYTELLING: EXTRACTION TELEMETRY & SHIFT LEAD
            ══════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden min-h-[220px] bg-[#111114] border border-white/[0.08] flex flex-col justify-end p-6 sm:p-8 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#18181c]/80 to-transparent" />
            <div className="relative z-10 space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] font-mono text-[11px] backdrop-blur-md">
                <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                BATCH ROAST METRICS: 48h DEGASSING CYCLE COMPLETE
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#f8fafc]">
                Ijen Highland Single-Origin Extraction Telemetry
              </h2>
              <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                Darmo flagship pressure-profiling grinders maintain 9.2 bar steady state across 18.5g dry doses.
                Extraction total dissolved solids (TDS) tested at 1.38% optimum sweetness band.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#18181c] border border-white/[0.08] p-6 flex flex-col justify-between shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#f59e0b] uppercase font-semibold">Shift Performance</span>
                <span className="material-symbols-outlined text-[#f7bb82] text-[22px]">workspace_premium</span>
              </div>
              <h3 className="text-lg font-bold text-[#f8fafc]">Barista Maestro Shift</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Night squad lead barista Rian H. logged 340 consecutive pour-overs with 0.00% customer refactors.
              </p>
            </div>
            <div className="pt-4 mt-4 bg-[#111114] p-3.5 rounded-xl flex items-center justify-between border border-white/[0.04]">
              <div>
                <div className="font-mono text-[10px] text-[#94a3b8]">STEAM WAND TEMP</div>
                <div className="font-mono text-xs text-white font-bold">64.5°C Optimal Microfoam</div>
              </div>
              <span className="material-symbols-outlined text-[#f59e0b] text-[24px]">thermostat</span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            MAIN ANALYTICS SPLIT (60% / 40%)
            ══════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: 24-HOUR PEAK HOURS & FOOTFALL DYNAMICS */}
          <div className="lg:col-span-7 bg-[#18181c] border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#f8fafc]">Hourly Sales &amp; Footfall Dynamics</h3>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#111114] text-[#f7bb82] font-bold">
                    24H CYCLE
                  </span>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#9c6b3a]" />
                    <span className="text-[#94a3b8]">Revenue</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-[#f59e0b] rounded-full" />
                    <span className="text-[#94a3b8]">Headcount</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#94a3b8]">
                Comparative telemetry between revenue volume (bars) and patron headcount (curve).
              </p>
            </div>

            {/* Custom Multi-Bar SVG Visualization */}
            <div className="relative w-full overflow-x-auto py-2">
              <div className="min-w-[560px]">
                <svg className="w-full h-64" fill="none" viewBox="0 0 600 240">
                  {/* Gridlines */}
                  <line stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" x1="40" x2="590" y1="20" y2="20" />
                  <line stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" x1="40" x2="590" y1="70" y2="70" />
                  <line stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" x1="40" x2="590" y1="120" y2="120" />
                  <line stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" x1="40" x2="590" y1="170" y2="170" />
                  <line stroke="rgba(255,255,255,0.12)" x1="40" x2="590" y1="210" y2="210" />

                  {/* Y Axis Labels */}
                  <text className="text-[10px] fill-[#94a3b8] font-mono" textAnchor="end" x="32" y="24">
                    Rp 5M
                  </text>
                  <text className="text-[10px] fill-[#94a3b8] font-mono" textAnchor="end" x="32" y="74">
                    Rp 3.5M
                  </text>
                  <text className="text-[10px] fill-[#94a3b8] font-mono" textAnchor="end" x="32" y="124">
                    Rp 2M
                  </text>
                  <text className="text-[10px] fill-[#94a3b8] font-mono" textAnchor="end" x="32" y="174">
                    Rp 1M
                  </text>

                  {/* Peak Highlight Zones */}
                  <rect fill="#f59e0b" fillOpacity="0.06" height="195" rx="6" width="85" x="295" y="15" />
                  <text className="text-[9px] fill-[#f59e0b] font-mono font-bold" textAnchor="middle" x="337" y="12">
                    PEAK 1: COWORK
                  </text>

                  <rect fill="#f7bb82" fillOpacity="0.08" height="195" rx="6" width="145" x="440" y="15" />
                  <text className="text-[9px] fill-[#f7bb82] font-mono font-bold" textAnchor="middle" x="512" y="12">
                    PEAK 2: MIDNIGHT DEV SPRINT
                  </text>

                  {/* 24 Hour Bars */}
                  <rect fill="#9c6b3a" fillOpacity="0.7" height="65" rx="2" width="12" x="48" y="145" />
                  <rect fill="#9c6b3a" fillOpacity="0.6" height="50" rx="2" width="12" x="70" y="160" />
                  <rect fill="#9c6b3a" fillOpacity="0.5" height="35" rx="2" width="12" x="92" y="175" />
                  <rect fill="#9c6b3a" fillOpacity="0.4" height="30" rx="2" width="12" x="114" y="180" />
                  <rect fill="#9c6b3a" fillOpacity="0.5" height="40" rx="2" width="12" x="136" y="170" />
                  <rect fill="#9c6b3a" fillOpacity="0.7" height="60" rx="2" width="12" x="158" y="150" />
                  <rect fill="#9c6b3a" fillOpacity="0.8" height="80" rx="2" width="12" x="180" y="130" />
                  <rect fill="#9c6b3a" fillOpacity="0.85" height="95" rx="2" width="12" x="202" y="115" />
                  <rect fill="#9c6b3a" fillOpacity="0.9" height="100" rx="2" width="12" x="224" y="110" />
                  <rect fill="#9c6b3a" height="115" rx="2" width="12" x="246" y="95" />
                  <rect fill="#9c6b3a" height="120" rx="2" width="12" x="268" y="90" />
                  <rect fill="#f59e0b" height="162" rx="2" width="12" x="302" y="48" />
                  <rect fill="#f59e0b" height="170" rx="2" width="12" x="324" y="40" />
                  <rect fill="#f59e0b" height="158" rx="2" width="12" x="346" y="52" />
                  <rect fill="#9c6b3a" height="140" rx="2" width="12" x="368" y="70" />
                  <rect fill="#9c6b3a" height="125" rx="2" width="12" x="395" y="85" />
                  <rect fill="#9c6b3a" height="135" rx="2" width="12" x="417" y="75" />
                  <rect fill="#f7bb82" height="178" rx="2" width="12" x="450" y="32" />
                  <rect fill="#f7bb82" height="186" rx="2" width="12" x="472" y="24" />
                  <rect fill="#f7bb82" height="190" rx="2" width="12" x="494" y="20" />
                  <rect fill="#f7bb82" height="182" rx="2" width="12" x="516" y="28" />
                  <rect fill="#f7bb82" height="165" rx="2" width="12" x="538" y="45" />
                  <rect fill="#f7bb82" height="130" rx="2" width="12" x="560" y="80" />

                  {/* Headcount Smooth Polyline */}
                  <path
                    d="M54,152 Q80,170 102,185 T146,175 T212,125 T256,105 T314,56 T356,65 T405,90 T460,40 T504,26 T548,50 T566,95"
                    fill="none"
                    stroke="#f59e0b"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                  />
                  <circle cx="330" cy="50" fill="#f59e0b" r="4" stroke="#18181c" strokeWidth="2" />
                  <circle cx="504" cy="26" fill="#f7bb82" r="4" stroke="#18181c" strokeWidth="2" />

                  {/* X Axis Time markers */}
                  <text className="text-[9px] fill-[#94a3b8] font-mono" textAnchor="middle" x="54" y="226">
                    00:00
                  </text>
                  <text className="text-[9px] fill-[#94a3b8] font-mono" textAnchor="middle" x="142" y="226">
                    04:00
                  </text>
                  <text className="text-[9px] fill-[#94a3b8] font-mono" textAnchor="middle" x="230" y="226">
                    08:00
                  </text>
                  <text className="text-[9px] fill-[#f59e0b] font-mono font-bold" textAnchor="middle" x="318" y="226">
                    13:00
                  </text>
                  <text className="text-[9px] fill-[#94a3b8] font-mono" textAnchor="middle" x="406" y="226">
                    18:00
                  </text>
                  <text className="text-[9px] fill-[#f7bb82] font-mono font-bold" textAnchor="middle" x="484" y="226">
                    22:00
                  </text>
                  <text className="text-[9px] fill-[#94a3b8] font-mono" textAnchor="middle" x="566" y="226">
                    02:00
                  </text>
                </svg>
              </div>
            </div>

            {/* Metric Summary Callout Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-[#111114] border border-white/[0.04] space-y-1">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#f59e0b]">
                  <span className="material-symbols-outlined text-[15px]">work</span>
                  <span>13:00 – 16:00 WIB • COWORKING RUSH</span>
                </div>
                <div className="text-lg font-bold text-[#f8fafc]">
                  Rp 14.850.000 <span className="text-xs text-[#94a3b8] font-normal">(89% Desk Load)</span>
                </div>
                <p className="text-xs text-[#94a3b8]">
                  Primary items: Cold Brew Aren, Pastrami Toast &amp; Day-pass VIP desk slots.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#111114] border border-white/[0.04] space-y-1">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#f7bb82]">
                  <span className="material-symbols-outlined text-[15px]">nightlight</span>
                  <span>20:00 – 01:00 WIB • MIDNIGHT SPRINT</span>
                </div>
                <div className="text-lg font-bold text-[#f8fafc]">
                  Rp 21.200.000 <span className="text-xs text-[#94a3b8] font-normal">(96% Table Load)</span>
                </div>
                <p className="text-xs text-[#94a3b8]">
                  Peak artisanal pour-over volume, brioche snacks, and shared extension plugs.
                </p>
              </div>
            </div>

            {/* Off-Peak Footnote */}
            <div className="p-3 rounded-lg bg-[#111114] border border-white/[0.04] flex items-center justify-between font-mono text-xs text-[#94a3b8]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#f59e0b]">bedtime</span>
                <span>
                  Off-Peak Dawn Shift (02:00 – 06:00 WIB): <strong className="text-white">Rp 4.200.000</strong> baseline
                  revenue sustained by remote dev teams.
                </span>
              </div>
              <span className="text-[#f7bb82] hidden sm:inline font-bold">100% Zero-Drop SLA</span>
            </div>
          </div>

          {/* RIGHT: REVENUE BY CATEGORY & PAYMENT CHANNELS */}
          <div className="lg:col-span-5 bg-[#18181c] border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#f8fafc]">Revenue by Category</h3>
                <span className="font-mono text-[11px] text-[#94a3b8]">SHARE RATIO</span>
              </div>
              <p className="text-xs text-[#94a3b8]">Extraction &amp; culinary contribution across 24h audit.</p>
            </div>

            {/* Custom Donut Chart */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
              <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="38"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="12"
                  />
                  {/* Segment 1: Signature Aren (42%) */}
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="38"
                    stroke="#f59e0b"
                    strokeDasharray="100.28 238.76"
                    strokeDashoffset="0"
                    strokeWidth="12"
                  />
                  {/* Segment 2: Single Origin (24%) */}
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="38"
                    stroke="#9c6b3a"
                    strokeDasharray="57.30 238.76"
                    strokeDashoffset="-100.28"
                    strokeWidth="12"
                  />
                  {/* Segment 3: Sourdough (21%) */}
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="38"
                    stroke="#e8c47a"
                    strokeDasharray="50.14 238.76"
                    strokeDashoffset="-157.58"
                    strokeWidth="12"
                  />
                  {/* Segment 4: Coworking Passes (13%) */}
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="38"
                    stroke="#f7bb82"
                    strokeDasharray="31.04 238.76"
                    strokeDashoffset="-207.72"
                    strokeWidth="12"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-[10px] text-[#94a3b8] uppercase">Gross</span>
                  <span className="text-xl font-bold text-[#f8fafc]">48.25M</span>
                  <span className="font-mono text-[10px] text-[#f59e0b]">IDR</span>
                </div>
              </div>

              {/* Donut Legend */}
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#111114]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-[#f59e0b]" />
                    <span className="text-xs text-[#f8fafc] font-medium">Signature Aren &amp; Cold Drip</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#f8fafc]">42%</span>
                    <span className="block font-mono text-[10px] text-[#94a3b8]">Rp 20.26M</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#111114]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-[#9c6b3a]" />
                    <span className="text-xs text-[#f8fafc] font-medium">Single-Origin V60 Pour-Over</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#f8fafc]">24%</span>
                    <span className="block font-mono text-[10px] text-[#94a3b8]">Rp 11.58M</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#111114]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-[#e8c47a]" />
                    <span className="text-xs text-[#f8fafc] font-medium">Brioche Toast &amp; Artisan Eats</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#f8fafc]">21%</span>
                    <span className="block font-mono text-[10px] text-[#94a3b8]">Rp 10.13M</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#111114]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-[#f7bb82]" />
                    <span className="text-xs text-[#f8fafc] font-medium">Workspace Passes &amp; VIP Pods</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#f8fafc]">13%</span>
                    <span className="block font-mono text-[10px] text-[#94a3b8]">Rp 6.27M</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Settlement Rails */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between font-mono text-xs text-[#94a3b8]">
                <span>SETTLEMENT RAILS</span>
                <span className="text-[#f7bb82] font-semibold">97% Cashless Adoption</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#111114] flex overflow-hidden">
                <div className="h-full bg-[#f59e0b]" style={{ width: "64%" }} title="QRIS Midtrans: 64%" />
                <div className="h-full bg-[#f7bb82]" style={{ width: "22%" }} title="GoPay / ShopeePay: 22%" />
                <div className="h-full bg-[#e8c47a]" style={{ width: "11%" }} title="BCA Debit / Credit: 11%" />
                <div className="h-full bg-[#94a3b8]" style={{ width: "3%" }} title="Cash: 3%" />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[#94a3b8] pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> QRIS Midtrans 64%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#f7bb82]" /> E-Wallet 22%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#e8c47a]" /> BCA Card 11%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#94a3b8]" /> Cash 3%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            EXTRACTION LEADERBOARD
            ══════════════════════════════════════════════════════════════ */}
        <section className="bg-[#18181c] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f59e0b] text-[22px]">emoji_events</span>
              <h3 className="text-lg font-bold text-[#f8fafc]">Top Extraction Catalog Leaderboard</h3>
            </div>
            <span className="font-mono text-xs text-[#f59e0b] font-semibold bg-[#111114] px-2.5 py-1 rounded-full">
              RANKED BY VELOCITY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                rank: "01",
                name: "Cold Brew Aren Brûlée",
                subtitle: "412 cups • 74.2% Margin",
                revenue: "Rp 21.01M",
                trend: "+18% vs avg",
                badgeColor: "text-[#f59e0b]",
              },
              {
                rank: "02",
                name: "Smoked Pastrami Brioche",
                subtitle: "218 orders • 62.8% Margin",
                revenue: "Rp 10.46M",
                trend: "High Dinner",
                badgeColor: "text-white",
              },
              {
                rank: "03",
                name: "Single-Origin V60 Ijen Honey",
                subtitle: "186 carafes • 81.5% Margin",
                revenue: "Rp 8.92M",
                trend: "Late Night Peak",
                badgeColor: "text-white",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#111114] border border-white/[0.04] flex items-center justify-between gap-3 hover:border-white/[0.1] transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-lg font-bold ${item.badgeColor} w-6 text-center`}>{item.rank}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <p className="font-mono text-[10px] text-[#94a3b8] mt-0.5">{item.subtitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-white">{item.revenue}</div>
                  <div className="font-mono text-[10px] text-[#f7bb82]">{item.trend}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
