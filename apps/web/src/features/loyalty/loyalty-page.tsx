'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coffee,
  Download,
  Flame,
  Gift,
  Laptop,
  Lock,
  QrCode,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@warkop-yareh/ui';
import { DataState, LoadingState } from '@/components/data-state';
import {
  getLoyaltyStatus,
  getLoyaltyTransactions,
  getRewards,
  redeemReward,
  type LoyaltyTier,
} from './loyalty.api';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAuthStore } from '@/stores/auth.store';
import { soundEffects } from '@/lib/audioAlerts';

const TIERS: LoyaltyTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
const THRESHOLDS = [0, 200, 500, 1000];

const QUESTS = [
  {
    id: 'q1',
    title: 'Explorer of Single Origin',
    desc: 'Cicipi 3 jenis manual brew berbeda minggu ini',
    progress: 2,
    total: 3,
    reward: '+150 YR PTS',
    done: false,
  },
  {
    id: 'q2',
    title: 'Morning Productivity Sprint',
    desc: 'Beli minuman atau reservasi sebelum pukul 09:00 WIB',
    progress: 1,
    total: 1,
    reward: '+80 YR PTS',
    done: true,
  },
  {
    id: 'q3',
    title: 'Sanctuary Guild Mentor',
    desc: 'Tulis tanggapan bermakna di forum komunitas Surabaya',
    progress: 1,
    total: 2,
    reward: '+100 YR PTS',
    done: false,
  },
];

export default function LoyaltyPage() {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.isInitialized);
  const authenticated = useAuthStore((s) => s.isAuthenticated);
  const enabled = initialized && authenticated;
  const client = useQueryClient();

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('ALL');
  const [rewardCategory, setRewardCategory] = useState<'all' | 'beverage' | 'workspace' | 'merch'>('all');
  const [notice, setNotice] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const status = useQuery({
    queryKey: ['loyalty', user?.id, 'status'],
    queryFn: getLoyaltyStatus,
    enabled,
  });

  const rewards = useQuery({
    queryKey: ['loyalty', user?.id, 'rewards'],
    queryFn: getRewards,
    enabled,
  });

  const ledger = useQuery({
    queryKey: ['loyalty', user?.id, 'ledger', page],
    queryFn: () => getLoyaltyTransactions(page),
    enabled,
  });

  const redemption = useMutation({
    mutationFn: redeemReward,
    onSuccess: async (result) => {
      soundEffects.playSuccessChime();
      setNotice(`${result.reward.name} berhasil ditukarkan! Kode voucher siap digunakan.`);
      await client.invalidateQueries({ queryKey: ['loyalty', user?.id] });
      setTimeout(() => setNotice(''), 6000);
    },
  });

  const data = status.data;
  const currentPoints = data?.loyaltyPoints ?? 1450;
  const currentTier = data?.membershipTier ?? 'GOLD';
  const tierIndex = TIERS.indexOf(currentTier);
  const nextThreshold = THRESHOLDS[Math.min(3, tierIndex + 1)] || 1000;
  const progressPercent = Math.min(100, Math.round((currentPoints / nextThreshold) * 100));

  const sampleRewards = [
    {
      id: 'r1',
      name: 'Free Upgrade Oat Milk Barista Edition',
      category: 'beverage',
      cost: 120,
      desc: 'Berlaku untuk seluruh racikan berbasis espresso',
    },
    {
      id: 'r2',
      name: '1-Hour Solo Focus Pod Pass',
      category: 'workspace',
      cost: 350,
      desc: 'Akses 1 jam bilik kerja akustik di Darmo atau Gubeng',
    },
    {
      id: 'r3',
      name: 'Signature Cold Brew Aren Brulee',
      category: 'beverage',
      cost: 500,
      desc: 'Segelas gratis Cold Brew Aren signature drop',
    },
    {
      id: 'r4',
      name: 'Ya’reh Stainless Tumbler (Limited Edition)',
      category: 'merch',
      cost: 1200,
      desc: 'Tumbler vakum insulasi grafir logo Warkop Ya’reh',
    },
  ];

  return (
    <main className="w-full min-h-screen bg-canvas-obsidian text-on-surface antialiased pb-32 pt-8">
      {/* Background Mesh */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-mesh opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-accent-amber uppercase tracking-widest mb-1.5">
              <Award className="w-4 h-4" />
              <span>Sanctuary Loyalty Club</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Kawan Ya&apos;reh Rewards
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Setiap cangkir kopi membawa Anda lebih dekat ke privilege eksklusif dan diskon ruang kerja.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-surface-card px-4 py-2 rounded-xl border border-border-subtle shadow-md">
              <Sparkles className="w-4 h-4 text-accent-amber" />
              <div>
                <span className="font-mono text-[10px] text-text-muted block uppercase">Available Points</span>
                <span className="font-mono text-sm font-bold text-accent-amber">
                  {currentPoints.toLocaleString('id-ID')} YR PTS
                </span>
              </div>
            </div>
          </div>
        </div>

        {notice && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
            <span>{notice}</span>
            <button onClick={() => setNotice('')} className="text-emerald-400">✕</button>
          </div>
        )}

        {/* 2-Column Hero: 3D Holographic Virtual Card + Tier Progression */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Virtual 3D Card (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              whileHover={{ rotateY: 10, rotateX: -6, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              className="relative w-full max-w-sm aspect-[1.58/1] rounded-3xl p-6 overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.9)] border border-accent-amber/50 bg-gradient-to-br from-surface-card via-[#1b1915] to-[#0d0d0f] text-text-primary flex flex-col justify-between"
            >
              {/* Gold Glare & Circuit Elements */}
              <div className="pointer-events-none absolute -top-16 -right-16 h-52 w-52 rounded-full bg-accent-amber/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-brand-coffee/35 blur-2xl" />

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-amber to-brand-coffee flex items-center justify-center font-heading font-black text-canvas-obsidian text-base shadow-sm">
                    Y
                  </div>
                  <div>
                    <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary block leading-none">
                      Warkop Ya&apos;reh
                    </span>
                    <span className="font-mono text-[9px] text-accent-amber uppercase tracking-widest">
                      Sanctuary Guild Pass
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  className="p-1.5 rounded-lg bg-surface-secondary border border-border-subtle hover:border-accent-amber/50 text-text-muted hover:text-accent-amber transition-colors"
                  title="Tampilkan QR Pass"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>

              {/* Card Center: EMV Chip & Points */}
              <div className="relative z-10 my-auto flex items-center justify-between">
                <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 to-amber-600 border border-amber-300/40 opacity-80" />
                <div className="text-right">
                  <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest block">
                    Total Points
                  </span>
                  <p className="font-heading text-2xl font-black text-text-primary tracking-tight">
                    {currentPoints.toLocaleString('id-ID')} <span className="font-mono text-xs text-accent-amber">PTS</span>
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] font-mono text-text-muted">
                <div>
                  <span className="text-accent-amber font-bold block">{user?.name ?? 'Reyhan Arisandi'}</span>
                  <span className="text-[10px] text-text-muted">#YR-2024-8921</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] bg-accent-amber/20 text-accent-amber border border-accent-amber/40">
                  {currentTier} PECINTA
                </span>
              </div>
            </motion.div>
          </div>

          {/* Tier Progression & Streak Dashboard (7 cols) */}
          <div className="lg:col-span-7 bg-surface-card p-6 sm:p-8 rounded-3xl border border-border-subtle shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-accent-amber uppercase tracking-wider font-bold">
                  Tier Progression
                </span>
                <h3 className="font-heading text-xl font-bold text-text-primary mt-1">
                  Menuju Platinum Pendekar
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Butuh {Math.max(0, nextThreshold - currentPoints)} poin lagi untuk membuka privilege gratis ruangan VIP.
                </p>
              </div>
              <span className="font-mono text-lg font-bold text-accent-amber">
                {progressPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-surface-secondary border border-border-subtle overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-brand-coffee via-secondary-container to-accent-amber shadow-sm"
              />
            </div>

            {/* 7-Day Brew Streak Card */}
            <div className="p-4 rounded-2xl bg-surface-secondary border border-border-subtle flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-amber/15 border border-accent-amber/30 flex items-center justify-center text-accent-amber">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-bold text-text-primary">
                    7-Day Brew Streak Aktif! 🔥
                  </h4>
                  <p className="text-[11px] text-text-muted">
                    Kunjungi cabang 3 hari berturut-turut untuk bonus +100 YR PTS.
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-accent-amber shrink-0 bg-accent-amber/10 px-3 py-1.5 rounded-lg border border-accent-amber/30">
                Hari ke-5 / 7
              </span>
            </div>
          </div>
        </div>

        {/* Active Gamified Quests & Challenges */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-accent-amber" />
              <h2 className="font-heading text-lg font-bold text-text-primary">
                Tantangan &amp; Quest Mingguan
              </h2>
            </div>
            <span className="text-xs text-text-muted font-mono">Reset tiap Senin 00:00 WIB</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {QUESTS.map((q) => (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  q.done
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-border-subtle bg-surface-card hover:border-primary/40'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-accent-amber uppercase tracking-wider font-bold bg-accent-amber/15 px-2 py-0.5 rounded">
                      {q.reward}
                    </span>
                    {q.done && (
                      <span className="font-mono text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                      </span>
                    )}
                  </div>
                  <h4 className="font-heading font-bold text-sm text-text-primary">{q.title}</h4>
                  <p className="text-xs text-text-muted leading-relaxed">{q.desc}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border-subtle">
                  <div className="flex justify-between text-[11px] font-mono text-text-muted">
                    <span>Progress</span>
                    <span>
                      {q.progress} / {q.total}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-secondary overflow-hidden">
                    <div
                      className="h-full bg-accent-amber rounded-full"
                      style={{ width: `${(q.progress / q.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Perks Redemption Bazaar */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-accent-amber" />
              <h2 className="font-heading text-xl font-bold text-text-primary">
                Bazaar Penukaran Hadiah
              </h2>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-card border border-border-subtle text-xs">
              <button
                type="button"
                onClick={() => setRewardCategory('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  rewardCategory === 'all'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setRewardCategory('beverage')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  rewardCategory === 'beverage'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Minuman
              </button>
              <button
                type="button"
                onClick={() => setRewardCategory('workspace')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  rewardCategory === 'workspace'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Workspace
              </button>
              <button
                type="button"
                onClick={() => setRewardCategory('merch')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  rewardCategory === 'merch'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Merchandise
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleRewards
              .filter((r) => rewardCategory === 'all' || r.category === rewardCategory)
              .map((reward) => (
                <div
                  key={reward.id}
                  className="p-5 rounded-2xl border border-border-subtle bg-surface-card flex flex-col justify-between space-y-4 hover:border-accent-amber/40 transition-all shadow-lg"
                >
                  <div className="space-y-2">
                    <span className="font-mono text-[10px] text-accent-amber uppercase tracking-wider font-bold bg-accent-amber/15 px-2.5 py-0.5 rounded">
                      {reward.cost} YR PTS
                    </span>
                    <h4 className="font-heading font-bold text-sm text-text-primary mt-2">
                      {reward.name}
                    </h4>
                    <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                      {reward.desc}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={currentPoints < reward.cost}
                    onClick={() => {
                      redemption.mutate(reward.id);
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      currentPoints >= reward.cost
                        ? 'bg-gradient-to-r from-brand-coffee to-secondary-container text-text-primary hover:opacity-90 shadow-md'
                        : 'bg-surface-secondary text-text-muted cursor-not-allowed border border-border-subtle'
                    }`}
                  >
                    {currentPoints >= reward.cost ? 'Tukarkan Poin' : 'Poin Belum Cukup'}
                  </button>
                </div>
              ))}
          </div>
        </section>
      </div>

      {/* QR Pass Modal */}
      <AnimatePresence>
        {isQrModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-surface-card text-text-primary rounded-3xl p-6 sm:p-8 border border-border-subtle shadow-2xl space-y-5 text-center relative"
            >
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-1"
              >
                ✕
              </button>
              <div className="space-y-1">
                <span className="font-mono text-xs text-accent-amber uppercase font-bold tracking-widest">
                  Sanctuary Guild Pass
                </span>
                <h3 className="font-heading text-lg font-bold">Tunjukkan ke Barista</h3>
                <p className="text-xs text-text-muted">
                  Pindai QR ini di kasir untuk klaim poin atau promo anggota.
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl w-48 h-48 mx-auto flex items-center justify-center shadow-inner">
                <QrCode className="w-36 h-36 text-slate-900" />
              </div>

              <div className="font-mono text-xs text-text-muted">
                <p className="font-bold text-text-primary">{user?.name ?? 'Reyhan Arisandi'}</p>
                <p>#YR-2024-8921 • GOLD TIER</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
