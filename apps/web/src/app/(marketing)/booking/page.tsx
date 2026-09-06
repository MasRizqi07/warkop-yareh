"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Sun,
  Moon,
  Infinity,
  MapPin,
  Monitor,
  Coffee,
  CheckCircle2,
  ChevronDown,
  Zap,
  Copy,
  Check,
  X,
  ArrowRight,
  VolumeX,
  Users,
} from "lucide-react";
import { useAppStore, TableReservation } from "@/store/useAppStore";

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
    Icon: Sun,
    tag: "Fresh Roast Included",
  },
  {
    id: "afternoon",
    title: "Afternoon Deep Work",
    time: "13:00 – 18:00 WIB",
    duration: "5 Hours",
    price: 45000,
    Icon: Clock,
    tag: "High Energy",
  },
  {
    id: "night-owl",
    title: "Night Owl / Hackathon",
    time: "19:00 – 02:00 WIB",
    duration: "7 Hours",
    price: 55000,
    Icon: Moon,
    tag: "Lo-Fi Acoustic Mode",
  },
  {
    id: "full-day",
    title: "24H Full Day Pass",
    time: "24 Hours Nonstop",
    duration: "Unlimited",
    price: 85000,
    Icon: Infinity,
    tag: "Best Value • 2 Drinks",
  },
];

const ZONES = [
  { id: "quiet", name: "Quiet Zone Pods", floor: "Floor 1", desc: "Sub-35dB silent library pod with acoustic padding", Icon: VolumeX },
  { id: "tech", name: "Tech Workstation", floor: "Floor 1", desc: "Dual AC sockets, USB-C 100W PD, mechanical keyboard friendly", Icon: Monitor },
  { id: "vip", name: "VIP Boardroom Suite", floor: "Floor 2", desc: "Private room seats 10-14 pax with 4K AirPlay screen", Icon: Users },
  { id: "balcony", name: "Smoking Garden Balcony", floor: "Floor 2", desc: "Open air terrace with garden breeze and power outlets", Icon: Coffee },
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

  const {
    branches,
    activeBranchId,
    setActiveBranch,
    getActiveBranch,
    createReservation,
    user,
  } = useAppStore();

  const activeBranch = getActiveBranch();

  const [selectedDate, setSelectedDate] = useState(dateRibbon[0].id);
  const [selectedShift, setSelectedShift] = useState(SHIFTS[2].id); // default Night Owl
  const [selectedZone, setSelectedZone] = useState("tech");
  const [selectedDesk, setSelectedDesk] = useState("D-01");
  const [guestCount, setGuestCount] = useState(1);
  const [customerName, setCustomerName] = useState(user.name || "Tamu Ya'reh");
  const [customerPhone, setCustomerPhone] = useState(user.phone || "08123456789");
  const [specialNotes, setSpecialNotes] = useState("");
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  // Amenities add-ons
  const [addUnlimitedColdBrew, setAddUnlimitedColdBrew] = useState(false);
  const [addManualBrewFlight, setAddManualBrewFlight] = useState(false);
  const [addMonitorRental, setAddMonitorRental] = useState(false);

  // Confirmation modal state
  const [confirmedReservation, setConfirmedReservation] = useState<TableReservation | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Pricing
  const currentShiftObj = SHIFTS.find((s) => s.id === selectedShift) || SHIFTS[0];
  const baseShiftPrice = currentShiftObj.price;
  const coldBrewPrice = addUnlimitedColdBrew ? 25000 : 0;
  const brewFlightPrice = addManualBrewFlight ? 35000 : 0;
  const monitorRentalPrice = addMonitorRental ? 40000 : 0;
  const totalReservationPrice = baseShiftPrice + coldBrewPrice + brewFlightPrice + monitorRentalPrice;

  const currentZoneDesks = DESKS.filter((d) => d.zone === selectedZone);
  const currentDesk = DESKS.find((d) => d.id === selectedDesk) || currentZoneDesks[0];

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();

    const notesParts = [
      specialNotes.trim(),
      addUnlimitedColdBrew ? "+Unlimited Cold Brew" : null,
      addManualBrewFlight ? "+Manual Brew Flight" : null,
      addMonitorRental ? "+4K Monitor Rental" : null,
    ].filter(Boolean);

    const newRes = createReservation({
      branchId: activeBranchId,
      tableId: selectedDesk,
      tableLabel: currentDesk ? currentDesk.name : selectedDesk,
      date: selectedDate,
      timeSlot: currentShiftObj.time,
      guestCount,
      customerName,
      customerPhone,
      notes: notesParts.length > 0 ? notesParts.join(", ") : undefined,
      depositAmount: totalReservationPrice,
    });

    setConfirmedReservation(newRes);
  };

  const handleCopyCode = () => {
    if (confirmedReservation && typeof navigator !== "undefined") {
      navigator.clipboard.writeText(confirmedReservation.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleProceedToCheckout = () => {
    if (!confirmedReservation) return;
    router.push(
      `/checkout?bookingRef=${encodeURIComponent(
        confirmedReservation.code
      )}&desk=${encodeURIComponent(selectedDesk)}&total=${totalReservationPrice}`
    );
  };

  return (
    <div className="min-h-screen bg-canvas-obsidian text-text-primary pt-4 pb-32 transition-colors">
      {/* Context & Breadcrumb Bar */}
      <div className="w-full bg-surface-secondary/80 backdrop-blur-md border-b border-border-subtle py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
            <Link href="/" className="hover:text-primary transition-colors">
              Warkop Ya&apos;reh
            </Link>
            <span>/</span>
            <span>Workspace & VIP</span>
            <span>/</span>
            <span className="text-accent-amber font-semibold">Table & Suite Reservation</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Real Branch Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                className="flex items-center gap-2 bg-surface-card hover:bg-surface-container px-3 py-1.5 rounded-full border border-border-subtle shadow-sm text-xs transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-accent-amber" />
                <span className="font-semibold text-text-primary">{activeBranch.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
              </button>

              {isBranchDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-card border border-border-subtle rounded-2xl shadow-2xl py-2 z-50">
                  <div className="px-3 py-1 text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    Pilih Cabang Aktif
                  </div>
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setActiveBranch(b.id);
                        setIsBranchDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        activeBranchId === b.id
                          ? "bg-primary/20 text-accent-amber font-bold"
                          : "text-text-primary hover:bg-surface-secondary"
                      }`}
                    >
                      <span>{b.name}</span>
                      {activeBranchId === b.id && <Check className="w-3.5 h-3.5 text-accent-amber" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-full border border-border-subtle shadow-sm font-mono text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-amber opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-amber"></span>
              </span>
              <span className="text-text-primary">42/65 Desks Occupied</span>
              <span className="text-text-muted">•</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Gigabit Fiber
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ══════════════════════════════════════════════════════════════
            1. DATE PICKER RIBBON (14 DAYS)
            ══════════════════════════════════════════════════════════════ */}
        <section className="bg-surface-card rounded-2xl p-5 sm:p-6 border border-border-subtle shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent-amber" />
              <h2 className="font-heading font-bold text-base text-text-primary">Select Session Date</h2>
            </div>
            <span className="font-mono text-xs text-text-muted">Local Time (WIB)</span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {dateRibbon.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDate(d.id)}
                className={`shrink-0 flex flex-col items-center justify-center w-24 py-3 px-2 rounded-xl text-center transition-all border cursor-pointer ${
                  selectedDate === d.id
                    ? "bg-gradient-to-b from-brand-coffee/30 to-surface-secondary border-accent-amber shadow-[0_0_16px_rgba(245,158,11,0.25)]"
                    : "bg-surface-secondary border-border-subtle hover:border-accent-amber/40 text-text-muted hover:text-text-primary"
                }`}
              >
                <span
                  className={`font-mono text-[10px] uppercase tracking-wider ${
                    selectedDate === d.id ? "text-accent-amber font-bold" : "text-text-muted"
                  }`}
                >
                  {d.dayName}
                </span>
                <span className="text-2xl font-extrabold text-text-primary font-mono mt-0.5">
                  {d.dateNum}
                </span>
                <span className="text-[11px] text-text-muted">{d.monthStr}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            2. SHIFT & DURATION PICKER
            ══════════════════════════════════════════════════════════════ */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent-amber" />
            <h3 className="font-heading font-bold text-base text-text-primary">Select Working Shift</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SHIFTS.map((shift) => {
              const ShiftIcon = shift.Icon;
              return (
                <div
                  key={shift.id}
                  onClick={() => setSelectedShift(shift.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedShift === shift.id
                      ? "bg-surface-card border-accent-amber shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                      : "bg-surface-secondary border-border-subtle hover:border-border-strong"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-xl bg-accent-amber/10 text-accent-amber">
                        <ShiftIcon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono text-cream-beige bg-brand-coffee/20 px-2 py-0.5 rounded border border-border-subtle">
                        {shift.tag}
                      </span>
                    </div>
                    <h4 className="font-heading font-bold text-sm text-text-primary">{shift.title}</h4>
                    <p className="font-mono text-xs text-text-muted mt-1">{shift.time}</p>
                  </div>

                  <div className="pt-4 border-t border-border-subtle mt-4 flex items-baseline justify-between">
                    <span className="font-mono text-[11px] text-text-muted">{shift.duration}</span>
                    <span className="font-mono font-extrabold text-base text-accent-amber">
                      Rp {shift.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              );
            })}
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
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedZone === zone.id
                      ? "bg-surface-card border-accent-amber text-text-primary shadow-sm"
                      : "bg-surface-secondary border-border-subtle text-text-muted hover:text-text-primary hover:border-border-strong"
                  }`}
                >
                  <p className="font-heading font-bold text-xs text-text-primary">{zone.name}</p>
                  <p className="text-[10px] font-mono text-accent-amber mt-0.5">{zone.floor}</p>
                </button>
              ))}
            </div>

            {/* Visual Floor Plan Grid */}
            <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div>
                  <h4 className="font-heading font-bold text-sm text-text-primary">
                    {ZONES.find((z) => z.id === selectedZone)?.name}
                  </h4>
                  <p className="text-xs text-text-muted">
                    {ZONES.find((z) => z.id === selectedZone)?.desc}
                  </p>
                </div>
                <div className="flex items-center gap-3 font-mono text-[10px] text-text-muted">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Available
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-neutral-400 dark:bg-neutral-600"></span> Occupied
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-accent-amber"></span> Selected
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
                          ? "bg-surface-card border-accent-amber shadow-[0_0_16px_rgba(245,158,11,0.25)] cursor-pointer"
                          : isAvailable
                          ? "bg-surface-secondary border-border-subtle hover:border-emerald-500/40 cursor-pointer"
                          : "bg-surface-container border-border-subtle/40 opacity-40 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-text-primary">{desk.name}</span>
                        {desk.hasDualMonitor && (
                          <Monitor className="w-4 h-4 text-cream-beige" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className={isSelected ? "text-accent-amber font-bold" : isAvailable ? "text-emerald-500 dark:text-emerald-400" : "text-text-muted"}>
                          {isSelected ? "Selected" : isAvailable ? "Available" : "Occupied"}
                        </span>
                        <span className="text-text-muted">PD 100W</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Amenity Packages Add-ons */}
            <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-accent-amber" />
                <h4 className="font-heading font-bold text-sm text-text-primary">Craft Beverage & Tech Upgrades</h4>
              </div>

              <div className="space-y-2.5">
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-surface-secondary border border-border-subtle hover:border-border-strong cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addUnlimitedColdBrew}
                      onChange={(e) => setAddUnlimitedColdBrew(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4"
                    />
                    <div>
                      <p className="text-xs font-bold text-text-primary">Unlimited Cold Brew Refills</p>
                      <p className="text-[10px] text-text-muted">Free flow slow-drip single origin during session</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-accent-amber">+Rp 25.000</span>
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-surface-secondary border border-border-subtle hover:border-border-strong cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addManualBrewFlight}
                      onChange={(e) => setAddManualBrewFlight(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4"
                    />
                    <div>
                      <p className="text-xs font-bold text-text-primary">3-Bean Manual Brew Flight</p>
                      <p className="text-[10px] text-text-muted">Tasting experience curated by Senior Roaster Dimas</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-accent-amber">+Rp 35.000</span>
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-surface-secondary border border-border-subtle hover:border-border-strong cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addMonitorRental}
                      onChange={(e) => setAddMonitorRental(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4"
                    />
                    <div>
                      <p className="text-xs font-bold text-text-primary">27&quot; 4K USB-C Monitor Rental</p>
                      <p className="text-[10px] text-text-muted">Plug-and-play with single cable charging</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-accent-amber">+Rp 40.000</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Reservation Summary Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-xl space-y-5 sticky top-28">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <h3 className="font-heading font-bold text-base text-text-primary">Reservation Summary</h3>
                <span className="font-mono text-[11px] text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                  Instant Pass
                </span>
              </div>

              {/* Patron details form inputs */}
              <div className="space-y-3 pb-3 border-b border-border-subtle">
                <div>
                  <label className="block text-[11px] font-mono text-text-muted mb-1">Patron Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    placeholder="Nama Pemesan"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-surface-secondary border border-border-subtle text-text-primary focus:outline-none focus:border-accent-amber transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-mono text-text-muted mb-1">WhatsApp Phone</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-surface-secondary border border-border-subtle text-text-primary focus:outline-none focus:border-accent-amber transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-text-muted mb-1">Guests</label>
                    <div className="flex items-center rounded-xl bg-surface-secondary border border-border-subtle">
                      <button
                        type="button"
                        onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                        className="px-2.5 py-2 text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-mono text-xs font-bold text-text-primary">
                        {guestCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setGuestCount(Math.min(8, guestCount + 1))}
                        className="px-2.5 py-2 text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-text-muted mb-1">Special Requests (Optional)</label>
                  <input
                    type="text"
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="e.g. Near window, quiet corner, etc."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-surface-secondary border border-border-subtle text-text-primary focus:outline-none focus:border-accent-amber transition-colors"
                  />
                </div>
              </div>

              {/* Line items */}
              <div className="space-y-3 text-xs text-text-muted">
                <div className="flex justify-between">
                  <span>Session Date:</span>
                  <span className="font-mono font-bold text-text-primary">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Working Shift:</span>
                  <span className="font-bold text-text-primary">{currentShiftObj.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reserved Station:</span>
                  <span className="font-mono font-bold text-accent-amber">
                    {selectedDesk} ({ZONES.find((z) => z.id === selectedZone)?.name})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Base Shift Fee:</span>
                  <span className="font-mono text-text-primary">Rp {baseShiftPrice.toLocaleString("id-ID")}</span>
                </div>
                {(coldBrewPrice > 0 || brewFlightPrice > 0 || monitorRentalPrice > 0) && (
                  <div className="pt-2 border-t border-border-subtle space-y-1">
                    <span className="text-[10px] uppercase font-mono text-text-muted">Selected Add-ons:</span>
                    {coldBrewPrice > 0 && (
                      <div className="flex justify-between text-cream-beige">
                        <span>Unlimited Cold Brew</span>
                        <span className="font-mono">+Rp 25.000</span>
                      </div>
                    )}
                    {brewFlightPrice > 0 && (
                      <div className="flex justify-between text-cream-beige">
                        <span>3-Bean Brew Flight</span>
                        <span className="font-mono">+Rp 35.000</span>
                      </div>
                    )}
                    {monitorRentalPrice > 0 && (
                      <div className="flex justify-between text-cream-beige">
                        <span>4K Monitor Rental</span>
                        <span className="font-mono">+Rp 40.000</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border-subtle flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-mono text-text-muted uppercase">Total Reservation</span>
                  <p className="text-2xl font-extrabold text-accent-amber font-mono">
                    Rp {totalReservationPrice.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmReservation}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#9c6b3a] via-[#ee9800] to-[#f59e0b] text-[#0a0a0c] font-bold text-sm shadow-[0_8px_24px_rgba(245,158,11,0.3)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm Reservation</span>
              </button>

              <p className="text-[10px] text-text-muted text-center">
                Free cancellation up to 2 hours before shift start.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          CONFIRMATION MODAL (Obsidian Artisan Design)
          ══════════════════════════════════════════════════════════════ */}
      {confirmedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-surface-card border border-border-subtle rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              type="button"
              onClick={() => setConfirmedReservation(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-bold text-xl text-text-primary">
                Reservasi Berhasil Dikonfirmasi!
              </h3>
              <p className="text-xs text-text-muted">
                Tunjukkan kode reservasi ini kepada barista saat tiba di {activeBranch.name}.
              </p>
            </div>

            {/* Booking Code Banner */}
            <div className="p-4 rounded-2xl bg-surface-secondary border border-border-subtle flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-text-muted uppercase">Kode Reservasi</span>
                <p className="font-mono text-lg font-extrabold text-accent-amber tracking-wider">
                  {confirmedReservation.code}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-card hover:bg-surface-container border border-border-subtle text-xs font-mono text-text-primary transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? "Tersalin" : "Salin"}</span>
              </button>
            </div>

            {/* Summary Details */}
            <div className="p-4 rounded-2xl bg-surface-secondary/60 border border-border-subtle space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Cabang</span>
                <span className="font-bold text-text-primary">{activeBranch.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Tanggal & Shift</span>
                <span className="font-bold text-text-primary">
                  {confirmedReservation.date} • {confirmedReservation.timeSlot}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Meja / Stasiun</span>
                <span className="font-mono font-bold text-accent-amber">
                  {confirmedReservation.tableLabel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Nama Pemesan</span>
                <span className="text-text-primary font-medium">{confirmedReservation.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Total Tagihan / Deposit</span>
                <span className="font-mono font-bold text-accent-amber">
                  Rp {(confirmedReservation.depositAmount || totalReservationPrice).toLocaleString("id-ID")}
                </span>
              </div>
              {confirmedReservation.notes && (
                <div className="pt-2 border-t border-border-subtle flex justify-between">
                  <span className="text-text-muted">Catatan</span>
                  <span className="text-cream-beige text-right">{confirmedReservation.notes}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmedReservation(null)}
                className="py-3 px-4 rounded-xl bg-surface-secondary hover:bg-surface-container border border-border-subtle text-xs font-bold text-text-primary transition-colors cursor-pointer text-center"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Bayar Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
