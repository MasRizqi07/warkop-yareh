"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  ClipboardList,
  X,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { InventoryItem } from "@/lib/mockData";
import { soundEffects } from "@/lib/audioAlerts";

export default function AdminInventoryPage() {
  const pathname = usePathname();
  const { inventory, updateStock, reconcileStockOpname, getActiveBranch } = useAppStore();
  const activeBranch = getActiveBranch();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItemForOpname, setSelectedItemForOpname] = useState<InventoryItem | null>(null);
  const [actualStockInput, setActualStockInput] = useState<number>(0);

  const adminNav = [
    { href: "/admin", label: "Executive Dashboard" },
    { href: "/admin/inventory", label: "Stok & Inventaris" },
    { href: "/admin/crm", label: "CRM & Segmentasi" },
    { href: "/admin/marketing", label: "WhatsApp Studio" },
    { href: "/admin/branches", label: "Multi-Cabang" },
  ];

  // Filter items
  const filteredInventory = inventory.filter((item) => {
    const matchCat = selectedCategory === "all" || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const lowStockItems = inventory.filter((item) => item.stock <= item.minThreshold);

  const handleOpenOpname = (item: InventoryItem) => {
    setSelectedItemForOpname(item);
    setActualStockInput(item.stock);
  };

  const handleSaveOpname = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForOpname) return;
    reconcileStockOpname(selectedItemForOpname.id, actualStockInput);
    soundEffects.playSuccessChime();
    setSelectedItemForOpname(null);
  };

  const handleQuickRestock = (itemId: string, qty: number) => {
    updateStock(itemId, qty);
    soundEffects.playSuccessChime();
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
            <Boxes className="w-4 h-4 text-[#f59e0b]" />
            <span>CENTRAL INVENTORY & BURN-RATE TRACKER</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Monitoring Bahan Baku & Stock Opname
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Gudang Bahan Baku • {activeBranch.name}
          </p>
        </div>

        {lowStockItems.length > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono animate-pulse">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{lowStockItems.length} Bahan Di Bawah Batas Minimum!</span>
          </div>
        )}
      </div>

      {/* Inventory Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
          <input
            aria-label="Cari inventaris"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari biji kopi, oat milk, cup kertas, sirup..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#141418] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#f59e0b]"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "Semua Kategori" },
            { id: "beans", label: "Biji Kopi" },
            { id: "dairy", label: "Susu & Dairy" },
            { id: "packaging", label: "Cup & Kemasan" },
            { id: "syrup", label: "Sirup Aren" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-[#9c6b3a] text-white"
                  : "bg-[#18181c] text-neutral-400 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Items Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredInventory.map((item) => {
          const isLow = item.stock <= item.minThreshold;
          const daysLeft =
            item.burnRatePerDay > 0
              ? Math.max(0, parseFloat((item.stock / item.burnRatePerDay).toFixed(1)))
              : 99;

          return (
            <div
              key={item.id}
              className={`rounded-3xl bg-[#18181c] border p-6 flex flex-col justify-between space-y-4 shadow-xl transition-all ${
                isLow
                  ? "border-rose-500/40 bg-gradient-to-br from-[#18181c] to-rose-950/20"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                  <span className="uppercase text-neutral-400">{item.category}</span>
                  {isLow ? (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold flex items-center gap-1 border border-rose-500/30">
                      <AlertTriangle className="w-3 h-3" /> STOK KRITIS
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Aman
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-bold text-base text-white">
                  {item.name}
                </h3>
              </div>

              {/* Stock Meter & Numbers */}
              <div className="space-y-2 p-3 rounded-2xl bg-[#111114] border border-white/5 font-mono text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="text-neutral-400">Sisa Stok Fisik:</span>
                  <span className={`text-xl font-bold ${isLow ? "text-rose-400" : "text-white"}`}>
                    {item.stock} <span className="text-xs text-neutral-400">{item.unit}</span>
                  </span>
                </div>

                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Batas Minimum:</span>
                  <span>{item.minThreshold} {item.unit}</span>
                </div>

                <div className="flex justify-between text-[11px] text-[#f59e0b]">
                  <span>Laju Pakai (Burn-Rate):</span>
                  <span>~{item.burnRatePerDay} {item.unit}/hari</span>
                </div>

                <div className="flex justify-between text-[11px] pt-1 border-t border-white/5">
                  <span className="text-neutral-400">Estimasi Habis:</span>
                  <span className={`font-bold ${daysLeft <= 2 ? "text-rose-400" : "text-neutral-200"}`}>
                    {daysLeft} Hari Lagi
                  </span>
                </div>
              </div>

              {/* Action Buttons: Stock Opname + Quick Restock */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleOpenOpname(item)}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>Stock Opname</span>
                </button>

                <button
                  onClick={() =>
                    handleQuickRestock(
                      item.id,
                      item.category === "packaging" ? 50 : item.category === "beans" ? 5 : 10
                    )
                  }
                  className="py-2.5 px-3 rounded-xl bg-[#9c6b3a] hover:bg-[#b07b44] text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Restock</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stock Opname Reconciliation Drawer / Modal */}
      <AnimatePresence>
        {selectedItemForOpname && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleSaveOpname}
              className="w-full max-w-md rounded-3xl bg-[#18181c] border border-white/10 p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-[#f59e0b]" />
                  <h3 className="font-heading font-bold text-base text-white">
                    Rekonsiliasi Stock Opname
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItemForOpname(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-400">Bahan Baku</span>
                <h4 className="font-heading font-bold text-base text-white">
                  {selectedItemForOpname.name}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-2xl bg-[#111114]">
                  <div className="text-[10px] text-neutral-400">Stok Sistem Saat Ini</div>
                  <div className="font-bold text-white text-base mt-0.5">
                    {selectedItemForOpname.stock} {selectedItemForOpname.unit}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#111114]">
                  <div className="text-[10px] text-neutral-400">Selisih Fisik vs Sistem</div>
                  <div
                    className={`font-bold text-base mt-0.5 ${
                      actualStockInput - selectedItemForOpname.stock === 0
                        ? "text-emerald-400"
                        : actualStockInput - selectedItemForOpname.stock > 0
                        ? "text-sky-400"
                        : "text-rose-400"
                    }`}
                  >
                    {(actualStockInput - selectedItemForOpname.stock).toFixed(2)}{" "}
                    {selectedItemForOpname.unit}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Jumlah Hitung Fisik Sebenarnya ({selectedItemForOpname.unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={actualStockInput}
                  onChange={(e) => setActualStockInput(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#111114] border border-white/10 text-white font-mono text-base font-bold focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItemForOpname(null)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] text-white font-heading font-bold text-xs shadow-md"
                >
                  Simpan Hasil Opname
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
