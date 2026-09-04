"use client";

import React, { useState } from "react";

interface Patron {
  id: string;
  name: string;
  initials: string;
  phone: string;
  tier: "Platinum" | "Gold" | "Silver" | "Bronze";
  rfmScore: string;
  lifetimeSpend: number;
  totalVisits: number;
  lastVisit: string;
  favoriteItem: string;
  favoriteHub: string;
  segment: "vip" | "regular" | "at-risk" | "new";
}

const PATRONS_DATA: Patron[] = [
  {
    id: "PTR-001",
    name: "Arya Wijaya",
    initials: "AW",
    phone: "+62 812-****-8812",
    tier: "Platinum",
    rfmScore: "5-5-5",
    lifetimeSpend: 4820000,
    totalVisits: 74,
    lastVisit: "Today 20:15 @ Darmo VIP #14",
    favoriteItem: "Cold Brew Aren Brûlée (Double Shot)",
    favoriteHub: "Darmo Flagship",
    segment: "vip",
  },
  {
    id: "PTR-002",
    name: "Nadia Kusuma",
    initials: "NK",
    phone: "+62 813-****-4491",
    tier: "Gold",
    rfmScore: "5-4-5",
    lifetimeSpend: 3150000,
    totalVisits: 48,
    lastVisit: "Yesterday 19:40 @ Gubeng Table B6",
    favoriteItem: "Single-Origin V60 Ijen Honey",
    favoriteHub: "Gubeng 24H",
    segment: "regular",
  },
  {
    id: "PTR-003",
    name: "Dimas Kurniawan",
    initials: "DK",
    phone: "+62 811-****-9023",
    tier: "Gold",
    rfmScore: "4-4-4",
    lifetimeSpend: 2890000,
    totalVisits: 42,
    lastVisit: "2 days ago @ Dharmahusada Hub",
    favoriteItem: "Matcha Pandan Oat Latte",
    favoriteHub: "Dharmahusada Campus",
    segment: "regular",
  },
  {
    id: "PTR-004",
    name: "Farhan Hakim",
    initials: "FH",
    phone: "+62 856-****-1102",
    tier: "Silver",
    rfmScore: "2-3-3",
    lifetimeSpend: 1420000,
    totalVisits: 18,
    lastVisit: "24 days ago @ Gubeng Sanctuary",
    favoriteItem: "Smoked Pastrami Brioche",
    favoriteHub: "Gubeng 24H",
    segment: "at-risk",
  },
  {
    id: "PTR-005",
    name: "Jessica Tanuwijaya",
    initials: "JT",
    phone: "+62 817-****-3388",
    tier: "Bronze",
    rfmScore: "5-1-2",
    lifetimeSpend: 380000,
    totalVisits: 3,
    lastVisit: "4 days ago @ Darmo Flagship",
    favoriteItem: "Cold Brew Aren Brûlée",
    favoriteHub: "Darmo Flagship",
    segment: "new",
  },
  {
    id: "PTR-006",
    name: "Bambang Soedjarwo",
    initials: "BS",
    phone: "+62 812-****-7721",
    tier: "Platinum",
    rfmScore: "5-5-5",
    lifetimeSpend: 5410000,
    totalVisits: 89,
    lastVisit: "Today 14:00 @ Darmo Boardroom",
    favoriteItem: "Single-Origin V60 Anaerobic",
    favoriteHub: "Darmo Flagship",
    segment: "vip",
  },
];

export default function PatronCrmLifecyclePage() {
  const [patrons, setPatrons] = useState<Patron[]>(PATRONS_DATA);
  const [selectedCohort, setSelectedCohort] = useState<"all" | "vip" | "regular" | "at-risk" | "new">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [whatsappToast, setWhatsappToast] = useState<string | null>(null);

  const handleSendVoucher = (patronName: string) => {
    setWhatsappToast(`Retention WhatsApp Voucher (20% V60) queued for ${patronName}!`);
    setTimeout(() => setWhatsappToast(null), 4000);
  };

  const filteredPatrons = patrons.filter((p) => {
    const matchCohort = selectedCohort === "all" || p.segment === selectedCohort;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.favoriteItem.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCohort && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f8fafc] font-sans">
      {/* ══════════════════════════════════════════════════════════════
          TOP COMMAND & TELEMETRY BAR
          ══════════════════════════════════════════════════════════════ */}
      <div className="w-full bg-[#111114] border-b border-white/[0.06] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs text-[#94a3b8]">
              <span>Admin Portal</span>
              <span>/</span>
              <span>Growth &amp; Customer Relations</span>
              <span>/</span>
              <span className="text-[#f7bb82] font-semibold">CRM &amp; Patron Intelligence</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-3 pt-0.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f8fafc] tracking-tight">
                Patron CRM &amp; Lifecycle Segmentation
              </h1>
              <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#18181c] text-[#f59e0b] border border-white/[0.08]">
                Module 5.0 • Live Cohort Engine
              </span>
            </div>
            <p className="text-xs text-[#94a3b8] max-w-3xl">
              Real-time RFM cohort telemetry, behavioral clustering, and automated multi-channel re-engagement across
              Darmo &amp; Gubeng sanctuaries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#18181c] border border-white/[0.08] shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <div className="flex flex-col">
                <span className="font-mono text-[11px] text-white font-medium flex items-center gap-1">
                  WhatsApp Gateway
                  <span className="material-symbols-outlined text-[14px] text-emerald-400">check_circle</span>
                </span>
                <span className="font-mono text-[10px] text-emerald-400">99.4% SLA • Live</span>
              </div>
            </div>

            <button
              onClick={() => alert("Exporting CRM Segment CSV...")}
              className="px-3.5 py-2.5 rounded-xl bg-[#18181c] hover:bg-[#201f21] text-xs font-semibold text-white border border-white/[0.08] transition-colors"
            >
              Export CSV
            </button>

            <button
              onClick={() => alert("Retention Campaign Studio Wizard triggered!")}
              className="px-4 py-2.5 rounded-xl bg-[#9c6b3a] hover:bg-[#825426] text-xs font-bold text-white shadow-md flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
              <span>+ Launch Campaign</span>
            </button>
          </div>
        </div>
      </div>

      {whatsappToast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-[#0a0a0c] font-bold text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[18px]">send</span>
          <span>{whatsappToast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ══════════════════════════════════════════════════════════════
            SECTION 1: RFM CUSTOMER SEGMENTATION MATRIX (4 Cards)
            ══════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: VIP Patrons */}
          <div className="relative overflow-hidden rounded-2xl bg-[#18181c] border border-white/[0.08] p-5 shadow-xl flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#111114] flex items-center justify-center text-purple-400">
                  <span className="material-symbols-outlined text-[22px]">workspace_premium</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-purple-950/40 text-purple-300">
                  Top 5% • Platinum
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">482</span>
                  <span className="font-mono text-xs text-emerald-400">+8.4% MoM</span>
                </div>
                <p className="text-xs text-[#94a3b8]">VIP Patrons in Sanctuary Guild</p>
              </div>
              <div className="pt-2 border-t border-white/[0.04] space-y-1 font-mono text-[11px] text-[#94a3b8]">
                <div className="flex justify-between">
                  <span>Rev Share:</span>
                  <span className="text-white font-bold">42.6% (Rp 184M)</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg LTV:</span>
                  <span className="text-white">Rp 3.820.000</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedCohort("vip")}
              className="w-full py-2 rounded-xl bg-[#111114] hover:bg-[#201f21] text-purple-300 font-bold text-xs transition-colors"
            >
              Filter VIPs (482)
            </button>
          </div>

          {/* Card 2: Active Regulars */}
          <div className="relative overflow-hidden rounded-2xl bg-[#18181c] border border-white/[0.08] p-5 shadow-xl flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#111114] flex items-center justify-center text-[#f59e0b]">
                  <span className="material-symbols-outlined text-[22px]">local_cafe</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#f59e0b]/20 text-[#f59e0b]">
                  Visited ≤ 7 Days
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">1.894</span>
                  <span className="font-mono text-xs text-emerald-400">+12.1% MoM</span>
                </div>
                <p className="text-xs text-[#94a3b8]">High-Frequency Weekly Visitors</p>
              </div>
              <div className="pt-2 border-t border-white/[0.04] space-y-1 font-mono text-[11px] text-[#94a3b8]">
                <div className="flex justify-between">
                  <span>Rev Share:</span>
                  <span className="text-white font-bold">38.2% (Rp 165M)</span>
                </div>
                <div className="flex justify-between">
                  <span>Frequency:</span>
                  <span className="text-white">3.4 visits / week</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedCohort("regular")}
              className="w-full py-2 rounded-xl bg-[#111114] hover:bg-[#201f21] text-[#f59e0b] font-bold text-xs transition-colors"
            >
              Filter Regulars (1.894)
            </button>
          </div>

          {/* Card 3: At-Risk / Inactive */}
          <div className="relative overflow-hidden rounded-2xl bg-[#18181c] border border-white/[0.08] p-5 shadow-xl flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#111114] flex items-center justify-center text-red-400">
                  <span className="material-symbols-outlined text-[22px]">heart_broken</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-red-950/40 text-red-300">
                  &gt; 21 Days Inactive
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-red-400">412</span>
                  <span className="font-mono text-xs text-red-400">Churn Hazard</span>
                </div>
                <p className="text-xs text-[#94a3b8]">Dormant Patrons Requiring Winback</p>
              </div>
              <div className="pt-2 border-t border-white/[0.04] space-y-1 font-mono text-[11px] text-[#94a3b8]">
                <div className="flex justify-between">
                  <span>At-Risk LTV:</span>
                  <span className="text-red-400 font-bold">Rp 32.8M</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Inactive:</span>
                  <span className="text-white">28.4 days</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedCohort("at-risk")}
              className="w-full py-2 rounded-xl bg-[#111114] hover:bg-[#201f21] text-red-400 font-bold text-xs transition-colors"
            >
              Trigger Winback (412)
            </button>
          </div>

          {/* Card 4: New Patrons */}
          <div className="relative overflow-hidden rounded-2xl bg-[#18181c] border border-white/[0.08] p-5 shadow-xl flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#111114] flex items-center justify-center text-emerald-400">
                  <span className="material-symbols-outlined text-[22px]">person_add</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-300">
                  Joined ≤ 14 Days
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">620</span>
                  <span className="font-mono text-xs text-emerald-400">+19.2% MoM</span>
                </div>
                <p className="text-xs text-[#94a3b8]">First-Time Onboarding Cohort</p>
              </div>
              <div className="pt-2 border-t border-white/[0.04] space-y-1 font-mono text-[11px] text-[#94a3b8]">
                <div className="flex justify-between">
                  <span>Repeat Rate:</span>
                  <span className="text-emerald-400 font-bold">38.4%</span>
                </div>
                <div className="flex justify-between">
                  <span>2nd Order SLA:</span>
                  <span className="text-white">Avg 4.8 days</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedCohort("new")}
              className="w-full py-2 rounded-xl bg-[#111114] hover:bg-[#201f21] text-emerald-300 font-bold text-xs transition-colors"
            >
              Filter Newbies (620)
            </button>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 2: COHORT FILTERS & PATRON DIRECTORY TABLE
            ══════════════════════════════════════════════════════════════ */}
        <section className="bg-[#18181c] border border-white/[0.08] rounded-2xl shadow-xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 font-mono text-xs">
              {(["all", "vip", "regular", "at-risk", "new"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCohort(c)}
                  className={`px-3.5 py-1.5 rounded-lg capitalize transition-all whitespace-nowrap ${
                    selectedCohort === c
                      ? "bg-[#201f21] text-[#f59e0b] font-bold border border-white/[0.08]"
                      : "text-[#94a3b8] hover:text-white"
                  }`}
                >
                  {c === "all" ? "All Patrons" : c}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-2 text-[#94a3b8] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, item..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#111114] border border-white/[0.08] text-white text-xs rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#111114] text-[#94a3b8] font-mono text-[11px] uppercase tracking-wider border-b border-white/[0.06]">
                  <th className="py-3 px-4">Patron Identity</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">RFM Score</th>
                  <th className="py-3 px-4">Lifetime Spend</th>
                  <th className="py-3 px-4">Visits</th>
                  <th className="py-3 px-4">Last Sanctuary Order</th>
                  <th className="py-3 px-4">Favorite Ritual</th>
                  <th className="py-3 px-4 text-right">Direct Re-engagement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredPatrons.map((p) => (
                  <tr key={p.id} className="hover:bg-[#201f21]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#9c6b3a] flex items-center justify-center font-bold text-white text-xs font-mono">
                          {p.initials}
                        </div>
                        <div>
                          <div className="font-bold text-white">{p.name}</div>
                          <div className="font-mono text-[10px] text-[#94a3b8]">{p.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
                          p.tier === "Platinum"
                            ? "bg-purple-950/50 text-purple-300"
                            : p.tier === "Gold"
                            ? "bg-[#f59e0b]/20 text-[#f59e0b]"
                            : p.tier === "Silver"
                            ? "bg-blue-950/50 text-blue-300"
                            : "bg-[#201f21] text-[#94a3b8]"
                        }`}
                      >
                        {p.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#f7bb82] font-bold">{p.rfmScore}</td>
                    <td className="py-3 px-4 font-mono text-white font-bold">
                      Rp {p.lifetimeSpend.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#94a3b8]">{p.totalVisits} visits</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#94a3b8]">{p.lastVisit}</td>
                    <td className="py-3 px-4 text-xs text-white">{p.favoriteItem}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSendVoucher(p.name)}
                        className="px-3 py-1 rounded-lg bg-[#111114] hover:bg-[#201f21] text-[#f59e0b] border border-[#f59e0b]/30 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">chat</span>
                        <span>WA Voucher</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 3: AUTOMATED LIFECYCLE RE-ENGAGEMENT RULES
            ══════════════════════════════════════════════════════════════ */}
        <section className="bg-[#18181c] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Automated WhatsApp Lifecycle Triggers</h3>
              <p className="text-xs text-[#94a3b8]">Real-time background triggers executing on patron telemetry.</p>
            </div>
            <span className="font-mono text-xs text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full">
              Engine Status: Active (3 Triggers)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#111114] border border-white/[0.04] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">At-Risk Winback</span>
                <span className="text-emerald-400 font-mono text-[10px]">Active</span>
              </div>
              <p className="text-xs text-[#94a3b8]">
                Trigger: Inactive &gt; 21 days → Dispatches WhatsApp message with 20% V60 single-origin coupon.
              </p>
              <div className="font-mono text-[10px] text-[#f7bb82]">412 messages sent this month • 28% claim rate</div>
            </div>

            <div className="p-4 rounded-xl bg-[#111114] border border-white/[0.04] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Night Owl Milestone</span>
                <span className="text-emerald-400 font-mono text-[10px]">Active</span>
              </div>
              <p className="text-xs text-[#94a3b8]">
                Trigger: 10th late-night sprint order post-21:00 → Complimentary Cold Brew Aren upgrade.
              </p>
              <div className="font-mono text-[10px] text-[#f7bb82]">184 rewarded • 94% NPS satisfaction</div>
            </div>

            <div className="p-4 rounded-xl bg-[#111114] border border-white/[0.04] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Birthday Sanctuary Gift</span>
                <span className="text-emerald-400 font-mono text-[10px]">Active</span>
              </div>
              <p className="text-xs text-[#94a3b8]">
                Trigger: Patron Birthday D-Day → Free artisan sourdough toast and VIP pod day pass.
              </p>
              <div className="font-mono text-[10px] text-[#f7bb82]">52 claimed this month • 100% redemption</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
