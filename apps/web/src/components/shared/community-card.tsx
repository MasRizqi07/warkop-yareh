"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CommunityGroup } from "@warkop-yareh/types";

interface CommunityCardProps {
  group: CommunityGroup;
  index?: number;
}

export function CommunityCard({ group, index = 0 }: CommunityCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="group relative bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden card-hover"
    >
      {/* Header */}
      <div className="relative h-32 bg-gradient-to-br from-primary-500/20 to-accent-500/20 dark:from-primary-500/10 dark:to-accent-500/10">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl opacity-50">
            {group.category === "Technology"
              ? "💻"
              : group.category === "Coffee"
                ? "☕"
                : group.category === "Arts"
                  ? "🎨"
                  : group.category === "Business"
                    ? "💼"
                    : group.category === "Games"
                      ? "🎲"
                      : "👥"}
          </span>
        </div>
        <div className="absolute top-3 left-3">
          <Badge size="sm" variant="secondary">
            {group.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {group.name}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2 leading-relaxed">
          {group.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {group.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--surface-tertiary)] text-[var(--text-tertiary)]"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-[var(--surface-elevated)] bg-gradient-to-br from-primary-300 to-primary-500 dark:from-primary-600 dark:to-primary-800"
                />
              ))}
            </div>
            <span className="text-xs text-[var(--text-tertiary)]">
              <Users className="w-3 h-3 inline mr-1" />
              {group.memberCount.toLocaleString("id-ID")} members
            </span>
          </div>
          <button className="flex items-center gap-1 text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors">
            Join
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
