"use client";

import React, { useState } from "react";
import { Star, Award, Coins, Users, Plus, Check, Edit, X } from "lucide-react";

interface RewardItem {
  id: string;
  title: string;
  pointsCost: number;
  isActive: boolean;
  type: "COFFEE" | "COWORKING" | "VOUCHER";
}

export default function LoyaltyPage() {
  const [rewards, setRewards] = useState<RewardItem[]>([
    { id: "RWD-01", title: "Free Toraja Drip Coffee", pointsCost: 150, isActive: true, type: "COFFEE" },
    { id: "RWD-02", title: "1-Day Coworking Pass", pointsCost: 350, isActive: true, type: "COWORKING" },
    { id: "RWD-03", title: "Rp 50,000 Discount Voucher", pointsCost: 500, isActive: true, type: "VOUCHER" },
    { id: "RWD-04", title: "Exclusive Warkop Tumbler", pointsCost: 1200, isActive: false, type: "VOUCHER" },
  ]);

  const stats = [
    { label: "Active Members", value: "1,248", icon: Users, colorClass: "bg-blue-500/10 text-blue-500" },
    { label: "Points Circulated", value: "348,200", icon: Coins, colorClass: "bg-amber-500/10 text-amber-500" },
    { label: "Rewards Redeemed", value: "184", icon: Award, colorClass: "bg-[var(--success-500)]/10 text-[var(--success-500)]" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-[var(--text-primary)]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)]">Loyalty & Rewards</h1>
          <p className="font-sans text-xs text-[var(--text-secondary)] mt-0.5">Manage customer loyalty points, rewards redemption catalog, and referral campaigns</p>
        </div>
        <button 
          onClick={() => alert("Create reward modal")}
          className="bg-[var(--interactive-primary)] text-white hover:bg-[var(--interactive-primary-hover)] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0 ml-auto md:ml-0"
        >
          <Plus className="w-4 h-4" /> ADD REWARD
        </button>
      </div>

      {/* Stats Summary Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, index) => {
          const Icon = s.icon;
          return (
            <div key={index} className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-tertiary)] p-6 flex items-center justify-between hover:shadow-md transition-all">
              <div>
                <p className="text-xs font-mono uppercase text-[var(--text-tertiary)] font-semibold">{s.label}</p>
                <h3 className="font-mono text-3xl font-bold text-[var(--text-primary)] mt-1.5">{s.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.colorClass}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Reward Catalog Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-[var(--color-primary)]" />
          <h2 className="font-heading text-lg font-bold text-[var(--text-primary)]">Points Redemption Catalog</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rewards.map((r) => (
            <div key={r.id} className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-tertiary)] p-6 hover:shadow-lg transition-all duration-300 flex justify-between items-center group">
              <div>
                <span className="font-mono text-[9px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{r.id} • {r.type}</span>
                <h3 className="font-heading text-base font-bold text-[var(--text-primary)] mt-1">{r.title}</h3>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--text-brand)] font-mono font-bold">
                  <Coins className="w-4 h-4" />
                  <span>{r.pointsCost} Points</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  title={`Edit reward ${r.id}`}
                  aria-label={`Edit reward ${r.id}`}
                  onClick={() => alert(`Edit reward ${r.id}`)}
                  className="p-2 border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  title={`Toggle status for ${r.id}`}
                  aria-label={`Toggle status for ${r.id}`}
                  onClick={() => {
                    const updated = rewards.map((x) => x.id === r.id ? { ...x, isActive: !x.isActive } : x);
                    setRewards(updated);
                  }}
                  className={`p-2 border rounded-lg transition-colors ${
                    r.isActive
                      ? "border-[var(--success-500)]/30 bg-[var(--success-500)]/10 text-[var(--success-500)] hover:bg-[var(--success-500)]/20"
                      : "border-[var(--error-500)]/30 bg-[var(--error-500)]/10 text-[var(--error-500)] hover:bg-[var(--error-500)]/20"
                  }`}
                >
                  {r.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
