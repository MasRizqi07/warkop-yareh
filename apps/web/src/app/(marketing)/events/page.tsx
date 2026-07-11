"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { EventCard } from "@/components/shared/event-card";
import { events } from "@/data/mock";
import { staggerContainer, staggerItem } from "@/lib/animations";

const EVENT_CATEGORIES = [
  { id: "all", label: "All Events" },
  { id: "tech", label: "Technology" },
  { id: "music", label: "Music" },
  { id: "business", label: "Business" },
  { id: "workshop", label: "Workshop" },
  { id: "art", label: "Art & Culture" },
  { id: "food", label: "Food & Drink" },
  { id: "community", label: "Community" },
];

export default function EventsPage() {
  const [category, setCategory] = useState("all");

  const filtered =
    category === "all" ? events : events.filter((e) => e.category === category);

  return (
    <div className="relative min-h-screen bg-background pb-16">
      {/* Noise Overlay */}
      <div className="fixed inset-0 organic-noise pointer-events-none z-0"></div>

      {/* Hero Header with flowing Radial Mesh */}
      <section className="relative pt-24 pb-12 overflow-hidden border-b border-white/5 bg-surface-container/10">
        <div className="absolute inset-0 bg-mesh z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Events"
            title="Events &amp; Kegiatan"
            description="Dari tech workshop, startup meetups, hingga acoustic live music — selalu ada alasan menarik untuk singgah ke Ya'reh."
          />
        </div>
      </section>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        
        {/* Category Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide border-b border-white/5 no-scrollbar"
        >
          {EVENT_CATEGORIES.map((cat) => {
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`shrink-0 px-5 py-2 rounded-full font-headline-md text-xs font-semibold uppercase tracking-wider transition-all duration-300 active:scale-95 ${
                  isActive
                    ? "bg-primary-container text-on-primary-container shadow-md"
                    : "bg-surface-container-highest/30 text-on-surface-variant hover:bg-surface-container-high/50"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        {/* Stats Grid Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {[
            {
              label: "Upcoming Events",
              value: events.filter((e) => e.status === "upcoming").length,
              icon: "📅",
              glowColor: "bg-primary/10 text-primary border border-primary/20",
            },
            {
              label: "Total Registered",
              value: events.reduce((s, e) => s + e.registered, 0),
              icon: "👥",
              glowColor: "bg-secondary-container/10 text-secondary border border-secondary-container/20",
            },
            {
              label: "Free Events",
              value: events.filter((e) => e.isFree).length,
              icon: "🎉",
              glowColor: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card p-5 rounded-2xl border border-white/5 bg-surface-container/20 flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="font-receipt-label text-[10px] text-on-surface-variant/75 uppercase tracking-tight">
                  {stat.label}
                </span>
                <h3 className="font-display-lg text-2xl font-extrabold text-[var(--text-primary)] leading-none">
                  {stat.value.toString().padStart(2, "0")}
                </h3>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${stat.glowColor}`}>
                {stat.icon}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Events Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {filtered.map((event, i) => (
            <motion.div key={event.id} variants={staggerItem}>
              <EventCard
                event={event}
                index={i}
                variant="featured"
              />
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 glass-card rounded-2xl border border-white/5 bg-surface-container/20"
          >
            <Sparkles className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-3 animate-pulse" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Belum ada event di kategori ini
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Cek kembali nanti atau lihat agenda kategori seru lainnya.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
