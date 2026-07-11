"use client";

import React, { useState } from "react";
import { Search, MapPin, Phone, Clock, Plus, Settings2 } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  isActive: boolean;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([
    { id: "BR-01", name: "Warkop Ya'reh Darmo", city: "Surabaya", address: "Jl. Raya Darmo No. 42", phone: "+62 811-2345-678", hours: "07:00 - 24:00", isActive: true },
    { id: "BR-02", name: "Warkop Ya'reh Dharmahusada", city: "Surabaya", address: "Jl. Dharmahusada Indah Timur No. 15", phone: "+62 811-8765-432", hours: "07:00 - 23:00", isActive: true },
    { id: "BR-03", name: "Warkop Ya'reh Gubeng", city: "Surabaya", address: "Jl. Gubeng Pojok No. 8", phone: "+62 811-3456-789", hours: "08:00 - 22:00", isActive: false },
  ]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-[var(--text-primary)]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)]">Branch Locations</h1>
          <p className="font-sans text-xs text-[var(--text-secondary)] mt-0.5">Control store hours, contact details, and locations for your franchise network</p>
        </div>
        <button 
          onClick={() => alert("Create branch modal")}
          className="bg-[var(--interactive-primary)] text-white hover:bg-[var(--interactive-primary-hover)] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" /> ADD OUTLET
        </button>
      </div>

      {/* Outlets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((b) => (
          <div key={b.id} className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-tertiary)] p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">{b.id}</span>
              <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold ${
                b.isActive ? "bg-[var(--success-500)]/10 text-[var(--success-500)] border border-[var(--success-500)]/20" : "bg-[var(--error-500)]/10 text-[var(--error-500)] border border-[var(--error-500)]/20"
              }`}>
                {b.isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>

            <h3 className="font-heading text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--text-brand)] transition-colors mt-2">{b.name}</h3>

            <div className="mt-6 space-y-3 text-xs text-[var(--text-secondary)] border-t border-[var(--border-default)]/50 pt-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[var(--text-brand)] shrink-0" />
                <span>{b.address}, {b.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[var(--text-brand)] shrink-0" />
                <span>{b.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--text-brand)] shrink-0" />
                <span>{b.hours}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-[var(--border-default)]/30 pt-4">
              <button 
                title={`Edit branch ${b.id}`}
                aria-label={`Edit branch ${b.id}`}
                onClick={() => alert(`Edit branch details ${b.id}`)}
                className="p-2 border border-[var(--border-default)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
