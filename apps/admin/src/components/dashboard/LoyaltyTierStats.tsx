import React from "react";
import { Sparkles } from "lucide-react";

export function LoyaltyTierStats() {
  return (
    <div className="rounded-xl p-6 border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 relative overflow-hidden h-full flex flex-col justify-center">
      <div className="relative z-10">
        <p className="font-mono text-[10px] font-bold text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)] uppercase tracking-widest mb-1">
          Loyalty Tier Stats
        </p>
        <h5 className="font-heading text-lg font-bold text-[var(--text-primary)] leading-tight">
          Gold Members Peak
        </h5>
        <p className="font-sans text-xs text-[var(--text-secondary)] mt-1.5 font-medium">
          <span className="text-[var(--success-500)] font-bold">+12%</span> from previous week
        </p>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[var(--color-accent)]/20 blur-2xl rounded-full pointer-events-none"></div>
      <Sparkles className="absolute top-6 right-6 w-8 h-8 text-[var(--color-accent)] opacity-40 pointer-events-none" />
    </div>
  );
}
