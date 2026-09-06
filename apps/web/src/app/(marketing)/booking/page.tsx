"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Generate 14-day interactive ribbon dates
const generateDates = () => {
  const dates = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      id: d.toISOString().split("T")[0],
      dayName: i === 0 ? "Today" : i === 1 ? "Tomorrow" : days[d.getDay()],
      dateNum: String(d.getDate()).padStart(2, "0"),
      monthStr: `${days[d.getDay()]}, ${months[d.getMonth()]}`,
    });
  }
  return dates;
};

const SHIFTS = [
  {
    id: "morning",
    title: "Morning Focus",
    time: "08:00 – 12:00 WIB",
    duration: "4 Hours",
    price: 35000,
    icon: "wb_sunny",
    tag: "Fresh Roast Included",
  },
  {
    id: "afternoon",
    title: "Afternoon Deep Work",
    time: "13:00 – 18:00 WIB",
    duration: "5 Hours",
    price: 45000,
    icon: "schedule",
    tag: "High Energy",
  },
  {
    id: "night-owl",
    title: "Night Owl / Hackathon",
    time: "19:00 – 02:00 WIB",
    duration: "7 Hours",
    price: 55000,
    icon: "dark_mode",
    tag: "Lo-Fi Acoustic Mode",
  },
  {
    id: "full-day",
    title: "24H Full Day Pass",
    time: "24 Hours Nonstop",
    duration: "Unlimited",
    price: 85000,
    icon: "all_inclusive",
    tag: "Best Value • 2 Drinks",
  },
];

const ZONES = [
  { id: "quiet", name: "Quiet Zone Pods", floor: "Floor 1", desc: "Sub-35dB silent library pod with acoustic padding" },
  { id: "tech", name: "Tech Workstation", floor: "Floor 1", desc: "Dual AC sockets, USB-C 100W PD, mechanical keyboard friendly" },
  { id: "vip", name: "VIP Boardroom Suite", floor: "Floor 2", desc: "Private room seats 10-14 pax with 4K AirPlay screen" },
  { id: "balcony", name: "Smoking Garden Balcony", floor: "Floor 2", desc: "Open air terrace with garden breeze and power outlets" },
];

const DESKS = [
  { id: "D-01", zone: "tech", name: "Desk #01", status: "available", hasDualMonitor: true },
  { id: "D-02", zone: "tech", name: "Desk #02", status: "occupied", hasDualMonitor: true },
  { id: "D-03", zone: "tech", name: "Desk #03", status: "available", hasDualMonitor: false },
  { id: "D-04", zone: "tech", name: "Desk #04", status: "available", hasDualMonitor: false },
  { id: "D-05", zone: "tech", name: "Desk #05", status: "occupied", hasDualMonitor: true },
  { id: "D-06", zone: "tech", name: "Desk #06", status: "available", hasDualMonitor: false },
  { id: "P-01", zone: "quiet", name: "Pod #01", status: "available", hasDualMonitor: false },
  { id: "P-02", zone: "quiet", name: "Pod #02", status: "available", hasDualMonitor: false },
  { id: "P-03", zone: "quiet", name: "Pod #03", status: "occupied", hasDualMonitor: false },
  { id: "P-04", zone: "quiet", name: "Pod #04", status: "available", hasDualMonitor: false },
  { id: "V-01", zone: "vip", name: "VIP Suite Alpha (10 Pax)", status: "available", hasDualMonitor: true },
  { id: "B-01", zone: "balcony", name: "Balcony Table #01", status: "available", hasDualMonitor: false },
  { id: "B-02", zone: "balcony", name: "Balcony Table #02", status: "available", hasDualMonitor: false },
];

export default function BookingPage() {
  const router = useRouter();
  const dateRibbon = generateDates();

  const [selectedDate, setSelectedDate] = useState(dateRibbon[0].id);
  const [selectedShift, setSelectedShift] = useState(SHIFTS[2].id); // default Night Owl
  const [selectedZone, setSelectedZone] = useState("tech");
  const [selectedDesk, setSelectedDesk] = useState("D-01");

  // Amenities add-ons
  const [addUnlimitedColdBrew, setAddUnlimitedColdBrew] = useState(false);
  const [addManualBrewFlight, setAddManualBrewFlight] = useState(false);
  const [addMonitorRental, setAddMonitorRental] = useState(false);

  // Pricing
  const currentShiftObj = SHIFTS.find((s) => s.id === selectedShift) || SHIFTS[0];
  const baseShiftPrice = currentShiftObj.price;
  const coldBrewPrice = addUnlimitedColdBrew ? 25000 : 0;
  const brewFlightPrice = addManualBrewFlight ? 35000 : 0;
  const monitorRentalPrice = addMonitorRental ? 40000 : 0;
  const totalReservationPrice = baseShiftPrice + coldBrewPrice + brewFlightPrice + monitorRentalPrice;

  const currentZoneDesks = DESKS.filter((d) => d.zone === selectedZone);

  const handleConfirmReservation = () => {
    router.push(
      `/checkout?bookingRef=${encodeURIComponent(
        `RES-${selectedDesk}-${selectedShift}`
      )}&desk=${selectedDesk}&total=${totalReservationPrice}`
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e5e1e4] pt-4 pb-32">
      {/* Context & Breadcrumb Bar */}
      <div className="w-full bg-[#111114]/80 backdrop-blur-md border-b border-white/[0.06] py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-xs text-[#94a3b8]">
            <Link href="/" className="hover:text-[#f7bb82] transition-colors">Warkop Ya&apos;reh</Link>
            <span>/</span>
            <span className="text-[#94a3b8]">Workspace & VIP</span>
            <span>/</span>
            <span className="text-[#f59e0b] font-semibold">Table & Suite Reservation</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-[#18181c] px-3 py-1.5 rounded-full border border-white/[0.08] shadow-sm text-xs">
              <span className="material-symbols-outlined text-[16px] text-[#f59e0b]">location_on</span>
              <span className="font-semibold text-[#f8fafc]">Darmo Flagship (Central Surabaya)</span>
            </div>
            <div className="flex items-center gap-2 bg-[#18181c] px-3 py-1.5 rounded-full border border-white/[0.08] shadow-sm font-mono text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f59e0b] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f59e0b]"></span>
              </span>
              <span className="text-[#f8fafc]">42/65 Desks Occupied</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">Gigabit Fiber Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ══════════════════════════════════════════════════════════════
            1. DATE PICKER RIBBON (14 DAYS)
            ══════════════════════════════════════════════════════════════ */}
        <section className="bg-[#111114] rounded-2xl p-5 sm:p-6 border border-white/[0.08] shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f59e0b] text-[22px]">
                calendar_month
              </span>
              <h2 className="font-bold text-base text-[#f8fafc]">Select Session Date</h2>
            </div>
            <span className="font-mono text-xs text-[#94a3b8]">Darmo Local Time (WIB)</span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {dateRibbon.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDate(d.id)}
                className={`shrink-0 flex flex-col items-center justify-center w-24 py-3 px-2 rounded-xl text-center transition-all border ${
                  selectedDate === d.id
                    ? "bg-gradient-to-b from-[#9c6b3a]/30 to-[#18181c] border-[#f59e0b] shadow-[0_0_16px_rgba(245,158,11,0.25)]"
                    : "bg-[#18181c] border-white/[0.06] hover:border-[#f59e0b]/40 text-[#94a3b8] hover:text-[#f8fafc]"
                }`}
              >
                <span
                  className={`font-mono text-[10px] uppercase tracking-wider ${
                    selectedDate === d.id ? "text-[#f59e0b] font-bold" : "text-[#94a3b8]"
                  }`}
                >
                  {d.dayName}
                </span>
                <span className="text-2xl font-extrabold text-[#f8fafc] font-mono mt-0.5">
                  {d.dateNum}
                </span>
                <span className="text-[11px] text-[#94a3b8]">{d.monthStr}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            2. SHIFT & DURATION PICKER
            ══════════════════════════════════════════════════════════════ */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f7bb82] text-[20px]">
              schedule
            </span>
            <h3 className="font-bold text-base text-[#f8fafc]">Select Working Shift</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SHIFTS.map((shift) => (
              <div
                key={shift.id}
                onClick={() => setSelectedShift(shift.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedShift === shift.id
                    ? "bg-[#18181c] border-[#f59e0b] shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                    : "bg-[#111114] border-white/[0.06] hover:border-white/[0.15]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="material-symbols-outlined text-[#f59e0b] text-[22px]">
                      {shift.icon}
                    </span>
                    <span className="text-[10px] font-mono text-[#e8c47a] bg-[#9c6b3a]/20 px-2 py-0.5 rounded">
                      {shift.tag}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#f8fafc]">{shift.title}</h4>
                  <p className="font-mono text-xs text-[#94a3b8] mt-1">{shift.time}</p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-baseline justify-between">
                  <span className="font-mono text-[11px] text-[#94a3b8]">{shift.duration}</span>
                  <span className="font-mono font-extrabold text-base text-[#f59e0b]">
                    Rp {shift.price.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            3. ZONE SELECTION & INTERACTIVE DESK FLOOR PLAN
            ══════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Zone Tabs & Desk Selector (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Zone Selector Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ZONES.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => {
                    setSelectedZone(zone.id);
                    const firstDesk = DESKS.find((d) => d.zone === zone.id && d.status === "available");
                    if (firstDesk) setSelectedDesk(firstDesk.id);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedZone === zone.id
                      ? "bg-[#18181c] border-[#f59e0b] text-[#f8fafc]"
                      : "bg-[#111114] border-white/[0.06] text-[#94a3b8] hover:text-[#f8fafc]"
                  }`}
                >
                  <p className="font-bold text-xs text-[#f8fafc]">{zone.name}</p>
                  <p className="text-[10px] font-mono text-[#f59e0b] mt-0.5">{zone.floor}</p>
                </button>
              ))}
            </div>

            {/* Visual Floor Plan Grid */}
            <div className="bg-[#111114] rounded-2xl p-6 border border-white/[0.08] shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <h4 className="font-bold text-sm text-[#f8fafc]">
                    {ZONES.find((z) => z.id === selectedZone)?.name}
                  </h4>
                  <p className="text-xs text-[#94a3b8]">
                    {ZONES.find((z) => z.id === selectedZone)?.desc}
                  </p>
                </div>
                <div className="flex items-center gap-3 font-mono text-[10px] text-[#94a3b8]">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Available
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-neutral-600"></span> Occupied
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#f59e0b]"></span> Selected
                  </span>
                </div>
              </div>

              {/* Desk Map Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {currentZoneDesks.map((desk) => {
                  const isSelected = selectedDesk === desk.id;
                  const isAvailable = desk.status === "available";
                  return (
                    <button
                      key={desk.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedDesk(desk.id)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#18181c] border-[#f59e0b] shadow-[0_0_16px_rgba(245,158,11,0.25)]"
                          : isAvailable
                          ? "bg-[#141417] border-white/[0.06] hover:border-emerald-500/40"
                          : "bg-[#0e0e10] border-white/[0.03] opacity-40 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-[#f8fafc]">{desk.name}</span>
                        {desk.hasDualMonitor && (
                          <span className="material-symbols-outlined text-[16px] text-[#e8c47a]">
                            monitor
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className={isSelected ? "text-[#f59e0b] font-bold" : isAvailable ? "text-emerald-400" : "text-neutral-500"}>
                          {isSelected ? "Selected" : isAvailable ? "Available" : "Occupied"}
                        </span>
                        <span className="text-[#94a3b8]">PD 100W</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Amenity Packages Add-ons */}
            <div className="bg-[#111114] rounded-2xl p-6 border border-white/[0.08] shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f59e0b] text-[20px]">
                  local_cafe
                </span>
                <h4 className="font-bold text-sm text-[#f8fafc]">Craft Beverage & Tech Upgrades</h4>
              </div>

              <div className="space-y-2.5">
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#18181c] border border-white/[0.06] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addUnlimitedColdBrew}
                      onChange={(e) => setAddUnlimitedColdBrew(e.target.checked)}
                      className="rounded accent-[#f59e0b]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#f8fafc]">Unlimited Cold Brew Refills</p>
                      <p className="text-[10px] text-[#94a3b8]">Free flow slow-drip single origin during session</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#f59e0b]">+Rp 25.000</span>
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#18181c] border border-white/[0.06] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addManualBrewFlight}
                      onChange={(e) => setAddManualBrewFlight(e.target.checked)}
                      className="rounded accent-[#f59e0b]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#f8fafc]">3-Bean Manual Brew Flight</p>
                      <p className="text-[10px] text-[#94a3b8]">Tasting experience curated by Senior Roaster Dimas</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#f59e0b]">+Rp 35.000</span>
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#18181c] border border-white/[0.06] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addMonitorRental}
                      onChange={(e) => setAddMonitorRental(e.target.checked)}
                      className="rounded accent-[#f59e0b]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#f8fafc]">27&quot; 4K USB-C Monitor Rental</p>
                      <p className="text-[10px] text-[#94a3b8]">Plug-and-play with single cable charging</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#f59e0b]">+Rp 40.000</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Reservation Summary Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#111114] rounded-2xl p-6 border border-white/[0.08] shadow-xl space-y-5 sticky top-28">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <h3 className="font-bold text-base text-[#f8fafc]">Reservation Summary</h3>
                <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                  Instant Pass
                </span>
              </div>

              <div className="space-y-3 text-xs text-[#94a3b8]">
                <div className="flex justify-between">
                  <span>Session Date:</span>
                  <span className="font-mono font-bold text-[#f8fafc]">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Working Shift:</span>
                  <span className="font-bold text-[#f8fafc]">{currentShiftObj.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reserved Station:</span>
                  <span className="font-mono font-bold text-[#f59e0b]">
                    {selectedDesk} ({ZONES.find((z) => z.id === selectedZone)?.name})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Base Shift Fee:</span>
                  <span className="font-mono text-[#f8fafc]">Rp {baseShiftPrice.toLocaleString("id-ID")}</span>
                </div>
                {(coldBrewPrice > 0 || brewFlightPrice > 0 || monitorRentalPrice > 0) && (
                  <div className="pt-2 border-t border-white/[0.06] space-y-1">
                    <span className="text-[10px] uppercase font-mono text-[#94a3b8]">Selected Add-ons:</span>
                    {coldBrewPrice > 0 && (
                      <div className="flex justify-between text-[#e8c47a]">
                        <span>Unlimited Cold Brew</span>
                        <span className="font-mono">+Rp 25.000</span>
                      </div>
                    )}
                    {brewFlightPrice > 0 && (
                      <div className="flex justify-between text-[#e8c47a]">
                        <span>3-Bean Brew Flight</span>
                        <span className="font-mono">+Rp 35.000</span>
                      </div>
                    )}
                    {monitorRentalPrice > 0 && (
                      <div className="flex justify-between text-[#e8c47a]">
                        <span>4K Monitor Rental</span>
                        <span className="font-mono">+Rp 40.000</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#94a3b8] uppercase">Total Reservation</span>
                  <p className="text-2xl font-extrabold text-[#f59e0b] font-mono">
                    Rp {totalReservationPrice.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmReservation}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#9c6b3a] via-[#ee9800] to-[#f59e0b] text-[#0a0a0c] font-bold text-sm shadow-[0_8px_24px_rgba(245,158,11,0.3)] hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>Confirm Reservation</span>
              </button>

              <p className="text-[10px] text-[#94a3b8] text-center">
                Free cancellation up to 2 hours before shift start.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
