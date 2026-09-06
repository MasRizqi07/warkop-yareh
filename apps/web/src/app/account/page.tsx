"use client";

import React, { useState } from "react";
import Link from "next/link";

interface OrderArchive {
  id: string;
  date: string;
  branch: string;
  itemsSummary: string;
  total: number;
  status: "Completed" | "In Preparation" | "Refunded";
}

const PAST_ORDERS: OrderArchive[] = [
  {
    id: "YR-20260904-8921",
    date: "04 Sep 2026, 23:42 WIB",
    branch: "Darmo Flagship (Table #14)",
    itemsSummary: "1× Cold Brew Aren Brulee, 1× Artisan Toasted Sourdough",
    total: 69000,
    status: "Completed",
  },
  {
    id: "YR-20260902-7104",
    date: "02 Sep 2026, 19:15 WIB",
    branch: "Darmo Flagship (Tech Hub Desk #02)",
    itemsSummary: "1× Iced Matcha Pandan Latte, 1× French Butter Almond Croissant",
    total: 67000,
    status: "Completed",
  },
  {
    id: "YR-20260829-4591",
    date: "29 Aug 2026, 14:10 WIB",
    branch: "Gubeng Sanctuary (Self Pickup)",
    itemsSummary: "2× Velvet Flat White 6oz, 1× Warkop Heritage Toast",
    total: 86000,
    status: "Completed",
  },
  {
    id: "YR-20260825-3312",
    date: "25 Aug 2026, 21:05 WIB",
    branch: "Darmo Flagship (Table #08)",
    itemsSummary: "1× Sumatra Gayo V60 Manual Brew, 1× Cold Brew Aren Brulee",
    total: 66000,
    status: "Completed",
  },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "preferences" | "security">("orders");

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e5e1e4] pt-8 sm:pt-10 pb-32">
      {/* Subtle Ambient Glow */}
      <div className="fixed -top-24 right-1/4 w-96 h-96 bg-[#f59e0b]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Breadcrumb & Page Header */}
        <div className="flex flex-col space-y-2 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 font-mono text-xs text-[#94a3b8]">
            <Link href="/" className="hover:text-[#f7bb82] transition-colors">Sanctuary Home</Link>
            <span>/</span>
            <span className="text-[#94a3b8]">Member Portal</span>
            <span>/</span>
            <span className="text-[#f59e0b] font-semibold">Profile &amp; History</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-1">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f8fafc] tracking-tight">
                Account Sanctuary &amp; Order Archives
              </h1>
              <p className="text-xs sm:text-sm text-[#94a3b8] max-w-2xl">
                Manage your identity, frequent midnight roasts, verified invoice archives, and active Surabaya table privileges.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#111114] px-3.5 py-1.5 rounded-xl border border-white/[0.08] self-start lg:self-auto shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f59e0b] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f59e0b]"></span>
              </span>
              <span className="font-mono text-[11px] text-[#94a3b8]">Session: Darmo Mesh #04</span>
              <span>•</span>
              <span className="font-mono text-[11px] text-[#f7bb82] font-bold">23:58 WIB</span>
            </div>
          </div>
        </div>

        {/* Lifetime KPI Bar Strip (4 cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111114] rounded-2xl p-5 border border-white/[0.08] shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#94a3b8] mb-2">
              <span className="text-xs uppercase font-mono">Lifetime Orders</span>
              <span className="material-symbols-outlined text-[#f7bb82] text-[18px]">receipt_long</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#f8fafc] font-mono">68</span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">+4 this month</span>
            </div>
            <span className="text-[11px] text-[#94a3b8] mt-2">Across 2 Surabaya outlets</span>
          </div>

          <div className="bg-[#111114] rounded-2xl p-5 border border-white/[0.08] shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#94a3b8] mb-2">
              <span className="text-xs uppercase font-mono">Active Points</span>
              <span className="material-symbols-outlined text-[#f59e0b] text-[18px]">award_star</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#f59e0b] font-mono">1,450</span>
              <span className="text-[10px] font-mono text-[#f59e0b] bg-[#f59e0b]/15 px-1.5 py-0.5 rounded">
                Gold 1.5x Multiplier
              </span>
            </div>
            <span className="text-[11px] text-[#94a3b8] mt-2">Approx. Rp 145.000 value</span>
          </div>

          <div className="bg-[#111114] rounded-2xl p-5 border border-white/[0.08] shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#94a3b8] mb-2">
              <span className="text-xs uppercase font-mono">Primary Flagship</span>
              <span className="material-symbols-outlined text-[#e8c47a] text-[18px]">store</span>
            </div>
            <div>
              <p className="text-lg font-bold text-[#f8fafc]">Darmo Flagship</p>
              <p className="text-[11px] text-[#94a3b8]">92% of your reservations</p>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono mt-2">Preferred Table #14</span>
          </div>

          <div className="bg-[#111114] rounded-2xl p-5 border border-white/[0.08] shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#94a3b8] mb-2">
              <span className="text-xs uppercase font-mono">Focus Hours</span>
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">bolt</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#f8fafc] font-mono">142</span>
              <span className="text-xs text-[#94a3b8]">Hours</span>
            </div>
            <span className="text-[11px] text-[#94a3b8] mt-2">Logged in Tech Hub</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1 overflow-x-auto scrollbar-none">
          {[
            { id: "orders", label: "Order Archives", icon: "inventory_2" },
            { id: "profile", label: "Patron Identity", icon: "badge" },
            { id: "preferences", label: "Brew & Desk Preferences", icon: "tune" },
            { id: "security", label: "Sessions & Security", icon: "security" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-[#18181c] border border-white/[0.08] text-[#f7bb82] shadow-sm"
                  : "text-[#94a3b8] hover:text-[#f8fafc]"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            TAB 1: ORDER ARCHIVES
            ══════════════════════════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#f8fafc]">Past Order Receipts</h3>
              <span className="font-mono text-xs text-[#94a3b8]">Verified Tax Invoices (PB1)</span>
            </div>

            <div className="space-y-3">
              {PAST_ORDERS.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl bg-[#111114] border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#f7bb82] bg-[#18181c] px-2 py-0.5 rounded border border-white/[0.06]">
                        {ord.id}
                      </span>
                      <span className="text-[11px] text-[#94a3b8]">{ord.date}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#f8fafc]">{ord.itemsSummary}</p>
                    <p className="text-xs text-[#94a3b8]">{ord.branch}</p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-white/[0.06]">
                    <span className="font-mono font-extrabold text-base text-[#f59e0b]">
                      Rp {ord.total.toLocaleString("id-ID")}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/orders/${encodeURIComponent(ord.id)}`}
                        className="px-3 py-1.5 rounded-lg bg-[#18181c] hover:bg-[#201f21] text-xs text-[#d5c3b6] hover:text-[#f8fafc] border border-white/[0.08] transition-colors"
                      >
                        Receipt
                      </Link>
                      <Link
                        href="/menu"
                        className="px-3 py-1.5 rounded-lg bg-[#9c6b3a]/30 hover:bg-[#9c6b3a]/60 text-xs text-[#f7bb82] font-semibold transition-colors"
                      >
                        Reorder
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 2: PATRON IDENTITY
            ══════════════════════════════════════════════════════════════ */}
        {activeTab === "profile" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#111114] border border-white/[0.08] shadow-md space-y-6 max-w-2xl">
            <h3 className="font-bold text-lg text-[#f8fafc]">Patron Profile Identity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[#94a3b8] block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  defaultValue="Reyhan Arisandi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181c] border border-white/[0.08] text-[#f8fafc] focus:outline-none focus:border-[#f59e0b]"
                />
              </div>
              <div>
                <label className="text-[#94a3b8] block mb-1">WhatsApp Mobile</label>
                <input
                  type="text"
                  defaultValue="+62 812-9876-5432"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181c] border border-white/[0.08] text-[#f8fafc] focus:outline-none focus:border-[#f59e0b]"
                />
              </div>
              <div>
                <label className="text-[#94a3b8] block mb-1">Email Address</label>
                <input
                  type="email"
                  defaultValue="reyhan.arisandi@surabayatech.id"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181c] border border-white/[0.08] text-[#f8fafc] focus:outline-none focus:border-[#f59e0b]"
                />
              </div>
              <div>
                <label className="text-[#94a3b8] block mb-1">Patron Unique ID</label>
                <input
                  type="text"
                  defaultValue="#YR-9821-SBY"
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181c] border border-white/[0.04] text-[#94a3b8] font-mono"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert("Profile updated successfully!")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#ee9800] text-[#f8fafc] font-bold text-xs shadow-md hover:brightness-110 transition-all"
            >
              Save Profile Changes
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 3: PREFERENCES
            ══════════════════════════════════════════════════════════════ */}
        {activeTab === "preferences" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#111114] border border-white/[0.08] shadow-md space-y-6 max-w-2xl text-xs">
            <h3 className="font-bold text-lg text-[#f8fafc]">Coffee &amp; Coworking Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[#94a3b8] block mb-1.5">Default Milk Preference</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181c] border border-white/[0.08] text-[#f8fafc] focus:outline-none">
                  <option>Oatly Barista Oat Milk</option>
                  <option>Fresh Whole Dairy Milk</option>
                  <option>Almond Milk</option>
                </select>
              </div>

              <div>
                <label className="text-[#94a3b8] block mb-1.5">Preferred Sweetness</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181c] border border-white/[0.08] text-[#f8fafc] focus:outline-none">
                  <option>50% Less Sweet (Recommended)</option>
                  <option>0% No Sugar / Unsweetened</option>
                  <option>100% Signature Palm Sugar</option>
                </select>
              </div>

              <div>
                <label className="text-[#94a3b8] block mb-1.5">Desk Seating Preference</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181c] border border-white/[0.08] text-[#f8fafc] focus:outline-none">
                  <option>Tech Hub (Dual AC + USB-C 100W PD)</option>
                  <option>Quiet Pod (Sub-35dB Silent Zone)</option>
                  <option>Garden Smoking Balcony</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert("Preferences saved successfully!")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#ee9800] text-[#f8fafc] font-bold text-xs shadow-md"
            >
              Update Preferences
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 4: SECURITY & SESSIONS
            ══════════════════════════════════════════════════════════════ */}
        {activeTab === "security" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#111114] border border-white/[0.08] shadow-md space-y-6 max-w-2xl text-xs">
            <h3 className="font-bold text-lg text-[#f8fafc]">Active Wi-Fi &amp; Web Sessions</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#18181c] border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-[#f8fafc]">MacBook Pro 16&quot; (macOS Sonoma)</p>
                  <p className="text-[11px] text-[#94a3b8] mt-0.5">Darmo Flagship • IP 10.24.8.91 (Gigabit Mesh)</p>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                  Active Now
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#18181c] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-[#f8fafc]">iPhone 15 Pro (iOS 18)</p>
                  <p className="text-[11px] text-[#94a3b8] mt-0.5">Cellular Telkomsel 5G • 2 hours ago</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Session revoked.")}
                  className="text-[11px] text-red-400 hover:underline"
                >
                  Revoke
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert("Logged out of all other devices.")}
              className="px-5 py-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 font-semibold text-xs hover:bg-red-900/40 transition-colors"
            >
              Sign Out All Other Sessions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
