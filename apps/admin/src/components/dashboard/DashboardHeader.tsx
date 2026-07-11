import React from "react";

export function DashboardHeader() {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)]">
          {greeting}, Ari Satria
        </h1>
        <p className="font-sans text-sm text-[var(--text-secondary)] mt-0.5">
          {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>
      
      {/* Branch selector */}
      <select 
        className="font-sans text-sm bg-[var(--surface-tertiary)] dark:bg-[var(--surface-tertiary)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-lg px-4 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] transition-all duration-normal"
        aria-label="Select Branch"
      >
        <option>All Branches</option>
        <option>Darmo Flagship</option>
        <option>Dharmahusada Branch</option>
      </select>
    </div>
  );
}
