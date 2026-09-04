"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  Clock,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  RefreshCw,
  CreditCard,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { soundEffects } from "@/lib/audioAlerts";

function PaymentStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("orderId") || "YRH-8492";

  const { orders, updateOrderStatus } = useAppStore();
  const order = orders.find((o) => o.id === orderId) || orders[0];

  // Feedback State Toggle for Demo
  const [feedbackState, setFeedbackState] = useState<"pending" | "expired" | "failed" | "success">("pending");
  const [countdownSeconds, setCountdownSeconds] = useState(300); // 5 minutes

  // Live 5-minute countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (feedbackState === "pending" && countdownSeconds > 0) {
      interval = setInterval(() => {
        setCountdownSeconds((sec) => {
          if (sec <= 1) {
            setFeedbackState("expired");
            return 0;
          }
          return sec - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [feedbackState, countdownSeconds]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleSimulatePaid = () => {
    soundEffects.playSuccessChime();
    soundEffects.playKdsBell();
    if (order) {
      updateOrderStatus(order.id, "confirmed");
    }
    setFeedbackState("success");
    setTimeout(() => {
      router.push(`/order/track/${order?.id || "YRH-8492"}`);
    }, 1800);
  };

  const handleRegenerateQris = () => {
    soundEffects.playSuccessChime();
    setCountdownSeconds(300);
    setFeedbackState("pending");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-8 sm:pt-10 pb-32 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex flex-col items-center justify-center">
      {/* State Switcher Bar for prototype inspection */}
      <div className="mb-8 p-1.5 rounded-2xl bg-[#141418] border border-white/10 flex items-center gap-1 text-xs font-mono">
        <span className="px-3 py-1 text-neutral-500 font-bold uppercase">Simulasi Status:</span>
        <button
          onClick={() => {
            setFeedbackState("pending");
            setCountdownSeconds(300);
          }}
          className={`px-3 py-1 rounded-xl transition-all ${
            feedbackState === "pending"
              ? "bg-[#f59e0b] text-black font-bold"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          QRIS Pending (5 Mnt)
        </button>
        <button
          onClick={() => setFeedbackState("expired")}
          className={`px-3 py-1 rounded-xl transition-all ${
            feedbackState === "expired"
              ? "bg-amber-600 text-white font-bold"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          QRIS Expired
        </button>
        <button
          onClick={() => setFeedbackState("failed")}
          className={`px-3 py-1 rounded-xl transition-all ${
            feedbackState === "failed"
              ? "bg-rose-600 text-white font-bold"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Gagal / Ditolak
        </button>
      </div>

      <div className="w-full">
        <AnimatePresence mode="wait">
          {/* 1. STATE: PENDING QRIS COUNTDOWN */}
          {feedbackState === "pending" && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 sm:p-10 rounded-3xl bg-[#18181c] border border-white/10 shadow-2xl text-center space-y-6"
            >
              <div>
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#f59e0b] mb-1 uppercase tracking-wider">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Menunggu Pembayaran Midtrans Snap</span>
                </div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                  Scan QRIS untuk Bayar
                </h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Buka aplikasi GoPay, OVO, ShopeePay, BCA, atau mobile banking kamu.
                </p>
              </div>

              {/* Countdown Meter */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#111114] border border-white/10">
                <span className="text-xs text-neutral-400">Batas Waktu Sisa:</span>
                <span className="font-mono font-extrabold text-lg text-[#f59e0b]">
                  {formatTime(countdownSeconds)}
                </span>
              </div>

              {/* QR Code Graphic Box */}
              <div className="p-5 bg-white text-black rounded-3xl shadow-xl inline-block max-w-[260px] mx-auto">
                <div className="relative w-48 h-48 mx-auto flex items-center justify-center border-4 border-black/10 rounded-2xl p-2">
                  <QrCode className="w-full h-full text-black" />
                </div>
                <div className="text-[10px] font-mono font-bold text-neutral-600 mt-2">
                  NMID: ID1024884920194 • WARKOP YA&apos;REH
                </div>
              </div>

              <div className="font-mono text-xs text-neutral-400">
                Total Tagihan: <span className="text-[#f59e0b] font-bold text-sm">Rp {order?.total.toLocaleString("id-ID") || "80.980"}</span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={handleSimulatePaid}
                  className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-heading font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  Simulasikan Pembayaran Berhasil (WebHook)
                </button>
                <Link
                  href="/checkout"
                  className="py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold text-xs transition-colors"
                >
                  Ganti Metode Pembayaran
                </Link>
              </div>
            </motion.div>
          )}

          {/* 2. STATE: EXPIRED */}
          {feedbackState === "expired" && (
            <motion.div
              key="expired"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 sm:p-10 rounded-3xl bg-[#18181c] border border-amber-500/30 shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#f59e0b] flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div>
                <h2 className="font-heading font-extrabold text-2xl text-white">
                  Kode QRIS Kedaluwarsa
                </h2>
                <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                  Batas waktu 5 menit untuk pembayaran transaksi #{orderId} telah habis demi keamanan transaksi kamu.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={handleRegenerateQris}
                  className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] text-white font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Generate Ulang QRIS Baru</span>
                </button>
                <Link
                  href="/checkout"
                  className="py-3.5 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold text-xs transition-colors"
                >
                  Kembali ke Checkout
                </Link>
              </div>
            </motion.div>
          )}

          {/* 3. STATE: PAYMENT FAILED */}
          {feedbackState === "failed" && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 sm:p-10 rounded-3xl bg-[#18181c] border border-rose-500/30 shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8" />
              </div>

              <div>
                <h2 className="font-heading font-extrabold text-2xl text-white">
                  Transaksi Pembayaran Gagal
                </h2>
                <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                  Bank tujuan atau penerbit kartu menolak transaksi (Kode: 504_PAYMENT_DECLINED). Saldo kamu tidak terpotong.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#111114] border border-white/5 max-w-sm mx-auto text-left text-xs space-y-1 font-mono text-neutral-400">
                <div className="flex justify-between">
                  <span>Order Ref:</span>
                  <span className="text-white font-bold">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Alasan Gagal:</span>
                  <span className="text-rose-400 font-bold">Issuer Card Timeout</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <Link
                  href="/checkout"
                  className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] text-white font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Coba Metode Lain di Kasir</span>
                </Link>
                <Link
                  href="/menu"
                  className="py-3.5 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold text-xs transition-colors"
                >
                  Kembali ke Menu
                </Link>
              </div>
            </motion.div>
          )}

          {/* 4. STATE: SUCCESS */}
          {feedbackState === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 sm:p-10 rounded-3xl bg-[#18181c] border border-emerald-500/30 shadow-2xl text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h2 className="font-heading font-extrabold text-2xl text-white">
                Pembayaran Berhasil Diverifikasi!
              </h2>
              <p className="text-xs text-neutral-400">
                Mengarahkan kamu ke pelacakan status pesanan live...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#f59e0b] border-t-transparent animate-spin" />
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
