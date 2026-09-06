"use client";

import React, { useState } from "react";
import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Gift,
  QrCode,
  CheckCircle2,
  Plus,
  RefreshCw,
  Maximize2,
  Check,
  Lock,
  Star,
  ArrowUpRight,
  Laptop,
  Cake,
  Ticket,
  ArrowRight,
  Download,
  X,
  Radio,
  Cpu,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { soundEffects } from "@/lib/audioAlerts";

type TierType = "Bronze" | "Silver" | "Gold" | "Platinum";

interface RewardItem {
  id: string;
  title: string;
  category: string;
  category: "all" | "drinks" | "food" | "merch" | "workspace";
  categoryLabel: string;
  pointsCost: number;
  valueRupiah: string;
  badge: string;
  badgeType: "stock" | "limited" | "urgent";
  image: string;
  available: boolean;
  description: string;
}

const REWARDS: RewardItem[] = [
const REWARDS_CATALOG: RewardItem[] = [
  {
    id: "r-1",
    title: "Complimentary Kopi Susu Aren Brulee",
    category: "Signature Beverage",
    pointsCost: 280,
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80",
    available: true,
    title: "Cold Brew Aren Brûlée",
    category: "drinks",
    categoryLabel: "Signature Beverage",
    pointsCost: 250,
    valueRupiah: "Rp 38.000",
    badge: "In Stock • Instant Claim",
    badgeType: "stock",
    image: "/images/cold-brew-aren-brulee.png",
    description: "18-hour cold drip infused with organic East Java palm sugar and torched brulee foam crust.",
  },
  {
    id: "r-2",
    title: "Croissant Butter Artisan Warm",
    category: "Artisan Bakery",
    pointsCost: 260,
    title: "Smoked Pastrami Brioche Toast",
    category: "food",
    categoryLabel: "Artisan Eats",
    pointsCost: 400,
    valueRupiah: "Rp 55.000",
    badge: "12 Left Today",
    badgeType: "limited",
    image: "/images/artisan-toasted-sourdough.png",
    available: true,
    description: "Artisan sourdough brioche, house-smoked beef pastrami, caramelized shallot mustard, and melted raclette.",
  },
  {
    id: "r-3",
    title: "Matcha Kyoto Oat Latte Cup",
    category: "Non-Coffee Specialty",
    pointsCost: 360,
    title: "Matcha Pandan Cloud Latte",
    category: "drinks",
    categoryLabel: "Non-Coffee Specialty",
    pointsCost: 280,
    valueRupiah: "Rp 42.000",
    badge: "In Stock",
    badgeType: "stock",
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800&auto=format&fit=crop&q=80",
    available: true,
    description: "Ceremonial Uji matcha whisked with fresh Pandan leaf reduction and silky textured cold milk.",
  },
  {
    id: "r-4",
    title: "Biji Kopi Arabica Ijen Blue Mountain (200g)",
    category: "Roastery Merchandise",
    pointsCost: 750,
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&auto=format&fit=crop&q=80",
    available: true,
    title: "Ceramic Tumbler (16oz Matte Black)",
    category: "merch",
    categoryLabel: "Merchandise",
    pointsCost: 1200,
    valueRupiah: "Rp 245.000",
    badge: "Limited Edition (4 left)",
    badgeType: "urgent",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    description: "Triple-wall insulated thermal vessel with ceramic core lining. Keeps iced brew cold for 24h.",
  },
  {
    id: "r-5",
    title: "2-Hour VIP Boardroom Private Suite Pass",
    category: "Workspace Pass",
    pointsCost: 1000,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
    available: true,
    title: "VIP Mezzanine Half-Day Pass",
    category: "workspace",
    categoryLabel: "Workspace Pass",
    pointsCost: 750,
    valueRupiah: "Rp 120.000",
    badge: "Instant Digital Pass",
    badgeType: "stock",
    image: "/images/darmo-interior.png",
    description: "6 hours of quiet ergonomic desk access, private gigabit LAN drop, unlimited drip coffee refills.",
  },
  {
    id: "r-6",
    title: "Single-Origin V60 Tasting Flight",
    category: "drinks",
    categoryLabel: "Barista Tasting",
    pointsCost: 350,
    valueRupiah: "Rp 50.000",
    badge: "Barista Station",
    badgeType: "stock",
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80",
    description: "Curated tri-flight of seasonal Indonesian microlots with tasting notes card and barista sensory guide.",
  },
];

interface LedgerEntry {
  id: string;
  date: string;
  refCode: string;
  title: string;
  subtitle: string;
  category: "POS Dine-In" | "Redemption" | "Community" | "Workspace" | "Achievement";
  pointsDelta: number;
  tierNote: string;
}

const LEDGER_DATA: LedgerEntry[] = [
  {
    id: "l-1",
    date: "Today, 23:42 WIB",
    refCode: "#ORD-9021",
    title: "Dine-In Order: Cold Brew & Pastrami",
    subtitle: "Darmo Flagship • Station 04",
    category: "POS Dine-In",
    pointsDelta: 103,
    tierNote: "1.5x Gold Tier",
  },
  {
    id: "l-2",
    date: "02 Sep 2026, 14:15 WIB",
    refCode: "#RED-4410",
    title: "Redeemed: Cold Brew Aren Brulee Voucher",
    subtitle: "Online Store Voucher Claim",
    category: "Redemption",
    pointsDelta: -250,
    tierNote: "Claimed",
  },
  {
    id: "l-3",
    date: "28 Aug 2026, 20:00 WIB",
    refCode: "#EVT-1029",
    title: "Attended Surabaya Dev Meetup: Tech Talk #08",
    subtitle: "Community Guild Check-in",
    category: "Community",
    pointsDelta: 150,
    tierNote: "Community Bonus",
  },
  {
    id: "l-4",
    date: "24 Aug 2026, 11:30 WIB",
    refCode: "#RSV-0842",
    title: "VIP Meeting Room 02 (3 hrs) Reservation",
    subtitle: "Darmo Mezzanine Level",
    category: "Workspace",
    pointsDelta: 210,
    tierNote: "10% Off Applied",
  },
  {
    id: "l-5",
    date: "15 Aug 2026, 09:12 WIB",
    refCode: "#TIER-LVL",
    title: "Unlocked Gold Tier Artisan Milestone",
    subtitle: "Level Advancement Reward",
    category: "Achievement",
    pointsDelta: 300,
    tierNote: "Milestone Perk",
  },
];

export default function LoyaltyPage() {
  const { user, deductLoyaltyPoints, addLoyaltyPoints } = useAppStore();
  const [selectedTierPreview, setSelectedTierPreview] = useState<TierType>(user.tier);
  const [selectedTierPreview, setSelectedTierPreview] = useState<TierType>("Gold");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [ledgerFilter, setLedgerFilter] = useState<"all" | "earned" | "redeemed" | "perks">("all");
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [redeemedMsg, setRedeemedMsg] = useState<string | null>(null);
  const [voucherCount, setVoucherCount] = useState(12);

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
  // 3D Card tilt state
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = (y / (rect.height / 2)) * -10;
    const tiltY = (x / (rect.width / 2)) * 10;
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`,
    });
  };

  const handleRedeem = (reward: RewardItem) => {
    if (user.points < reward.pointsCost) {
      alert(`Poin belum mencukupi! Kamu butuh ${reward.pointsCost} PTS (Saldo: ${user.points} PTS).`);
  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
    });
  };

  const handleRedeem = (item: RewardItem) => {
    if (user.points < item.pointsCost) {
      alert(`Poin belum mencukupi! Kamu butuh ${item.pointsCost} PTS (Saldo: ${user.points} PTS).`);
      return;
    }
    deductLoyaltyPoints(reward.pointsCost);
    deductLoyaltyPoints(item.pointsCost);
    setVoucherCount((prev) => prev + 1);
    soundEffects.playSuccessChime();
    setRedeemedMsg(`Berhasil menukarkan: ${reward.title}. Barcode voucher otomatis aktif di profil!`);
    setRedeemedMsg(`Berhasil menukarkan "${item.title}"! 1 voucher digital ditambahkan ke dompet akun kamu.`);
    setTimeout(() => setRedeemedMsg(null), 5000);
  };

  const filteredRewards = REWARDS_CATALOG.filter((item) => {
    if (activeCategory === "all") return true;
    return item.category === activeCategory;
  });

  const filteredLedger = LEDGER_DATA.filter((entry) => {
    if (ledgerFilter === "all") return true;
    if (ledgerFilter === "earned") return entry.pointsDelta > 0;
    if (ledgerFilter === "redeemed") return entry.pointsDelta < 0;
    if (ledgerFilter === "perks") return entry.category === "Achievement" || entry.category === "Workspace";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-8 sm:pt-10 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 border-b border-white/5 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] uppercase tracking-wider mb-2">
            <Award className="w-4 h-4 text-[#f59e0b]" />
            <span>Kawan Ya&apos;reh Gamified Loyalty Ecosystem</span>
    <div className="w-full bg-canvas-obsidian min-h-screen text-text-primary selection:bg-brand-coffee selection:text-text-primary">
      {/* Ambient Atmospheric Glow Accents */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-accent-amber/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-brand-coffee/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Breadcrumbs & Live Status Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
          <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-text-muted">Loyalty Hub</span>
            <span>/</span>
            <span className="text-accent-amber font-semibold">Kawan Ya&apos;reh Rewards</span>
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
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-card text-accent-amber font-mono text-[11px] shadow-sm border border-border-subtle">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse" />
              GOLD MULTIPLIER: 1.5x ACTIVE
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-secondary text-text-muted font-mono text-[11px] border border-border-subtle">
              <RefreshCw className="w-3 h-3 text-text-muted" />
              Synced: 23:42 WIB
            </span>
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
        {/* Member Welcome Banner & Quick Summary Grid */}
        <div className="bg-surface-secondary border border-border-subtle rounded-2xl p-6 shadow-md mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-coffee via-secondary-container to-accent-amber p-0.5 shadow-lg">
                  <div className="w-full h-full bg-surface-card rounded-2xl flex items-center justify-center overflow-hidden">
                    <span className="font-heading font-black text-2xl text-accent-amber">YR</span>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-accent-amber text-canvas-obsidian w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shadow">
                  ★
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                    {user.name || "Reyhan Arisandi"}
                  </h1>
                  <span className="px-2 py-0.5 rounded bg-accent-amber/20 text-accent-amber font-mono text-[11px] uppercase tracking-wider font-semibold">
                    Gold Artisan
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  Darmo Flagship Resident • Patron ID:{" "}
                  <span className="font-mono text-text-primary font-semibold">#YR-9821</span>
                </p>
              </div>
            </div>

            {/* 4 Fast Numerical Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-surface-card p-2 rounded-xl border border-border-subtle">
              <div className="p-3 bg-canvas-obsidian rounded-lg flex flex-col justify-center">
                <span className="font-mono text-[10px] text-text-muted uppercase">Available Balance</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-bold text-accent-amber font-mono">{user.points}</span>
                  <span className="font-mono text-[10px] text-primary">PTS</span>
                </div>
              </div>
              <div className="p-3 bg-canvas-obsidian rounded-lg flex flex-col justify-center">
                <span className="font-mono text-[10px] text-text-muted uppercase">Tier Level</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-bold text-text-primary">Lvl 3</span>
                  <span className="font-mono text-[10px] text-emerald-400">Top 4%</span>
                </div>
              </div>
              <div className="p-3 bg-canvas-obsidian rounded-lg flex flex-col justify-center">
                <span className="font-mono text-[10px] text-text-muted uppercase">Cycle Spend</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-bold text-text-primary font-mono">Rp 660k</span>
                </div>
              </div>
              <div className="p-3 bg-canvas-obsidian rounded-lg flex flex-col justify-center">
                <span className="font-mono text-[10px] text-text-muted uppercase">Vouchers</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-bold text-tertiary font-mono">{voucherCount}</span>
                  <span className="font-mono text-[10px] text-text-muted">Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 3D-Tilt Virtual Membership Card & Tier Switcher */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#18181c] border border-white/10 space-y-4">
        {/* Alert Notification Toast */}
        <AnimatePresence>
          {redeemedMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{redeemedMsg}</span>
              </div>
              <button
                onClick={() => setRedeemedMsg(null)}
                className="text-emerald-400 hover:text-white p-1"
                aria-label="Dismiss message"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════════
            2-COLUMN HERO SECTION: VIRTUAL 3D CARD + TIER PROGRESSION
            ══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* LEFT COLUMN: 3D Holographic Card (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-white">
                Kartu Virtual Membership
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                NFC & QR Tap Ready
              <span className="font-mono text-xs uppercase tracking-widest text-text-muted flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-accent-amber" />
                Interactive NFC Pass
              </span>
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="font-mono text-xs text-primary hover:underline"
              >
                Tap to expand POS QR
              </button>
            </div>

            {/* Tier Switcher Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#111114] rounded-xl text-xs font-mono text-center">
              {(["Bronze", "Silver", "Gold", "Platinum"] as TierType[]).map((t) => (
            {/* Virtual Luxury Card Container with 3D perspective tilt */}
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => setIsQrModalOpen(true)}
              style={tiltStyle}
              className="relative w-full aspect-[1.58/1] rounded-2xl p-6 overflow-hidden shadow-2xl transition-transform duration-200 bg-gradient-to-br from-[#2a1d0f] via-[#1a140d] to-[#0d0d10] cursor-pointer border border-accent-amber/30 group"
            >
              {/* Ambient Gold Glow Inside Card */}
              <div className="absolute -top-20 -right-20 w-56 h-56 bg-accent-amber/25 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-44 h-44 bg-brand-coffee/20 rounded-full blur-xl pointer-events-none" />
              {/* Card Watermark Subtle Texture */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              <div className="relative z-10 h-full flex flex-col justify-between">
                {/* Card Header: Monogram + EMV Chip */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-amber/20 border border-accent-amber/30 flex items-center justify-center font-heading font-black text-accent-amber text-sm">
                      YR
                    </div>
                    <div>
                      <div className="text-base font-bold text-text-primary tracking-tight">Warkop Ya&apos;reh</div>
                      <div className="font-mono text-[10px] text-accent-amber tracking-widest uppercase font-semibold">
                        SANCTUARY PASS
                      </div>
                    </div>
                  </div>

                  {/* EMV Chip Representation */}
                  <div className="w-11 h-8 rounded bg-gradient-to-tr from-amber-400/80 via-yellow-200/90 to-amber-600/80 shadow-md flex items-center justify-center p-0.5">
                    <div className="w-full h-full rounded-sm bg-gradient-to-br from-amber-600/40 to-black/30 flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-canvas-obsidian" />
                    </div>
                  </div>
                </div>

                {/* Card Middle: Balance & Status */}
                <div className="my-auto py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-[11px] text-primary uppercase tracking-wider">
                        Gold Artisan Tier
                      </div>
                      <div className="text-2xl font-bold text-text-primary font-mono tracking-normal flex items-baseline gap-2">
                        {user.points} <span className="font-mono text-xs text-accent-amber">YR PTS</span>
                      </div>
                    </div>

                    {/* Small In-Card QR Thumbnail */}
                    <div className="bg-white p-1.5 rounded-lg shadow-lg group-hover:scale-105 transition-transform">
                      <QrCode className="w-10 h-10 text-black" />
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Name, Card No & Expiry */}
                <div className="pt-2">
                  <div className="font-mono text-xs text-tertiary tracking-widest font-semibold uppercase">
                    {user.name || "REYHAN ARISANDI"}
                  </div>
                  <div className="flex items-center justify-between text-text-muted font-mono text-[10px] pt-1">
                    <span>YR-9821-4029-7712</span>
                    <span>SINCE 09/23 • DARMO</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tap to scan action bar */}
            <div className="flex items-center justify-between bg-surface-card p-3 rounded-xl border border-border-subtle">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-accent-amber" />
                <span className="text-xs text-text-primary font-medium">Ready for Counter Scanner</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  key={t}
                  onClick={() => setSelectedTierPreview(t)}
                  className={`py-1.5 rounded-lg transition-all ${
                    selectedTierPreview === t
                      ? "bg-white/15 text-white font-bold shadow-sm"
                      : "text-neutral-500 hover:text-white"
                  onClick={() => {
                    addLoyaltyPoints(50);
                    soundEffects.playSuccessChime();
                  }}
                  className="px-2.5 py-1.5 bg-surface-secondary hover:bg-surface-container border border-border-subtle text-accent-amber font-mono text-[11px] rounded-lg transition-colors flex items-center gap-1"
                  title="Simulate POS purchase reward"
                >
                  <Plus className="w-3 h-3" />
                  <span>+50 Pts</span>
                </button>
                <button
                  onClick={() => setIsQrModalOpen(true)}
                  className="px-3 py-1.5 bg-brand-coffee hover:bg-primary-container text-text-primary text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                >
                  <span>Enlarge QR</span>
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Tier Progression & Horizon (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6 bg-surface-secondary border border-border-subtle p-6 rounded-2xl shadow-md">
            {/* Interactive Tier Indicator Strip */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-text-primary">Artisan Journey Track</span>
                <span className="font-mono text-xs text-accent-amber">Cycle ends 31 Dec 2026</span>
              </div>

              {/* 4 Tier Segment Selector */}
              <div className="grid grid-cols-4 gap-2">
                {/* Bronze */}
                <button
                  onClick={() => setSelectedTierPreview("Bronze")}
                  className={`p-3 rounded-xl flex flex-col items-center text-center transition-all border ${
                    selectedTierPreview === "Bronze"
                      ? "bg-surface-card border-amber-700/50 shadow-md"
                      : "bg-surface-card/60 border-border-subtle opacity-70 hover:opacity-100"
                  }`}
                >
                  {t}
                  <Check className="w-5 h-5 text-amber-700" />
                  <span className="text-xs font-medium text-text-muted mt-1">Bronze</span>
                  <span className="font-mono text-[10px] text-text-muted">1.0x Pts</span>
                </button>
              ))}

                {/* Silver */}
                <button
                  onClick={() => setSelectedTierPreview("Silver")}
                  className={`p-3 rounded-xl flex flex-col items-center text-center transition-all border ${
                    selectedTierPreview === "Silver"
                      ? "bg-surface-card border-slate-400/50 shadow-md"
                      : "bg-surface-card/60 border-border-subtle opacity-70 hover:opacity-100"
                  }`}
                >
                  <Check className="w-5 h-5 text-slate-300" />
                  <span className="text-xs font-medium text-slate-300 mt-1">Silver</span>
                  <span className="font-mono text-[10px] text-slate-400">1.2x Pts</span>
                </button>

                {/* Gold (Current Active) */}
                <button
                  onClick={() => setSelectedTierPreview("Gold")}
                  className={`p-3 rounded-xl flex flex-col items-center text-center relative overflow-hidden transition-all border ${
                    selectedTierPreview === "Gold"
                      ? "bg-gradient-to-b from-brand-coffee/40 to-surface-card border-accent-amber/50 shadow-lg"
                      : "bg-surface-card/60 border-border-subtle hover:opacity-100"
                  }`}
                >
                  <div className="absolute top-0 right-0 left-0 h-1 bg-accent-amber" />
                  <Star className="w-5 h-5 text-accent-amber fill-accent-amber" />
                  <span className="text-xs font-bold text-accent-amber mt-1">Gold</span>
                  <span className="font-mono text-[10px] text-tertiary">Active • 1.5x</span>
                </button>

                {/* Platinum (Target) */}
                <button
                  onClick={() => setSelectedTierPreview("Platinum")}
                  className={`p-3 rounded-xl flex flex-col items-center text-center transition-all border ${
                    selectedTierPreview === "Platinum"
                      ? "bg-surface-card border-purple-400/50 shadow-md"
                      : "bg-surface-card/60 border-border-subtle opacity-50 hover:opacity-75"
                  }`}
                >
                  <Lock className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-medium text-indigo-300 mt-1">Platinum</span>
                  <span className="font-mono text-[10px] text-indigo-400">2.0x Pts</span>
                </button>
              </div>
            </div>

            {/* Virtual 3D-Card Mockup */}
            <motion.div
              layout
              whileHover={{ scale: 1.02, rotateY: 5, rotateX: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`w-full aspect-[1.58/1] rounded-3xl p-6 sm:p-7 bg-gradient-to-br ${tierStyles[selectedTierPreview].gradient} border ${tierStyles[selectedTierPreview].border} shadow-[0_16px_40px_rgba(0,0,0,0.7)] relative overflow-hidden flex flex-col justify-between`}
            >
              <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 blur-3xl rounded-full pointer-events-none" />
            {/* Detailed Tier Progress Bar */}
            <div className="bg-surface-card border border-border-subtle p-5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">Progress to Platinum Sanctuary Tier</span>
                <span className="font-mono text-xs text-accent-amber font-bold">66% Completed</span>
              </div>

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
              {/* Progress Track */}
              <div className="w-full h-3 bg-canvas-obsidian rounded-full overflow-hidden p-0.5 border border-border-subtle">
                <div
                  className="h-full bg-gradient-to-r from-brand-coffee via-accent-amber to-tertiary rounded-full transition-all duration-1000"
                  style={{ width: "66%" }}
                />
              </div>

              <div className="flex items-center justify-between pt-3 font-mono text-xs text-text-muted">
                <span>Rp 660.000 spent</span>
                <span className="text-text-primary font-semibold">Target: Rp 1.000.000 (Rp 340.000 to go)</span>
              </div>

              <p className="text-xs text-text-muted mt-3">
                Spend <strong className="text-accent-amber font-semibold">Rp 340.000 more</strong> or earn 350 pts
                before midnight 31 Dec 2026 to automatically unlock lifetime Platinum perks.
              </p>
            </div>

            {/* Platinum Benefits Preview Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-surface-card via-surface-container to-surface-card border border-border-subtle flex items-start gap-3 shadow-sm">
              <Award className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Upcoming Platinum Privileges
                </span>
                <p className="text-xs text-text-muted leading-relaxed">
                  Unlimited Oat/Almond upgrades, 24/7 dedicated Mezzanine VIP Pods access, complimentary manual brew
                  tasting flight on every flagship visit, and concierge table reservations.
                </p>
              </div>
            </div>
          </div>
        </div>

              {/* Card Middle / Chip */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="w-11 h-8 rounded-lg bg-gradient-to-tr from-amber-200 via-amber-400 to-amber-100 border border-amber-500/40 opacity-80" />
                <span className="font-mono text-xs text-white/40 tracking-widest">
                  •••• 8492
        {/* ══════════════════════════════════════════════════════════════
            QUICK PERKS MATRIX (4 Active Unlocked Feature Cards)
            ══════════════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="font-mono text-xs text-accent-amber uppercase tracking-wider">
                Included in your Gold Tier
              </span>
              <h2 className="text-2xl font-bold text-text-primary">Active Sanctuary Privileges</h2>
            </div>
            <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              4 Privileges Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Perk 1 */}
            <div className="bg-surface-secondary border border-border-subtle p-5 rounded-xl hover:bg-surface-card transition-all flex flex-col justify-between shadow-sm group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface-card border border-border-subtle text-accent-amber flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-text-primary mb-1">Free Espresso Upsize</h3>
                <span className="inline-block font-mono text-[11px] text-emerald-400 mb-2">
                  Active • Unlimited Visits
                </span>
                <p className="text-xs text-text-muted leading-relaxed">
                  Automatic 16oz upgrade on all Americano, Aren Brulee, and Flat White dine-in or takeaway orders.
                </p>
              </div>
              <div className="mt-4 pt-3 text-right">
                <span className="font-mono text-xs text-primary">Auto-applied at POS</span>
              </div>
            </div>

              {/* Card Bottom: Name & Balance */}
              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <div className="text-[9px] font-mono uppercase text-neutral-400">Cardholder Name</div>
                  <div className="font-heading font-bold text-base text-white">{user.name}</div>
            {/* Perk 2 */}
            <div className="bg-surface-secondary border border-border-subtle p-5 rounded-xl hover:bg-surface-card transition-all flex flex-col justify-between shadow-sm group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface-card border border-border-subtle text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Laptop className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-mono uppercase text-neutral-400">Poin Aktif</div>
                  <div className={`font-mono font-extrabold text-lg ${tierStyles[selectedTierPreview].accent}`}>
                    {user.points} PTS
                  </div>
                </div>
                <h3 className="text-base font-bold text-text-primary mb-1">10% Workspace Discount</h3>
                <span className="inline-block font-mono text-[11px] text-emerald-400 mb-2">
                  Active • Darmo &amp; Gubeng
                </span>
                <p className="text-xs text-text-muted leading-relaxed">
                  Applicable directly on all Quiet Pods and VIP Boardroom bookings made through the app.
                </p>
              </div>
            </motion.div>
              <div className="mt-4 pt-3 text-right">
                <Link
                  href="/booking"
                  className="font-mono text-xs text-accent-amber hover:underline flex items-center justify-end gap-1"
                >
                  <span>Book Pod</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Cashier Barcode */}
            <div className="p-4 rounded-2xl bg-[#111114] border border-white/5 text-center space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-400">
                Tunjukkan Barcode ke Kasir untuk Double Points
              </span>
              <div className="p-2.5 bg-white text-black inline-block rounded-xl shadow-md">
                <QrCode className="w-12 h-12 text-black mx-auto" />
                <span className="font-mono text-[9px] font-bold text-black mt-0.5 block">
                  YR-{user.id.toUpperCase()}
            {/* Perk 3 */}
            <div className="bg-surface-secondary border border-border-subtle p-5 rounded-xl hover:bg-surface-card transition-all flex flex-col justify-between shadow-sm group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface-card border border-border-subtle text-tertiary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Cake className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-text-primary mb-1">Birthday Brew &amp; Platter</h3>
                <span className="inline-block font-mono text-[11px] text-tertiary mb-2">
                  Unlocked • Available Nov 14
                </span>
                <p className="text-xs text-text-muted leading-relaxed">
                  Complimentary signature brew and artisanal toast bites during your entire birthday week.
                </p>
              </div>
              <div className="mt-4 pt-3 text-right">
                <span className="font-mono text-xs text-text-muted">Nov 14 — 21</span>
              </div>
            </div>

            {/* Perk 4 */}
            <div className="bg-surface-secondary border border-border-subtle p-5 rounded-xl hover:bg-surface-card transition-all flex flex-col justify-between shadow-sm group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface-card border border-border-subtle text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Ticket className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-text-primary mb-1">Priority Community Seat</h3>
                <span className="inline-block font-mono text-[11px] text-emerald-400 mb-2">VIP Pass Active</span>
                <p className="text-xs text-text-muted leading-relaxed">
                  Reserved front-row spots for late-night developer meetups, founder discussions, and pour-over workshops.
                </p>
              </div>
              <div className="mt-4 pt-3 text-right">
                <Link
                  href="/community"
                  className="font-mono text-xs text-accent-amber hover:underline flex items-center justify-end gap-1"
                >
                  <span>View Events</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
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
        {/* ══════════════════════════════════════════════════════════════
            REWARDS STORE / MARKETPLACE
            ══════════════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="font-mono text-xs text-accent-amber uppercase tracking-wider">
                Redeem Your Points
              </span>
              <h2 className="text-2xl font-bold text-text-primary">Artisan Rewards Marketplace</h2>
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "All Rewards (6)" },
                { id: "drinks", label: "Free Drinks (3)" },
                { id: "food", label: "Food & Pastry (1)" },
                { id: "merch", label: "Merchandise (1)" },
                { id: "workspace", label: "Workspace (1)" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setActiveCategory(btn.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeCategory === btn.id
                      ? "bg-brand-coffee text-text-primary shadow-sm"
                      : "bg-surface-secondary hover:bg-surface-card text-text-muted hover:text-text-primary border border-border-subtle"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {REWARDS.map((item) => {
              const canAfford = user.points >= item.pointsCost;
          {/* 6-Item Reward Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map((reward) => {
              const canAfford = user.points >= reward.pointsCost;

              return (
                <div
                  key={item.id}
                  className="rounded-3xl bg-[#18181c] border border-white/10 overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all shadow-md"
                  key={reward.id}
                  className="bg-surface-secondary border border-border-subtle rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:border-white/[0.14] transition-all flex flex-col group"
                >
                  <div className="relative h-40 w-full bg-[#111114]">
                  <div className="relative aspect-video w-full overflow-hidden bg-surface-card">
                    <Image
                      src={item.image}
                      alt={item.title}
                      src={reward.image}
                      alt={reward.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 300px"
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#18181c] via-black/30 to-transparent" />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/60 text-[#fcd34d] border border-white/10">
                      {item.category}
                    </span>
                    <div className="absolute top-3 right-3 bg-canvas-obsidian/90 backdrop-blur-md px-2.5 py-1 rounded-full text-accent-amber font-mono text-xs flex items-center gap-1 shadow-md border border-border-subtle">
                      <Gift className="w-3.5 h-3.5 text-accent-amber" />
                      <span>{reward.pointsCost} Pts</span>
                    </div>
                    <div
                      className={`absolute bottom-3 left-3 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono ${
                        reward.badgeType === "urgent"
                          ? "bg-rose-950/80 text-rose-400 border border-rose-500/30"
                          : reward.badgeType === "limited"
                          ? "bg-amber-950/80 text-amber-400 border border-amber-500/30"
                          : "bg-surface-secondary/80 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {reward.badge}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <h4 className="font-heading font-bold text-sm text-white line-clamp-2">
                      {item.title}
                    </h4>
                  <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-text-primary mb-1">{reward.title}</h3>
                      <p className="text-xs text-text-muted leading-relaxed">{reward.description}</p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#f59e0b]">
                        {item.pointsCost} PTS
                      </span>

                    <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                      <span className="font-mono text-xs text-text-muted">Value: {reward.valueRupiah}</span>
                      <button
                        onClick={() => handleRedeem(item)}
                        onClick={() => handleRedeem(reward)}
                        disabled={!canAfford}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                          canAfford
                            ? "bg-[#9c6b3a] hover:bg-[#b07b44] text-white shadow-md active:scale-95"
                            : "bg-white/5 text-neutral-500 cursor-not-allowed"
                            ? "bg-brand-coffee hover:bg-primary-container text-text-primary cursor-pointer active:scale-95"
                            : "bg-surface-container text-text-muted cursor-not-allowed border border-border-subtle"
                        }`}
                      >
                        {canAfford ? "Tukarkan" : "Poin Kurang"}
                        {canAfford ? "Redeem Voucher" : "Need More PTS"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            ACTIVITY & POINTS TRANSACTION LEDGER
            ══════════════════════════════════════════════════════════════ */}
        <div className="bg-surface-secondary border border-border-subtle rounded-2xl p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="font-mono text-xs text-accent-amber uppercase tracking-wider">Audit Log</span>
              <h2 className="text-2xl font-bold text-text-primary">Points &amp; Perks Ledger</h2>
            </div>

            {/* Ledger Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "All Activity" },
                { id: "earned", label: "Earned (+)" },
                { id: "redeemed", label: "Redeemed (-)" },
                { id: "perks", label: "Tier Perks" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setLedgerFilter(pill.id as typeof ledgerFilter)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    ledgerFilter === pill.id
                      ? "bg-surface-card text-text-primary border border-border-subtle"
                      : "bg-canvas-obsidian text-text-muted hover:text-text-primary"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="font-mono text-xs text-text-muted uppercase border-b border-border-subtle pb-3">
                  <th className="py-3 px-4">Date &amp; Timestamp</th>
                  <th className="py-3 px-4">Ref Code</th>
                  <th className="py-3 px-4">Activity Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Points Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 text-xs">
                {filteredLedger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-surface-card transition-colors">
                    <td className="py-3.5 px-4 font-mono text-text-primary whitespace-nowrap">{entry.date}</td>
                    <td className="py-3.5 px-4 font-mono text-text-muted">{entry.refCode}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-text-primary">{entry.title}</div>
                      <div className="font-mono text-[11px] text-text-muted">{entry.subtitle}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-surface-card text-text-muted font-mono text-[10px] border border-border-subtle">
                        {entry.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-mono font-bold ${
                          entry.pointsDelta > 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {entry.pointsDelta > 0 ? `+${entry.pointsDelta}` : entry.pointsDelta} Pts
                      </span>
                      <div className="font-mono text-[10px] text-accent-amber">{entry.tierNote}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ledger Footer */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-border-subtle font-mono text-xs text-text-muted">
            <span>Showing {filteredLedger.length} of 68 historical entries</span>
            <button
              onClick={() => alert("Downloading CSV Statement: YAR-LOYALTY-LEDGER-2026.csv")}
              className="text-accent-amber hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Download Statement (.CSV)</span>
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          POPUP MODAL: ENLARGED POS QR SCANNER
          ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isQrModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-canvas-obsidian/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-secondary border border-border-subtle rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center relative"
            >
              <button
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface-card transition-colors"
                onClick={() => setIsQrModalOpen(false)}
                aria-label="Close QR modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-xl bg-accent-amber/20 text-accent-amber flex items-center justify-center mb-3">
                <QrCode className="w-7 h-7" />
              </div>

              <h3 className="text-lg font-bold text-text-primary">Scan at Barista Counter</h3>
              <p className="text-xs text-text-muted mt-1 mb-6">
                Hold screen directly over barcode laser scanner or NFC terminal at Darmo / Gubeng.
              </p>

              {/* Large QR Code Frame */}
              <div className="bg-white p-5 rounded-2xl shadow-xl mb-4">
                <QrCode className="w-52 h-52 text-black" />
              </div>

              {/* Scannable Barcode simulation */}
              <div className="w-full bg-surface-card border border-border-subtle p-3 rounded-xl flex flex-col items-center">
                <div className="flex items-center gap-1 h-8 opacity-80 mb-1">
                  <div className="w-1 h-full bg-text-primary" />
                  <div className="w-2 h-full bg-text-primary" />
                  <div className="w-0.5 h-full bg-text-primary" />
                  <div className="w-3 h-full bg-text-primary" />
                  <div className="w-1 h-full bg-text-primary" />
                  <div className="w-2 h-full bg-text-primary" />
                  <div className="w-0.5 h-full bg-text-primary" />
                  <div className="w-2 h-full bg-text-primary" />
                  <div className="w-1 h-full bg-text-primary" />
                  <div className="w-3 h-full bg-text-primary" />
                  <div className="w-0.5 h-full bg-text-primary" />
                  <div className="w-2 h-full bg-text-primary" />
                  <div className="w-1 h-full bg-text-primary" />
                </div>
                <span className="font-mono text-xs text-accent-amber tracking-widest font-semibold">
                  YR-9821-4029-7712
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2 text-emerald-400 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Screen Brightness Boosted to 100%
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
