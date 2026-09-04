"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { CafeTable } from "@/lib/mockData";

export default function ReservationsPage() {
  const {
    tables,
    branches,
    activeBranchId,
    setActiveBranch,
    getActiveBranch,
    createReservation,
    user,
  } = useAppStore();

  const activeBranch = getActiveBranch();

  // Generate 14-day calendar strip starting today
  const today = new Date();
  const dates = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return {
      isoString: d.toISOString().split("T")[0],
      dayName: d.toLocaleDateString("id-ID", { weekday: "short" }),
      dateNum: d.getDate(),
      monthName: d.toLocaleDateString("id-ID", { month: "short" }),
    };
  });

  const [selectedDate, setSelectedDate] = useState(dates[0].isoString);
  const [selectedSlot, setSelectedSlot] = useState("14:00 - 17:00");
  const [selectedTable, setSelectedTable] = useState<CafeTable | null>(tables[0]);
  const [guestCount, setGuestCount] = useState(2);
  const [customerName, setCustomerName] = useState(user.name);
  const [customerPhone, setCustomerPhone] = useState(user.phone);
  const [specialNotes, setSpecialNotes] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const timeSlots = [
    "08:00 - 11:00",
    "11:00 - 14:00",
    "14:00 - 17:00",
    "17:00 - 20:00",
    "20:00 - 23:00",
    "23:00 - 02:00",
  ];

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;

    const depositAmount = selectedTable.zone === "vip-suite" ? 200000 : 50000;

    const newRes = createReservation({
      branchId: activeBranchId,
      tableId: selectedTable.id,
      tableLabel: selectedTable.label,
      date: selectedDate,
      timeSlot: selectedSlot,
      guestCount,
      customerName: customerName || user.name,
      customerPhone: customerPhone || user.phone,
      notes: specialNotes.trim() || undefined,
      depositAmount,
    });

    setBookingSuccess(newRes.code);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-8 sm:pt-10 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 border-b border-white/5 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SISTEM BOOKING WORKSPACE & TABLE REAL-TIME</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            Reservasi Meja & Coworking Pod
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Pilih tanggal, zona meja (Quiet, Communal, atau VIP Meeting Suite), dan amankan tempat kerjamu dengan soket listrik & Wi-Fi gigabit.
          </p>
        </div>

        {/* Branch Switcher Buttons */}
        <div className="flex items-center gap-2 bg-[#141418] p-1.5 rounded-2xl border border-white/5">
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBranch(b.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                b.id === activeBranchId
                  ? "bg-[#9c6b3a] text-white shadow-md"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {b.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 14-Day Calendar Date Strip */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
          <span className="flex items-center gap-1.5 font-bold uppercase text-white">
            <Calendar className="w-4 h-4 text-[#f59e0b]" /> Pilih Tanggal (14 Hari ke Depan)
          </span>
          <span>Bulan: September 2026</span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-3 scrollbar-none">
          {dates.map((item) => {
            const isSelected = selectedDate === item.isoString;
            return (
              <button
                key={item.isoString}
                onClick={() => setSelectedDate(item.isoString)}
                className={`min-w-[70px] p-3 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                  isSelected
                    ? "bg-[#f59e0b] text-black border-[#f59e0b] shadow-[0_0_20px_rgba(245,158,11,0.4)] font-bold scale-105"
                    : "bg-[#18181c] border-white/5 text-neutral-400 hover:text-white hover:border-white/20"
                }`}
              >
                <span className="text-[10px] uppercase font-mono">{item.dayName}</span>
                <span className="text-xl font-heading font-extrabold my-0.5">{item.dateNum}</span>
                <span className="text-[10px] font-mono">{item.monthName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slot Picker */}
      <div className="mb-8 space-y-2">
        <label className="text-xs font-mono uppercase text-neutral-400 font-bold flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-sky-400" /> Pilih Sesi Jam (Durasi 3 Jam)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {timeSlots.map((slot) => {
            const isSelected = selectedSlot === slot;
            return (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-medium transition-all ${
                  isSelected
                    ? "bg-[#9c6b3a] border-[#9c6b3a] text-white shadow-md"
                    : "bg-[#141418] border-white/5 text-neutral-400 hover:text-white"
                }`}
              >
                {slot} WIB
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Grid: Floor Plan + Reservation Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Visual Floor Plan Map */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-[#18181c] border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-heading font-bold text-base text-white">
                  Peta Denah Meja • {activeBranch.name}
                </h3>
                <p className="text-xs text-neutral-400">
                  Klik meja untuk melihat detail fasilitas & memesan.
                </p>
              </div>

              {/* Status Legend */}
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Tersedia
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Terisi
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> Dipilih
                </span>
              </div>
            </div>

            {/* Visual Floor Plan Representation */}
            <div className="space-y-6">
              {/* Zone 1: Indoor Quiet Work Pods */}
              <div className="p-4 rounded-2xl bg-[#111114] border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span className="text-white font-semibold">ZONA INDOOR QUIET (T-01 s/d T-10)</span>
                  <span>AC Dingin • Stopkontak Tiap Meja</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {tables
                    .filter((t) => t.zone === "indoor-quiet")
                    .map((table) => {
                      const isSelected = selectedTable?.id === table.id;
                      const isOccupied = table.status === "occupied";

                      return (
                        <button
                          key={table.id}
                          disabled={isOccupied}
                          onClick={() => setSelectedTable(table)}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            isSelected
                              ? "bg-[#f59e0b] border-[#f59e0b] text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105"
                              : isOccupied
                              ? "bg-rose-950/20 border-rose-900/40 text-rose-500 cursor-not-allowed opacity-60"
                              : "bg-[#18181c] border-white/5 text-neutral-300 hover:border-emerald-500/50"
                          }`}
                        >
                          <div className="text-xs font-mono font-bold">{table.id}</div>
                          <div className="text-[10px] mt-0.5">{table.seats} Kursi</div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Zone 2: Outdoor Communal Garden */}
              <div className="p-4 rounded-2xl bg-[#111114] border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span className="text-white font-semibold">ZONA OUTDOOR COMMUNAL (O-01 s/d O-08)</span>
                  <span>Smoking Friendly • Garden Breeze</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {tables
                    .filter((t) => t.zone === "outdoor-communal")
                    .map((table) => {
                      const isSelected = selectedTable?.id === table.id;
                      const isOccupied = table.status === "occupied";

                      return (
                        <button
                          key={table.id}
                          disabled={isOccupied}
                          onClick={() => setSelectedTable(table)}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            isSelected
                              ? "bg-[#f59e0b] border-[#f59e0b] text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105"
                              : isOccupied
                              ? "bg-rose-950/20 border-rose-900/40 text-rose-500 cursor-not-allowed opacity-60"
                              : "bg-[#18181c] border-white/5 text-neutral-300 hover:border-emerald-500/50"
                          }`}
                        >
                          <div className="text-xs font-mono font-bold">{table.id}</div>
                          <div className="text-[10px] mt-0.5">{table.seats} Kursi</div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Zone 3: VIP Meeting Suites */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/20 to-amber-950/20 border border-purple-500/20 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-purple-300">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" /> VIP PRIVATE SUITES (VIP-01 s/d VIP-03)
                  </span>
                  <span>Smart TV • Whiteboard • Soundbar</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {tables
                    .filter((t) => t.zone === "vip-suite")
                    .map((table) => {
                      const isSelected = selectedTable?.id === table.id;
                      const isOccupied = table.status === "occupied";

                      return (
                        <button
                          key={table.id}
                          disabled={isOccupied}
                          onClick={() => setSelectedTable(table)}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "bg-[#f59e0b] border-[#f59e0b] text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105"
                              : isOccupied
                              ? "bg-rose-950/20 border-rose-900/40 text-rose-500 cursor-not-allowed opacity-60"
                              : "bg-[#18181c] border-purple-500/30 text-neutral-200 hover:border-purple-400"
                          }`}
                        >
                          <div className="text-xs font-heading font-bold">{table.label}</div>
                          <div className="text-[10px] font-mono mt-0.5">Kapasitas {table.seats} Orang</div>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Table Details & Reservation Form */}
        <div className="lg:col-span-5 space-y-6">
          {selectedTable ? (
            <div className="p-6 sm:p-7 rounded-3xl bg-[#18181c] border border-white/10 space-y-5">
              <div className="border-b border-white/10 pb-4">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#f59e0b]/20 text-[#fcd34d] border border-[#f59e0b]/30">
                  {selectedTable.zoneName}
                </span>
                <h3 className="font-heading font-extrabold text-xl text-white mt-2">
                  {selectedTable.label}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Maksimal {selectedTable.seats} Orang • {selectedTable.powerSockets} Port Colokan Listrik
                </p>
              </div>

              {/* Table Features List */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-neutral-400 uppercase">Fasilitas Meja:</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {selectedTable.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-neutral-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleConfirmReservation} className="space-y-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">Jumlah Orang</label>
                    <input
                      type="number"
                      min={1}
                      max={selectedTable.seats}
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#111114] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#f59e0b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">Deposit Booking</label>
                    <div className="px-3 py-2 rounded-xl bg-[#111114] border border-white/10 text-[#f59e0b] font-mono font-bold text-xs">
                      Rp {(selectedTable.zone === "vip-suite" ? 200000 : 50000).toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Nama Pemesan</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111114] border border-white/10 text-white text-xs focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">WhatsApp Konfirmasi</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111114] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Catatan Kebutuhan</label>
                  <textarea
                    rows={2}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="Contoh: Butuh proyektor/kabel HDMI atau minta colokan ekstra..."
                    className="w-full p-2.5 rounded-xl bg-[#111114] border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>

                {bookingSuccess ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-1 text-center">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-400" />
                    <div className="font-bold text-sm">Reservasi Berhasil Dikonfirmasi!</div>
                    <div className="font-mono text-white">Kode Booking: {bookingSuccess}</div>
                    <p className="text-[11px] text-neutral-400">
                      Tunjukkan kode ini ke kasir/barista saat kedatangan.
                    </p>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#9c6b3a] to-[#d4b488] hover:opacity-95 text-white font-heading font-bold text-sm flex items-center justify-between shadow-[0_4px_20px_rgba(156,107,58,0.4)] transition-all active:scale-[0.98]"
                  >
                    <span>Konfirmasi Reservasi</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </form>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-[#18181c] border border-white/10 text-center text-neutral-400 text-xs">
              Pilih salah satu meja pada peta denah untuk melihat informasi booking.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
