'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Lock,
  LogOut,
  Minus,
  Plus,
  Printer,
  Receipt,
  User,
  Wallet,
} from 'lucide-react';

interface DenomItem {
  value: number;
  label: string;
  count: number;
  colorBg: string;
  colorText: string;
}

const INITIAL_DENOMS: DenomItem[] = [
  { value: 100000, label: 'Rp 100.000', count: 28, colorBg: 'bg-red-950/40', colorText: 'text-red-400' },
  { value: 50000, label: 'Rp 50.000', count: 16, colorBg: 'bg-blue-950/40', colorText: 'text-blue-400' },
  { value: 20000, label: 'Rp 20.000', count: 12, colorBg: 'bg-emerald-950/40', colorText: 'text-emerald-400' },
  { value: 10000, label: 'Rp 10.000', count: 6, colorBg: 'bg-purple-950/40', colorText: 'text-purple-400' },
  { value: 5000, label: 'Rp 5.000', count: 4, colorBg: 'bg-amber-950/40', colorText: 'text-amber-400' },
  { value: 2000, label: 'Rp 2.000 / Rp 1.000', count: 5, colorBg: 'bg-surface-container', colorText: 'text-primary' },
  { value: 1000, label: 'Coins (1.000 / 500)', count: 0, colorBg: 'bg-surface-container', colorText: 'text-accent-amber' },
];

export default function PosCashierShiftManagementPage() {
  const [denoms, setDenoms] = useState<DenomItem[]>(INITIAL_DENOMS);
  const [elapsedTime, setElapsedTime] = useState('07h 45m 18s');
  const [currentTime, setCurrentTime] = useState('22:45:18 WIB');
  const [drawerPopped, setDrawerPopped] = useState(false);

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setCurrentTime(
        `${now.getHours().toString().padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} WIB`
      );

      const shiftStart = new Date(now);
      shiftStart.setHours(15, 0, 0, 0);
      const elapsedMs = Math.max(0, now.getTime() - shiftStart.getTime());
      const hours = Math.floor(elapsedMs / 3_600_000);
      const minutes = Math.floor((elapsedMs % 3_600_000) / 60_000);
      const seconds = Math.floor((elapsedMs % 60_000) / 1_000);
      setElapsedTime(
        `${hours.toString().padStart(2, '0')}h ${minutes
          .toString()
          .padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`,
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
    <div className="min-h-screen bg-canvas-obsidian text-text-primary font-sans pb-16">
      {/* ══════════════════════════════════════════════════════════════
          POS TERMINAL SUB-NAVBAR
          ══════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-surface-secondary/95 backdrop-blur-xl border-b border-border-subtle px-4 sm:px-6 py-3">
        <div className="max-w-[1560px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/pos" className="flex items-center gap-2 group">
              <CreditCard className="w-6 h-6 text-accent-amber" />
              <span className="font-extrabold text-text-primary text-base tracking-tight group-hover:text-primary transition-colors">
                Ya&apos;reh POS
              </span>
            </Link>
            <span className="px-2.5 py-0.5 rounded bg-surface-container text-accent-amber font-mono text-[11px] border border-border-subtle">
              TERMINAL-01 (Gubeng 24H Sanctuary)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/pos"
              className="px-3 py-1.5 rounded-lg bg-surface-card hover:bg-surface-container text-xs font-semibold text-text-muted hover:text-text-primary border border-border-subtle transition-colors"
            >
              ← Back to Register
            </Link>
            <span className="h-4 w-px bg-border-subtle" />
            <button
              onClick={() => alert('Emergency Manager Called to Terminal 01.')}
              className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Help Call</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* ══════════════════════════════════════════════════════════════
            ACTIVE SHIFT STATUS & CASHIER HEADER
            ══════════════════════════════════════════════════════════════ */}
        <div className="w-full bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-24 -top-24 w-80 h-80 bg-accent-amber/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 relative z-10">
            {/* Left: Operator Meta */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-surface-container border border-border-subtle flex items-center justify-center shadow-inner text-accent-amber">
                  <User className="w-7 h-7" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-accent-amber border-2 border-surface-card" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight font-headline-md">
                    Rayhan Al-Farisi
                  </h1>
                  <span className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-surface-container text-cream-beige border border-border-subtle">
                    ID: STF-2024-08
                  </span>
                  <span className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-accent-amber/20 text-accent-amber animate-pulse font-semibold border border-accent-amber/30">
                    Shift Active • Handover Ready
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-text-muted text-xs">
                  <span>Shift 2: Evening Sprint (15:00 - 23:00 WIB)</span>
                  <span>•</span>
                  <span className="text-primary flex items-center gap-1 font-mono">
                    <CreditCard className="w-3.5 h-3.5" /> POS-01 (Front Bar)
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Shift Timer */}
            <div className="flex flex-wrap items-center gap-4 bg-surface-secondary border border-border-subtle px-5 py-2.5 rounded-xl">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-text-muted uppercase">Opened</span>
                <span className="font-mono text-xs text-text-primary font-semibold">15:00:00 WIB</span>
              </div>
              <div className="h-6 w-px bg-border-subtle" />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-text-muted uppercase">Elapsed</span>
                <span className="font-mono text-xs text-accent-amber font-bold">{elapsedTime}</span>
              </div>
              <div className="h-6 w-px bg-border-subtle" />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-text-muted uppercase">Live Clock</span>
                <span className="font-mono text-xs text-cream-beige font-semibold">{currentTime}</span>
              </div>
            </div>

            {/* Right: Quick Hardware Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePopDrawer}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-card text-text-primary text-xs font-bold transition-all shadow-md active:scale-95 border border-border-subtle"
              >
                <LogOut className="w-4 h-4 text-primary" />
                <span>Pop Drawer [F2]</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-coffee hover:bg-primary-container text-text-primary text-xs font-bold transition-all shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print X-Report</span>
              </button>
            </div>
          </div>

          {drawerPopped && (
            <div className="mt-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
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
            <div className="bg-surface-card border border-border-subtle rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-accent-amber" />
                  <h2 className="text-base font-bold text-text-primary font-headline-md">
                    System Expected Cash in Drawer
                  </h2>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-secondary text-text-muted border border-border-subtle">
                  Formula Engine Locked
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle">
                  <span className="text-text-muted text-[10px] uppercase block">Opening Float</span>
                  <span className="text-text-primary font-bold text-sm">Rp {openingFloat.toLocaleString('id-ID')}</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle">
                  <span className="text-text-muted text-[10px] uppercase block">+ Cash Sales</span>
                  <span className="text-accent-amber font-bold text-sm">
                    +Rp {cashSales.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle">
                  <span className="text-text-muted text-[10px] uppercase block">- Paid Outs</span>
                  <span className="text-red-400 font-bold text-sm">-Rp {paidOuts.toLocaleString('id-ID')}</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container border border-primary/30">
                  <span className="text-primary text-[10px] uppercase block font-bold">Expected Total</span>
                  <span className="text-primary font-extrabold text-sm">
                    Rp {expectedTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Denomination Counter Grid */}
            <div className="bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div>
                  <h3 className="text-base font-bold text-text-primary font-headline-md">
                    Physical Cash Drawer Count
                  </h3>
                  <p className="text-xs text-text-muted">Count and input bills/coins presently inside the till tray.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSetExactMatch}
                    className="px-3 py-1.5 rounded-lg bg-surface-secondary hover:bg-surface-container text-xs font-mono text-primary border border-border-subtle transition-colors"
                  >
                    Zero All
                    Match Expected
                  </button>
                  <button
                    onClick={handleZeroAll}
                    className="px-3 py-1.5 rounded-lg bg-surface-secondary hover:bg-surface-container text-xs font-mono text-text-muted hover:text-text-primary border border-border-subtle transition-colors"
                  >
                    Exact Match
                    Clear [0]
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {denoms.map((d) => {
                  const lineTotal = d.value * d.count;
                  return (
                    <div
                      key={d.value}
                      className="p-3 rounded-xl bg-surface-secondary border border-border-subtle flex items-center justify-between gap-3 font-mono text-xs"
                    >
                      <div className="flex items-center gap-3 w-40">
                        <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${d.colorBg} ${d.colorText}`}>
                          {d.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateCount(d.value, -1)}
                          className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-card text-text-primary flex items-center justify-center font-bold text-sm border border-border-subtle"
                        >
                          -
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-sm font-bold text-[#f59e0b] w-8 text-center">{d.count}</span>
                        <input
                          aria-label={`Count for ${d.label}`}
                          type="number"
                          value={d.count}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            setDenoms((prev) =>
                              prev.map((item) => (item.value === d.value ? { ...item, count: val } : item))
                            );
                          }}
                          className="w-14 text-center py-1 bg-surface-card border border-border-subtle rounded-lg text-text-primary font-bold outline-none focus:border-accent-amber"
                        />
                        <button
                          onClick={() => handleUpdateCount(d.value, 1)}
                          className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-card text-text-primary flex items-center justify-center font-bold text-sm border border-border-subtle"
                        >
                          +
                          <Plus className="w-3.5 h-3.5" />
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

                      <div className="w-32 text-right">
                        <span className="font-bold text-text-primary">Rp {lineTotal.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Physical Reconciliation Result Strip */}
              <div className="mt-4 pt-4 border-t border-border-subtle flex items-center justify-between bg-surface-secondary p-4 rounded-xl border">
                <div>
                  <span className="text-xs text-text-muted block">Total Physically Counted:</span>
                  <span className="font-mono text-2xl font-bold text-text-primary">
                    Rp {totalCounted.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-text-muted block">Reconciliation Delta:</span>
                  <div
                    className={`font-mono text-lg font-bold flex items-center gap-1.5 ${
                      variance === 0 ? 'text-emerald-400' : variance > 0 ? 'text-accent-amber' : 'text-red-400'
                    }`}
                  >
                    {variance === 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                    <span>
                      {variance === 0
                        ? 'BALANCED (Rp 0)'
                        : variance > 0
                        ? `+Rp ${variance.toLocaleString('id-ID')} (Over)`
                        : `-Rp ${Math.abs(variance).toLocaleString('id-ID')} (Shortage)`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: SHIFT SUMMARY & CLOSE WORKFLOW (5 Cols) */}
          <div className="xl:col-span-5 flex flex-col gap-6">
            {/* Shift Sales Mix Card */}
            <div className="bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2 font-headline-md">
                <Receipt className="w-5 h-5 text-primary" />
                <span>Shift Revenue Breakdown</span>
              </h3>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle flex items-center justify-between">
                  <span className="text-text-muted">Cash In Drawer (86 bills):</span>
                  <span className="font-bold text-text-primary">Rp 3.480.000</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle flex items-center justify-between">
                  <span className="text-text-muted">QRIS Midtrans (142 bills):</span>
                  <span className="font-bold text-accent-amber">Rp 5.920.000</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle flex items-center justify-between">
                  <span className="text-text-muted">EDC BCA / Mandiri (38 bills):</span>
                  <span className="font-bold text-text-primary">Rp 2.140.000</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle flex items-center justify-between">
                  <span className="text-text-muted">GrabFood / GoFood (21 bills):</span>
                  <span className="font-bold text-text-primary">Rp 890.000</span>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container border border-border-subtle flex items-center justify-between text-sm pt-2">
                  <span className="text-primary font-semibold">Total Gross Shift Sales:</span>
                  <span className="font-bold text-text-primary text-base">Rp 12.430.000</span>
                </div>
              </div>
            </div>

            {/* Cash Drops & Skim Cash */}
            <div className="bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-text-primary font-headline-md">Cash Drops / Skim Cash</h3>
                <span className="font-mono text-[10px] text-text-muted">SETOR BRANKAS</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Deposit cash in excess of Rp 1.000.000 float into drop safe before final handover.
              </p>
              <button
                onClick={() => alert('Cash Drop Voucher generated. Drop Rp 2.930.000 into Safe.')}
                className="w-full py-2.5 rounded-xl bg-surface-secondary hover:bg-surface-container text-xs font-bold text-primary border border-border-subtle transition-colors"
              >
                + Record Cash Drop to Safe (Rp 2.930.000)
              </button>
            </div>

            {/* End Shift Action Trigger */}
            <div className="bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-text-primary font-headline-md">Final Shift Handover</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Once physical count is reconciled and cash drops logged, close shift and print official Z-Report for the
                night shift manager.
              </p>
              <button
                onClick={() => {
                  alert(
                    'Shift #2 Closed Successfully! Z-Report printed and emailed to Store Manager. Opening float Rp 500.000 retained.'
                  );
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-coffee to-secondary-container hover:from-primary-container hover:to-secondary text-text-primary font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                <span>Finalize &amp; Close Shift (Z-Report)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
