"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  IconChevronRight, 
  IconUpload, 
  IconQrCode, 
  IconReady, 
  IconCheckAll, 
  IconLoading, 
  IconSave 
} from "@/lib/icons";

export default function EditEventPage() {
  const router = useRouter();

  // State details for Surabaya Dev Meetup e1
  const [title, setTitle] = useState("Surabaya Dev Meetup: Building High-Performance UI");
  const [description, setDescription] = useState(
    "Join us for an exclusive evening at Warkop Ya'reh Tunjungan. We'll be diving deep into the architecture of modern web interfaces, exploring how to balance aesthetic warmth with technical precision.\n\nAgenda:\n- 18:00: Coffee & Networking\n- 19:00: Main Session: The Glassmorphic Revolution\n- 20:30: Q&A and Community Brews\n\nLimited spots available for the coding workshop section."
  );
  const [category, setCategory] = useState("Developer Meetup");
  const [location, setLocation] = useState("Ya'reh Tunjungan, Surabaya");
  const [date, setDate] = useState("Nov 15, 2024");
  const [time, setTime] = useState("18:00 WIB");
  const [capacity, setCapacity] = useState(45);
  const [fee, setFee] = useState("50.000");

  const [savingState, setSavingState] = useState<"idle" | "syncing" | "saved">("idle");

  const handleSaveChanges = () => {
    setSavingState("syncing");
    setTimeout(() => {
      setSavingState("saved");
      setTimeout(() => {
        setSavingState("idle");
      }, 2000);
    }, 1200);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-[var(--text-primary)] pb-24">
      {/* Breadcrumbs and Page Heading */}
      <section className="space-y-2">
        <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-mono text-[10px] uppercase font-bold">
          <span>Dashboard</span>
          <IconChevronRight size={12} className="leading-none" />
          <span>Events</span>
          <IconChevronRight size={12} className="leading-none" />
          <span className="text-[var(--color-primary)]">Surabaya Dev Meetup</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="font-heading text-2xl font-extrabold text-[var(--text-primary)]">Edit Event: Surabaya Dev Meetup</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-2 font-semibold">Configure technical workshop details and logistics.</p>
          </div>
          
          <div className="glass-card rounded-xl p-4 bg-[var(--surface-tertiary)] flex gap-6 items-center border border-[var(--border-default)]">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase font-semibold">EVENT ID</span>
              <span className="font-mono text-xs text-[var(--color-primary)] font-bold">#WRK-SUB-2024-082</span>
            </div>
            <div className="h-8 w-px bg-[var(--border-default)]"></div>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase font-semibold">LAST EDITED</span>
              <span className="font-mono text-xs text-[var(--text-primary)] font-semibold">Oct 24, 14:22 by Admin</span>
            </div>
          </div>
        </div>
      </section>

      {/* Form Layout Split */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Left Column: Banner & Title details */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="glass-card rounded-2xl overflow-hidden border border-[var(--border-default)] bg-[var(--surface-tertiary)] relative group">
            <div className="aspect-[21/9] w-full relative overflow-hidden bg-neutral-900">
              <Image
                alt="Event Banner"
                className="w-full h-full object-cover opacity-70 transition-transform duration-75 group-hover:scale-[1.01]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuGOQLHldozLrjCTOkApDD6xUWmUIos9NXqPf0zrd3NqgrVlZRXf-DxSm7H4-gDawdrjYOEU8l75r0xtYwPGtVm3e6uWYhjVuTMcW_NqAaLwJcy4eDDHlzT4uLXjcoAq2lYyQouMtc7dtlObxC9ejW6aSYJmusAHbJgCGj_ZNi9Pl2DrYg7u7n_Tf9kopyw4XPArjJ_WJPTOBjfUSdo86Xka2TuKEl1L1oCia00TfKUDE2SUr2FRAAf_rG7j7XdZEK6rfeqn1Tia4"
                fill
                sizes="(max-w-768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-tertiary)]/95 to-transparent flex flex-col justify-end p-6">
                <div className="bg-[var(--surface-secondary)]/80 backdrop-blur-md p-3.5 rounded-xl border border-[var(--border-default)] w-fit cursor-pointer hover:bg-[var(--surface-secondary)] transition-colors flex items-center gap-3">
                  <IconUpload size={18} className="text-[var(--color-primary)]" />
                  <div className="text-left leading-none">
                    <p className="font-bold text-xs">Update Event Banner</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-1">1200x512px (Max 5MB)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Title & Description inputs */}
          <div className="space-y-6 bg-[var(--surface-tertiary)] p-6 rounded-2xl border border-[var(--border-default)]">
            <div className="flex flex-col gap-2">
              <label htmlFor="event-title" className="font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-widest px-1 font-semibold">Event Title</label>
              <input
                id="event-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-[var(--surface-secondary)]/50 border-b-2 border-[var(--border-default)] px-4 py-3 rounded-t-xl text-[var(--text-primary)] font-medium focus:bg-[var(--surface-secondary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm font-semibold"
                type="text"
                placeholder="Enter event title"
                title="Event Title"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="event-description" className="font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-widest px-1 font-semibold">Description</label>
              <textarea
                id="event-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-[var(--surface-secondary)]/50 border-b-2 border-[var(--border-default)] px-4 py-3 rounded-t-xl text-[var(--text-primary)] focus:bg-[var(--surface-secondary)] focus:border-[var(--color-primary)] outline-none transition-all resize-none text-xs leading-relaxed"
                rows={8}
                placeholder="Enter event description"
                title="Description"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Logistics Details */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <div className="glass-card rounded-2xl p-6 bg-[var(--surface-tertiary)] border border-[var(--border-default)] space-y-6">
            <h3 className="font-heading text-lg font-bold text-[var(--color-primary)]">Event Logistics</h3>
            
            <div className="space-y-4 text-xs font-semibold">
              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="event-category" className="font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">Category</label>
                <select
                  id="event-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-[var(--surface-secondary)] border-b-2 border-[var(--border-default)] px-3 py-2 rounded-t-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
                  title="Category"
                >
                  <option value="Workshop">Workshop</option>
                  <option value="Developer Meetup">Developer Meetup</option>
                  <option value="Brewing Masterclass">Brewing Masterclass</option>
                  <option value="Product Launch">Product Launch</option>
                </select>
              </div>

              {/* Location */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="event-location" className="font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">Branch Location</label>
                <select
                  id="event-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-[var(--surface-secondary)] border-b-2 border-[var(--border-default)] px-3 py-2 rounded-t-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
                  title="Branch Location"
                >
                  <option value="Ya'reh Tunjungan, Surabaya">Ya&apos;reh Tunjungan, Surabaya</option>
                  <option value="Ya'reh Darmo, Surabaya">Ya&apos;reh Darmo, Surabaya</option>
                  <option value="Ya'reh Sudirman, Jakarta">Ya&apos;reh Sudirman, Jakarta</option>
                </select>
                <div className="mt-2 h-32 rounded-lg bg-[var(--surface-secondary)] overflow-hidden relative border border-[var(--border-default)]">
                  <Image
                    alt="Location Map"
                    className="w-full h-full object-cover opacity-60"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGW8SPKH-KERhDkXSZ2OR5CkCW5pKsi511hppFubtJEwtGky3QH9TCdECkeKLMkfHAHgjjPF5eYWodNnnGPFukIfnD_gAMYUNb0AHT6WzRvHcP3wJWd0_dEcTb10QOMQmOMT5XbiGwMvORbisho5fIAec7gWXGjf4PAWYdnuKYU5oIqHXlfDQZVooVEA-Wgg0sXZAKDSIYVtx1gU4R1W8JG7thb114KlCU6cSpVHVbH5WtJEOx2RDq1YdljwzaBCHin4ySU8efN0U"
                    fill
                    sizes="(max-w-500px) 100vw, 30vw"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-mono bg-neutral-900/80 px-3 py-1 rounded-full border border-[var(--color-primary)]/30 text-[var(--color-primary)]">View Detailed Map</span>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="event-date" className="font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">Date</label>
                  <input
                    id="event-date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-[var(--surface-secondary)] border-b-2 border-[var(--border-default)] px-3 py-2 rounded-t-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                    type="text"
                    placeholder="e.g. June 15, 2026"
                    title="Date"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="event-time" className="font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">Time</label>
                  <input
                    id="event-time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-[var(--surface-secondary)] border-b-2 border-[var(--border-default)] px-3 py-2 rounded-t-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                    type="text"
                    placeholder="e.g. 19:00 WIB"
                    title="Time"
                  />
                </div>
              </div>

              {/* Capacity & fee */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="event-capacity" className="font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">Capacity</label>
                  <input
                    id="event-capacity"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="bg-[var(--surface-secondary)] border-b-2 border-[var(--border-default)] px-3 py-2 rounded-t-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                    type="number"
                    placeholder="e.g. 50"
                    title="Capacity"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="event-fee" className="font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">Entry Fee (IDR)</label>
                  <input
                    id="event-fee"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    className="bg-[var(--surface-secondary)] border-b-2 border-[var(--border-default)] px-3 py-2 rounded-t-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                    type="text"
                    placeholder="e.g. 50000"
                    title="Entry Fee"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-between">
              <div>
                <p className="font-bold text-xs leading-none">Event Status</p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-1 font-semibold">Visible to public app users</p>
              </div>
              <div className="flex items-center gap-1.5 bg-[var(--success-500)]/10 text-[var(--success-500)] px-3.5 py-1.5 rounded-full border border-[var(--success-500)]/20 text-[10px] font-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-500)] animate-pulse"></span>
                <span>Live &amp; Active</span>
              </div>
            </div>
          </div>

          {/* Tickets templates */}
          <div className="glass-card rounded-2xl p-5 border border-dashed border-[var(--border-default)] bg-[var(--surface-tertiary)] flex flex-col items-center justify-center text-center">
            <IconQrCode size={30} className="text-[var(--text-tertiary)] mb-3" />
            <p className="font-bold text-xs mb-0.5">Generate Attendee Pass</p>
            <p className="text-[10px] text-[var(--text-tertiary)] mb-3 font-semibold">Export digital tickets for this event</p>
            <button
              onClick={() => alert("Downloading PDF template...")}
              className="text-[var(--color-primary)] font-mono text-xs font-semibold hover:underline"
            >
              Download Template (.PDF)
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Action Footer */}
      <footer className="fixed bottom-0 right-0 w-[calc(100%-16rem)] h-20 bg-[var(--surface-secondary)]/90 backdrop-blur-md border-t border-[var(--border-default)] flex items-center justify-between px-12 z-40 shadow-inner">
        <div className="flex items-center gap-2 text-[var(--success-500)] text-xs font-semibold">
          <IconReady size={18} className="leading-none" />
          <span>All changes are automatically drafted locally.</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => router.push("/events")}
            className="px-6 py-2.5 rounded-xl hover:bg-white/5 transition-all text-[var(--text-secondary)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={savingState !== "idle"}
            className={`px-8 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg ${
              savingState === "saved"
                ? "bg-[var(--success-500)] text-white shadow-[var(--success-500)]/20"
                : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 shadow-[var(--color-primary)]/20"
            }`}
          >
            <div className={`${savingState === "syncing" ? "animate-spin" : ""}`}>
              {savingState === "saved" ? <IconCheckAll size={16} /> : savingState === "syncing" ? <IconLoading size={16} /> : <IconSave size={16} />}
            </div>
            <span>
              {savingState === "saved" ? "Changes Saved" : savingState === "syncing" ? "Syncing..." : "Save Changes"}
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
}
