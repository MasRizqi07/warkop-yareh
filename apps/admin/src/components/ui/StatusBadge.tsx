import React from 'react';

type StatusType = 
  | "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED" // Orders
  | "CONFIRMED" // Reservations
  | "UPCOMING" | "ONGOING" // Events
  | "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK" // Products
  | string;

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let colorClasses = "bg-slate-500/10 text-slate-400 border-slate-500/20";
  let pulseClass = "";
  const displayStatus = status.replace(/_/g, ' ');

  switch (status) {
    case "PENDING":
    case "LOW_STOCK":
      colorClasses = "bg-amber-500/10 text-amber-500 border-amber-500/20";
      break;
    case "PREPARING":
    case "UPCOMING":
      colorClasses = "bg-blue-500/10 text-blue-500 border-blue-500/20";
      break;
    case "READY":
    case "CONFIRMED":
    case "AVAILABLE":
      colorClasses = "bg-[var(--success-500)]/10 text-[var(--success-500)] border-[var(--success-500)]/20";
      break;
    case "ONGOING":
      colorClasses = "bg-[var(--success-500)]/10 text-[var(--success-500)] border-[var(--success-500)]/20";
      pulseClass = "animate-pulse";
      break;
    case "CANCELLED":
    case "OUT_OF_STOCK":
      colorClasses = "bg-[var(--error-500)]/10 text-[var(--error-500)] border-[var(--error-500)]/20";
      break;
    case "COMPLETED":
      colorClasses = "bg-slate-500/15 text-slate-400 border-slate-500/20";
      break;
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold border ${colorClasses} ${pulseClass} uppercase`}>
      {displayStatus}
    </span>
  );
}
