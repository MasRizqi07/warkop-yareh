"use client";

import React from "react";
import { Coffee, ArrowRight } from "lucide-react";

export function InventoryAlert() {
  const inventoryItems = [
    {
      id: "BEAN-TJ-001",
      name: "Toraja Arabica",
      category: "Coffee Beans",
      level: "1.2kg",
      percent: 15,
      status: "CRITICAL",
      statusColor: "bg-[var(--error-500)]/10 text-[var(--error-600)] border-[var(--error-500)]/20",
      widthClass: "w-[15%]",
      bgClass: "bg-[var(--error-500)]",
      actionText: "Restock",
    },
    {
      id: "DAIRY-OT-042",
      name: "Oat Milk",
      category: "Dairy/Alt",
      level: "14.0L",
      percent: 70,
      status: "OPTIMAL",
      statusColor: "bg-[var(--success-500)]/10 text-[var(--success-600)] border-[var(--success-500)]/20",
      widthClass: "w-[70%]",
      bgClass: "bg-[var(--success-500)]",
      actionText: "Manage",
    },
    {
      id: "SWT-PL-015",
      name: "Palm Sugar",
      category: "Sweeteners",
      level: "3.5kg",
      percent: 35,
      status: "LOW STOCK",
      statusColor: "bg-[var(--warning-500)]/10 text-[var(--warning-600)] border-[var(--warning-500)]/20",
      widthClass: "w-[35%]",
      bgClass: "bg-[var(--warning-500)]",
      actionText: "Restock",
    },
  ];

  const handleRestock = (itemName: string) => {
    alert(`Initiating restock procurement order for ${itemName}...`);
  };

  return (
    <div className="rounded-xl p-6 border border-[var(--border-default)] bg-[var(--surface-tertiary)] dark:bg-[var(--surface-tertiary)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-heading text-lg font-semibold text-[var(--text-primary)]">Inventory Overview</h3>
          <p className="font-sans text-xs text-[var(--text-secondary)] mt-0.5">Real-time supply monitoring</p>
        </div>
        <button className="text-[var(--text-brand)] hover:underline font-mono text-xs font-semibold flex items-center gap-1 group">
          VIEW ALL <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-default)]">
              <th className="py-3 font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Item Name</th>
              <th className="py-3 font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Category</th>
              <th className="py-3 font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold text-center">Current Level</th>
              <th className="py-3 font-mono text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Status</th>
              <th className="py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]/50">
            {inventoryItems.map((item) => (
              <tr key={item.id} className="group hover:bg-[var(--surface-secondary)]/50 transition-colors motion-safe:card-hover">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--text-brand)]">
                      <Coffee className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-sans text-sm font-bold text-[var(--text-primary)]">{item.name}</p>
                      <p className="text-[10px] font-mono text-[var(--text-tertiary)] font-semibold">{item.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 font-sans text-xs text-[var(--text-secondary)]">{item.category}</td>
                <td className="py-4">
                  <div className="flex flex-col items-center gap-1.5 w-full max-w-[120px] mx-auto">
                    <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">{item.level}</span>
                    <div className="relative w-full bg-[var(--border-default)] rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-slower ease-spring ${item.widthClass} ${item.bgClass}`}
                      />
                      {/* Threshold marker at 30% */}
                      <div className="absolute top-0 left-[30%] w-px h-2 bg-[var(--text-tertiary)] opacity-60 z-10" />
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider border ${item.statusColor}`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button
                    onClick={() => handleRestock(item.name)}
                    className={`font-mono text-[10px] py-1.5 px-3.5 rounded-lg transition-transform active:scale-95 font-semibold ${
                      item.percent < 20 
                        ? "bg-[var(--error-500)] text-white hover:bg-[var(--error-600)] pulse-glow" 
                        : "bg-[var(--interactive-primary)] text-white hover:bg-[var(--interactive-primary-hover)]"
                    }`}
                  >
                    {item.actionText}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
