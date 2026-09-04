"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Award,
  Gift,
  QrCode,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { soundEffects } from "@/lib/audioAlerts";

type TierType = "Bronze" | "Silver" | "Gold" | "Platinum";

interface RewardItem {
  id: string;
  title: string;
  category: string;
  pointsCost: number;
  image: string;
  available: boolean;
}

const REWARDS: RewardItem[] = [
  {
    id: "r-1",
    title: "Complimentary Kopi Susu Aren Brulee",
    category: "Signature Beverage",
    pointsCost: 280,
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80",
    available: true,
  },
  {
    id: "r-2",
    title: "Croissant Butter Artisan Warm",
    category: "Artisan Bakery",
    pointsCost: 260,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=800&auto=format&fit=crop&q=80",
    available: true,
  },
  {
    id: "r-3",
    title: "Matcha Kyoto Oat Latte Cup",
    category: "Non-Coffee Specialty",
    pointsCost: 360,
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800&auto=format&fit=crop&q=80",
    available: true,
  },
  {
    id: "r-4",
    title: "Biji Kopi Arabica Ijen Blue Mountain (200g)",
    category: "Roastery Merchandise",
    pointsCost: 750,
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&auto=format&fit=crop&q=80",
    available: true,
  },
  {
    id: "r-5",
    title: "2-Hour VIP Boardroom Private Suite Pass",
    category: "Workspace Pass",
    pointsCost: 1000,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
    available: true,
  },
];

export default function LoyaltyPage() {
  const { user, deductLoyaltyPoints, addLoyaltyPoints } = useAppStore();
  const [selectedTierPreview, setSelectedTierPreview] = useState<TierType>(user.tier);
  const [redeemedMsg, setRedeemedMsg] = useState<string | null>(null);

  const tierStyles: Record<TierType, { gradient: string; border: string; accent: string; multiplier: string }> = {
    Bronze: {
      gradient: "from-[#2e1d13] via-[#1c140e] to-[#0a0a0c]",
      border: "border-amber-700/40",
      accent: "text-amber-600",
      multiplier: "1.0x",
    },
    Silver: {
      gradient: "from-[#334155] via-[#1e293b] to-[#0f172a]",
      border: "border-slate-400/40",
      accent: "text-slate-300",
      multiplier: "1.2x",
    },
    Gold: {
      gradient: "from-[#78350f] via-[#20150d] to-[#0a0a0c]",
      border: "border-[#f59e0b]/50",
      accent: "text-[#f59e0b]",
      multiplier: "1.5x",
    },
    Platinum: {
      gradient: "from-[#581c87] via-[#1e1b4b] to-[#030712]",
      border: "border-purple-400/50",
      accent: "text-purple-300",
      multiplier: "2.0x",
    },
  };

  const handleRedeem = (reward: RewardItem) => {
    if (user.points < reward.pointsCost) {
      alert(`Poin belum mencukupi! Kamu butuh ${reward.pointsCost} PTS (Saldo: ${user.points} PTS).`);
      return;
    }
    deductLoyaltyPoints(reward.pointsCost);
    soundEffects.playSuccessChime();
    setRedeemedMsg(`Berhasil menukarkan: ${reward.title}. Barcode voucher otomatis aktif di profil!`);
    setTimeout(() => setRedeemedMsg(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-8 sm:pt-10 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 border-b border-white/5 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] uppercase tracking-wider mb-2">
            <Award className="w-4 h-4 text-[#f59e0b]" />
            <span>Kawan Ya&apos;reh Gamified Loyalty Ecosystem</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            Pusat Rewards & Membership
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Dapatkan 10 Poin per Rp 10.000 transaksi. Kumpulkan poin untuk menikmati sajian gratis, upgrade room VIP, dan voucher eksklusif.
          </p>
        </div>

        {/* User Balance Quick Pill */}
        <div className="p-3 px-5 rounded-2xl bg-[#18181c] border border-white/10 flex items-center gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase text-neutral-400">Saldo Poin Kamu</div>
            <div className="font-mono font-extrabold text-2xl text-[#f59e0b]">{user.points} PTS</div>
          </div>
          <div className="pl-4 border-l border-white/10 flex flex-col justify-between">
            <div className="text-[10px] font-mono uppercase text-neutral-400">Tier Status</div>
            <div className="font-heading font-bold text-base text-white">{user.tier} Member</div>
          </div>
          <button
            onClick={() => {
              addLoyaltyPoints(50);
              soundEffects.playSuccessChime();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f59e0b]/15 hover:bg-[#f59e0b]/25 border border-[#f59e0b]/30 text-[#f59e0b] text-xs font-mono transition-colors"
            title="Simulasi scan struk kasir"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+50 Poin Demo</span>
          </button>
        </div>
      </div>

      {redeemedMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{redeemedMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 3D-Tilt Virtual Membership Card & Tier Switcher */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#18181c] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-white">
                Kartu Virtual Membership
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                NFC & QR Tap Ready
              </span>
            </div>

            {/* Tier Switcher Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#111114] rounded-xl text-xs font-mono text-center">
              {(["Bronze", "Silver", "Gold", "Platinum"] as TierType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTierPreview(t)}
                  className={`py-1.5 rounded-lg transition-all ${
                    selectedTierPreview === t
                      ? "bg-white/15 text-white font-bold shadow-sm"
                      : "text-neutral-500 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Virtual 3D-Card Mockup */}
            <motion.div
              layout
              whileHover={{ scale: 1.02, rotateY: 5, rotateX: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`w-full aspect-[1.58/1] rounded-3xl p-6 sm:p-7 bg-gradient-to-br ${tierStyles[selectedTierPreview].gradient} border ${tierStyles[selectedTierPreview].border} shadow-[0_16px_40px_rgba(0,0,0,0.7)] relative overflow-hidden flex flex-col justify-between`}
            >
              <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 blur-3xl rounded-full pointer-events-none" />

              {/* Card Top */}
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div className="font-heading font-black text-lg text-white tracking-widest uppercase">
                    YA&apos;REH PASS
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400 tracking-wider">
                    SURABAYA SPECIALTY PATRON
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-black/40 border border-white/10 ${tierStyles[selectedTierPreview].accent}`}>
                  {selectedTierPreview} ({tierStyles[selectedTierPreview].multiplier})
                </span>
              </div>

              {/* Card Middle / Chip */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="w-11 h-8 rounded-lg bg-gradient-to-tr from-amber-200 via-amber-400 to-amber-100 border border-amber-500/40 opacity-80" />
                <span className="font-mono text-xs text-white/40 tracking-widest">
                  •••• 8492
                </span>
              </div>

              {/* Card Bottom: Name & Balance */}
              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <div className="text-[9px] font-mono uppercase text-neutral-400">Cardholder Name</div>
                  <div className="font-heading font-bold text-base text-white">{user.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-mono uppercase text-neutral-400">Poin Aktif</div>
                  <div className={`font-mono font-extrabold text-lg ${tierStyles[selectedTierPreview].accent}`}>
                    {user.points} PTS
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Cashier Barcode */}
            <div className="p-4 rounded-2xl bg-[#111114] border border-white/5 text-center space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-400">
                Tunjukkan Barcode ke Kasir untuk Double Points
              </span>
              <div className="p-2.5 bg-white text-black inline-block rounded-xl shadow-md">
                <QrCode className="w-12 h-12 text-black mx-auto" />
                <span className="font-mono text-[9px] font-bold text-black mt-0.5 block">
                  YR-{user.id.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Point Redemption Shop */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#f59e0b]" /> Katalog Penukaran Hadiah
            </h3>
            <span className="text-xs font-mono text-neutral-400">
              Saldo: <span className="text-[#f59e0b] font-bold">{user.points} PTS</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {REWARDS.map((item) => {
              const canAfford = user.points >= item.pointsCost;

              return (
                <div
                  key={item.id}
                  className="rounded-3xl bg-[#18181c] border border-white/10 overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all shadow-md"
                >
                  <div className="relative h-40 w-full bg-[#111114]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#18181c] via-black/30 to-transparent" />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/60 text-[#fcd34d] border border-white/10">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <h4 className="font-heading font-bold text-sm text-white line-clamp-2">
                      {item.title}
                    </h4>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#f59e0b]">
                        {item.pointsCost} PTS
                      </span>

                      <button
                        onClick={() => handleRedeem(item)}
                        disabled={!canAfford}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          canAfford
                            ? "bg-[#9c6b3a] hover:bg-[#b07b44] text-white shadow-md active:scale-95"
                            : "bg-white/5 text-neutral-500 cursor-not-allowed"
                        }`}
                      >
                        {canAfford ? "Tukarkan" : "Poin Kurang"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
