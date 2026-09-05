"use client";

import React, { useState } from "react";
import { Save, Percent, Info } from "lucide-react";

export default function SettingsPage() {
  const [taxRate, setTaxRate] = useState("11");
  const [brandName, setBrandName] = useState("Warkop Ya'reh");
  const [currency, setCurrency] = useState("IDR");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Settings saved successfully!");
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto text-[var(--text-primary)]">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)]">System Settings</h1>
        <p className="font-sans text-xs text-[var(--text-secondary)] mt-0.5">Configure franchise rules, billing variables, and notification keys</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand details card */}
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-tertiary)] p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-default)]/50 pb-3">
            <Info className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="font-heading text-base font-bold text-[var(--text-primary)]">General Identity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="brand-name" className="text-xs font-semibold text-[var(--text-secondary)]">Brand Name</label>
              <input
                id="brand-name"
                type="text"
                className="w-full bg-[var(--surface-secondary)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] transition-all"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="currency-symbol" className="text-xs font-semibold text-[var(--text-secondary)]">Currency Symbol</label>
              <input
                id="currency-symbol"
                type="text"
                className="w-full bg-[var(--surface-secondary)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] transition-all"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tax details card */}
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-tertiary)] p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-default)]/50 pb-3">
            <Percent className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="font-heading text-base font-bold text-[var(--text-primary)]">Tax & Charges</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="tax-rate" className="text-xs font-semibold text-[var(--text-secondary)]">PPN Tax Rate (%)</label>
              <input
                id="tax-rate"
                type="number"
                className="w-full bg-[var(--surface-secondary)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] transition-all"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button 
            type="submit"
            className="bg-[var(--interactive-primary)] text-white hover:bg-[var(--interactive-primary-hover)] font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
          >
            <Save className="w-4 h-4" /> SAVE CHANGES
          </button>
        </div>
      </form>
    </div>
  );
}
