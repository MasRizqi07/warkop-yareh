"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Calendar, Plus, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface CommunityEvent {
  id: string;
  title: string;
  category: "COMMUNITY" | "WORKSHOP" | "MEETUP" | "MUSIC";
  date: string;
  time: string;
  location: string;
  capacity: number;
  registeredCount: number;
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
}

export default function EventsPage() {
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const events: CommunityEvent[] = [
    { id: "EVT-201", title: "Surabaya Dev Meetup", category: "MEETUP", date: "2026-06-24", time: "19:00 - 21:30", location: "Darmo Flagsip Lounge", capacity: 50, registeredCount: 42, status: "UPCOMING" },
    { id: "EVT-202", title: "Latte Art Masterclass", category: "WORKSHOP", date: "2026-06-28", time: "14:00 - 17:00", location: "Barista Training Lab", capacity: 15, registeredCount: 12, status: "UPCOMING" },
    { id: "EVT-203", title: "Friday Acoustic Night", category: "MUSIC", date: "2026-06-12", time: "20:00 - 22:00", location: "Outdoor Terrace", capacity: 80, registeredCount: 75, status: "UPCOMING" },
    { id: "EVT-204", title: "Coffee Cupping Workshop", category: "WORKSHOP", date: "2026-06-05", time: "13:00 - 15:00", location: "Roasting Studio", capacity: 10, registeredCount: 10, status: "COMPLETED" },
  ];

  const filteredEvents = events.filter((e) => {
    const matchesFilter = filter === "ALL" || e.category === filter || e.status === filter;
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryBadge = (category: CommunityEvent["category"]) => {
    switch (category) {
      case "MEETUP":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "WORKSHOP":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "MUSIC":
        return "bg-pink-500/10 text-pink-400 border-pink-500/20";
      case "COMMUNITY":
        return "bg-teal-500/10 text-teal-400 border-teal-500/20";
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-[var(--text-primary)]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)]">Community Events</h1>
          <p className="font-sans text-xs text-[var(--text-secondary)] mt-0.5">Organize workshops, customer gathers, and cultural gatherings</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              aria-label="Search events"
              type="text"
              placeholder="Search event title..."
              className="bg-[var(--surface-tertiary)] border border-[var(--border-default)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] w-60 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => alert("Create event modal")}
            className="bg-[var(--interactive-primary)] text-white hover:bg-[var(--interactive-primary-hover)] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" /> CREATE EVENT
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-default)] overflow-x-auto pb-px">
        {["ALL", "MEETUP", "WORKSHOP", "MUSIC", "UPCOMING", "COMPLETED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 shrink-0 ${
              filter === tab
                ? "border-[var(--color-primary)] text-[var(--text-brand)] font-bold"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Event Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map((e) => {
          const occupancyPercent = Math.round((e.registeredCount / e.capacity) * 100);
          return (
            <div key={e.id} className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-tertiary)] p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2 items-center">
                  <span className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">{e.id}</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-semibold ${getCategoryBadge(e.category)}`}>
                    {e.category}
                  </span>
                </div>
                <div className="flex gap-1">
                  <StatusBadge status={e.status} />
                </div>
              </div>

              <h3 className="font-heading text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--text-brand)] transition-colors leading-snug">
                {e.title}
              </h3>

              <div className="mt-4 space-y-2 text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--text-brand)]" />
                  <span>{e.date} @ {e.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--text-brand)]" />
                  <span>{e.location}</span>
                </div>
              </div>

              {/* Attendance Tracker */}
              <div className="mt-6 border-t border-[var(--border-default)]/50 pt-4 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--text-secondary)]">Registration Occupancy</span>
                  <span className="text-[var(--text-primary)]">{e.registeredCount} / {e.capacity} ({occupancyPercent}%)</span>
                </div>
                <div className="relative w-full bg-[var(--border-default)] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 w-[var(--bar-width)] ${
                      occupancyPercent >= 90 ? "bg-[var(--error-500)]" : occupancyPercent >= 60 ? "bg-amber-500" : "bg-[var(--success-500)]"
                    }`}
                    style={{ "--bar-width": `${occupancyPercent}%` } as React.CSSProperties}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Link href={`/events/${e.id}`}>
                  <button className="px-3.5 py-2 border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] text-[var(--text-primary)] font-bold text-xs rounded-xl transition-all">
                    Manage Attendees
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
