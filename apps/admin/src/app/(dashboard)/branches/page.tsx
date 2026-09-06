'use client';

import React, { useState } from 'react';
import {
  Download,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Sliders,
  Store,
} from 'lucide-react';

interface BranchNode {
  id: string;
  name: string;
  tag: string;
  address: string;
  is24H: boolean;
  occupancy: number;
  maxTables: number;
  dailyRevenue: number;
  dailyTarget: number;
  radiusKm: number;
  posVersion: string;
}

interface PriceItem {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  darmoPrice: number;
  gubengPrice: number;
  dharmahusadaPrice: number;
  darmoStock: boolean;
  gubengStock: boolean;
  dharmaStock: boolean;
}

const INITIAL_BRANCHES: BranchNode[] = [
  {
    id: 'DRM-01',
    name: 'Darmo Flagship',
    tag: 'Central HQ',
    address: 'Jl. Raya Darmo No. 42, Tegalsari',
    is24H: true,
    occupancy: 41,
    maxTables: 50,
    dailyRevenue: 18450000,
    dailyTarget: 22000000,
    radiusKm: 7.5,
    posVersion: 'v2.4-sync',
  },
  {
    id: 'GBG-02',
    name: 'Gubeng 24H Sanctuary',
    tag: 'East SBY',
    address: 'Jl. Sumatra No. 18, Gubeng',
    is24H: true,
    occupancy: 27,
    maxTables: 40,
    dailyRevenue: 14100000,
    dailyTarget: 16000000,
    radiusKm: 6.0,
    posVersion: 'v2.4-sync',
  },
  {
    id: 'DHM-03',
    name: 'Dharmahusada Campus Hub',
    tag: 'University Node',
    address: 'Jl. Dharmahusada Indah Timur No. 15',
    is24H: false,
    occupancy: 32,
    maxTables: 35,
    dailyRevenue: 9800000,
    dailyTarget: 12000000,
    radiusKm: 4.5,
    posVersion: 'v2.4-sync',
  },
];

const INITIAL_PRICES: PriceItem[] = [
  {
    id: 'itm-1',
    name: 'Cold Brew Aren Brûlée',
    category: 'Signature Cold Brew',
    basePrice: 43000,
    darmoPrice: 43000,
    gubengPrice: 45000,
    dharmahusadaPrice: 39000,
    darmoStock: true,
    gubengStock: true,
    dharmaStock: true,
  },
  {
    id: 'itm-2',
    name: 'Single-Origin V60 Ijen Anaerobic',
    category: 'Slow Bar Pour',
    basePrice: 38000,
    darmoPrice: 38000,
    gubengPrice: 38000,
    dharmahusadaPrice: 35000,
    darmoStock: true,
    gubengStock: false,
    dharmaStock: true,
  },
  {
    id: 'itm-3',
    name: 'Matcha Pandan Oat Latte',
    category: 'Artisan Latte',
    basePrice: 35000,
    darmoPrice: 35000,
    gubengPrice: 36000,
    dharmahusadaPrice: 32000,
    darmoStock: true,
    gubengStock: true,
    dharmaStock: false,
  },
  {
    id: 'itm-4',
    name: 'Smoked Pastrami Brioche Toast',
    category: 'Midnight Toast',
    basePrice: 48000,
    darmoPrice: 48000,
    gubengPrice: 50000,
    dharmahusadaPrice: 45000,
    darmoStock: true,
    gubengStock: true,
    dharmaStock: true,
  },
  {
    id: 'itm-5',
    name: 'VIP Pod 4-Hour Sprint Pass',
    category: 'Workspace Pass',
    basePrice: 50000,
    darmoPrice: 50000,
    gubengPrice: 55000,
    dharmahusadaPrice: 40000,
    darmoStock: true,
    gubengStock: true,
    dharmaStock: true,
  },
];

export default function MultiBranchManagementPage() {
  const [branches] = useState<BranchNode[]>(INITIAL_BRANCHES);
  const [prices, setPrices] = useState<PriceItem[]>(INITIAL_PRICES);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('DRM-01');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleStock = (itemId: string, branchKey: 'darmoStock' | 'gubengStock' | 'dharmaStock') => {
    setPrices((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, [branchKey]: !item[branchKey] } : item))
    );
  };

  const handlePriceChange = (
    itemId: string,
    branchKey: 'darmoPrice' | 'gubengPrice' | 'dharmahusadaPrice',
    newVal: number
  ) => {
    setPrices((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, [branchKey]: newVal } : item))
    );
  };

  return (
    <div className="min-h-screen bg-canvas-obsidian text-text-primary font-sans">
      {/* ══════════════════════════════════════════════════════════════
          TOP COMMAND & REPLICA TELEMETRY BAR
          ══════════════════════════════════════════════════════════════ */}
      <div className="w-full bg-surface-secondary border-b border-border-subtle px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-text-muted">
            <span>Admin Portal</span>
            <span>/</span>
            <span>Multi-Branch &amp; Store Ops</span>
            <span>/</span>
            <span className="text-text-primary font-semibold">Branch Architecture &amp; Localized Pricing</span>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 bg-surface-card px-2.5 py-0.5 rounded-full border border-border-subtle">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold">Postgres Neon Multi-Region Replica Active</span>
              <span className="text-text-muted">| 18ms</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Exporting Branch Pricing Matrix...')}
              className="px-3 py-1.5 rounded-xl bg-surface-card hover:bg-surface-container text-xs text-text-muted hover:text-text-primary font-semibold border border-border-subtle flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Matrix</span>
            </button>
            <button
              onClick={() => alert('Global Sync Rule Applied across 3 nodes.')}
              className="px-3 py-1.5 rounded-xl bg-surface-card hover:bg-surface-container text-xs text-accent-amber font-semibold border border-border-subtle flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Rules</span>
            </button>
            <button
              onClick={() => alert('New Outlet Creation Wizard...')}
              className="px-3.5 py-1.5 rounded-xl bg-brand-coffee hover:bg-primary-container text-xs text-text-primary font-bold shadow-md flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Outlet</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ══════════════════════════════════════════════════════════════
            1. OUTLETS TELEMETRY CARDS
            ══════════════════════════════════════════════════════════════ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-accent-amber" />
              <h2 className="text-xl font-bold text-text-primary tracking-tight font-headline-md">
                Active Outlets Telemetry
              </h2>
              <span className="font-mono text-[10px] bg-surface-card text-text-muted px-2 py-0.5 rounded-full border border-border-subtle">
                3 Nodes Online
              </span>
            </div>
            <span className="font-mono text-xs text-text-muted hidden sm:inline">
              Select outlet to inspect localized overrides
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {branches.map((b) => {
              const occPercent = Math.round((b.occupancy / b.maxTables) * 100);
              const targetPercent = Math.round((b.dailyRevenue / b.dailyTarget) * 100);
              const isSelected = selectedBranchId === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBranchId(b.id)}
                  className={`relative p-5 rounded-2xl cursor-pointer transition-all shadow-xl ${
                    isSelected
                      ? 'bg-surface-card border-2 border-accent-amber shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                      : 'bg-surface-card border border-border-subtle hover:border-border-subtle/80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-text-primary text-base font-headline-md">{b.name}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-surface-secondary text-primary font-mono text-[10px] border border-border-subtle">
                          {b.tag}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-1">{b.address}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full ${
                        b.is24H
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-surface-secondary text-text-muted border border-border-subtle'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${b.is24H ? 'bg-emerald-400' : 'bg-text-muted'}`} />
                      {b.is24H ? '24H Nonstop' : '07:00 - 23:00'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 font-mono text-xs">
                    <div>
                      <div className="flex justify-between text-text-muted mb-1">
                        <span>
                          Occupancy ({b.occupancy}/{b.maxTables} Tables)
                        </span>
                        <span className="text-text-primary font-bold">{occPercent}%</span>
                      </div>
                      <div className="w-full bg-surface-secondary h-1.5 rounded-full overflow-hidden">
                        <div className="bg-accent-amber h-full rounded-full" style={{ width: `${occPercent}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-text-muted mb-1">
                        <span>Daily Target</span>
                        <span className="text-primary font-bold">
                          Rp {(b.dailyRevenue / 1000000).toFixed(2)}M ({targetPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-surface-secondary h-1.5 rounded-full overflow-hidden">
                        <div className="bg-brand-coffee h-full rounded-full" style={{ width: `${targetPercent}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between font-mono text-[11px] text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-accent-amber" /> Radius {b.radiusKm} km
                    </span>
                    <span>{b.posVersion}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            2. LOCALIZED PRICING MODIFIER MATRIX
            ══════════════════════════════════════════════════════════════ */}
        <section className="bg-surface-card border border-border-subtle rounded-2xl shadow-xl overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-text-primary font-headline-md">
                  Localized Price Modifier Matrix
                </h3>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Set outlet-specific price adjustments (surge pricing or campus discounts) and instant inventory
                availability toggles.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#94a3b8] text-[18px]">
                search
              </span>
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
              <input
                aria-label="Filter branch catalog"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter catalog items..."
                className="w-full pl-9 pr-3 py-1.5 bg-surface-secondary border border-border-subtle text-text-primary text-xs rounded-xl outline-none focus:border-accent-amber"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-secondary text-text-muted font-mono text-[11px] uppercase tracking-wider border-b border-border-subtle">
                  <th className="py-3 px-4">Item &amp; Category</th>
                  <th className="py-3 px-4">Base Retail</th>
                  <th className="py-3 px-4">
                    Darmo Flagship <span className="text-primary">(HQ Base)</span>
                  </th>
                  <th className="py-3 px-4">
                    Gubeng 24H <span className="text-accent-amber">(+Late Surge)</span>
                  </th>
                  <th className="py-3 px-4">
                    Dharmahusada <span className="text-emerald-400">(-Student Subsidy)</span>
                  </th>
                  <th className="py-3 px-4 text-right">Instant Stock Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {prices
                  .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-surface-container/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-text-primary text-xs">{item.name}</div>
                        <span className="font-mono text-[10px] text-text-muted">{item.category}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-text-muted">
                        Rp {item.basePrice.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-1 text-text-primary font-bold">
                          <span>Rp</span>
                          <input
                            aria-label={`${item.name} price at Darmo`}
                            type="number"
                            value={item.darmoPrice}
                            onChange={(e) =>
                              handlePriceChange(item.id, 'darmoPrice', parseInt(e.target.value) || item.basePrice)
                            }
                            className="w-20 bg-surface-secondary border border-border-subtle px-2 py-0.5 rounded text-text-primary font-mono text-xs outline-none focus:border-accent-amber"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-1 text-accent-amber font-bold">
                          <span>Rp</span>
                          <input
                            aria-label={`${item.name} price at Gubeng`}
                            type="number"
                            value={item.gubengPrice}
                            onChange={(e) =>
                              handlePriceChange(item.id, 'gubengPrice', parseInt(e.target.value) || item.basePrice)
                            }
                            className="w-20 bg-surface-secondary border border-border-subtle px-2 py-0.5 rounded text-accent-amber font-mono text-xs outline-none focus:border-accent-amber"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-1 text-emerald-400 font-bold">
                          <span>Rp</span>
                          <input
                            aria-label={`${item.name} price at Dharmahusada`}
                            type="number"
                            value={item.dharmahusadaPrice}
                            onChange={(e) =>
                              handlePriceChange(
                                item.id,
                                'dharmahusadaPrice',
                                parseInt(e.target.value) || item.basePrice
                              )
                            }
                            className="w-20 bg-surface-secondary border border-border-subtle px-2 py-0.5 rounded text-emerald-400 font-mono text-xs outline-none focus:border-accent-amber"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 font-mono text-[10px]">
                          <button
                            onClick={() => toggleStock(item.id, 'darmoStock')}
                            className={`px-2 py-0.5 rounded ${
                              item.darmoStock
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            Darmo: {item.darmoStock ? 'IN' : 'OOS'}
                          </button>
                          <button
                            onClick={() => toggleStock(item.id, 'gubengStock')}
                            className={`px-2 py-0.5 rounded ${
                              item.gubengStock
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            Gubeng: {item.gubengStock ? 'IN' : 'OOS'}
                          </button>
                          <button
                            onClick={() => toggleStock(item.id, 'dharmaStock')}
                            className={`px-2 py-0.5 rounded ${
                              item.dharmaStock
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            Campus: {item.dharmaStock ? 'IN' : 'OOS'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
