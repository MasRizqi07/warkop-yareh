'use client';

import React, { useState } from 'react';
import {
  Award,
  Coffee,
  HeartCrack,
  MessageSquare,
  Rocket,
  Search,
  Send,
  UserPlus,
} from 'lucide-react';

interface Patron {
  id: string;
  name: string;
  initials: string;
  phone: string;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  rfmScore: string;
  lifetimeSpend: number;
  totalVisits: number;
  lastVisit: string;
  favoriteItem: string;
  favoriteHub: string;
  segment: 'vip' | 'regular' | 'at-risk' | 'new';
}

const PATRONS_DATA: Patron[] = [
  {
    id: 'PTR-001',
    name: 'Arya Wijaya',
    initials: 'AW',
    phone: '+62 812-****-8812',
    tier: 'Platinum',
    rfmScore: '5-5-5',
    lifetimeSpend: 4820000,
    totalVisits: 74,
    lastVisit: 'Today 20:15 @ Darmo VIP #14',
    favoriteItem: 'Cold Brew Aren Brûlée (Double Shot)',
    favoriteHub: 'Darmo Flagship',
    segment: 'vip',
  },
  {
    id: 'PTR-002',
    name: 'Nadia Kusuma',
    initials: 'NK',
    phone: '+62 813-****-4491',
    tier: 'Gold',
    rfmScore: '5-4-5',
    lifetimeSpend: 3150000,
    totalVisits: 48,
    lastVisit: 'Yesterday 19:40 @ Gubeng Table B6',
    favoriteItem: 'Single-Origin V60 Ijen Honey',
    favoriteHub: 'Gubeng 24H',
    segment: 'regular',
  },
  {
    id: 'PTR-003',
    name: 'Dimas Kurniawan',
    initials: 'DK',
    phone: '+62 811-****-9023',
    tier: 'Gold',
    rfmScore: '4-4-4',
    lifetimeSpend: 2890000,
    totalVisits: 42,
    lastVisit: '2 days ago @ Dharmahusada Hub',
    favoriteItem: 'Matcha Pandan Oat Latte',
    favoriteHub: 'Dharmahusada Campus',
    segment: 'regular',
  },
  {
    id: 'PTR-004',
    name: 'Farhan Hakim',
    initials: 'FH',
    phone: '+62 856-****-1102',
    tier: 'Silver',
    rfmScore: '2-3-3',
    lifetimeSpend: 1420000,
    totalVisits: 18,
    lastVisit: '24 days ago @ Gubeng Sanctuary',
    favoriteItem: 'Smoked Pastrami Brioche',
    favoriteHub: 'Gubeng 24H',
    segment: 'at-risk',
  },
  {
    id: 'PTR-005',
    name: 'Jessica Tanuwijaya',
    initials: 'JT',
    phone: '+62 817-****-3388',
    tier: 'Bronze',
    rfmScore: '5-1-2',
    lifetimeSpend: 380000,
    totalVisits: 3,
    lastVisit: '4 days ago @ Darmo Flagship',
    favoriteItem: 'Cold Brew Aren Brûlée',
    favoriteHub: 'Darmo Flagship',
    segment: 'new',
  },
  {
    id: 'PTR-006',
    name: 'Bambang Soedjarwo',
    initials: 'BS',
    phone: '+62 812-****-7721',
    tier: 'Platinum',
    rfmScore: '5-5-5',
    lifetimeSpend: 5410000,
    totalVisits: 89,
    lastVisit: 'Today 14:00 @ Darmo Boardroom',
    favoriteItem: 'Single-Origin V60 Anaerobic',
    favoriteHub: 'Darmo Flagship',
    segment: 'vip',
  },
];

export default function PatronCrmLifecyclePage() {
  const patrons = PATRONS_DATA;
  const [selectedCohort, setSelectedCohort] = useState<'all' | 'vip' | 'regular' | 'at-risk' | 'new'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [whatsappToast, setWhatsappToast] = useState<string | null>(null);

  const handleSendVoucher = (patronName: string) => {
    setWhatsappToast(`Retention WhatsApp Voucher (20% V60) queued for ${patronName}!`);
    setTimeout(() => setWhatsappToast(null), 4000);
  };

  const filteredPatrons = patrons.filter((p) => {
    const matchCohort = selectedCohort === 'all' || p.segment === selectedCohort;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.favoriteItem.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCohort && matchSearch;
  });

  return (
    <div className="min-h-screen bg-canvas-obsidian text-text-primary font-sans">
      {/* ══════════════════════════════════════════════════════════════
          TOP COMMAND & TELEMETRY BAR
          ══════════════════════════════════════════════════════════════ */}
      <div className="w-full bg-surface-secondary border-b border-border-subtle px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
              <span>Admin Portal</span>
              <span>/</span>
              <span>Growth &amp; Customer Relations</span>
              <span>/</span>
              <span className="text-primary font-semibold">CRM &amp; Patron Intelligence</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-3 pt-0.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-headline-xl">
                Patron CRM &amp; Lifecycle Segmentation
              </h1>
              <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-surface-card text-accent-amber border border-border-subtle">
                Module 5.0 • Live Cohort Engine
              </span>
            </div>
            <p className="text-xs text-text-muted max-w-3xl font-body-md">
              Target high-value midnight regulars, prevent churn via automated WhatsApp triggers, and personalize Surabaya table experiences.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => alert('Exporting CRM Segment CSV...')}
              className="px-3.5 py-2.5 rounded-xl bg-surface-card hover:bg-surface-container text-xs font-semibold text-text-primary border border-border-subtle transition-colors"
            >
              Export CSV
            </button>

            <button
              onClick={() => alert('Retention Campaign Studio Wizard triggered!')}
              className="px-4 py-2.5 rounded-xl bg-brand-coffee hover:bg-primary-container text-xs font-bold text-text-primary shadow-md flex items-center gap-1.5 transition-all"
            >
              <Rocket className="w-4 h-4" />
              <span>+ Launch Campaign</span>
            </button>
          </div>
        </div>
      </div>

      {whatsappToast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-4 right-4 z-50 bg-emerald-500 text-canvas-obsidian font-bold text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce"
        >
          <Send className="w-4 h-4" />
          <span>{whatsappToast}</span>
        </aside>
      )}

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ══════════════════════════════════════════════════════════════
            SECTION 1: RFM CUSTOMER SEGMENTATION MATRIX (4 Cards)
            ══════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: VIP Patrons */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-card border border-border-subtle p-5 shadow-xl flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center text-purple-400">
                  <Award className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-purple-950/40 text-purple-300 border border-purple-500/20">
                  Top 5% • Platinum
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-text-primary font-mono">482</span>
                  <span className="font-mono text-xs text-emerald-400 font-bold">+8.4% MoM</span>
                </div>
                <p className="text-xs text-text-muted">VIP Patrons in Sanctuary Guild</p>
              </div>
              <div className="pt-2 border-t border-border-subtle space-y-1 font-mono text-[11px] text-text-muted">
                <div className="flex justify-between">
                  <span>Rev Share:</span>
                  <span className="text-text-primary font-bold">42.6% (Rp 184M)</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg LTV:</span>
                  <span className="text-text-primary">Rp 3.820.000</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedCohort('vip')}
              className="w-full py-2 rounded-xl bg-surface-secondary hover:bg-surface-container text-purple-300 font-bold text-xs transition-colors border border-border-subtle"
            >
              Filter VIPs (482)
            </button>
          </div>

          {/* Card 2: Active Regulars */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-card border border-border-subtle p-5 shadow-xl flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center text-accent-amber">
                  <Coffee className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-accent-amber/20 text-accent-amber border border-accent-amber/30">
                  Visited ≤ 7 Days
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-text-primary font-mono">1.894</span>
                  <span className="font-mono text-xs text-emerald-400 font-bold">+12.1% MoM</span>
                </div>
                <p className="text-xs text-text-muted">High-Frequency Weekly Visitors</p>
              </div>
              <div className="pt-2 border-t border-border-subtle space-y-1 font-mono text-[11px] text-text-muted">
                <div className="flex justify-between">
                  <span>Rev Share:</span>
                  <span className="text-text-primary font-bold">38.2% (Rp 165M)</span>
                </div>
                <div className="flex justify-between">
                  <span>Frequency:</span>
                  <span className="text-text-primary">3.4 visits / week</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedCohort('regular')}
              className="w-full py-2 rounded-xl bg-surface-secondary hover:bg-surface-container text-accent-amber font-bold text-xs transition-colors border border-border-subtle"
            >
              Filter Regulars (1.894)
            </button>
          </div>

          {/* Card 3: At-Risk / Inactive */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-card border border-border-subtle p-5 shadow-xl flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center text-red-400">
                  <HeartCrack className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-red-950/40 text-red-300 border border-red-500/30">
                  &gt; 21 Days Inactive
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-red-400 font-mono">412</span>
                  <span className="font-mono text-xs text-red-400 font-semibold">Churn Hazard</span>
                </div>
                <p className="text-xs text-text-muted">Dormant Patrons Requiring Winback</p>
              </div>
              <div className="pt-2 border-t border-border-subtle space-y-1 font-mono text-[11px] text-text-muted">
                <div className="flex justify-between">
                  <span>At-Risk LTV:</span>
                  <span className="text-red-400 font-bold">Rp 32.8M</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Inactive:</span>
                  <span className="text-text-primary">28.4 days</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedCohort('at-risk')}
              className="w-full py-2 rounded-xl bg-surface-secondary hover:bg-surface-container text-red-400 font-bold text-xs transition-colors border border-border-subtle"
            >
              Trigger Winback (412)
            </button>
          </div>

          {/* Card 4: New Patrons */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-card border border-border-subtle p-5 shadow-xl flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center text-emerald-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                  Joined ≤ 14 Days
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-text-primary font-mono">620</span>
                  <span className="font-mono text-xs text-emerald-400 font-bold">+19.2% MoM</span>
                </div>
                <p className="text-xs text-text-muted">First-Time Onboarding Cohort</p>
              </div>
              <div className="pt-2 border-t border-border-subtle space-y-1 font-mono text-[11px] text-text-muted">
                <div className="flex justify-between">
                  <span>Repeat Rate:</span>
                  <span className="text-emerald-400 font-bold">38.4%</span>
                </div>
                <div className="flex justify-between">
                  <span>2nd Order SLA:</span>
                  <span className="text-text-primary">Avg 4.8 days</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedCohort('new')}
              className="w-full py-2 rounded-xl bg-surface-secondary hover:bg-surface-container text-emerald-300 font-bold text-xs transition-colors border border-border-subtle"
            >
              Filter Newbies (620)
            </button>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 2: COHORT FILTERS & PATRON DIRECTORY TABLE
            ══════════════════════════════════════════════════════════════ */}
        <section className="bg-surface-card border border-border-subtle rounded-2xl shadow-xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 font-mono text-xs">
              {(['all', 'vip', 'regular', 'at-risk', 'new'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCohort(c)}
                  className={`px-3.5 py-1.5 rounded-lg capitalize transition-all whitespace-nowrap ${
                    selectedCohort === c
                      ? 'bg-surface-container text-accent-amber font-bold border border-accent-amber/30'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {c === 'all' ? 'All Patrons' : c}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-2 text-[#94a3b8] text-[18px]">
                search
              </span>
              <Search className="w-4 h-4 absolute left-3 top-2 text-text-muted" />
              <input
                aria-label="Search patrons"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, item..."
                className="w-full pl-9 pr-3 py-1.5 bg-surface-secondary border border-border-subtle text-text-primary text-xs rounded-xl outline-none focus:border-accent-amber"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-secondary text-text-muted font-mono text-[11px] uppercase tracking-wider border-b border-border-subtle">
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
              <tbody className="divide-y divide-border-subtle">
                {filteredPatrons.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-coffee flex items-center justify-center font-bold text-text-primary text-xs font-mono">
                          {p.initials}
                        </div>
                        <div>
                          <div className="font-bold text-text-primary">{p.name}</div>
                          <div className="font-mono text-[10px] text-text-muted">{p.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
                          p.tier === 'Platinum'
                            ? 'bg-purple-950/50 text-purple-300 border border-purple-500/30'
                            : p.tier === 'Gold'
                            ? 'bg-accent-amber/20 text-accent-amber border border-accent-amber/30'
                            : p.tier === 'Silver'
                            ? 'bg-blue-950/50 text-blue-300 border border-blue-500/30'
                            : 'bg-surface-container text-text-muted'
                        }`}
                      >
                        {p.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-primary font-bold">{p.rfmScore}</td>
                    <td className="py-3 px-4 font-mono text-text-primary font-bold">
                      Rp {p.lifetimeSpend.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 font-mono text-text-muted">{p.totalVisits} visits</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-text-muted">{p.lastVisit}</td>
                    <td className="py-3 px-4 text-xs text-text-primary">{p.favoriteItem}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSendVoucher(p.name)}
                        className="px-3 py-1 rounded-lg bg-surface-secondary hover:bg-surface-container text-accent-amber border border-accent-amber/30 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
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
        <section className="bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text-primary">Automated WhatsApp Lifecycle Triggers</h3>
              <p className="text-xs text-text-muted">Real-time background triggers executing on patron telemetry.</p>
            </div>
            <span className="font-mono text-xs text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
              Engine Status: Active (3 Triggers)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-surface-secondary border border-border-subtle space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary">At-Risk Winback</span>
                <span className="text-emerald-400 font-mono text-[10px]">Active</span>
              </div>
              <p className="text-xs text-text-muted">
                Trigger: Inactive &gt; 21 days → Dispatches WhatsApp message with 20% V60 single-origin coupon.
              </p>
              <div className="font-mono text-[10px] text-primary">412 messages sent this month • 28% claim rate</div>
            </div>

            <div className="p-4 rounded-xl bg-surface-secondary border border-border-subtle space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary">Night Owl Milestone</span>
                <span className="text-emerald-400 font-mono text-[10px]">Active</span>
              </div>
              <p className="text-xs text-text-muted">
                Trigger: 10th late-night sprint order post-21:00 → Complimentary Cold Brew Aren upgrade.
              </p>
              <div className="font-mono text-[10px] text-primary">184 rewarded • 94% NPS satisfaction</div>
            </div>

            <div className="p-4 rounded-xl bg-surface-secondary border border-border-subtle space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary">Birthday Sanctuary Gift</span>
                <span className="text-emerald-400 font-mono text-[10px]">Active</span>
              </div>
              <p className="text-xs text-text-muted">
                Trigger: Patron Birthday D-Day → Free artisan sourdough toast and VIP pod day pass.
              </p>
              <div className="font-mono text-[10px] text-primary">52 claimed this month • 100% redemption</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
