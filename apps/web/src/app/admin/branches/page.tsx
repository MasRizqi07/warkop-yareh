"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Wifi,
  Save,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { BranchInfo, MOCK_PRODUCTS } from "@/lib/mockData";
import { soundEffects } from "@/lib/audioAlerts";

export default function AdminBranchesPage() {
  const pathname = usePathname();
  const { branches, activeBranchId, setActiveBranch } = useAppStore();

  const [selectedBranchId, setSelectedBranchId] = useState(activeBranchId);
  const selectedBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  const [wifiName, setWifiName] = useState(selectedBranch.wifiName);
  const [wifiPass, setWifiPass] = useState(selectedBranch.wifiPass);
  const [priceMultiplier, setPriceMultiplier] = useState(selectedBranch.priceMultiplier || 1.0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local item overrides
  const [itemOverrides, setItemOverrides] = useState<Record<string, number>>({
    "prod-1": 28000,
    "prod-2": 34000,
    "prod-3": 32000,
  });

  const adminNav = [
    { href: "/admin", label: "Executive Dashboard" },
    { href: "/admin/inventory", label: "Stok & Inventaris" },
    { href: "/admin/crm", label: "CRM & Segmentasi" },
    { href: "/admin/marketing", label: "WhatsApp Studio" },
    { href: "/admin/branches", label: "Multi-Cabang" },
  ];

  const handleSelectBranch = (b: BranchInfo) => {
    setSelectedBranchId(b.id);
    setWifiName(b.wifiName);
    setWifiPass(b.wifiPass);
    setPriceMultiplier(b.priceMultiplier || 1.0);
  };

  const handleSaveBranchConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveBranch(selectedBranchId);
    setSaveSuccess(true);
    soundEffects.playSuccessChime();
    setTimeout(() => setSaveSuccess(false), 3000);
  };

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
            <Building2 className="w-4 h-4 text-[#f59e0b]" />
            <span>SURABAYA MULTI-BRANCH NETWORK HUB</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Konfigurasi Gerai & Price Overrides
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Kelola kapasitas kursi, kredensial Wi-Fi, dan penyesuaian harga khusus tiap cabang Surabaya.
          </p>
        </div>
      </div>

      {/* 3 Branches Horizontal Switcher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {branches.map((b) => {
          const isSelected = b.id === selectedBranchId;
          const occupancyRate = Math.round((b.currentOccupancy / b.seatingCapacity) * 100);

          return (
            <button
              key={b.id}
              onClick={() => handleSelectBranch(b)}
              className={`p-6 rounded-3xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? "bg-[#18181c] border-[#f59e0b] shadow-[0_0_24px_rgba(245,158,11,0.2)] ring-1 ring-[#f59e0b]"
                  : "bg-[#141418] border-white/5 text-neutral-400 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-[#f59e0b] font-bold uppercase">
                  Cabang #{b.id.toUpperCase()}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    b.status === "open"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {b.status}
                </span>
              </div>

              <h3 className="font-heading font-bold text-lg text-white">{b.name}</h3>
              <p className="text-xs text-neutral-400 line-clamp-1 mt-1">{b.address}</p>

              {/* Seating Occupancy Meter */}
              <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-neutral-300">
                  <span>Okupansi Meja:</span>
                  <span className="font-bold text-white">
                    {b.currentOccupancy} / {b.seatingCapacity} ({occupancyRate}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[#111114] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      occupancyRate > 80 ? "bg-rose-500" : "bg-[#f59e0b]"
                    }`}
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Branch Detail Settings Form & Price Overrides */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Branch Infrastructure & Wi-Fi (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <form
            onSubmit={handleSaveBranchConfig}
            className="p-6 sm:p-7 rounded-3xl bg-[#18181c] border border-white/10 space-y-5 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-white">
                  Pengaturan Fasilitas: {selectedBranch.name}
                </h3>
                <p className="text-xs text-neutral-400">{selectedBranch.tagline}</p>
              </div>
              <span className="text-xs font-mono text-[#f59e0b] bg-[#f59e0b]/10 px-3 py-1 rounded-full">
                {selectedBranch.hours}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Alamat Lengkap
              </label>
              <input
                type="text"
                disabled
                value={selectedBranch.address}
                className="w-full px-4 py-2.5 rounded-xl bg-[#111114] border border-white/5 text-neutral-400 text-xs cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Nama SSID Wi-Fi
                </label>
                <div className="relative">
                  <Wifi className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={wifiName}
                    onChange={(e) => setWifiName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#111114] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Password Wi-Fi Pelanggan
                </label>
                <input
                  type="text"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#111114] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#f59e0b]"
                />
              </div>
            </div>

            {/* Global Multiplier */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-300">
                  Multiplier Harga Cabang (Regional Pricing)
                </label>
                <span className="font-mono text-xs text-[#f59e0b] font-bold">
                  {priceMultiplier}x
                </span>
              </div>
              <input
                type="range"
                min="0.85"
                max="1.20"
                step="0.05"
                value={priceMultiplier}
                onChange={(e) => setPriceMultiplier(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#111114] rounded-lg appearance-none cursor-pointer accent-[#f59e0b]"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-500 mt-1">
                <span>0.85x (-15% Promo Kampus)</span>
                <span>1.0x (Standard)</span>
                <span>1.2x (+20% Peak Surcharge)</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] hover:opacity-95 text-white font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Konfigurasi Cabang</span>
            </button>

            {saveSuccess && (
              <p className="text-xs text-emerald-400 text-center">
                Konfigurasi cabang berhasil diperbarui secara live!
              </p>
            )}
          </form>
        </div>

        {/* Right Column: Localized Menu Price Overrides (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-[#18181c] border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-white">
                  Localized Menu Price Overrides
                </h3>
                <p className="text-xs text-neutral-400">
                  Override harga satuan untuk {selectedBranch.name}
                </p>
              </div>
              <span className="text-xs font-mono text-neutral-400">3 Menu Utama</span>
            </div>

            <div className="space-y-3">
              {MOCK_PRODUCTS.slice(0, 4).map((prod) => {
                const currentOverride =
                  itemOverrides[prod.id] || Math.round(prod.price * priceMultiplier);

                return (
                  <div
                    key={prod.id}
                    className="p-3 rounded-2xl bg-[#111114] border border-white/5 flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <h4 className="font-semibold text-white">{prod.name}</h4>
                      <div className="text-[10px] font-mono text-neutral-500">
                        Base: Rp {prod.price.toLocaleString("id-ID")}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-neutral-400 text-[11px]">Rp</span>
                      <input
                        type="number"
                        step="1000"
                        value={currentOverride}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setItemOverrides((prev) => ({ ...prev, [prod.id]: val }));
                        }}
                        className="w-28 px-3 py-1.5 rounded-xl bg-[#18181c] border border-white/10 text-white font-mono font-bold text-xs focus:outline-none focus:border-[#f59e0b]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-2xl bg-[#111114] border border-white/5 text-[11px] text-neutral-400 leading-relaxed">
              Perubahan harga otomatis diterapkan ke menu digital pelanggan yang sedang tersambung ke WiFi cabang {selectedBranch.name}.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
