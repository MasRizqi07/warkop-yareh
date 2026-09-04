"use client";

import React, { useState } from "react";
import Image from "next/image";

type CampaignObjective = "birthday" | "night" | "single_origin" | "rsvp";

export default function MarketingCampaignStudioPage() {
  const [campaignName, setCampaignName] = useState(
    "Weekend Midnight Dev Boost — 25% Off Aren Brew & Nitro"
  );
  const [selectedObjective, setSelectedObjective] = useState<CampaignObjective>("night");
  const [selectedAudience, setSelectedAudience] = useState("night_owls");
  const [discountPercent, setDiscountPercent] = useState("25%");
  const [expiryHours, setExpiryHours] = useState("48");
  const [headerMedia, setHeaderMedia] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleTestSend = () => {
    setToastMessage("Test WhatsApp message dispatched to +62 812-3490-8812!");
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleBroadcast = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setToastMessage("Campaign successfully broadcasted to 1,420 targeted patrons!");
      setTimeout(() => setToastMessage(null), 4000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f8fafc] font-sans pb-16">
      {/* ══════════════════════════════════════════════════════════════
          TOP COMMAND CONTEXT BAR
          ══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#111114] border-b border-white/[0.06] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono text-xs text-[#94a3b8]">
              <span>Admin Portal</span>
              <span>/</span>
              <span>Growth &amp; Engagement</span>
              <span>/</span>
              <span className="text-[#f59e0b] font-semibold">Marketing Automation Studio</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Meta Cloud Status */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181c] border border-white/[0.08] shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-mono text-[11px] text-emerald-400 font-semibold">WhatsApp Cloud API</span>
                <span className="text-[#94a3b8] text-[10px]">• 99.98% Deliverability</span>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181c] border border-white/[0.08] font-mono text-[11px] text-[#94a3b8]">
                <span>Quota:</span>
                <strong className="text-white">14,820 / 50,000</strong>
                <span className="text-[#f7bb82]">(Tier 2)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="material-symbols-outlined text-[18px]">mark_chat_read</span>
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#f8fafc] tracking-tight">
                  Omnichannel WhatsApp Campaign Studio
                </h1>
              </div>
              <p className="text-xs text-[#94a3b8] max-w-3xl">
                Design, simulate, and broadcast automated multi-tier patron campaigns via Meta WhatsApp Cloud API across
                Darmo &amp; Gubeng sanctuaries.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTestSend}
                className="px-4 py-2 rounded-xl bg-[#201f21] hover:bg-[#2a2a2c] text-[#f59e0b] text-xs font-bold border border-[#f59e0b]/30 shadow-md flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">send_to_mobile</span>
                <span>Test Send</span>
              </button>
              <button
                onClick={handleBroadcast}
                disabled={isSending}
                className="px-5 py-2 rounded-xl bg-[#9c6b3a] hover:bg-[#825426] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                <span>{isSending ? "Broadcasting..." : "Broadcast Live"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-[#0a0a0c] font-bold text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MAIN ASYMMETRIC STUDIO (60% Config / 40% Phone Simulator)
          ══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: 60% (7 Cols) Campaign Builder */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* STEP 1: CAMPAIGN IDENTITY & OBJECTIVE */}
            <div className="bg-[#18181c] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#0a0a0c] bg-[#f7bb82] px-2 py-0.5 rounded font-bold">
                    01
                  </span>
                  <h2 className="text-base font-bold text-white">Campaign Identity &amp; Objective</h2>
                </div>
                <span className="font-mono text-[10px] text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded">
                  Active Draft
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-mono text-[11px] text-[#94a3b8] mb-1 uppercase">Campaign Name</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full bg-[#111114] border border-white/[0.08] text-white text-xs px-3 py-2 rounded-xl outline-none focus:border-[#f59e0b]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#94a3b8] mb-2 uppercase">
                    Objective Preset
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: "birthday", title: "Birthday Voucher", desc: "Automated D-Day Gift", icon: "cake" },
                      { id: "night", title: "Weekend Night Boost", desc: "High-Velocity Dev Sprint", icon: "nightlight" },
                      { id: "single_origin", title: "New Single-Origin", desc: "Micro-lot Ijen Tasting", icon: "local_cafe" },
                      { id: "rsvp", title: "Community Event RSVP", desc: "Dev Meetup & Workshop", icon: "hub" },
                    ].map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => setSelectedObjective(preset.id as CampaignObjective)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          selectedObjective === preset.id
                            ? "bg-[#201f21] border-[#f59e0b] shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                            : "bg-[#111114] border-white/[0.06] hover:border-white/[0.14]"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-[20px] mt-0.5 ${
                            selectedObjective === preset.id ? "text-[#f59e0b]" : "text-[#94a3b8]"
                          }`}
                        >
                          {preset.icon}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white">{preset.title}</div>
                          <p className="text-[11px] text-[#94a3b8]">{preset.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: AUDIENCE & SEGMENT FILTER */}
            <div className="bg-[#18181c] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#0a0a0c] bg-[#f7bb82] px-2 py-0.5 rounded font-bold">
                    02
                  </span>
                  <h2 className="text-base font-bold text-white">Audience &amp; Smart Segment Filter</h2>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Sync 4 min ago
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-mono text-[11px] text-[#94a3b8] mb-1 uppercase">
                    Target Cohort
                  </label>
                  <select
                    value={selectedAudience}
                    onChange={(e) => setSelectedAudience(e.target.value)}
                    className="w-full bg-[#111114] border border-white/[0.08] text-white text-xs px-3 py-2 rounded-xl outline-none"
                  >
                    <option value="night_owls">Night Owls (Orders post-21:00 WIB) &amp; Gold/Platinum Tiers</option>
                    <option value="all_active">All Active Patrons (Visited within 14 days)</option>
                    <option value="at_risk">At-Risk Churn Patrons (&gt; 21 days inactive)</option>
                    <option value="coworking">Coworking Desk Day-Pass Holders</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-[#111114] p-3.5 rounded-xl font-mono text-xs">
                  <div>
                    <span className="text-[#94a3b8] text-[10px] uppercase block">Estimated Reach</span>
                    <span className="text-xl font-bold text-white">1,420 Patrons</span>
                  </div>
                  <div>
                    <span className="text-[#94a3b8] text-[10px] uppercase block">Est. Cost (Cloud API)</span>
                    <span className="text-xl font-bold text-emerald-400">Rp 426.000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: MESSAGE COMPOSER */}
            <div className="bg-[#18181c] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#0a0a0c] bg-[#f7bb82] px-2 py-0.5 rounded font-bold">
                    03
                  </span>
                  <h2 className="text-base font-bold text-white">WhatsApp Template Parameters</h2>
                </div>
                <span className="font-mono text-[10px] text-[#f7bb82]">Template: yareh_midnight_v2</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#111114]">
                  <span className="text-xs text-white font-semibold">Include High-Res Cold Brew Header Photo</span>
                  <button
                    onClick={() => setHeaderMedia(!headerMedia)}
                    className={`w-10 h-6 rounded-full transition-colors relative ${
                      headerMedia ? "bg-[#f59e0b]" : "bg-[#201f21]"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        headerMedia ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] text-[#94a3b8] mb-1">Discount Param</label>
                    <input
                      type="text"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      className="w-full bg-[#111114] border border-white/[0.08] text-white text-xs px-3 py-2 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] text-[#94a3b8] mb-1">Voucher Expiry (Hours)</label>
                    <input
                      type="text"
                      value={expiryHours}
                      onChange={(e) => setExpiryHours(e.target.value)}
                      className="w-full bg-[#111114] border border-white/[0.08] text-white text-xs px-3 py-2 rounded-xl outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 40% (5 Cols) High-Fidelity Realistic Phone Simulator */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-[340px] sm:w-[380px] rounded-[48px] bg-[#000000] p-3.5 shadow-2xl border-4 border-[#201f21] relative">
              {/* Dynamic Island */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 rounded-full bg-black z-30" />

              {/* Screen Body */}
              <div className="w-full rounded-[38px] overflow-hidden bg-[#0b141a] min-h-[640px] flex flex-col justify-between relative border border-white/[0.06]">
                {/* Phone Top Status */}
                <div className="pt-2 px-6 flex items-center justify-between text-[11px] text-white font-mono z-20">
                  <span>22:45</span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[13px]">signal_cellular_alt</span>
                    <span className="material-symbols-outlined text-[13px]">wifi</span>
                    <span className="material-symbols-outlined text-[13px]">battery_full</span>
                  </div>
                </div>

                {/* WhatsApp Chat Top App Bar */}
                <div className="bg-[#1f2c34] px-4 py-2.5 flex items-center justify-between shadow-md mt-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#9c6b3a] flex items-center justify-center font-bold text-white text-xs">
                      WY
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white">Warkop Ya&apos;reh</span>
                        <span className="material-symbols-outlined text-[13px] text-emerald-400">verified</span>
                      </div>
                      <span className="font-mono text-[9px] text-[#94a3b8]">Official Business Account</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[#94a3b8]">
                    <span className="material-symbols-outlined text-[18px]">videocam</span>
                    <span className="material-symbols-outlined text-[18px]">call</span>
                  </div>
                </div>

                {/* Chat Bubble Area */}
                <div className="flex-1 p-3 flex flex-col justify-end space-y-3 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
                  {/* Incoming WhatsApp Business Message */}
                  <div className="max-w-[92%] rounded-2xl bg-[#005c4b] text-white p-3 shadow-lg self-start space-y-2.5 text-xs">
                    {headerMedia && (
                      <div className="relative w-full h-36 rounded-xl overflow-hidden bg-black/40">
                        <Image
                          src="/images/cold-brew-aren-brulee.png"
                          alt="Cold Brew Aren Brûlée"
                          fill
                          sizes="340px"
                          className="object-cover"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur font-mono text-[9px] text-[#f59e0b] font-bold">
                          SANCTUARY EXCLUSIVE
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 leading-relaxed">
                      <p className="font-bold text-sm text-[#f7bb82]">Hai Arya! 🌙</p>
                      <p className="text-[11px] text-white/90">
                        Lanjut sprint malam ini di Gubeng 24H? Kami sediakan voucher boost fokus untuk teman coding kamu:
                      </p>
                      <div className="p-2 rounded-lg bg-black/30 border border-white/10 font-mono text-center">
                        <span className="text-xs font-bold text-[#f59e0b]">DISCOUNT {discountPercent}</span>
                        <span className="block text-[10px] text-white/70">KODE: DEVSPRINT25</span>
                      </div>
                      <p className="text-[10px] text-white/70">
                        Berlaku {expiryHours} jam untuk Cold Brew Aren Brûlée &amp; Nitro V60 di semua sanctuary.
                      </p>
                    </div>

                    <div className="pt-1 flex items-center justify-end font-mono text-[9px] text-white/60">
                      <span>22:45 • Terkirim</span>
                    </div>

                    {/* Interactive Action Buttons */}
                    <div className="space-y-1 pt-1 border-t border-white/10">
                      <button
                        onClick={() => alert("Simulated: Voucher claimed!")}
                        className="w-full py-2 rounded-lg bg-black/30 hover:bg-black/40 text-center font-bold text-xs text-[#f59e0b] flex items-center justify-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">local_cafe</span>
                        <span>Claim {discountPercent} Off Aren Brew</span>
                      </button>
                      <button
                        onClick={() => alert("Simulated: Table map opened!")}
                        className="w-full py-2 rounded-lg bg-black/30 hover:bg-black/40 text-center font-bold text-xs text-white/90 flex items-center justify-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">map</span>
                        <span>View Gubeng Live Seats</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="p-2 bg-[#1f2c34] flex items-center justify-between text-xs text-[#94a3b8]">
                  <span>Reply to Warkop Ya&apos;reh...</span>
                  <span className="material-symbols-outlined text-[18px]">mic</span>
                </div>
              </div>
            </div>

            <p className="font-mono text-xs text-[#94a3b8] mt-4 text-center">
              Real-time WhatsApp Cloud Template Preview v2.4
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
