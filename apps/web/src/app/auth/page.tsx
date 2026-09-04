"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  Globe,
  RefreshCw,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { soundEffects } from "@/lib/audioAlerts";

export default function AuthPage() {
  const router = useRouter();
  const { login } = useAppStore();

  const [mode, setMode] = useState<"login" | "register" | "otp">("login");
  const [phoneNumber, setPhoneNumber] = useState("08123456789");
  const [fullName, setFullName] = useState("Achmad Rizqi");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(45);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // OTP Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mode === "otp" && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [mode, countdown]);

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.startsWith("08") && !phoneNumber.startsWith("+62")) {
      setErrorMsg("Masukkan nomor WhatsApp Indonesia valid (contoh: 0812...)");
      return;
    }
    setErrorMsg("");
    setMode("otp");
    setCountdown(60);
    soundEffects.playSuccessChime();
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otpCode];
    newOtp[index] = val.slice(-1);
    setOtpCode(newOtp);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const fullCode = otpCode.join("");
    if (fullCode.length < 6) {
      setErrorMsg("Silakan masukkan 6 digit kode OTP WhatsApp");
      return;
    }
    setIsVerifying(true);
    setErrorMsg("");

    setTimeout(() => {
      login(phoneNumber, fullName);
      soundEffects.playSuccessChime();
      setIsVerifying(false);
      router.push("/menu");
    }, 900);
  };

  const handleGoogleAuthMock = () => {
    setIsVerifying(true);
    setTimeout(() => {
      login("08123456789", "Achmad Rizqi");
      soundEffects.playSuccessChime();
      setIsVerifying(false);
      router.push("/menu");
    }, 600);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#9c6b3a] flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <span className="font-heading font-black text-white text-2xl">Y</span>
            </div>
            <div className="text-left">
              <h1 className="font-heading font-bold text-xl text-white tracking-wider uppercase leading-tight">
                Warkop Ya&apos;reh
              </h1>
              <p className="text-xs font-mono text-[#f59e0b]">Surabaya Coffee & Coworking</p>
            </div>
          </Link>
          <p className="text-sm text-neutral-400">
            {mode === "otp"
              ? "Verifikasi instan via WhatsApp OTP"
              : "Masuk untuk menikmati rewards poin & pesan cepat"}
          </p>
        </div>

        {/* Card Box */}
        <div className="rounded-3xl bg-[#18181c] border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Top Tabs */}
          {mode !== "otp" && (
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#111114] rounded-2xl mb-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg("");
                }}
                className={`py-2.5 rounded-xl transition-all ${
                  mode === "login"
                    ? "bg-[#9c6b3a] text-white shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Masuk Member
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMsg("");
                }}
                className={`py-2.5 rounded-xl transition-all ${
                  mode === "register"
                    ? "bg-[#9c6b3a] text-white shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Daftar Baru
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center">
              {errorMsg}
            </div>
          )}

          {/* Form Content */}
          <AnimatePresence mode="wait">
            {mode !== "otp" ? (
              <motion.form
                key="auth-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleRequestOtp}
                className="space-y-4"
              >
                {mode === "register" && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nama lengkap kamu"
                      className="w-full px-4 py-3 rounded-xl bg-[#111114] border border-white/10 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-[#f59e0b]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Nomor WhatsApp
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="08123456789"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#111114] border border-white/10 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-[#f59e0b] font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Kode OTP 6-digit akan dikirimkan ke nomor WhatsApp ini.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] hover:opacity-95 text-white font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(156,107,58,0.4)] transition-all active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-300" />
                  <span>Kirim Kode WhatsApp OTP</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <span className="relative px-3 bg-[#18181c] text-neutral-500 text-xs">
                    atau masuk instan dengan
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuthMock}
                  disabled={isVerifying}
                  className="w-full py-3 px-4 rounded-xl bg-[#111114] hover:bg-white/5 border border-white/10 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-3 transition-colors"
                >
                  <Globe className="w-4 h-4 text-[#f59e0b]" />
                  <span>Lanjutkan dengan Google Account</span>
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div className="text-center">
                  <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-2 border border-emerald-500/20">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-white">
                    Masukkan 6-Digit OTP
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 font-mono">
                    Dikirim ke <span className="text-white font-semibold">{phoneNumber}</span>
                  </p>
                </div>

                {/* 6 Digit Inputs */}
                <div className="flex justify-between gap-2">
                  {otpCode.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      className="w-12 h-14 text-center font-mono font-bold text-xl rounded-xl bg-[#111114] border border-white/10 text-[#f59e0b] focus:border-[#f59e0b] focus:outline-none"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifying}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] hover:opacity-95 text-white font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(156,107,58,0.4)] transition-all"
                >
                  {isVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  )}
                  <span>{isVerifying ? "Memverifikasi..." : "Verifikasi & Masuk"}</span>
                </button>

                <div className="flex items-center justify-between text-xs text-neutral-400 pt-2">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="hover:text-white transition-colors"
                  >
                    Ganti Nomor
                  </button>
                  <button
                    type="button"
                    disabled={countdown > 0}
                    onClick={() => {
                      setCountdown(60);
                      soundEffects.playSuccessChime();
                    }}
                    className={countdown > 0 ? "text-neutral-500 cursor-not-allowed" : "text-[#f59e0b] font-medium hover:underline"}
                  >
                    {countdown > 0 ? `Kirim ulang (${countdown}s)` : "Kirim Ulang OTP"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Perks Note */}
        <div className="mt-6 text-center text-xs text-neutral-500 space-y-1">
          <div className="flex items-center justify-center gap-2 text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-[#f59e0b]" />
            <span>Member baru otomatis dapat bonus 100 Poin Loyalty</span>
          </div>
          <p>Terhubung dengan Ekosistem Warkop Ya&apos;reh Surabaya</p>
        </div>
      </div>
    </div>
  );
}
