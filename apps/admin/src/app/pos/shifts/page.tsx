"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface DenomItem {
  value: number;
  label: string;
  count: number;
  colorBg: string;
  colorText: string;
}

const INITIAL_DENOMS: DenomItem[] = [
  { value: 100000, label: "Rp 100.000", count: 28, colorBg: "bg-red-950/40", colorText: "text-red-400" },
  { value: 50000, label: "Rp 50.000", count: 16, colorBg: "bg-blue-950/40", colorText: "text-blue-400" },
  { value: 20000, label: "Rp 20.000", count: 12, colorBg: "bg-emerald-950/40", colorText: "text-emerald-400" },
  { value: 10000, label: "Rp 10.000", count: 6, colorBg: "bg-purple-950/40", colorText: "text-purple-400" },
  { value: 5000, label: "Rp 5.000", count: 4, colorBg: "bg-amber-950/40", colorText: "text-amber-400" },
  { value: 2000, label: "Rp 2.000 / Rp 1.000", count: 5, colorBg: "bg-[#201f21]", colorText: "text-[#f7bb82]" },
  { value: 1000, label: "Coins (1.000 / 500)", count: 0, colorBg: "bg-[#201f21]", colorText: "text-yellow-500" },
];

export default function PosCashierShiftManagementPage() {
  const [denoms, setDenoms] = useState<DenomItem[]>(INITIAL_DENOMS);
  const [elapsedTime, setElapsedTime] = useState("07h 45m 18s");
  const [currentTime, setCurrentTime] = useState("22:45:18 WIB");
  const [drawerPopped, setDrawerPopped] = useState(false);

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setCurrentTime(
        `${now.getHours().toString().padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")} WIB`
      );

      const shiftStart = new Date(now);
      shiftStart.setHours(15, 0, 0, 0);
      const elapsedMs = Math.max(0, now.getTime() - shiftStart.getTime());
      const hours = Math.floor(elapsedMs / 3_600_000);
      const minutes = Math.floor((elapsedMs % 3_600_000) / 60_000);
      const seconds = Math.floor((elapsedMs % 60_000) / 1_000);
      setElapsedTime(
        `${hours.toString().padStart(2, "0")}h ${minutes
          .toString()
          .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`,
      );
    };

    updateClocks();
    const timer = setInterval(updateClocks, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateCount = (value: number, delta: number) => {
    setDenoms((prev) =>
      prev.map((d) => (d.value === value ? { ...d, count: Math.max(0, d.count + delta) } : d))
    );
  };

  const handleSetExactMatch = () => {
    // Expected is Rp 3.930.000
    // 28 * 100k = 2.800.000
    // 16 * 50k = 800.000
    // 12 * 20k = 240.000
    // 6 * 10k = 60.000
    // 4 * 5k = 20.000
    // 5 * 2k = 10.000
    // Total = 3.930.000
    setDenoms(INITIAL_DENOMS);
  };

  const handleZeroAll = () => {
    setDenoms((prev) => prev.map((d) => ({ ...d, count: 0 })));
  };

  const totalCounted = denoms.reduce((acc, curr) => acc + curr.value * curr.count, 0);
  const openingFloat = 500000;
  const cashSales = 3480000;
  const paidOuts = 50000;
  const expectedTotal = openingFloat + cashSales - paidOuts;
  const variance = totalCounted - expectedTotal;

  const handlePopDrawer = () => {
    setDrawerPopped(true);
    setTimeout(() => setDrawerPopped(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f8fafc] font-sans pb-16">
      {/* ══════════════════════════════════════════════════════════════
          POS TERMINAL SUB-NAVBAR
          ══════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-[#0e0e10]/95 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6 py-3">
        <div className="max-w-[1560px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/pos" className="flex items-center gap-2 group">
              <span className="material-symbols-outlined text-[#f59e0b] text-[24px]">point_of_sale</span>
              <span className="font-extrabold text-white text-base tracking-tight group-hover:text-[#f7bb82] transition-colors">
                Ya&apos;reh POS
              </span>
            </Link>
            <span className="px-2.5 py-0.5 rounded bg-[#201f21] text-[#f59e0b] font-mono text-[11px]">
              TERMINAL-01 (Gubeng 24H Sanctuary)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/pos"
              className="px-3 py-1.5 rounded-lg bg-[#18181c] hover:bg-[#201f21] text-xs font-semibold text-[#94a3b8] hover:text-white"
            >
              ← Back to Register
            </Link>
            <span className="h-4 w-px bg-white/[0.08]" />
            <button
              onClick={() => alert("Emergency Manager Called to Terminal 01.")}
              className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">sos</span>
              <span>Help Call</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* ══════════════════════════════════════════════════════════════
            ACTIVE SHIFT STATUS & CASHIER HEADER
            ══════════════════════════════════════════════════════════════ */}
        <div className="w-full bg-[#18181c] border border-white/[0.08] rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-24 -top-24 w-80 h-80 bg-[#f59e0b]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 relative z-10">
            {/* Left: Operator Meta */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-[#201f21] border border-white/[0.08] flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-[#f59e0b] text-[30px]">badge</span>
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#ffb95f] border-2 border-[#18181c]" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Rayhan Al-Farisi</h1>
                  <span className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-[#201f21] text-[#e8c47a]">
                    ID: STF-2024-08
                  </span>
                  <span className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-[#f59e0b]/20 text-[#f59e0b] animate-pulse font-semibold">
                    Shift Active • Handover Ready
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-[#94a3b8] text-xs">
                  <span>Shift 2: Evening Sprint (15:00 - 23:00 WIB)</span>
                  <span>•</span>
                  <span className="text-[#f7bb82] flex items-center gap-1 font-mono">
                    <span className="material-symbols-outlined text-[15px]">point_of_sale</span> POS-01 (Front Bar)
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Shift Timer */}
            <div className="flex flex-wrap items-center gap-4 bg-[#111114] border border-white/[0.06] px-5 py-2.5 rounded-xl">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#94a3b8] uppercase">Opened</span>
                <span className="font-mono text-xs text-white font-semibold">15:00:00 WIB</span>
              </div>
              <div className="h-6 w-px bg-white/[0.08]" />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#94a3b8] uppercase">Elapsed</span>
                <span className="font-mono text-xs text-[#f59e0b] font-bold">{elapsedTime}</span>
              </div>
              <div className="h-6 w-px bg-white/[0.08]" />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#94a3b8] uppercase">Live Clock</span>
                <span className="font-mono text-xs text-[#e8c47a] font-semibold">{currentTime}</span>
              </div>
            </div>

            {/* Right: Quick Hardware Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePopDrawer}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#201f21] hover:bg-[#2a2a2c] text-white text-xs font-bold transition-all shadow-md active:scale-95 border border-white/[0.06]"
              >
                <span className="material-symbols-outlined text-[#f7bb82] text-[18px]">eject</span>
                <span>Pop Drawer [F2]</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9c6b3a] hover:bg-[#825426] text-white text-xs font-bold transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Print X-Report</span>
              </button>
            </div>
          </div>

          {drawerPopped && (
            <div className="mt-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>RJ11 Kick Pulse Sent to Cash Drawer • Drawer Armed &amp; Open</span>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            MAIN RECONCILIATION WORKSPACE (60% / 40%)
            ══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* LEFT: PHYSICAL CASH COUNTING MATRIX (7 Cols) */}
          <div className="xl:col-span-7 flex flex-col gap-6">
            {/* System Expectation Ledger */}
            <div className="bg-[#18181c] border border-white/[0.08] rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#f59e0b] text-[22px]">account_balance_wallet</span>
                  <h2 className="text-base font-bold text-white">System Expected Cash in Drawer</h2>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#111114] text-[#94a3b8]">
                  Formula Engine Locked
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#111114] flex flex-col justify-between">
                  <span className="text-[#94a3b8]">Opening Float</span>
                  <div className="font-mono font-bold text-white text-sm mt-1">Rp 500.000</div>
                  <span className="font-mono text-[10px] text-[#94a3b8] mt-1">Verified Float</span>
                </div>
                <div className="p-3 rounded-xl bg-[#111114] flex flex-col justify-between">
                  <span className="text-[#94a3b8]">+ Cash Sales (86 Tx)</span>
                  <div className="font-mono font-bold text-emerald-400 text-sm mt-1">+Rp 3.480.000</div>
                  <span className="font-mono text-[10px] text-[#94a3b8] mt-1">86 Bills Paid</span>
                </div>
                <div className="p-3 rounded-xl bg-[#111114] flex flex-col justify-between">
                  <span className="text-[#94a3b8]">- Paid Outs / Ice</span>
                  <div className="font-mono font-bold text-red-400 text-sm mt-1">-Rp 50.000</div>
                  <span className="font-mono text-[10px] text-[#94a3b8] mt-1">Ref #PC-889</span>
                </div>
                <div className="p-3 rounded-xl bg-[#201f21] border border-[#f59e0b]/30 flex flex-col justify-between shadow-inner">
                  <span className="text-[#f59e0b] font-semibold">= Net Expected</span>
                  <div className="font-mono font-bold text-[#f59e0b] text-base mt-1">Rp 3.930.000</div>
                  <span className="font-mono text-[10px] text-[#94a3b8] mt-1">Target Baseline</span>
                </div>
              </div>
            </div>

            {/* Denomination Counter Matrix */}
            <div className="bg-[#18181c] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white">Physical Cash Counting Matrix</h3>
                  <p className="text-xs text-[#94a3b8]">Input physically counted notes &amp; coins in drawer.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleZeroAll}
                    className="px-2.5 py-1 rounded-lg bg-[#111114] hover:bg-[#201f21] text-[#94a3b8] hover:text-white font-mono text-xs"
                  >
                    Zero All
                  </button>
                  <button
                    onClick={handleSetExactMatch}
                    className="px-2.5 py-1 rounded-lg bg-[#9c6b3a]/30 hover:bg-[#9c6b3a]/50 text-[#f7bb82] font-mono text-xs font-semibold"
                  >
                    Exact Match
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {denoms.map((d) => {
                  const subtotal = d.value * d.count;
                  return (
                    <div
                      key={d.value}
                      className="p-3 rounded-xl bg-[#111114] border border-white/[0.04] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl ${d.colorBg} ${d.colorText} font-mono text-xs font-bold flex items-center justify-center`}
                        >
                          {d.value >= 1000 ? `${d.value / 1000}K` : d.value}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{d.label}</div>
                          <div className="font-mono text-xs text-[#94a3b8]">Rp {subtotal.toLocaleString("id-ID")}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateCount(d.value, -1)}
                          className="w-8 h-8 rounded-lg bg-[#201f21] hover:bg-[#2a2a2c] text-white font-bold flex items-center justify-center text-sm active:scale-95"
                        >
                          -
                        </button>
                        <span className="font-mono text-sm font-bold text-[#f59e0b] w-8 text-center">{d.count}</span>
                        <button
                          onClick={() => handleUpdateCount(d.value, 1)}
                          className="w-8 h-8 rounded-lg bg-[#201f21] hover:bg-[#2a2a2c] text-white font-bold flex items-center justify-center text-sm active:scale-95"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleUpdateCount(d.value, 5)}
                          className="hidden sm:flex px-2 h-8 rounded-lg bg-[#201f21] hover:bg-[#2a2a2c] text-[#e8c47a] font-mono text-[11px] items-center justify-center font-semibold"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleUpdateCount(d.value, 10)}
                          className="hidden sm:flex px-2 h-8 rounded-lg bg-[#201f21] hover:bg-[#2a2a2c] text-[#e8c47a] font-mono text-[11px] items-center justify-center font-semibold"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Physical Count & Discrepancy Banner */}
              <div className="p-4 rounded-xl bg-[#201f21] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                <div>
                  <span className="text-xs text-[#94a3b8] block">Total Physically Counted:</span>
                  <span className="font-mono text-2xl font-bold text-white">
                    Rp {totalCounted.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-[#94a3b8] block">Reconciliation Delta:</span>
                  <div
                    className={`font-mono text-lg font-bold flex items-center gap-1.5 ${
                      variance === 0 ? "text-emerald-400" : variance > 0 ? "text-[#f59e0b]" : "text-red-400"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {variance === 0 ? "check_circle" : "warning"}
                    </span>
                    <span>
                      {variance === 0
                        ? "BALANCED (Rp 0)"
                        : variance > 0
                        ? `+Rp ${variance.toLocaleString("id-ID")} (Over)`
                        : `-Rp ${Math.abs(variance).toLocaleString("id-ID")} (Shortage)`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: SHIFT SUMMARY & CLOSE WORKFLOW (5 Cols) */}
          <div className="xl:col-span-5 flex flex-col gap-6">
            {/* Shift Sales Mix Card */}
            <div className="bg-[#18181c] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f7bb82] text-[20px]">receipt</span>
                <span>Shift Revenue Breakdown</span>
              </h3>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#111114] flex items-center justify-between">
                  <span className="text-[#94a3b8]">Cash In Drawer (86 bills):</span>
                  <span className="font-bold text-white">Rp 3.480.000</span>
                </div>
                <div className="p-3 rounded-xl bg-[#111114] flex items-center justify-between">
                  <span className="text-[#94a3b8]">QRIS Midtrans (142 bills):</span>
                  <span className="font-bold text-[#f59e0b]">Rp 5.920.000</span>
                </div>
                <div className="p-3 rounded-xl bg-[#111114] flex items-center justify-between">
                  <span className="text-[#94a3b8]">EDC BCA / Mandiri (38 bills):</span>
                  <span className="font-bold text-white">Rp 2.140.000</span>
                </div>
                <div className="p-3 rounded-xl bg-[#111114] flex items-center justify-between">
                  <span className="text-[#94a3b8]">GrabFood / GoFood (21 bills):</span>
                  <span className="font-bold text-white">Rp 890.000</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#201f21] border border-white/[0.08] flex items-center justify-between text-sm pt-2">
                  <span className="text-[#f7bb82] font-semibold">Total Gross Shift Sales:</span>
                  <span className="font-bold text-white text-base">Rp 12.430.000</span>
                </div>
              </div>
            </div>

            {/* Cash Drops & Skim Cash */}
            <div className="bg-[#18181c] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Cash Drops / Skim Cash</h3>
                <span className="font-mono text-[10px] text-[#94a3b8]">SETOR BRANKAS</span>
              </div>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Deposit cash in excess of Rp 1.000.000 float into drop safe before final handover.
              </p>
              <button
                onClick={() => alert("Cash Drop Voucher generated. Drop Rp 2.930.000 into Safe.")}
                className="w-full py-2.5 rounded-xl bg-[#111114] hover:bg-[#201f21] text-xs font-bold text-[#f7bb82] border border-white/[0.06] transition-colors"
              >
                + Record Cash Drop to Safe (Rp 2.930.000)
              </button>
            </div>

            {/* End Shift Action Trigger */}
            <div className="bg-[#18181c] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white">Final Shift Handover</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Once physical count is reconciled and cash drops logged, close shift and print official Z-Report for the
                night shift manager.
              </p>
              <button
                onClick={() => {
                  alert(
                    "Shift #2 Closed Successfully! Z-Report printed and emailed to Store Manager. Opening float Rp 500.000 retained."
                  );
                }}
                className="w-full py-3.5 rounded-xl bg-[#f59e0b] hover:bg-[#ffb95f] text-[#0a0a0c] font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                <span>Finalize &amp; Close Shift (Z-Report)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
