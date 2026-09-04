"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function PaymentStatusContent() {
  const searchParams = useSearchParams();

  const orderNumber = searchParams.get("orderNumber") || "YR-20260904-8921";
  const orderId = searchParams.get("orderId") || "ord-8921";
  const initialMethod = searchParams.get("method") || "qris";
  const totalAmount = Number(searchParams.get("total")) || 74250;

  // Active state: 'pending' | 'success' | 'expired' | 'failed'
  const [paymentState, setPaymentState] = useState<"pending" | "success" | "expired" | "failed">(
    initialMethod === "cash" ? "success" : "pending"
  );
  const [secondsRemaining, setSecondsRemaining] = useState(899); // ~15 minutes

  // Countdown timer for pending QRIS
  useEffect(() => {
    if (paymentState !== "pending") return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setPaymentState("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentState]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e5e1e4] pt-24 pb-28 px-4 flex items-center justify-center">
      {/* Subtle Ambient Radial Glow */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#f59e0b]/15 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-xl w-full space-y-6">
        {/* Dev / Interactive State Switcher Strip */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#111114] border border-white/[0.08] text-xs">
          <span className="font-mono text-[#94a3b8] px-2">Gateway Simulation:</span>
          <div className="flex items-center gap-1">
            {(["pending", "success", "expired", "failed"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setPaymentState(st)}
                className={`px-3 py-1 rounded-lg font-mono capitalize transition-all ${
                  paymentState === st
                    ? "bg-[#9c6b3a] text-[#f8fafc] font-bold shadow-sm"
                    : "text-[#94a3b8] hover:text-[#f8fafc]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            STATE 1: PENDING QRIS PAYMENT
            ══════════════════════════════════════════════════════════════ */}
        {paymentState === "pending" && (
          <div className="rounded-3xl bg-[#111114] border border-white/[0.08] p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-[#f59e0b] font-mono text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-ping"></span>
              <span>AWAITING QRIS VERIFICATION</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#f8fafc]">
                Scan QRIS to Complete Sanctuary Order
              </h1>
              <p className="text-xs sm:text-sm text-[#94a3b8]">
                Invoice Code: <span className="font-mono text-[#f7bb82] font-semibold">{orderNumber}</span>
              </p>
            </div>

            {/* QRIS Code Canvas Simulator */}
            <div className="p-6 rounded-2xl bg-white text-[#0a0a0c] inline-block shadow-xl max-w-[280px] mx-auto border-4 border-[#e8c47a]">
              <div className="text-center font-black tracking-widest text-xs uppercase mb-2 border-b pb-1 text-[#0a0a0c]">
                QRIS • Bank Indonesia
              </div>
              <div className="w-52 h-52 relative mx-auto bg-neutral-100 flex items-center justify-center rounded-lg overflow-hidden border border-black/10">
                {/* Visual QR pattern mockup */}
                <div className="p-3 text-center space-y-2">
                  <span className="material-symbols-outlined text-6xl text-[#0a0a0c]">
                    qr_code_2
                  </span>
                  <p className="font-mono text-[10px] text-neutral-600 font-bold uppercase tracking-wider">
                    WARKOP YA&apos;REH SBY
                  </p>
                  <p className="font-mono text-xs font-extrabold text-[#0a0a0c]">
                    Rp {totalAmount.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="text-[10px] text-neutral-500 font-mono mt-2 tracking-tight">
                NMID: ID1024398129038
              </div>
            </div>

            {/* Live Countdown Timer */}
            <div className="p-3.5 rounded-xl bg-[#18181c] border border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-[#94a3b8]">QR Code Expiry Time:</span>
              <span className="font-mono font-bold text-[#f59e0b] text-base">
                {formatTimer(secondsRemaining)}
              </span>
            </div>

            {/* Simulated Action CTAs */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPaymentState("success")}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>I Have Paid (Simulate Webhook Settlement)</span>
              </button>

              <Link
                href="/checkout"
                className="block w-full py-2.5 rounded-xl bg-[#18181c] hover:bg-[#201f21] text-[#94a3b8] hover:text-[#f8fafc] text-xs font-semibold transition-colors"
              >
                Change Payment Method
              </Link>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            STATE 2: EXPIRED SESSION
            ══════════════════════════════════════════════════════════════ */}
        {paymentState === "expired" && (
          <div className="rounded-3xl bg-[#111114] border border-[#f59e0b]/30 p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-[#f59e0b] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">timer_off</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[#f8fafc]">Payment Session Expired</h2>
              <p className="text-xs text-[#94a3b8]">
                The 15-minute QRIS settlement window for invoice <span className="font-mono text-[#f8fafc] font-semibold">{orderNumber}</span> has ended.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#18181c] border border-white/[0.06] text-xs text-[#94a3b8]">
              Your items have been safely reserved in the session cache. Generate a fresh QRIS code to complete your order.
            </div>

            <button
              type="button"
              onClick={() => {
                setSecondsRemaining(899);
                setPaymentState("pending");
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#ee9800] text-[#f8fafc] font-bold text-sm shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>Generate New QRIS Code</span>
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            STATE 3: FAILED PAYMENT
            ══════════════════════════════════════════════════════════════ */}
        {paymentState === "failed" && (
          <div className="rounded-3xl bg-[#111114] border border-red-500/30 p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-950/50 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">cancel</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[#f8fafc]">Payment Transaction Failed</h2>
              <p className="text-xs text-red-300">
                Gateway reported a network timeout or issuer card decline.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#18181c] border border-white/[0.06] text-xs text-[#94a3b8] text-left space-y-1 font-mono">
              <p>Reference: {orderNumber}</p>
              <p>Error Code: 504_GATEWAY_TIMEOUT</p>
              <p>Recommendation: Retry via Virtual Account Bank or Cash at Counter.</p>
            </div>

            <div className="space-y-2.5">
              <Link
                href="/checkout"
                className="block w-full py-3.5 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#ee9800] text-[#f8fafc] font-bold text-sm shadow-md transition-all text-center"
              >
                Retry with Different Payment
              </Link>
              <Link
                href="/menu"
                className="block w-full py-2.5 rounded-xl bg-[#18181c] text-[#94a3b8] hover:text-[#f8fafc] text-xs font-semibold transition-colors text-center"
              >
                Back to Menu Catalog
              </Link>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            STATE 4: SUCCESS CONFIRMATION
            ══════════════════════════════════════════════════════════════ */}
        {paymentState === "success" && (
          <div className="rounded-3xl bg-[#111114] border border-emerald-500/30 p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <span className="material-symbols-outlined text-[44px]">check_circle</span>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider">
                Payment Verified &amp; Settled
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f8fafc]">
                Your Brew is in Motion!
              </h2>
              <p className="text-xs text-[#94a3b8]">
                Ticket #{orderNumber} has been dispatched to Darmo Bar Station #2.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#18181c] border border-white/[0.06] text-xs space-y-2 text-left">
              <div className="flex justify-between text-[#94a3b8]">
                <span>Total Paid:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  Rp {totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-[#94a3b8]">
                <span>Fulfillment:</span>
                <span className="text-[#f8fafc] font-semibold">Dine-In • Table #14</span>
              </div>
              <div className="flex justify-between text-[#94a3b8]">
                <span>Estimated Time:</span>
                <span className="text-[#f59e0b] font-mono font-bold">~10-12 Mins</span>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="space-y-2.5 pt-2">
              <Link
                href={`/order/track/${encodeURIComponent(orderId)}`}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#9c6b3a] via-[#ee9800] to-[#f59e0b] text-[#0a0a0c] font-bold text-sm shadow-[0_8px_24px_rgba(245,158,11,0.3)] hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">timeline</span>
                <span>Track Live Order &amp; Digital Receipt</span>
              </Link>

              <Link
                href="/menu"
                className="block w-full py-2.5 rounded-xl bg-[#18181c] text-[#94a3b8] hover:text-[#f8fafc] text-xs font-semibold transition-colors text-center"
              >
                Order Another Drop
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-[#94a3b8]">
          Loading payment gateway state...
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
