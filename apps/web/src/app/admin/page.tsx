"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  DollarSign,
  Users,
  Coffee,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function AdminDashboardPage() {
  const pathname = usePathname();
  const { getActiveBranch } = useAppStore();
  const activeBranch = getActiveBranch();

  const [dateRange, setDateRange] = useState("Hari Ini");

  const adminNav = [
    { href: "/admin", label: "Executive Dashboard" },
    { href: "/admin/inventory", label: "Stok & Inventaris" },
    { href: "/admin/crm", label: "CRM & Segmentasi" },
    { href: "/admin/marketing", label: "WhatsApp Studio" },
    { href: "/admin/branches", label: "Multi-Cabang" },
  ];

  // Hourly footfall data (24 hours in Surabaya)
  const hourlyData = [
    { hour: "06:00", visitors: 12, height: "15%" },
    { hour: "08:00", visitors: 48, height: "45%" },
    { hour: "10:00", visitors: 65, height: "60%" },
    { hour: "12:00", visitors: 88, height: "85%" },
    { hour: "14:00", visitors: 72, height: "70%" },
    { hour: "16:00", visitors: 84, height: "80%" },
    { hour: "18:00", visitors: 96, height: "92%" },
    { hour: "20:00", visitors: 108, height: "100%" },
    { hour: "22:00", visitors: 94, height: "90%" },
    { hour: "00:00", visitors: 62, height: "58%" },
    { hour: "02:00", visitors: 34, height: "30%" },
  ];

  // Leaderboard products
  const bestSellers = [
    { name: "Kopi Susu Aren Brulee", units: 142, rev: 3976000, trend: "+18%" },
    { name: "Nitro Honey Cold Brew", units: 98, rev: 3332000, trend: "+24%" },
    { name: "Nasi Kulit Sambal Matah", units: 86, rev: 3268000, trend: "+12%" },
    { name: "Ijen Single Origin V60", units: 74, rev: 2368000, trend: "+8%" },
    { name: "Matcha Kyoto Oat Latte", units: 62, rev: 2232000, trend: "+15%" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-8 sm:pt-10 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Admin Module Sub-Nav */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-8 border-b border-white/5 scrollbar-none">
        {adminNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#9c6b3a] text-white shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>ENTERPRISE BACK-OFFICE OPERATIONS</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Executive Analytics & Operations
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Konsolidasi performa gerai Surabaya ({activeBranch.name})
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-[#141418] p-1.5 rounded-2xl border border-white/5 text-xs font-mono">
          {["Hari Ini", "7 Hari Terakhir", "Bulan Ini"].map((d) => (
            <button
              key={d}
              onClick={() => setDateRange(d)}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                dateRange === d ? "bg-[#f59e0b] text-black font-bold" : "text-neutral-400 hover:text-white"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-6 rounded-3xl bg-[#18181c] border border-white/10 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono uppercase">Omzet Penjualan</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-extrabold text-2xl text-white">
            Rp 18.420.000
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.8% vs hari kemarin</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#18181c] border border-white/10 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono uppercase">Transaksi Sukses</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-extrabold text-2xl text-white">
            342 Pesanan
          </div>
          <div className="flex items-center gap-1 text-[11px] text-sky-400 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>99.4% SLA Saji &lt; 8 Mnt</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#18181c] border border-white/10 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono uppercase">Rata-Rata Keranjang (AOV)</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-[#f59e0b]">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-extrabold text-2xl text-white">
            Rp 53.800
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#f59e0b] font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+Rp 4.200 (Add-on Oat/Beans)</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#18181c] border border-white/10 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono uppercase">Okupansi Meja & Pod</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-extrabold text-2xl text-white">
            78% Terisi
          </div>
          <div className="flex items-center gap-1 text-[11px] text-purple-400 font-mono">
            <span>Peak 20:00 - 02:00 WIB</span>
          </div>
        </div>
      </div>

      {/* Grid: Footfall Heatmap + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Hourly Footfall Bar Heatmap (8 cols) */}
        <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-[#18181c] border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="font-heading font-bold text-base text-white">
                Pola Kunjungan Per Jam (Peak Footfall)
              </h3>
              <p className="text-xs text-neutral-400">
                Puncak kepadatan workspace & coffee bar di Surabaya.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Kapasitas Optimal
            </span>
          </div>

          {/* Bar chart representation */}
          <div className="h-56 flex items-end justify-between gap-2 pt-6">
            {hourlyData.map((bar) => (
              <div key={bar.hour} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.visitors}
                </div>
                <div className="w-full bg-[#111114] rounded-t-xl h-40 flex items-end p-1">
                  <div
                    className="w-full bg-gradient-to-t from-[#9c6b3a] to-[#f59e0b] rounded-lg transition-all group-hover:brightness-125"
                    style={{ height: bar.height }}
                  />
                </div>
                <span className="text-[10px] font-mono text-neutral-500">{bar.hour}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Share Donut Breakdown (4 cols) */}
        <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-[#18181c] border border-white/10 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-white">
              Pangsa Penjualan Kategori
            </h3>
            <p className="text-xs text-neutral-400">
              Distribusi kontribusi revenue per segmen menu.
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {[
              { label: "Kopi Specialty", pct: 54, color: "bg-[#f59e0b]" },
              { label: "Makanan & Heavy Meal", pct: 26, color: "bg-emerald-400" },
              { label: "Non-Coffee & Matcha", pct: 12, color: "bg-sky-400" },
              { label: "Pastry & Bakery", pct: 8, color: "bg-purple-400" },
            ].map((cat) => (
              <div key={cat.label} className="space-y-1">
                <div className="flex justify-between text-neutral-300">
                  <span className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                    <span>{cat.label}</span>
                  </span>
                  <span className="font-bold text-white">{cat.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#111114] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cat.color} rounded-full`}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-[#111114] border border-white/5 text-xs text-neutral-400">
            Kopi Susu Aren Brulee memimpin margin profit kotor sebesar 72.4%.
          </div>
        </div>
      </div>

      {/* Best-Selling Leaderboard Table */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#18181c] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-white">
            Menu Terlaris (Leaderboard Hari Ini)
          </h3>
          <span className="text-xs font-mono text-neutral-400">Update Tiap Transaksi KDS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400 font-mono uppercase">
                <th className="py-3 px-2">Peringkat</th>
                <th className="py-3 px-2">Nama Menu</th>
                <th className="py-3 px-2">Porsi Terjual</th>
                <th className="py-3 px-2">Total Omzet</th>
                <th className="py-3 px-2">Pertumbuhan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {bestSellers.map((item, idx) => (
                <tr key={item.name} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2 font-bold text-[#f59e0b]">#{idx + 1}</td>
                  <td className="py-3 px-2 font-sans font-semibold text-white">{item.name}</td>
                  <td className="py-3 px-2 text-neutral-300">{item.units} Porsi</td>
                  <td className="py-3 px-2 text-emerald-400 font-bold">
                    Rp {item.rev.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-2 text-sky-400">{item.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
