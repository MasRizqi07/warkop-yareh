"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { soundEffects } from "@/lib/audioAlerts";

export default function ShiftReconciliationPage() {
  const { currentShift, reconcileShift, orders, getActiveBranch } = useAppStore();
  const activeBranch = getActiveBranch();

  // Denominations counter
  const [denominations, setDenominations] = useState<Record<number, number>>({
    100000: 12, // 1.200.000
    50000: 8,   // 400.000
    20000: 5,   // 100.000
    10000: 3,   // 30.000
    5000: 2,    // 10.000
    2000: 0,
    1000: 0,
  });

  const [notes, setNotes] = useState(currentShift.notes || "");
  const [isZReportOpen, setIsZReportOpen] = useState(false);

  // Compute physical total from denominations
  const totalPhysicalCash = Object.entries(denominations).reduce(
    (acc, [denom, count]) => acc + parseInt(denom) * count,
    0
  );

  // Expected cash in drawer = Opening Float + total cash sales
  const cashOrders = orders.filter((o) => o.paymentMethod === "cash");
  const liveCashSales = cashOrders.reduce((acc, o) => acc + o.total, 0) || currentShift.totalCashSales;
  const liveQrisSales = orders.filter((o) => o.paymentMethod !== "cash").reduce((acc, o) => acc + o.total, 0) || currentShift.totalQrisSales;

  const expectedCash = currentShift.openingFloat + liveCashSales;
  const variance = totalPhysicalCash - expectedCash;

  const handleDenomChange = (denom: number, val: number) => {
    setDenominations((prev) => ({
      ...prev,
      [denom]: Math.max(0, val || 0),
    }));
  };

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    reconcileShift(totalPhysicalCash, notes);
    soundEffects.playSuccessChime();
    setIsZReportOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-8 sm:pt-10 pb-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 border-b border-white/5 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>POS CASH RECONCILIATION & SHIFT BALANCING</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Rekonsiliasi Kasir & Shift Closing
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Cabang: <span className="text-white font-semibold">{activeBranch.name}</span> • Kasir: <span className="text-white font-semibold">{currentShift.cashierName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsZReportOpen(true)}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4 text-[#f59e0b]" />
            <span>Pratinjau X/Z-Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-3xl bg-[#18181c] border border-white/10">
          <div className="text-[10px] font-mono uppercase text-neutral-400">Modal Awal Kas (Float)</div>
          <div className="font-mono font-bold text-lg text-white mt-1">
            Rp {currentShift.openingFloat.toLocaleString("id-ID")}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#18181c] border border-white/10">
          <div className="text-[10px] font-mono uppercase text-neutral-400">Penjualan Tunai (Cash)</div>
          <div className="font-mono font-bold text-lg text-emerald-400 mt-1">
            Rp {liveCashSales.toLocaleString("id-ID")}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#18181c] border border-white/10">
          <div className="text-[10px] font-mono uppercase text-neutral-400">Penjualan QRIS / VA</div>
          <div className="font-mono font-bold text-lg text-sky-400 mt-1">
            Rp {liveQrisSales.toLocaleString("id-ID")}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#18181c] border border-white/10">
          <div className="text-[10px] font-mono uppercase text-neutral-400">Total Omzet Shift</div>
          <div className="font-mono font-bold text-lg text-[#f59e0b] mt-1">
            Rp {(liveCashSales + liveQrisSales).toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Cash Drawer Denomination Counter */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-[#18181c] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-400" />
                <span>Penghitungan Lembar Fisik Laci Kasir</span>
              </h3>
              <span className="text-xs font-mono text-neutral-400">Denominasi Rupiah</span>
            </div>

            <div className="space-y-3">
              {[100000, 50000, 20000, 10000, 5000, 2000, 1000].map((denom) => (
                <div
                  key={denom}
                  className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-[#111114] border border-white/5 text-xs"
                >
                  <span className="font-mono font-bold text-white min-w-[90px]">
                    Rp {denom.toLocaleString("id-ID")}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 font-mono text-[11px]">x</span>
                    <input
                      type="number"
                      min={0}
                      value={denominations[denom] || ""}
                      onChange={(e) => handleDenomChange(denom, parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-20 px-3 py-1.5 rounded-xl bg-[#18181c] border border-white/10 text-white font-mono text-center font-bold focus:outline-none focus:border-[#f59e0b]"
                    />
                    <span className="text-neutral-500 font-mono text-[11px]">lembar =</span>
                  </div>

                  <span className="font-mono font-bold text-emerald-400 min-w-[110px] text-right">
                    Rp {((denominations[denom] || 0) * denom).toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="font-heading font-bold text-sm text-white">
                Total Fisik di Laci:
              </span>
              <span className="font-mono font-extrabold text-xl text-emerald-400">
                Rp {totalPhysicalCash.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Variance Balance & Close Shift Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-[#18181c] border border-white/10 space-y-5">
            <h3 className="font-heading font-bold text-base text-white">
              Pemeriksaan Selisih (Variance)
            </h3>

            <div className="space-y-2 text-xs font-mono text-neutral-400">
              <div className="flex justify-between">
                <span>Modal Awal Float:</span>
                <span className="text-white">Rp {currentShift.openingFloat.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Cash Masuk:</span>
                <span className="text-white">Rp {liveCashSales.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/5 font-bold">
                <span>Target Uang Fisik:</span>
                <span className="text-white">Rp {expectedCash.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Hasil Hitung Fisik:</span>
                <span className="text-emerald-400">Rp {totalPhysicalCash.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* Variance Status Box */}
            <div
              className={`p-4 rounded-2xl border text-center space-y-1 ${
                variance === 0
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : variance > 0
                  ? "bg-sky-500/10 border-sky-500/30 text-sky-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider">Status Selisih Kas</div>
              <div className="font-mono font-extrabold text-xl">
                {variance === 0
                  ? "BALANCE (Cocok Rp 0)"
                  : variance > 0
                  ? `SURPLUS (+Rp ${variance.toLocaleString("id-ID")})`
                  : `DEFISIT (-Rp ${Math.abs(variance).toLocaleString("id-ID")})`}
              </div>
            </div>

            {/* Closing Form */}
            <form onSubmit={handleCloseShift} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Catatan Handover / Serah Terima Shift
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Keterangan sisa kembalian, stok cup habis, atau catatan khusus kasir berikutnya..."
                  className="w-full p-3 rounded-xl bg-[#111114] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] hover:opacity-95 text-white font-heading font-bold text-xs shadow-lg transition-all active:scale-95"
              >
                Kunci Laci & Buat Z-Report Resmi
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Z-Report Modal / Thermal Print Mockup */}
      {isZReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-3xl bg-[#1c1c21] border border-white/10 p-6 space-y-4 shadow-2xl font-mono text-xs text-neutral-300"
          >
            <div className="text-center border-b border-white/10 pb-3">
              <div className="font-heading font-black text-sm text-white tracking-widest uppercase">
                WARKOP YA&apos;REH SURABAYA
              </div>
              <div className="text-[10px] text-neutral-400">
                LAPORAN AKHIR SHIFT (Z-REPORT)
              </div>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Shift ID:</span>
                <span className="text-white">{currentShift.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Cabang:</span>
                <span className="text-white">{activeBranch.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span className="text-white">{currentShift.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu Tutup:</span>
                <span className="text-white">{new Date().toLocaleTimeString("id-ID")} WIB</span>
              </div>
            </div>

            <div className="py-2 border-y border-white/10 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Modal Awal (Float):</span>
                <span>Rp {currentShift.openingFloat.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tunai:</span>
                <span>Rp {liveCashSales.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span>Sales QRIS:</span>
                <span>Rp {liveQrisSales.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between font-bold text-white pt-1">
                <span>TOTAL OMZET:</span>
                <span className="text-[#f59e0b]">
                  Rp {(liveCashSales + liveQrisSales).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between pt-1 text-emerald-400 font-bold">
                <span>UANG FISIK:</span>
                <span>Rp {totalPhysicalCash.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Variance:</span>
                <span>Rp {variance.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-neutral-500 pt-1">
              *** DOKUMEN SISTEM WARKOP YA&apos;REH ***
            </div>

            <button
              onClick={() => setIsZReportOpen(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
            >
              Tutup Pratinjau
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
