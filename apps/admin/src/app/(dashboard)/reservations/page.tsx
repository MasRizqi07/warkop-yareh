"use client";

import React, { useState } from "react";
import { Search, Calendar, Users, Clock, Coffee } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface Reservation {
  id: string;
  customerName: string;
  tableNumber: string;
  tableType: "INDOOR" | "OUTDOOR" | "VIP" | "MEETING_ROOM";
  date: string;
  timeSlot: string;
  guestCount: number;
  status: "CONFIRMED" | "PENDING" | "COMPLETED" | "CANCELLED";
}

export default function ReservationsPage() {
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const reservations: Reservation[] = [
    { id: "RES-101", customerName: "Rian Hidayat", tableNumber: "T-04", tableType: "INDOOR", date: "2026-06-11", timeSlot: "14:00 - 16:00", guestCount: 2, status: "CONFIRMED" },
    { id: "RES-102", customerName: "Mega Wijaya", tableNumber: "VIP-1", tableType: "VIP", date: "2026-06-11", timeSlot: "18:00 - 20:00", guestCount: 4, status: "PENDING" },
    { id: "RES-103", customerName: "Taufik Hidayat", tableNumber: "MR-3", tableType: "MEETING_ROOM", date: "2026-06-11", timeSlot: "10:00 - 12:00", guestCount: 8, status: "COMPLETED" },
    { id: "RES-104", customerName: "Sarah Amalia", tableNumber: "O-12", tableType: "OUTDOOR", date: "2026-06-12", timeSlot: "16:00 - 18:00", guestCount: 3, status: "CONFIRMED" },
  ];

  const filteredReservations = reservations.filter((r) => {
    const matchesFilter = filter === "ALL" || r.status === filter;
    const matchesSearch = r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)]">Reservations Hub</h1>
          <p className="font-sans text-xs text-[var(--text-secondary)] mt-0.5">Control workspace availability, table occupancy, and guest bookings</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search guest or reservation..."
              className="bg-[var(--surface-tertiary)] border border-[var(--border-default)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] w-64 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Reservation Status Filter Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-default)] overflow-x-auto pb-px">
        {["ALL", "CONFIRMED", "PENDING", "COMPLETED", "CANCELLED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 shrink-0 ${
              filter === status
                ? "border-[var(--color-primary)] text-[var(--text-brand)] font-bold"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Grid of Reservations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReservations.map((r) => (
          <div key={r.id} className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-tertiary)] p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">{r.id}</span>
              <StatusBadge status={r.status} />
            </div>

            {/* Guest Name & Table */}
            <h3 className="font-heading text-lg font-bold text-[var(--text-primary)]">{r.customerName}</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[var(--border-default)]/50 pt-4 text-xs font-sans text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-[var(--text-brand)]" />
                <span>{r.tableNumber} ({r.tableType.toLowerCase().replace("_", " ")})</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--text-brand)]" />
                <span>{r.guestCount} Guests</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--text-brand)]" />
                <span>{r.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--text-brand)]" />
                <span>{r.timeSlot}</span>
              </div>
            </div>

            {/* Actions */}
            {r.status === "PENDING" && (
              <div className="mt-6 flex justify-end gap-2 border-t border-[var(--border-default)]/30 pt-4">
                <button 
                  onClick={() => alert(`Rejected reservation ${r.id}`)}
                  className="px-3 py-1.5 border border-[var(--error-500)]/30 text-[var(--error-500)] hover:bg-[var(--error-500)]/10 rounded-lg text-xs font-bold font-mono transition-colors"
                >
                  Reject
                </button>
                <button 
                  onClick={() => alert(`Confirmed reservation ${r.id}`)}
                  className="px-3 py-1.5 bg-[var(--success-600)] text-white hover:bg-[var(--success-500)] rounded-lg text-xs font-bold font-mono transition-colors"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
