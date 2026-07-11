"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mb-12",
        align === "center" && "text-center mx-auto max-w-2xl",
        className,
      )}
    >
      {badge && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-4 border border-primary-100 dark:border-primary-900/50">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-base text-[var(--text-secondary)] leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  );
}
