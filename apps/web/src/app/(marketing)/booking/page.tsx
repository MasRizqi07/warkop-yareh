"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconWifi, 
  IconPower, 
  IconSeat, 
  IconPrint, 
  IconGroupsOff, 
  IconReservation, 
  IconCoffee, 
  IconGroups, 
  IconCheck, 
  IconLoyalty 
} from "@/lib/icons";
import { useReservationStore } from "@/stores";

interface Spot {
  id: string;
  name: string;
  type: string;
  capacity: number;
  price: number;
  status: "available" | "reserved" | "occupied";
  colStart: number;
  rowStart: number;
  amenities: { icon: string; label: string }[];
}

const colStartClasses: Record<number, string> = {
  1: "col-start-1",
  2: "col-start-2",
  3: "col-start-3",
  4: "col-start-4",
  5: "col-start-5",
  6: "col-start-6",
};

const rowStartClasses: Record<number, string> = {
  1: "row-start-1",
  2: "row-start-2",
  3: "row-start-3",
  4: "row-start-4",
};

import { api } from "@/lib/api";

export default function BookingPage() {
  const [selectedZone, setSelectedZone] = useState("Indoor");
  const [selectedDate, setSelectedDate] = useState("12");
  const [selectedTime, setSelectedTime] = useState("11:00 AM");
  const [selectedSpot, setSelectedSpot] = useState<Spot>({
    id: "spot1",
    name: "The Roasting Room",
    type: "Meeting Pod",
    capacity: 6,
    price: 45000,
    status: "available",
    colStart: 2,
    rowStart: 2,
    amenities: [
      { icon: "wifi", label: "Hi-Speed WiFi" },
      { icon: "power", label: "Power Outlets" },
      { icon: "event_seat", label: "Comfy Seats" },
      { icon: "print", label: "Cloud Print" }
    ],
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const { addReservation, reservations } = useReservationStore();

  const handleConfirm = async () => {
    try {
      await api.post('/reservations', {
        userId: 'user-1',
        branchId: 'coldnbrew-gubeng-001',
        tableId: selectedSpot.id,
        date: `2024-11-${selectedDate}`,
        startTime: selectedTime,
        endTime: '13:00',
        guestCount: selectedSpot.capacity,
      });

      addReservation({
        zone: selectedZone,
        spotId: selectedSpot.id,
        spotName: selectedSpot.name,
        date: `${selectedDate} Nov`,
        time: selectedTime,
        price: selectedSpot.price,
      });
      setBookingConfirmed(true);
    } catch (err) {
      console.error(err);
      alert('Failed to book table. Please try again.');
    }
  };

  const spots: Spot[] = [
    {
      id: "spot1",
      name: "The Roasting Room",
      type: "Meeting Pod",
      capacity: 6,
      price: 45000,
      status: "available",
      colStart: 2,
      rowStart: 2,
      amenities: [
        { icon: "wifi", label: "Hi-Speed WiFi" },
        { icon: "power", label: "Power Outlets" },
        { icon: "event_seat", label: "Comfy Seats" },
        { icon: "print", label: "Cloud Print" }
      ],
    },
    {
      id: "spot2",
      name: "Communal Hotdesk B",
      type: "Coworking Space",
      capacity: 1,
      price: 15000,
      status: "reserved",
      colStart: 4,
      rowStart: 1,
      amenities: [
        { icon: "wifi", label: "Hi-Speed WiFi" },
        { icon: "power", label: "Power Outlets" },
        { icon: "event_seat", label: "Comfy Seats" }
      ],
    },
    {
      id: "spot3",
      name: "Cozy Corner Booth C",
      type: "Lounge Seat",
      capacity: 4,
      price: 30000,
      status: "occupied",
      colStart: 5,
      rowStart: 3,
      amenities: [
        { icon: "wifi", label: "Hi-Speed WiFi" },
        { icon: "power", label: "Power Outlets" }
      ],
    },
  ];

  const handleSpotClick = (spot: Spot) => {
    if (spot.status === "occupied") return;
    setSelectedSpot(spot);
  };

  return (
    <div className="bg-background text-on-background min-h-screen pb-32">
      {/* Noise Overlay */}
      <div className="fixed inset-0 organic-noise pointer-events-none z-[-1] opacity-30"></div>

      {/* Main Container */}
      <main className="pt-24 px-4 max-w-container-max mx-auto space-y-8">
        
        {/* Floor Plan Selection */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Select Zone</h2>
            <div className="flex gap-2 p-1 glass-card rounded-xl">
              {["Indoor", "Outdoor", "VIP Room"].map((zone) => (
                <button
                  key={zone}
                  onClick={() => setSelectedZone(zone)}
                  className={`px-4 py-1.5 rounded-lg text-receipt-label font-receipt-label transition-colors ${
                    selectedZone === zone
                      ? "bg-primary-container text-on-primary-container"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 relative aspect-[4/3] md:aspect-[21/9] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent z-10"></div>
            <Image
              alt="Floor plan"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhLJIk6lrVYtMEIRb3biYCadHukC3TaaK36VSik-cCNy7V8N1KdACPbMsr1swFmFXFwAGAgHdlD9Gcn3PCNflumIc0MDo4gHazdPgI_hP-YpUo0QesLZ993nPSHjWAFUucj0n4P_EmwydnD3gv6uT2VvcGLeKFXW3dfVMxd5lH5R5iJsIBEAHAoAiFVYH6o88MZPPPxhHRjCuzh856-CJ-Ej0UNtyDXlxPHvgYlUSWpiAqNn2bJl247f3-lLjd4IoT8PAwo_Z6gKQ"
              fill
              sizes="(max-width: 1280px) 100vw, 80vw"
              priority
            />

            {/* Floor Plan Markers */}
            <div className="absolute inset-0 p-8 grid grid-cols-6 grid-rows-4 gap-4 z-20">
              {spots.map((spot) => {
                const isSelected = selectedSpot.id === spot.id;
                const isReservedInStore = reservations.some(
                  (r) => r.spotId === spot.id && r.date === `${selectedDate} Nov` && r.time === selectedTime && r.status === "CONFIRMED"
                );
                return (
                  <button
                    key={spot.id}
                    onClick={() => handleSpotClick(spot)}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                      colStartClasses[spot.colStart] || ""
                    } ${rowStartClasses[spot.rowStart] || ""} ${
                      isReservedInStore || spot.status === "occupied"
                        ? "bg-error/20 border-error text-error cursor-not-allowed"
                        : isSelected || spot.status === "reserved"
                        ? "bg-primary/20 border-primary text-primary hover:bg-primary hover:text-coffee-bean scale-110"
                        : "bg-java-green/20 border-java-green text-java-green animate-pulse hover:bg-java-green hover:text-white"
                    }`}
                    disabled={isReservedInStore || spot.status === "occupied"}
                  >
                    {isReservedInStore || spot.status === "occupied" ? <IconGroupsOff size={24} /> : <IconSeat size={24} />}
                  </button>
                );
              })}
            </div>

            {/* Indicators */}
            <div className="absolute bottom-4 left-4 flex gap-3 z-20">
              <span className="flex items-center gap-1.5 px-3 py-1 glass-card rounded-full text-[10px] font-receipt-label uppercase">
                <span className="w-2 h-2 rounded-full bg-java-green"></span> Available
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 glass-card rounded-full text-[10px] font-receipt-label uppercase">
                <span className="w-2 h-2 rounded-full bg-primary"></span> Reserved
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 glass-card rounded-full text-[10px] font-receipt-label uppercase">
                <span className="w-2 h-2 rounded-full bg-error"></span> Occupied
              </span>
            </div>
          </div>
        </section>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Date & Time Picker */}
          <section className="space-y-4">
            <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
              <IconReservation size={24} className="text-primary" />
              Schedule
            </h3>
            <div className="glass-card rounded-2xl p-6 space-y-6">
              
              {/* Dates */}
              <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth no-scrollbar">
                {[
                  { day: "12", month: "Nov" },
                  { day: "13", month: "Nov" },
                  { day: "14", month: "Nov" },
                  { day: "15", month: "Nov" }
                ].map((d) => {
                  const isSelected = selectedDate === d.day;
                  return (
                    <div
                      key={d.day}
                      onClick={() => setSelectedDate(d.day)}
                      className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer group ${
                        isSelected
                          ? "bg-primary-container text-on-primary-container"
                          : "border border-white/10 hover:border-primary"
                      }`}
                    >
                      <span className={`font-receipt-label text-receipt-label uppercase ${isSelected ? 'opacity-80' : 'text-on-surface-variant group-hover:text-primary transition-colors'}`}>{d.month}</span>
                      <span className={`font-display-lg text-headline-md leading-none ${isSelected ? '' : 'text-on-surface group-hover:text-primary transition-colors'}`}>{d.day}</span>
                    </div>
                  );
                })}
              </div>

              {/* Time grid */}
              <div className="space-y-3">
                <label className="font-receipt-label text-receipt-label uppercase text-on-surface-variant">Time Slot</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { slot: "09:00 AM", disabled: false },
                    { slot: "11:00 AM", disabled: false },
                    { slot: "02:00 PM", disabled: false },
                    { slot: "04:30 PM", disabled: true },
                    { slot: "07:00 PM", disabled: false },
                    { slot: "09:30 PM", disabled: false }
                  ].map((t) => {
                    const isSelected = selectedTime === t.slot;
                    return (
                      <button
                        key={t.slot}
                        onClick={() => !t.disabled && setSelectedTime(t.slot)}
                        className={`py-3 px-2 rounded-xl font-receipt-label text-code-sm text-center transition-all ${
                          t.disabled
                            ? "border border-white/10 opacity-40 cursor-not-allowed"
                            : isSelected
                            ? "bg-primary/10 border border-primary text-primary"
                            : "border border-white/10 hover:bg-white/5"
                        }`}
                        disabled={t.disabled}
                      >
                        {t.slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Amenities & Meeting Rooms */}
          <section className="space-y-4">
            <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
              <IconCoffee size={24} className="text-primary" />
              Room Details
            </h3>
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-headline-md text-headline-md text-primary-fixed">{selectedSpot.name}</p>
                  <p className="font-receipt-label text-receipt-label text-on-surface-variant uppercase">
                    {selectedSpot.type} • {selectedSpot.capacity} Capacity
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full border border-primary flex items-center justify-center">
                  <IconGroups size={24} className="text-primary" />
                </div>
              </div>

              <div className="space-y-4">
                <p className="font-receipt-label text-receipt-label uppercase text-on-surface-variant border-b border-white/10 pb-2">Inclusive Amenities</p>
                <div className="grid grid-cols-2 gap-4">
                  {selectedSpot.amenities.map((amenity) => {
                    const getIcon = (iconName: string) => {
                      if (iconName === 'wifi') return <IconWifi size={20} className="text-primary-fixed" />;
                      if (iconName === 'power') return <IconPower size={20} className="text-primary-fixed" />;
                      if (iconName === 'event_seat') return <IconSeat size={20} className="text-primary-fixed" />;
                      if (iconName === 'print') return <IconPrint size={20} className="text-primary-fixed" />;
                      return null;
                    };
                    return (
                      <div key={amenity.label} className="flex items-center gap-3">
                        {getIcon(amenity.icon)}
                        <span className="font-body-md text-body-md text-on-surface">{amenity.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-dashed border-white/20">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-receipt-label text-receipt-label text-on-surface-variant">TOTAL ESTIMATE</span>
                  <span className="font-receipt-label text-headline-md text-primary">
                    IDR {(selectedSpot.price / 1000).toFixed(0)}.000 / hr
                  </span>
                </div>
                <button
                  onClick={handleConfirm}
                  className="w-full py-4 bg-primary text-coffee-bean font-headline-md rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {bookingConfirmed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass-card bg-surface-container rounded-3xl p-8 max-w-sm w-full border border-white/10 space-y-6 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-full bg-java-green/20 border-2 border-java-green flex items-center justify-center text-java-green mx-auto">
                <IconCheck size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="font-headline-md text-xl font-bold">Reservation Successful</h3>
                <p className="text-xs text-on-surface-variant/85 leading-relaxed">
                  You have successfully reserved <span className="text-primary font-bold">{selectedSpot.name}</span> on <span className="font-semibold text-on-surface">Nov {selectedDate}</span> at <span className="font-semibold text-on-surface">{selectedTime}</span>.
                </p>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                <div className="flex items-center justify-center gap-2 text-primary font-semibold text-sm">
                  <IconLoyalty size={16} />
                  <span>+150 Loyalty Points Earned</span>
                </div>
              </div>

              <button
                onClick={() => setBookingConfirmed(false)}
                className="w-full py-4 bg-primary text-coffee-bean font-headline-md rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
              >
                BACK TO WORKSPACE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
