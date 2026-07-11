import React from "react";
import { ShoppingCart, CalendarCheck, TrendingUp, Calendar } from "lucide-react";
import { StatCard } from "./StatCard";

export function StatsRow() {
  const stats = [
    {
      label: "Orders Today",
      value: "47",
      trend: "+12%",
      trendUp: true,
      icon: ShoppingCart,
      colorClass: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
      accentClass: "bg-[var(--color-primary)]",
    },
    {
      label: "Active Reservations",
      value: "05",
      trend: "+2 new",
      trendUp: true,
      icon: CalendarCheck,
      colorClass: "bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
      accentClass: "bg-[var(--color-accent)]",
    },
    {
      label: "Monthly Revenue",
      value: "Rp 42.8M",
      trend: "+8.3%",
      trendUp: true,
      icon: TrendingUp,
      colorClass: "bg-[var(--success-500)]/10 text-[var(--success-500)]",
      accentClass: "bg-[var(--success-500)]",
    },
    {
      label: "Upcoming Events",
      value: "02",
      trend: "This week",
      trendUp: null,
      icon: Calendar,
      colorClass: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
      accentClass: "bg-[var(--color-primary)]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard 
          key={stat.label}
          {...stat}
          className="slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        />
      ))}
    </div>
  );
}
