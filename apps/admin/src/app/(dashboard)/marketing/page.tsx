'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Battery,
  CheckCircle2,
  Coffee,
  Gift,
  MapPin,
  Mic,
  Moon,
  Phone,
  Rocket,
  Send,
  Signal,
  Users,
  Video,
  Wifi,
} from 'lucide-react';

type CampaignObjective = 'birthday' | 'night' | 'single_origin' | 'rsvp';

export default function MarketingCampaignStudioPage() {
  const [campaignName, setCampaignName] = useState(
    'Weekend Midnight Dev Boost — 25% Off Aren Brew & Nitro'
  );
  const [selectedObjective, setSelectedObjective] = useState<CampaignObjective>('night');
  const [selectedAudience, setSelectedAudience] = useState('night_owls');
  const [discountPercent, setDiscountPercent] = useState('25%');
  const [expiryHours, setExpiryHours] = useState('48');
  const [headerMedia, setHeaderMedia] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleTestSend = () => {
    setToastMessage('Test WhatsApp message dispatched to +62 812-3490-8812!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleBroadcast = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setToastMessage('Campaign successfully broadcasted to 1,420 targeted patrons!');
      setTimeout(() => setToastMessage(null), 4000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-canvas-obsidian text-text-primary font-sans pb-16">
      {/* ══════════════════════════════════════════════════════════════
          TOP COMMAND CONTEXT BAR
          ══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-surface-secondary border-b border-border-subtle px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
              <span>Admin Portal</span>
              <span>/</span>
              <span>Growth &amp; Engagement</span>
              <span>/</span>
              <span className="text-accent-amber font-semibold">Marketing Automation Studio</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Meta Cloud Status */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-border-subtle shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-mono text-[11px] text-emerald-400 font-semibold">WhatsApp Cloud API</span>
                <span className="text-text-muted text-[10px]">• 99.98% Deliverability</span>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-border-subtle font-mono text-[11px] text-text-muted">
                <span>Quota:</span>
                <strong className="text-text-primary">14,820 / 50,000</strong>
                <span className="text-primary font-semibold">(Tier 2)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight font-headline-xl">
                  Omnichannel WhatsApp Campaign Studio
                </h1>
              </div>
              <p className="text-xs text-text-muted max-w-3xl font-body-md">
                Design, simulate, and broadcast automated multi-tier patron campaigns via Meta WhatsApp Cloud API across
                Darmo &amp; Gubeng sanctuaries.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTestSend}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-card text-accent-amber text-xs font-bold border border-accent-amber/30 shadow-md flex items-center gap-1.5 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Test Send</span>
              </button>
              <button
                onClick={handleBroadcast}
                disabled={isSending}
                className="px-5 py-2 rounded-xl bg-brand-coffee hover:bg-primary-container text-text-primary text-xs font-bold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Rocket className="w-4 h-4" />
                <span>{isSending ? 'Broadcasting...' : 'Broadcast Live'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-4 right-4 z-50 bg-emerald-500 text-canvas-obsidian font-bold text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MAIN ASYMMETRIC STUDIO (60% Config / 40% Phone Simulator)
          ══════════════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: 60% (7 Cols) Campaign Builder */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* STEP 1: CAMPAIGN IDENTITY & OBJECTIVE */}
            <div className="bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-canvas-obsidian bg-primary px-2 py-0.5 rounded font-bold">
                    01
                  </span>
                  <h2 className="text-base font-bold text-text-primary font-headline-md">Campaign Identity &amp; Objective</h2>
                </div>
                <span className="font-mono text-[10px] text-accent-amber bg-accent-amber/10 px-2 py-0.5 rounded border border-accent-amber/20 font-semibold">
                  Active Draft
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="campaign-name" className="block font-mono text-[11px] text-text-muted mb-1 uppercase">
                    Campaign Name
                  </label>
                  <input
                    id="campaign-name"
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full bg-surface-secondary border border-border-subtle text-text-primary text-xs px-3 py-2 rounded-xl outline-none focus:border-accent-amber"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-text-muted mb-2 uppercase">
                    Objective Preset
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'birthday', title: 'Birthday Voucher', desc: 'Automated D-Day Gift', icon: Gift },
                      { id: 'night', title: 'Weekend Night Boost', desc: 'High-Velocity Dev Sprint', icon: Moon },
                      { id: 'single_origin', title: 'New Single-Origin', desc: 'Micro-lot Ijen Tasting', icon: Coffee },
                      { id: 'rsvp', title: 'Community Event RSVP', desc: 'Dev Meetup & Workshop', icon: Users },
                    ].map((preset) => {
                      const IconComp = preset.icon;
                      const isSelected = selectedObjective === preset.id;
                      return (
                        <button
                          type="button"
                          key={preset.id}
                          onClick={() => setSelectedObjective(preset.id as CampaignObjective)}
                          aria-pressed={isSelected}
                          className={`flex w-full cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-left transition-all ${
                            isSelected
                              ? 'bg-surface-container border-accent-amber shadow-sm'
                              : 'bg-surface-secondary border-border-subtle hover:border-border-subtle/80'
                          }`}
                        >
                          <IconComp
                            className={`w-5 h-5 mt-0.5 shrink-0 ${
                              isSelected ? 'text-accent-amber' : 'text-text-muted'
                            }`}
                          />
                          <div>
                            <div className="text-xs font-bold text-text-primary">{preset.title}</div>
                            <p className="text-[11px] text-text-muted">{preset.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: AUDIENCE & SEGMENT FILTER */}
            <div className="bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-canvas-obsidian bg-primary px-2 py-0.5 rounded font-bold">
                    02
                  </span>
                  <h2 className="text-base font-bold text-text-primary font-headline-md">Audience &amp; Smart Segment Filter</h2>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                  Sync 4 min ago
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="campaign-audience" className="block font-mono text-[11px] text-text-muted mb-1 uppercase">
                    Target Cohort
                  </label>
                  <select
                    id="campaign-audience"
                    value={selectedAudience}
                    onChange={(e) => setSelectedAudience(e.target.value)}
                    className="w-full bg-surface-secondary border border-border-subtle text-text-primary text-xs px-3 py-2 rounded-xl outline-none cursor-pointer focus:border-accent-amber"
                  >
                    <option value="night_owls">Night Owls (Orders post-21:00 WIB) &amp; Gold/Platinum Tiers</option>
                    <option value="all_active">All Active Patrons (Visited within 14 days)</option>
                    <option value="at_risk">At-Risk Churn Patrons (&gt; 21 days inactive)</option>
                    <option value="coworking">Coworking Desk Day-Pass Holders</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-surface-secondary p-3.5 rounded-xl font-mono text-xs border border-border-subtle">
                  <div>
                    <span className="text-text-muted text-[10px] uppercase block">Estimated Reach</span>
                    <span className="text-xl font-bold text-text-primary">1,420 Patrons</span>
                  </div>
                  <div>
                    <span className="text-text-muted text-[10px] uppercase block">Est. Cost (Cloud API)</span>
                    <span className="text-xl font-bold text-emerald-400">Rp 426.000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: MESSAGE COMPOSER */}
            <div className="bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-canvas-obsidian bg-primary px-2 py-0.5 rounded font-bold">
                    03
                  </span>
                  <h2 className="text-base font-bold text-text-primary font-headline-md">WhatsApp Template Parameters</h2>
                </div>
                <span className="font-mono text-[10px] text-primary font-semibold">Template: yareh_midnight_v2</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary border border-border-subtle">
                  <span className="text-xs text-text-primary font-semibold">Include High-Res Cold Brew Header Photo</span>
                  <button
                    type="button"
                    onClick={() => setHeaderMedia(!headerMedia)}
                    aria-label="Include high-resolution campaign header image"
                    aria-pressed={headerMedia}
                    className={`w-10 h-6 rounded-full transition-colors relative ${
                      headerMedia ? 'bg-accent-amber' : 'bg-surface-container'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        headerMedia ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="campaign-discount" className="block font-mono text-[11px] text-text-muted mb-1">
                      Discount Param
                    </label>
                    <input
                      id="campaign-discount"
                      type="text"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      className="w-full bg-surface-secondary border border-border-subtle text-text-primary text-xs px-3 py-2 rounded-xl outline-none focus:border-accent-amber"
                    />
                  </div>
                  <div>
                    <label htmlFor="campaign-expiry" className="block font-mono text-[11px] text-text-muted mb-1">
                      Voucher Expiry (Hours)
                    </label>
                    <input
                      id="campaign-expiry"
                      type="text"
                      value={expiryHours}
                      onChange={(e) => setExpiryHours(e.target.value)}
                      className="w-full bg-surface-secondary border border-border-subtle text-text-primary text-xs px-3 py-2 rounded-xl outline-none focus:border-accent-amber"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 40% (5 Cols) High-Fidelity Realistic Phone Simulator */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-[340px] sm:w-[380px] rounded-[48px] bg-black p-3.5 shadow-2xl border-4 border-surface-container relative">
              {/* Dynamic Island */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 rounded-full bg-black z-30" />

              {/* Screen Body */}
              <div className="w-full rounded-[38px] overflow-hidden bg-canvas-obsidian min-h-[640px] flex flex-col justify-between relative border border-border-subtle">
                {/* Phone Top Status */}
                <div className="pt-2 px-6 flex items-center justify-between text-[11px] text-text-primary font-mono z-20">
                  <span>22:45</span>
                  <div className="flex items-center gap-1.5 text-text-primary">
                    <Signal className="w-3.5 h-3.5" />
                    <Wifi className="w-3.5 h-3.5" />
                    <Battery className="w-4 h-4" />
                  </div>
                </div>

                {/* WhatsApp Chat Top App Bar */}
                <div className="bg-surface-secondary px-4 py-2.5 flex items-center justify-between shadow-md mt-1 border-b border-border-subtle">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-coffee flex items-center justify-center font-bold text-text-primary text-xs">
                      WY
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-text-primary">Warkop Ya&apos;reh</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <span className="font-mono text-[9px] text-text-muted">Official Business Account</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-text-muted">
                    <Video className="w-4 h-4 cursor-pointer hover:text-text-primary transition-colors" />
                    <Phone className="w-4 h-4 cursor-pointer hover:text-text-primary transition-colors" />
                  </div>
                </div>

                {/* Chat Bubble Area */}
                <div className="flex-1 p-3 flex flex-col justify-end space-y-3 bg-canvas-obsidian">
                  {/* Incoming WhatsApp Business Message */}
                  <div className="max-w-[92%] rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-white p-3 shadow-lg self-start space-y-2.5 text-xs">
                    {headerMedia && (
                      <div className="relative w-full h-36 rounded-xl overflow-hidden bg-black/40">
                        <Image
                          src="https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=800&auto=format&fit=crop"
                          alt="Cold Brew Aren Brûlée"
                          fill
                          sizes="340px"
                          className="object-cover"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur font-mono text-[9px] text-accent-amber font-bold">
                          SANCTUARY EXCLUSIVE
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 leading-relaxed">
                      <p className="font-bold text-sm text-primary">Hai Arya! 🌙</p>
                      <p className="text-[11px] text-white/90">
                        Lanjut sprint malam ini di Gubeng 24H? Kami sediakan voucher boost fokus untuk teman coding kamu:
                      </p>
                      <div className="p-2 rounded-lg bg-black/40 border border-white/10 font-mono text-center">
                        <span className="text-xs font-bold text-accent-amber">DISCOUNT {discountPercent}</span>
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
                        onClick={() => alert('Simulated: Voucher claimed!')}
                        className="w-full py-2 rounded-lg bg-black/30 hover:bg-black/40 text-center font-bold text-xs text-accent-amber flex items-center justify-center gap-1 transition-colors"
                      >
                        <Coffee className="w-3.5 h-3.5" />
                        <span>Claim {discountPercent} Off Aren Brew</span>
                      </button>
                      <button
                        onClick={() => alert('Simulated: Table map opened!')}
                        className="w-full py-2 rounded-lg bg-black/30 hover:bg-black/40 text-center font-bold text-xs text-white/90 flex items-center justify-center gap-1 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>View Gubeng Live Seats</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="p-2.5 bg-surface-secondary flex items-center justify-between text-xs text-text-muted border-t border-border-subtle">
                  <span className="text-[11px]">Reply to Warkop Ya&apos;reh...</span>
                  <Mic className="w-4 h-4 text-text-muted" />
                </div>
              </div>
            </div>

            <p className="font-mono text-xs text-text-muted mt-4 text-center">
              Real-time WhatsApp Cloud Template Preview v2.4
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
