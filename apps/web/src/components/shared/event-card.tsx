"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@warkop-yareh/types";

const categoryColors: Record<string, string> = {
  tech: "from-blue-600 to-indigo-800",
  music: "from-purple-600 to-violet-800",
  business: "from-emerald-600 to-teal-800",
  food: "from-orange-600 to-amber-800",
  art: "from-pink-600 to-rose-800",
  workshop: "from-cyan-600 to-sky-800",
  community: "from-primary-600 to-primary-800",
};

const categoryLabels: Record<string, string> = {
  tech: "Technology",
  music: "Music",
  business: "Business",
  food: "Food & Drink",
  art: "Art & Culture",
  workshop: "Workshop",
  community: "Community",
};

interface EventCardProps {
  event: Event;
  index?: number;
  variant?: "default" | "featured";
}

export function EventCard({
  event,
  index = 0,
  variant = "default",
}: EventCardProps) {
  const spotsLeft = event.capacity - event.registered;
  const isFull = spotsLeft <= 0;
  const isAlmostFull = spotsLeft > 0 && spotsLeft <= 5;

  if (variant === "featured") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className="group relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] card-hover"
      >
        <div
          className={cn(
            "relative h-64 bg-gradient-to-br",
            categoryColors[event.category] || categoryColors.community,
          )}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <span className="text-[120px]">
              {event.category === "tech"
                ? "💻"
                : event.category === "music"
                  ? "🎵"
                  : event.category === "business"
                    ? "💼"
                    : event.category === "art"
                      ? "🎨"
                      : "🎪"}
            </span>
          </div>
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="gold" size="sm">
              {categoryLabels[event.category] || event.category}
            </Badge>
            {event.isFree && (
              <Badge variant="success" size="sm">
                Free
              </Badge>
            )}
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white mb-1">{event.title}</h3>
            <p className="text-sm text-white/80 line-clamp-2">
              {event.description}
            </p>
          </div>
        </div>
        <div className="p-5 bg-[var(--surface-elevated)]">
          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)] mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary-500" />
              {formatDate(event.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary-500" />
              {event.startTime} - {event.endTime}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                <MapPin className="w-4 h-4" />
                {event.location.split(" - ")[0]}
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <Users className="w-4 h-4" />
                <span
                  className={cn(
                    isAlmostFull && "text-warning-500 font-semibold",
                    isFull && "text-error-500 font-semibold",
                  )}
                >
                  {isFull ? "Full" : `${spotsLeft} spots left`}
                </span>
              </span>
            </div>
            <Link
              href={`/events/${event.id}`}
              className="flex items-center gap-1.5 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors"
            >
              {isFull ? "Join Waitlist" : "Register"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group flex gap-4 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:border-[var(--border-hover)] transition-all"
    >
      {/* Date Badge */}
      <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-primary-50 dark:bg-primary-950/40 shrink-0">
        <span className="text-lg font-bold text-primary-600 dark:text-primary-400 leading-none">
          {new Date(event.date).getDate()}
        </span>
        <span className="text-[10px] font-semibold text-primary-500 uppercase">
          {new Date(event.date).toLocaleString("en", { month: "short" })}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge size="sm" variant={event.isFree ? "success" : "default"}>
            {event.isFree ? "Free" : formatCurrency(event.price)}
          </Badge>
          <Badge size="sm" variant="secondary">
            {categoryLabels[event.category]}
          </Badge>
        </div>
        <h4 className="font-semibold text-sm text-[var(--text-primary)] truncate group-hover:text-primary-600 transition-colors">
          {event.title}
        </h4>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--text-tertiary)]">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {event.startTime}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {event.registered}/{event.capacity}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
