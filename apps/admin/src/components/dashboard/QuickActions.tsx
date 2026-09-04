import React from "react";
import Link from "next/link";
import { Plus, CalendarPlus, ListOrdered, Download, Boxes, Receipt, Send } from "lucide-react";

export function QuickActions() {
  const actions = [
    { label: "Manage Orders", icon: ListOrdered, href: "/orders", accent: true },
    { label: "Inventory & Silos", icon: Boxes, href: "/inventory", accent: false },
    { label: "Cashier Shifts", icon: Receipt, href: "/shifts", accent: false },
    { label: "WhatsApp Studio", icon: Send, href: "/marketing", accent: false },
    { label: "Branch Pricing", icon: Plus, href: "/branches", accent: false },
    { label: "Export Audit", icon: Download, href: "/analytics", accent: false },
  ];

  return (
    <div className="rounded-2xl bg-[#18181c] border border-white/[0.08] p-6 h-full flex flex-col shadow-xl">
      <h3 className="font-heading text-base font-semibold text-white mb-4">
        Quick Operations
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 flex-grow content-start">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link
              key={i}
              href={action.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all active:scale-95 border ${
                action.accent
                  ? "bg-[#9c6b3a] hover:bg-[#825426] text-white border-transparent shadow-md"
                  : "bg-[#111114] text-[#f8fafc] hover:bg-[#201f21] border-white/[0.06]"
              }`}
            >
              <Icon className={`w-4 h-4 ${action.accent ? "text-white" : "text-[#f59e0b]"}`} />
              <span>{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
