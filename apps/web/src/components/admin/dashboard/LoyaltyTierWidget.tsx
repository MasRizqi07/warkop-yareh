'use client'

import React from 'react'
import { TrendingUp } from 'lucide-react'

const tiers = [
  { name: 'Platinum', count: 87,   color: 'bg-[var(--text-tertiary)]',       pct: 8  },
  { name: 'Gold',     count: 312,  color: 'bg-[var(--accent-500)]',          pct: 29 },
  { name: 'Silver',   count: 489,  color: 'bg-[var(--neutral-500)]',         pct: 45 },
  { name: 'Bronze',   count: 203,  color: 'bg-[var(--primary-700)]',         pct: 18 },
]

export function LoyaltyTierWidget() {
  return (
    <div className="bg-[var(--surface-secondary)] border border-[var(--border-default)] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border-default)]">
        <p className="text-[10px] font-inter text-[var(--text-tertiary)] uppercase tracking-widest">
          Loyalty Tier Stats
        </p>
        <div className="flex items-end justify-between mt-1">
          <h3 className="font-plus-jakarta font-700 text-lg text-[var(--text-primary)]">
            Gold Members Peak
          </h3>
          <div className="flex items-center gap-1 text-[var(--success-500)]">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="font-jetbrains text-xs">+12%</span>
          </div>
        </div>
        <p className="text-xs font-inter text-[var(--text-tertiary)] mt-0.5">
          from previous week
        </p>
      </div>

      <div className="px-5 py-4 space-y-3">
        {tiers.map((tier) => (
          <div key={tier.name} className="flex items-center gap-3">
            <span className="w-16 text-xs font-inter text-[var(--text-secondary)] text-right">
              {tier.name}
            </span>
            <div className="flex-1 h-2 rounded-full bg-[var(--surface-tertiary)]">
              <div
                className={`h-full rounded-full ${tier.color} transition-all duration-700`}
                style={{ width: `${tier.pct}%` }}
              />
            </div>
            <span className="w-10 font-jetbrains text-xs font-500 text-[var(--text-tertiary)] text-right">
              {tier.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
