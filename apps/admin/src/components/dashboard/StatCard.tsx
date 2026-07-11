import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean | null;
  icon: LucideIcon;
  colorClass: string;
  accentClass: string;
  className?: string;
  style?: React.CSSProperties;
}

export function StatCard({
  label,
  value,
  trend,
  trendUp,
  icon: Icon,
  colorClass,
  accentClass,
  className = "",
  style,
}: StatCardProps) {
  return (
    <div 
      className={`relative overflow-hidden rounded-xl bg-[var(--surface-tertiary)] dark:bg-[var(--surface-tertiary)] border border-[var(--border-default)] dark:border-[var(--border-default)] p-6 motion-safe:card-hover ${className}`}
      style={style}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trendUp !== null && (
          <span className={`font-mono text-xs px-2 py-1 rounded-full ${trendUp ? 'bg-[var(--success-500)]/10 text-[var(--success-500)]' : 'bg-[var(--error-500)]/10 text-[var(--error-500)]'}`}>
            {trend}
          </span>
        )}
        {trendUp === null && (
          <span className="font-mono text-xs px-2 py-1 rounded-full bg-[var(--surface-secondary)] text-[var(--text-tertiary)] border border-[var(--border-default)]">
            {trend}
          </span>
        )}
      </div>

      <p className="font-mono text-3xl font-semibold text-[var(--text-primary)]">
        {value}
      </p>

      <p className="font-sans text-sm text-[var(--text-secondary)] mt-1">
        {label}
      </p>

      <div 
        className={`absolute bottom-0 left-0 right-0 h-1 opacity-60 rounded-b-xl ${accentClass}`}
      />
    </div>
  );
}
