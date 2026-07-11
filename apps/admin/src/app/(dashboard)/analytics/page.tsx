"use client";

import React from "react";
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Percent } from "lucide-react";

export default function AnalyticsPage() {
  const cards = [
    { label: "Gross Revenue", value: "Rp 42.8M", trend: "+12.4%", icon: DollarSign, trendUp: true },
    { label: "Total Orders", value: "1,842", trend: "+8.3%", icon: ShoppingCart, trendUp: true },
    { label: "Conversion Rate", value: "3.4%", trend: "+0.5%", icon: Percent, trendUp: true },
    { label: "Average Value", value: "Rp 23,200", trend: "-1.2%", icon: TrendingUp, trendUp: false },
  ];

  const categoryPerformance = [
    { name: "Specialty Coffee", unitsSold: 942, revenue: "Rp 24.5M", percentage: 70 },
    { name: "Non-Coffee / Alt", unitsSold: 412, revenue: "Rp 9.8M", percentage: 55 },
    { name: "Indonesian Snacks", unitsSold: 320, revenue: "Rp 5.2M", percentage: 40 },
    { name: "Coworking Packages", unitsSold: 65, revenue: "Rp 3.3M", percentage: 25 },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-[var(--text-primary)]">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)]">Business Analytics</h1>
        <p className="font-sans text-xs text-[var(--text-secondary)] mt-0.5">Real-time revenue tracking, category performance index, and branch metrics</p>
      </div>

      {/* Analytics Summary Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, index) => {
          const Icon = c.icon;
          return (
            <div key={index} className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-tertiary)] p-6 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-mono uppercase text-[var(--text-tertiary)] font-semibold">{c.label}</span>
                <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${
                  c.trendUp ? "bg-[var(--success-500)]/10 text-[var(--success-500)]" : "bg-[var(--error-500)]/10 text-[var(--error-500)]"
                }`}>
                  {c.trend}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <h3 className="font-mono text-2xl font-bold text-[var(--text-primary)]">{c.value}</h3>
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--text-brand)] shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Performance List */}
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-tertiary)] p-6 space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[var(--color-primary)]" />
          <h2 className="font-heading text-lg font-bold text-[var(--text-primary)]">Product Category Performance</h2>
        </div>

        <div className="space-y-6">
          {categoryPerformance.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[var(--text-primary)]">{item.name} ({item.unitsSold} units)</span>
                <span className="font-mono text-[var(--text-brand)]">{item.revenue}</span>
              </div>
              <div className="relative w-full bg-[var(--border-default)] h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-1000 w-[var(--bar-width)]"
                  style={{ "--bar-width": `${item.percentage}%` } as React.CSSProperties}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
