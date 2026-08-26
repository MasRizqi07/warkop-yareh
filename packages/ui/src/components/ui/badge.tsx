"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "success"
    | "warning"
    | "error"
    | "gold"
    | "pulse-glow"
    | "gradient";
  size?: "sm" | "default" | "lg";
}

const badgeVariants: Record<string, string> = {
  default:
    "bg-[var(--accent-container)] text-[var(--accent-container-text)]",
  secondary:
    "bg-[var(--bg-surface-overlay)] text-[var(--text-secondary)] border border-[var(--border-default)]",
  outline:
    "border border-[var(--border-default)] text-[var(--text-secondary)] bg-transparent",
  success:
    "bg-[var(--green-500)]/10 text-[var(--green-500)] border border-[var(--green-500)]/20",
  warning:
    "bg-[var(--gold-container)]/20 text-[var(--gold-highlight)] border border-[var(--gold-container)]/30",
  error: "bg-[var(--danger-container)] text-[var(--danger-fill)] border border-[var(--danger-fill)]/20",
  gold: "bg-[var(--gold-container)]/40 text-[var(--gold-highlight)] border border-[var(--gold-highlight)]/20",
  "pulse-glow": "bg-[var(--gold-highlight)] text-[var(--neutral-950)] shadow-md animate-pulse-glow",
  gradient: "bg-gradient-to-r from-[var(--accent-fill)] to-[var(--gold-highlight)] text-[var(--text-on-brand)] shadow-lg",
};

const sizeVariants: Record<string, string> = {
  sm: "text-[10px] px-2 py-0.5",
  default: "text-xs px-2.5 py-1",
  lg: "text-sm px-3 py-1.5",
};

export function Badge({
  variant = "default",
  size = "default",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap transition-colors",
        badgeVariants[variant],
        sizeVariants[size],
        className,
      )}
      {...props}
    />
  );
}

export type StatusType = 
  | "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED"
  | "CONFIRMED"
  | "UPCOMING" | "ONGOING"
  | "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK"
  | string;

export interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let variant: "default" | "success" | "warning" | "error" | "secondary" = "secondary";
  let pulse = false;
  
  switch (status) {
    case "PENDING":
    case "LOW_STOCK":
      variant = "warning";
      break;
    case "PREPARING":
    case "UPCOMING":
      variant = "default";
      break;
    case "READY":
    case "CONFIRMED":
    case "AVAILABLE":
      variant = "success";
      break;
    case "ONGOING":
      variant = "success";
      pulse = true;
      break;
    case "CANCELLED":
    case "OUT_OF_STOCK":
      variant = "error";
      break;
    case "COMPLETED":
      variant = "secondary";
      break;
  }

  const displayStatus = status.replace(/_/g, " ");
  return (
    <Badge variant={variant} size="sm" className={cn(pulse && "animate-pulse", "uppercase", className)}>
      {displayStatus}
    </Badge>
  );
}
