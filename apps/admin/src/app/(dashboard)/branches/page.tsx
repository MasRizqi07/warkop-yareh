"use client";

import React, { useState } from "react";

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
    id: "DRM-01",
    name: "Darmo Flagship",
    tag: "Central HQ",
    address: "Jl. Raya Darmo No. 42, Tegalsari",
    is24H: true,
    occupancy: 41,
    maxTables: 50,
    dailyRevenue: 18450000,
    dailyTarget: 22000000,
    radiusKm: 7.5,
    posVersion: "v2.4-sync",
  },
  {
    id: "GBG-02",
    name: "Gubeng 24H Sanctuary",
    tag: "East SBY",
    address: "Jl. Sumatra No. 18, Gubeng",
    is24H: true,
    occupancy: 27,
    maxTables: 40,
    dailyRevenue: 14100000,
    dailyTarget: 16000000,
    radiusKm: 6.0,
    posVersion: "v2.4-sync",
  },
  {
    id: "DHM-03",
    name: "Dharmahusada Campus Hub",
    tag: "University Node",
    address: "Jl. Dharmahusada Indah Timur No. 15",
    is24H: false,
    occupancy: 32,
    maxTables: 35,
    dailyRevenue: 9800000,
    dailyTarget: 12000000,
    radiusKm: 4.5,
    posVersion: "v2.4-sync",
  },
];

const INITIAL_PRICES: PriceItem[] = [
  {
    id: "itm-1",
    name: "Cold Brew Aren Brûlée",
    category: "Signature Coffee",
    basePrice: 28000,
    darmoPrice: 28000,
    gubengPrice: 30000,
    dharmahusadaPrice: 25000,
    darmoStock: true,
    gubengStock: true,
    dharmaStock: true,
  },
  {
    id: "itm-2",
    name: "Single-Origin V60 Ijen Honey",
    category: "Artisan Manual Brew",
    basePrice: 32000,
    darmoPrice: 32000,
    gubengPrice: 34000,
    dharmahusadaPrice: 29000,
    darmoStock: true,
    gubengStock: true,
    dharmaStock: false,
  },
  {
    id: "itm-3",
    name: "Matcha Pandan Oat Latte",
    category: "Specialty Tea",
    basePrice: 30000,
    darmoPrice: 30000,
    gubengPrice: 32000,
    dharmahusadaPrice: 27000,
    darmoStock: true,
    gubengStock: false,
    dharmaStock: true,
  },
  {
    id: "itm-4",
    name: "Artisan Smoked Pastrami Brioche",
    category: "Bakery & Food",
    basePrice: 42000,
    darmoPrice: 42000,
    gubengPrice: 45000,
    dharmahusadaPrice: 38000,
    darmoStock: true,
    gubengStock: true,
    dharmaStock: true,
  },
  {
    id: "itm-5",
    name: "VIP Pod 4-Hour Sprint Pass",
    category: "Workspace Pass",
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
  const [selectedBranchId, setSelectedBranchId] = useState<string>("DRM-01");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleStock = (itemId: string, branchKey: "darmoStock" | "gubengStock" | "dharmaStock") => {
    setPrices((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, [branchKey]: !item[branchKey] } : item))
    );
  };

  const handlePriceChange = (
    itemId: string,
    branchKey: "darmoPrice" | "gubengPrice" | "dharmahusadaPrice",
    newVal: number
  ) => {
    setPrices((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, [branchKey]: newVal } : item))
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f8fafc] font-sans">
      {/* ══════════════════════════════════════════════════════════════
          TOP COMMAND & REPLICA TELEMETRY BAR
          ══════════════════════════════════════════════════════════════ */}
      <div className="w-full bg-[#111114] border-b border-white/[0.06] px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#94a3b8]">
            <span>Admin Portal</span>
            <span>/</span>
            <span>Multi-Branch &amp; Store Ops</span>
            <span>/</span>
            <span className="text-white font-semibold">Branch Architecture &amp; Localized Pricing</span>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 bg-[#18181c] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold">Postgres Neon Multi-Region Replica Active</span>
              <span className="text-[#94a3b8]">| 18ms</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert("Exporting Branch Pricing Matrix...")}
              className="px-3 py-1.5 rounded-xl bg-[#18181c] hover:bg-[#201f21] text-xs text-[#94a3b8] hover:text-white font-semibold border border-white/[0.08]"
            >
              Export Matrix
            </button>
            <button
              onClick={() => alert("Global Sync Rule Applied across 3 nodes.")}
              className="px-3 py-1.5 rounded-xl bg-[#18181c] hover:bg-[#201f21] text-xs text-[#f59e0b] font-semibold border border-white/[0.08]"
            >
              Sync Rules
            </button>
            <button
              onClick={() => alert("New Outlet Creation Wizard...")}
              className="px-3.5 py-1.5 rounded-xl bg-[#9c6b3a] hover:bg-[#825426] text-xs text-white font-bold shadow-md"
            >
              + Add Outlet
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ══════════════════════════════════════════════════════════════
            1. OUTLETS TELEMETRY CARDS
            ══════════════════════════════════════════════════════════════ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f59e0b] text-[22px]">storefront</span>
              <h2 className="text-xl font-bold text-white tracking-tight">Active Outlets Telemetry</h2>
              <span className="font-mono text-[10px] bg-[#18181c] text-[#94a3b8] px-2 py-0.5 rounded-full">
                3 Nodes Online
              </span>
            </div>
            <span className="font-mono text-xs text-[#94a3b8] hidden sm:inline">
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
                      ? "bg-[#18181c] border-2 border-[#f59e0b] shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                      : "bg-[#18181c] border border-white/[0.08] hover:border-white/[0.16]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">{b.name}</h3>
                        <span className="px-2 py-0.2 rounded-full bg-[#111114] text-[#f7bb82] font-mono text-[10px]">
                          {b.tag}
                        </span>
                      </div>
                      <p className="text-xs text-[#94a3b8] mt-1">{b.address}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full ${
                        b.is24H
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-[#111114] text-[#94a3b8]"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${b.is24H ? "bg-emerald-400" : "bg-[#94a3b8]"}`} />
                      {b.is24H ? "24H Nonstop" : "07:00 - 23:00"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 font-mono text-xs">
                    <div>
                      <div className="flex justify-between text-[#94a3b8] mb-1">
                        <span>
                          Occupancy ({b.occupancy}/{b.maxTables} Tables)
                        </span>
                        <span className="text-white font-bold">{occPercent}%</span>
                      </div>
                      <div className="w-full bg-[#111114] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#f59e0b] h-full rounded-full" style={{ width: `${occPercent}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[#94a3b8] mb-1">
                        <span>Daily Target</span>
                        <span className="text-[#f7bb82] font-bold">
                          Rp {(b.dailyRevenue / 1000000).toFixed(2)}M ({targetPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#111114] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#9c6b3a] h-full rounded-full" style={{ width: `${targetPercent}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-[#94a3b8]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-[#f59e0b]">radar</span> Radius{" "}
                      {b.radiusKm} km
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
        <section className="bg-[#18181c] border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f7bb82] text-[22px]">tune</span>
                <h3 className="text-lg font-bold text-white">Localized Price Modifier Matrix</h3>
              </div>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                Set outlet-specific price adjustments (surge pricing or campus discounts) and instant inventory
                availability toggles.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#94a3b8] text-[18px]">
                search
              </span>
              <input
                aria-label="Filter branch catalog"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter catalog items..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#111114] border border-white/[0.08] text-white text-xs rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#111114] text-[#94a3b8] font-mono text-[11px] uppercase tracking-wider border-b border-white/[0.06]">
                  <th className="py-3 px-4">Item &amp; Category</th>
                  <th className="py-3 px-4">Base Retail</th>
                  <th className="py-3 px-4">
                    Darmo Flagship <span className="text-[#f7bb82]">(HQ Base)</span>
                  </th>
                  <th className="py-3 px-4">
                    Gubeng 24H <span className="text-[#f59e0b]">(+Late Surge)</span>
                  </th>
                  <th className="py-3 px-4">
                    Dharmahusada <span className="text-emerald-400">(-Student Subsidy)</span>
                  </th>
                  <th className="py-3 px-4 text-right">Instant Stock Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {prices
                  .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-[#201f21]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-xs">{item.name}</div>
                        <span className="font-mono text-[10px] text-[#94a3b8]">{item.category}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-[#94a3b8]">
                        Rp {item.basePrice.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-1 text-white font-bold">
                          <span>Rp</span>
                          <input
                            aria-label={`${item.name} price at Darmo`}
                            type="number"
                            value={item.darmoPrice}
                            onChange={(e) =>
                              handlePriceChange(item.id, "darmoPrice", parseInt(e.target.value) || item.basePrice)
                            }
                            className="w-20 bg-[#111114] border border-white/[0.08] px-2 py-0.5 rounded text-white font-mono text-xs outline-none"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-1 text-[#f59e0b] font-bold">
                          <span>Rp</span>
                          <input
                            aria-label={`${item.name} price at Gubeng`}
                            type="number"
                            value={item.gubengPrice}
                            onChange={(e) =>
                              handlePriceChange(item.id, "gubengPrice", parseInt(e.target.value) || item.basePrice)
                            }
                            className="w-20 bg-[#111114] border border-white/[0.08] px-2 py-0.5 rounded text-[#f59e0b] font-mono text-xs outline-none"
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
                                "dharmahusadaPrice",
                                parseInt(e.target.value) || item.basePrice
                              )
                            }
                            className="w-20 bg-[#111114] border border-white/[0.08] px-2 py-0.5 rounded text-emerald-400 font-mono text-xs outline-none"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 font-mono text-[10px]">
                          <button
                            onClick={() => toggleStock(item.id, "darmoStock")}
                            className={`px-2 py-0.5 rounded ${
                              item.darmoStock
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            Darmo: {item.darmoStock ? "IN" : "OOS"}
                          </button>
                          <button
                            onClick={() => toggleStock(item.id, "gubengStock")}
                            className={`px-2 py-0.5 rounded ${
                              item.gubengStock
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            Gubeng: {item.gubengStock ? "IN" : "OOS"}
                          </button>
                          <button
                            onClick={() => toggleStock(item.id, "dharmaStock")}
                            className={`px-2 py-0.5 rounded ${
                              item.dharmaStock
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            Campus: {item.dharmaStock ? "IN" : "OOS"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
