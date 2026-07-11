"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

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
    "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
  secondary:
    "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  outline:
    "border border-[var(--border-default)] text-[var(--text-secondary)] bg-transparent",
  success:
    "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500",
  warning:
    "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500",
  error: "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-500",
  gold: "bg-gradient-to-r from-accent-100 to-accent-200 text-accent-700 dark:from-accent-900/40 dark:to-accent-800/40 dark:text-accent-300",
  "pulse-glow": "bg-[var(--color-primary-500)] text-white shadow-md animate-pulse-glow",
  gradient: "bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-accent-500)] text-white shadow-lg",
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
